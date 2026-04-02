import { fire } from '../firebase';
import { ILeagueModel } from '../models/ILeagueModel';
import { IPlayer } from '../models/IPlayerModel';
import { GameWithMeta } from '../models/IGameModel';
import { findCandidateIndices, resolveTiebreaker, computePlayerGameStats, computeCumulativeScores } from '../utils/league-stats';

interface IInvited {
	[userID: string]: string;
}

export interface IGameInvite {
	inviteKey: string;
	leagueID: number;
	leagueTitle: string;
	newGameId: number;
	inviter: IPlayer;
}

interface IInviteObj {
	invited: IInvited;
	invite: IGameInvite;
}

export default class LeagueService {
	public static invitePlayers(league: Partial<ILeagueModel>, newGameId: number): Promise<boolean> {
		// TODO: add reject when after a xxx seconds with not enough joined players
		// TODO: upgrade the promise to allow cancel
		return new Promise<boolean>(resolve => {
			// create firebase ref to notification/gameInvites
			const gameInvitesRef = fire.database().ref().child('notifications/gameInvites');

			// generate new key
			const inviteKey = gameInvitesRef.push().key;
			const { invited, invite } = LeagueService.setInviteObj(league, inviteKey as string, newGameId);

			// update the invantation and invited list
			const update = {
				[`${inviteKey}`]: invite
			};

			gameInvitesRef
				.update(update)
				.then(() => LeagueService.setAllInvited(invited, gameInvitesRef))
				.then(invitedRefs => {
					// setTimeout(() => {
					//   gameInvitesRef
					//     .child(`${inviteKey}/joinedPlayers`)
					//     .push('QVU5a8IMtPZkqo76vgRAvErZ3pm2');
					// }, 2000);
					// setTimeout(() => {
					//   gameInvitesRef
					//     .child(`${inviteKey}/joinedPlayers`)
					//     .push('6fosZWZDV5g0yB7Js8IQhk3ADHh2');
					// }, 2500);

					const playersKeys = Object.keys(invited);

					// listen to changes in the invantation (joinedPlayers)
					gameInvitesRef
						.child(`${inviteKey}/joinedPlayers`)
						.on('child_added', (player: firebase.database.DataSnapshot) => {
							console.log(player.val());
							// resolve when all players joined
							const index = playersKeys.indexOf(player.val());

							if (index > -1) {
								playersKeys.splice(index, 1);
							}

							console.log(playersKeys);

							if (!playersKeys.length) {
								gameInvitesRef.child(`${inviteKey}/joinedPlayers`).off('child_added');

								LeagueService.removeAllInvited(invitedRefs);
								resolve(true);
							}
						});
				});
		});
	}

	public static setInviteObj(league: Partial<ILeagueModel>, inviteKey: string, newGameId: number): IInviteObj {
		const { players, leagueID, title } = league;
		const userId = fire.auth().currentUser?.uid;
		const inviter = players?.find(player => player.key === userId) as IPlayer;
		const invited = (players as IPlayer[])
			.filter(player => player.key !== userId)
			.reduce((invited, player) => {
				invited[player.key] = inviteKey;

				return invited;
			}, {} as IInvited);

		return {
			invited,
			invite: {
				inviter,
				inviteKey,
				leagueID: leagueID as number,
				leagueTitle: title as string,
				newGameId
			}
		};
	}

	public static setAllInvited(
		invited: IInvited,
		gameInvitesRef: firebase.database.Reference
	): Promise<firebase.database.Reference[]> {
		const sets: Promise<firebase.database.Reference>[] = [];

		Object.keys(invited).forEach(playerKey => {
			const promise = gameInvitesRef.child(`invitedPlayers/${playerKey}`).push(invited[playerKey]);

			sets.push(promise);
		});

		return Promise.all(sets);
	}

	public static removeAllInvited(invitedRefs: firebase.database.Reference[]) {
		invitedRefs.forEach((ref: firebase.database.Reference) => {
			ref.set(null);
		});
	}

	public static acceptGameInvite(invite: IGameInvite): Promise<any> {
		const { inviteKey } = invite;
		const gameInviteRef = fire.database().ref().child(`notifications/gameInvites/${inviteKey}/joinedPlayers`);
		const userId = fire.auth().currentUser?.uid;

		// TODO: listen also if game was added before resolve,
		// otherwise the navigation to the new game is before the game is actually created
		return new Promise<void>(resolve => {
			gameInviteRef.push(userId).then(() => {
				gameInviteRef.on('value', snap => {
					if (Object.values(snap.val()).length === 3) {
						gameInviteRef.off('value');
						resolve();
					}
				});
			});
		});
	}

	public static async checkAndSetWinner(leagueID: string, players: IPlayer[]): Promise<void> {
		const db = fire.database();

		const leagueGamesSnap = await db
			.ref(`leagueGames/_${leagueID}`)
			.orderByChild('status')
			.equalTo('FINISHED')
			.once('value');

		const leagueGamesData = leagueGamesSnap.val();

		if (!leagueGamesData) return;

		const gameKeys = Object.keys(leagueGamesData);

		const summarySnap = await db
			.ref(`leagueGamesSummary/_${leagueID}`)
			.orderByKey()
			.endAt(gameKeys[gameKeys.length - 1])
			.once('value');

		const allSummaries = summarySnap.val();

		if (!allSummaries) return;

		const perPlayerGames = players.map(player =>
			gameKeys
				.map(key => allSummaries[key]?.players?.[player.key])
				.filter(Boolean),
		);

		const cumulativeScores = computeCumulativeScores(perPlayerGames);

		const candidateIndices = findCandidateIndices(cumulativeScores);

		if (candidateIndices.length === 0) return;

		let winnerIdx: number;

		if (candidateIndices.length === 1) {
			winnerIdx = candidateIndices[0];
		} else {
			const gameSnapshots = await Promise.all(gameKeys.map(key => db.ref(`games/${key}`).once('value')));

			const allGamesData: GameWithMeta[] = gameSnapshots.map((snap, i) => {
				const gameKey = gameKeys[i];
				const leagueGameInfo = leagueGamesData[gameKey];
				const playersOrderRaw = leagueGameInfo.playersOrder;
				const playersOrder: IPlayer[] | null = playersOrderRaw
					? Array.isArray(playersOrderRaw)
						? playersOrderRaw
						: Object.values(playersOrderRaw)
					: null;

				const gameData = snap.val();
				const rounds = gameData?.rounds
					? Array.isArray(gameData.rounds)
						? gameData.rounds
						: Object.values(gameData.rounds)
					: [];

				return {
					gameKey,
					gameID: leagueGameInfo.gameID,
					playersOrder,
					rounds,
					totalScore0: Number(gameData?.totalScore0 || 0),
					totalScore1: Number(gameData?.totalScore1 || 0),
					totalScore2: Number(gameData?.totalScore2 || 0),
					totalScore3: Number(gameData?.totalScore3 || 0)
				};
			});

			const playerGameStats = computePlayerGameStats(allGamesData, players);
			winnerIdx = resolveTiebreaker(candidateIndices, playerGameStats);
		}

		const winner = players[winnerIdx];

		await db.ref(`leagues/list/_${leagueID}`).update({
			active: false,
			winner: { key: winner.key, nickname: winner.nickname }
		});
	}
}
