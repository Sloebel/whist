import { IPlayer, IPlayerScoresSummary } from '../models/IPlayerModel';
import { GameWithMeta } from '../models/IGameModel';
import { LEAGUE_SCORE_THRESHOLD } from '../constants/scores';

export interface PlayerGameStats {
	gameWins: number;
	totalGamePoints: number;
	highestBidderWins: number;
}

export function findCandidateIndices(cumulativeScores: number[]): number[] {
	const maxScore = Math.max(...cumulativeScores);
	if (maxScore < LEAGUE_SCORE_THRESHOLD) return [];

	return cumulativeScores.reduce<number[]>((acc, score, idx) => {
		if (score === maxScore) acc.push(idx);
		return acc;
	}, []);
}

export function resolveTiebreaker(candidateIndices: number[], playerGameStats: PlayerGameStats[]): number {
	let remaining = candidateIndices;

	const maxWins = Math.max(...remaining.map(i => playerGameStats[i].gameWins));
	remaining = remaining.filter(i => playerGameStats[i].gameWins === maxWins);
	if (remaining.length === 1) return remaining[0];

	const maxPoints = Math.max(...remaining.map(i => playerGameStats[i].totalGamePoints));
	remaining = remaining.filter(i => playerGameStats[i].totalGamePoints === maxPoints);
	if (remaining.length === 1) return remaining[0];

	const maxStood = Math.max(...remaining.map(i => playerGameStats[i].highestBidderWins));
	remaining = remaining.filter(i => playerGameStats[i].highestBidderWins === maxStood);

	return remaining[0];
}

export function getGamePosition(playersOrder: IPlayer[] | null, leaguePlayers: IPlayer[], leagueIdx: number): number {
	if (playersOrder) {
		const playerKey = leaguePlayers[leagueIdx].key;
		return playersOrder.findIndex(p => p.key === playerKey);
	}

	return leagueIdx;
}

export function computeCumulativeScores(
	perPlayerGames: IPlayerScoresSummary[][],
): number[] {
	return perPlayerGames.map((games) =>
		games.reduce((sum, g) => sum + Number(g.leagueScore || 0), 0),
	);
}

export function computePlayerGameStats(allGamesData: GameWithMeta[], leaguePlayers: IPlayer[]): PlayerGameStats[] {
	const playerStats: PlayerGameStats[] = leaguePlayers.map(() => ({
		gameWins: 0,
		totalGamePoints: 0,
		highestBidderWins: 0
	}));

	for (const game of allGamesData) {
		const scores = [game.totalScore0, game.totalScore1, game.totalScore2, game.totalScore3];
		const maxScore = Math.max(...scores);

		for (let i = 0; i < leaguePlayers.length; i++) {
			const pos = getGamePosition(game.playersOrder, leaguePlayers, i);
			if (pos === -1) continue;

			const score = scores[pos];
			playerStats[i].totalGamePoints += score;

			if (score === maxScore) {
				playerStats[i].gameWins++;
			}
		}

		for (const round of game.rounds) {
			if (!round || round.highestBidder === undefined || round.highestBidder === '') continue;

			const bidderPos = Number(round.highestBidder);
			const bid = Number(round[`bid${bidderPos}`] || 0);
			const won = Number(round[`won${bidderPos}`] || 0);

			if (bid === won) {
				const leagueIdx = leaguePlayers.findIndex(
					(_, idx) => getGamePosition(game.playersOrder, leaguePlayers, idx) === bidderPos
				);
				if (leagueIdx !== -1) {
					playerStats[leagueIdx].highestBidderWins++;
				}
			}
		}
	}

	return playerStats;
}
