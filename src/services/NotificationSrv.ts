import { fire } from '../firebase';
import { EventEmitter } from '../utils/events/EventEmitter';
import { IGameInvite } from './LeagueSrv';

// TODO: handle posible of many notification
// for example: two game invites from two different leagues
class NotificationsService {
  private gameInviteEventEmitter: EventEmitter<
    IGameInvite
  > = new EventEmitter();

  public registerGameInvite(callback: () => void) {
    this.gameInviteEventEmitter.on(callback);

    const userId = fire.auth().currentUser?.uid;
    const gameInvitesRef = fire
      .database()
      .ref()
      .child(`notifications/gameInvites`);

    gameInvitesRef
      .child(`/invitedPlayers/${userId}`)
      .on('child_added', (invite) => {
        gameInvitesRef.child(invite.val()).once('value', (snapshot) => {
          console.log(snapshot.val());
          this.gameInviteEventEmitter.trigger(snapshot.val());
        });
      });
  }
}

export default new NotificationsService();
