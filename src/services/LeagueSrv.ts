import { fire } from '../firebase';
import { ILeagueModel } from '../models/ILeagueModel';
import { IPlayer } from '../models/IPlayerModel';

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
  public static invitePlayers(
    league: Partial<ILeagueModel>,
    newGameId: number
  ): Promise<boolean> {
    // TODO: add reject when after a xxx seconds with not enough joined players
    // TODO: upgrade the promise to allow cancel
    return new Promise<boolean>((resolve) => {
      // create firebase ref to notification/gameInvites
      const gameInvitesRef = fire
        .database()
        .ref()
        .child('notifications/gameInvites');

      // generate new key
      const inviteKey = gameInvitesRef.push().key;
      const { invited, invite } = LeagueService.setInviteObj(
        league,
        inviteKey as string,
        newGameId
      );

      // update the invantation and invited list
      const update = {
        [`${inviteKey}`]: invite,
      };

      gameInvitesRef
        .update(update)
        .then(() => LeagueService.setAllInvited(invited, gameInvitesRef))
        .then((invitedRefs) => {
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
                gameInvitesRef
                  .child(`${inviteKey}/joinedPlayers`)
                  .off('child_added');

                LeagueService.removeAllInvited(invitedRefs);
                resolve();
              }
            });
        });
    });
  }

  public static setInviteObj(
    league: Partial<ILeagueModel>,
    inviteKey: string,
    newGameId: number
  ): IInviteObj {
    const { players, leagueID, title } = league;
    const userId = fire.auth().currentUser?.uid;
    const inviter = players?.find((player) => player.key === userId) as IPlayer;
    const invited = (players as IPlayer[])
      .filter((player) => player.key !== userId)
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
        newGameId,
      },
    };
  }

  public static setAllInvited(
    invited: IInvited,
    gameInvitesRef: firebase.database.Reference
  ): Promise<firebase.database.Reference[]> {
    const sets: Promise<firebase.database.Reference>[] = [];

    Object.keys(invited).forEach((playerKey) => {
      const promise = gameInvitesRef
        .child(`invitedPlayers/${playerKey}`)
        .push(invited[playerKey]);

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
    const gameInviteRef = fire
      .database()
      .ref()
      .child(`notifications/gameInvites/${inviteKey}/joinedPlayers`);
    const userId = fire.auth().currentUser?.uid;

    // TODO: listen also if game was added before resolve,
    // otherwise the navigation to the new game is before the game is actually created
    return new Promise((resolve) => {
      gameInviteRef.push(userId).then(() => {
        gameInviteRef.on('value', (snap) => {
          if (Object.values(snap.val()).length === 3) {
            gameInviteRef.off('value');
            resolve();
          }
        });
      });
    });
  }
}
