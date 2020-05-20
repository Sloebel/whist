import { fire } from '../firebase';
import { IPlayer } from '../models/IPlayerModel';

export default class GameService {
  // the request to set cards by player will happen only if current user is the dealer
  // but if the data already exist it will not override it (by database rules)
  public static setCardsToPlayers(
    gameKey: string,
    round: number,
    cardsByPlayer: {
      [key: string]: string[];
    }
  ) {
    fire
      .database()
      .ref()
      .child(`cardsByGame/${gameKey}/round${round}`)
      .update(
        {
          cardsState: cardsByPlayer,
        },
        (error) => {
          if (error) {
            console.error('cards state probably already exists');
          }
        }
      );
  }

  public static updateHandCardsState(
    gameKey: string,
    round: number,
    cardIndex: string
  ) {
    const userId = fire.auth().currentUser?.uid;

    if (userId) {
      fire
        .database()
        .ref()
        .child(`cardsByGame/${gameKey}/round${round}/cardsState/${userId}`)
        .update({ [`${cardIndex}`]: null });
    }
  }

  public static savePlayersOrder(
    leagueID: string,
    gameKey: string,
    playersOrder: IPlayer[]
  ) {
    fire
      .database()
      .ref(`leagueGames/_${leagueID}/${gameKey}`)
      .update({ playersOrder });
  }
}
