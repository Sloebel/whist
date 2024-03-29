import React, { Component } from 'react';
import { createPortal } from 'react-dom';
import { fire } from '../firebase';
import { Button, message } from 'antd';
import { TableOutlined, BorderOuterOutlined } from '@ant-design/icons';
import {
  getDevicePlayerIndex,
  dealCards,
  nextPlayerIndex,
  getTotalWonBid,
  calcIfRoundFell,
  getTotalRemoteWonBid,
  calculateHandWinner,
} from '../utils/game-utils';
import './GameTab.scss';
import { INPUT_MODE } from '../constants/states';
import GameMobileView from './GameMobileView';
import { GAME_DEFAULT_SCORES } from '../constants/scores';
import GameService from '../services/GameSrv';
import {
  IGameColumn,
  GameViewType,
  GAME_STATUS,
  IGameData,
  ILeagueGameModel,
  IGamePlayersSummary,
  IRoundData,
  TotalScoreTypeMap,
  TotalScoreType,
  LeagueScoreTypeMap,
  LeagueScoreType,
  IThrownCard,
} from '../models/IGameModel';
import { RouteComponentProps } from 'react-router-dom';
import { IPlayer } from '../models/IPlayerModel';

export const PlayersContext = React.createContext<{
  players: IPlayer[];
  reorderPlayers?: (newOrder: IPlayer[]) => void;
}>({ players: [] });

type GameRouteParams = {
  leagueID: string;
  gameID: string;
};

export interface IGameTabProps extends RouteComponentProps<GameRouteParams> {
  players: IPlayer[];
  loaderStateCb: (loading: boolean) => void;
}

export interface IGameTabState {
  players: IPlayer[];
  devicePlayerIndex: number | null;
  columns: IGameColumn[];
  currentView: GameViewType;
  gameData: Partial<IGameData>;
  gameSummary: IGamePlayersSummary;
}

class GameTab extends Component<IGameTabProps, IGameTabState> {
  private gameRef?: firebase.database.Reference;
  private leagueGamesRef?: firebase.database.Query;
  private gameSummaryRef?: firebase.database.Reference;
  private ownCardsStateRef?: firebase.database.Reference;
  private gameKey: string = '';

  constructor(props: IGameTabProps) {
    super(props);

    this.state = {
      players: props.players,
      devicePlayerIndex: null, //this.getDevicePlayerIndex(props.players),
      columns: [], //this.initColumns(props.players),
      currentView: 'table',
      gameData: {
        currentRound: 1,
        dealer: undefined,
        rounds: [],
        totalScore0: undefined,
        totalScore1: undefined,
        totalScore2: undefined,
        totalScore3: undefined,
        // status: '',
      },
      gameSummary: {},
    };

    this.selectActiveRound = this.selectActiveRound.bind(this);
    this.setCurrentViewState = this.setCurrentViewState.bind(this);
    // this.selectActiveRound = this.selectActiveRound.bind(this);
    this.handleReorderPlayers = this.handleReorderPlayers.bind(this);
  }

  private fetch() {
    const { match } = this.props;
    const { params } = match;
    const { leagueID, gameID } = params;

    const db = fire.database();

    if (this.gameRef) {
      this.gameRef.off('value');
    }

    this.leagueGamesRef = db
      .ref(`leagueGames/_${leagueID}`)
      .orderByChild('gameID')
      .equalTo(Number(gameID));

    this.leagueGamesRef.once('value', (snapshot) => {
      const gameData = Object.values(snapshot.val())[0] as ILeagueGameModel;
      const gameKey = Object.keys(snapshot.val())[0];
      this.gameKey = gameKey;
      this.gameRef = db.ref(`games/${gameKey}`);
      this.gameSummaryRef = db.ref(
        `leagueGamesSummary/_${leagueID}/${gameKey}/players`
      );
      const { gameMode, playersOrder } = gameData;

      const players = playersOrder || this.props.players;

      this.setState({
        players,
        columns: this.initColumns(players),
        devicePlayerIndex: getDevicePlayerIndex(players),
      });

      this.gameRef.on('value', (snap) => {
        const gameRefData = snap.val();

        this.setState({
          gameData: {
            ...this.state.gameData,
            gameMode,
            ...gameRefData,
          },
        });

        this.props.loaderStateCb(false);
      });

      this.gameSummaryRef.on('value', (snap) => {
        this.setState({
          gameSummary: {
            ...snap.val(),
          },
        });
      });
    });
  }

  public componentDidMount() {
    this.fetch();
  }

  public componentWillUnmount() {
    this.gameRef?.off('value');
    this.gameSummaryRef?.off('value');
    if (this.ownCardsStateRef) {
      this.ownCardsStateRef.off('value');
    }
  }

  public componentDidUpdate(
    prevProps: IGameTabProps,
    prevState: IGameTabState
  ) {
    if (prevProps.match.params.gameID !== this.props.match.params.gameID) {
      this.fetch();
    }

    const { gameData } = this.state;

    if (
      prevState.gameData.gameMode !== gameData.gameMode ||
      prevState.gameData.currentRound !== gameData.currentRound
    ) {
      this.handleGameModeChange();
    }

    if (prevState.gameData !== gameData) {
      const { currentRound, dealer, gameMode } = gameData;
      const roundData = this.getRoundData(currentRound as number);

      if (gameMode === 'remote' && roundData) {
        const { handsState, currentHand } = roundData;
        const currentHandState =
          handsState && handsState[currentHand as number];
        const userId = fire.auth().currentUser?.uid;

        if (
          currentHandState &&
          (currentHandState.thrownCards || []).length === 4 &&
          currentHandState.status === 'ACTIVE'
        ) {
          setTimeout(() => {
            if (dealer === userId) {
              this.handleHandFinished(roundData);
            }
          }, 2500);
        }

        if (
          currentHand === 13 &&
          (handsState || {})[currentHand].status === 'FINISHED' &&
          dealer === userId
        ) {
          this.calculateHandScore(roundData);
        }
      }
    }
  }

  private handleSave = (row: IRoundData, player: number) => {
    const stateToUpdate: Partial<IGameData> = {};
    let summaryToUpdate;
    const prevRounds = this.state.gameData.rounds || [];
    const newData = [...prevRounds];
    const index = newData.findIndex((item) => row.round === item.round);

    const item = newData[index];

    newData.splice(index, 1, {
      ...item,
      ...row,
    });

    // reference to the new Data relevant row to update with score and segment
    row = newData[index];

    if (typeof player === 'number') {
      // calculate score
      this.calculatePlayerScore(row, player, newData, index, stateToUpdate);

      //update O/U
      const {
        currentTotalBid,
        currentTotalWon,
        allHasWonInput,
      } = getTotalWonBid(row);

      row.segment = currentTotalBid !== null ? currentTotalBid - 13 : '';
      row.check = allHasWonInput && currentTotalWon === 13;

      // calculate if round fell - change next round factor
      if (row.check) {
        const didRoundFell = calcIfRoundFell(row);

        if (didRoundFell) {
          row.fell = true;

          if (row.round < 12) {
            // because metaData index is zero based row.round value is next round index
            newData[row.round].factor = row.factor * 2;
          } else if (row.factor > 1) {
            newData[row.round].factor = row.factor;
          }
        } else if (row.fell) {
          row.fell = false;
          if (newData[row.round]) {
            newData[row.round].factor =
              row.factor > 1 ? row.factor / 2 : row.factor;
          }

          for (let i = 0; i < 4; i++) {
            this.calculatePlayerScore(row, i, newData, index, stateToUpdate);
          }
        }

        // calculate round summary stats
        summaryToUpdate = this.calculateSummary(newData, index);

        if (row.round === 13 && !row.fell) {
          stateToUpdate.status = GAME_STATUS.FINISHED;
          this.updateGameStatus(GAME_STATUS.FINISHED);

          // round summary league scores
          const {
            totalScore0,
            totalScore1,
            totalScore2,
            totalScore3,
          } = this.state.gameData;
          const scores: TotalScoreTypeMap = {
            totalScore0,
            totalScore1,
            totalScore2,
            totalScore3,
          };
          const totalScore: TotalScoreType = `totalScore${player}` as TotalScoreType;
          scores[totalScore] = stateToUpdate[totalScore];
          summaryToUpdate = this.calculateLeagueScores(scores, summaryToUpdate);
        }

        this.gameSummaryRef?.update(this.mapToPlayersObj(summaryToUpdate));
      }
    }

    if (this.state.gameData.gameMode === 'remote') {
      // prev round inputMode === BID
      // round inputMode === WON
      // set players with won === 0;
      const prevRound = prevRounds[index];

      if (
        prevRound.inputMode === INPUT_MODE.BID &&
        row.inputMode === INPUT_MODE.WON
      ) {
        [0, 1, 2, 3].forEach((player) => {
          row[`won${player}`] = 0;
        });
      }
    }

    stateToUpdate.rounds = newData;

    // this.setState(stateToUpdate);
    this.gameRef?.update(stateToUpdate);
  };

  private handleCardThrown = (
    card: string,
    player: number,
    currentRound: number,
    currentHand: number
  ) => {
    const roundData = this.getRoundData(currentRound);
    const thrownCards =
      (roundData &&
        roundData.handsState &&
        roundData.handsState[currentHand].thrownCards) ||
      [];
    const newThrownCards = [...thrownCards, { player, card }];

    const {
      gameData: { ownCardsState },
    } = this.state;

    this.gameRef
      ?.child(`rounds/${currentRound - 1}/handsState/${currentHand}`)
      .update({
        status: 'ACTIVE',
        turnOf: newThrownCards.length !== 4 ? nextPlayerIndex(player) : null,
        thrownCards: newThrownCards,
      })
      .then(() => this.updateOwnCardState(card, currentRound, ownCardsState));
  };

  private calculatePlayerScore = (
    round: IRoundData,
    player: number,
    roundsData: IRoundData[],
    currentRound: number,
    stateToUpdate: Partial<IGameData>
  ) => {
    let rowScore;

    const bid = round[`bid${player}`];
    const won = round[`won${player}`];

    if (won !== '' && bid !== '') {
      if (won === bid) {
        if (won * 1 === 0) {
          rowScore = (round.segment as number) > 0 ? 25 : 50;
        } else {
          rowScore = Math.pow(won, 2) + 10;
        }
      } else {
        const diff = Math.abs(won - bid);

        if (bid * 1 === 0) {
          rowScore =
            -((round.segment as number) > 0 ? 25 : 50) + (diff - 1) * 10;
        } else {
          rowScore = diff * -10;
        }
      }

      rowScore *= round.factor;

      round[`score${player}`] = rowScore;

      //calculate aggregate score
      let aggregateScore = 0;
      for (let i = 0; i <= currentRound; i++) {
        const round = roundsData[i];

        if (typeof round[`score${player}`] === 'number' && !round.fell) {
          aggregateScore += round[`score${player}`];
        }
      }
      round[`aggregateScore${player}`] = aggregateScore;
      stateToUpdate[`totalScore${player}`] = round[`aggregateScore${player}`];
    }
  };

  private calculateLeagueScores = (
    scores: TotalScoreTypeMap,
    summaryToUpdate: IGamePlayersSummary
  ): IGamePlayersSummary => {
    const sortedScores: TotalScoreType[] = (Object.keys(
      scores
    ) as TotalScoreType[]).sort(
      (a: TotalScoreType, b: TotalScoreType) =>
        (scores[b] || 0) - (scores[a] || 0)
    );

    sortedScores.forEach((scoreIndex: TotalScoreType, i) => {
      const score = scores[scoreIndex] as number;
      let leagueScore = GAME_DEFAULT_SCORES[i];

      // score < 0 => -1
      if (score < 0) {
        leagueScore--;
      }

      // score reminder from 100 == 0 => leagueScore + 1
      if (score % 100 === 0) {
        leagueScore++;
      }

      // score > 300 => +3
      if (score > 300) {
        leagueScore += 3;
      }

      // score < -100 => -3
      if (score < -100) {
        leagueScore -= 3;
      }

      summaryToUpdate[`${scoreIndex.slice(-1)}`].leagueScore = leagueScore;
    });

    return summaryToUpdate;
  };

  private calculateSummary = (
    roundsData: IRoundData[],
    currentRoundIndex: number
  ): IGamePlayersSummary => {
    const currentRound = currentRoundIndex + 1;
    const playersSummary: IGamePlayersSummary = {};

    for (let pIndex = 0; pIndex < 4; pIndex++) {
      // playersSummary[pIndex] = {};
      let stood = 0;
      let totalRounds = 0;
      let totalHBrounds = 0;
      let stoodWhileHB = 0;
      let stoodInOver = 0;
      let totalOverRounds = 0;
      let stoodInUnder = 0;
      let totalNTrounds = 0;
      let stoodInNT = 0;
      let stoodWhenLastBidder = 0;
      let totalStoodWhenLastBidder = 0;

      for (let rIndex = 0; rIndex < currentRound; rIndex++) {
        const round = roundsData[rIndex];
        if (!round.fell) {
          totalRounds++;
          const highestBidder = round.highestBidder === pIndex;
          const lastBidder =
            !highestBidder &&
            (pIndex + 1 > 3 ? 0 : pIndex + 1) === round.highestBidder;

          if (highestBidder) {
            totalHBrounds++;
          } else if (lastBidder) {
            totalStoodWhenLastBidder++;
          }

          if (round.segment && round.segment > 0) {
            totalOverRounds++;
          }

          if (round.trump === 'NT') {
            totalNTrounds++;
          }

          if (round[`bid${pIndex}`] === round[`won${pIndex}`]) {
            stood++;

            if (highestBidder) {
              stoodWhileHB++;
            } else if (lastBidder) {
              stoodWhenLastBidder++;
            }

            if (round.trump === 'NT') {
              stoodInNT++;
            }

            round.segment && round.segment > 0 ? stoodInOver++ : stoodInUnder++;
          }
        }
      }

      const successRate = { wins: stood, total: totalRounds };
      const successRateHB = { wins: stoodWhileHB, total: totalHBrounds };
      const successRateOver = { wins: stoodInOver, total: totalOverRounds };
      const successRateUnder = {
        wins: stoodInUnder,
        total: totalRounds - totalOverRounds,
      };
      const successRateNT = { wins: stoodInNT, total: totalNTrounds };
      const successRateLastBidder = {
        wins: stoodWhenLastBidder,
        total: totalStoodWhenLastBidder,
      };

      playersSummary[pIndex] = {
        // successRate: Number.isNaN(successRate) ? '' : successRate,
        leagueScore: 0,
        successRate,
        successRateHB,
        successRateOver,
        successRateUnder,
        successRateNT,
        successRateLastBidder,
      };
    }

    return playersSummary;
  };

  private mapToPlayersObj = (
    summaryToUpdate: IGamePlayersSummary
  ): IGamePlayersSummary => {
    const { players, gameSummary } = this.state;

    return players.reduce((obj: IGamePlayersSummary, player, index) => {
      obj[player.key] = {
        ...gameSummary[player.key],
        ...summaryToUpdate[index],
      };

      return obj;
    }, {});
  };

  private updateGameStatus = (status: GAME_STATUS) => {
    const { match } = this.props;
    const { params } = match;
    const { leagueID } = params;

    fire
      .database()
      .ref(`leagueGames/_${leagueID}/${this.gameKey}`)
      .update({ status });
  };

  private toggleSlide = () => {
    const currentView = this.state.currentView === 'panel' ? 'table' : 'panel';
    this.setCurrentViewState(currentView);
  };

  private setCurrentViewState(currentView: GameViewType) {
    this.setState({ currentView });
  }

  private selectActiveRound(newRound: number) {
    const { gameData, currentView } = this.state;
    const { rounds, currentRound, gameMode, dealer } = gameData;
    const userId = fire.auth().currentUser?.uid;

    if (
      Number(newRound) < Number(currentRound) ||
      (rounds && rounds[(currentRound as number) - 1].check)
    ) {
      this.gameRef?.update({
        currentRound: Number(newRound),
      });

      if (currentView === 'table') {
        this.toggleSlide();
      }

      if (
        gameMode === 'remote' &&
        dealer === userId &&
        !(rounds as IRoundData[])[newRound - 1].handsState
      ) {
        // deal cards
        const { players } = this.state;
        const cardsByPlayer = dealCards(players);

        // *** if cards already exist for this round firebase will block the update
        GameService.setCardsToPlayers(this.gameKey, newRound, cardsByPlayer);
      }
    } else {
      message.warning('Current round is not completed');
    }
  }

  private handleReorderPlayers(newOrder: IPlayer[]) {
    this.setState({
      players: newOrder,
      devicePlayerIndex: getDevicePlayerIndex(newOrder),
      columns: this.initColumns(newOrder),
    });

    const { params } = this.props.match;
    const { leagueID } = params;
    fire
      .database()
      .ref(`leagueGames/_${leagueID}/${this.gameKey}`)
      .update({ playersOrder: newOrder });
  }

  private getLeagueScores = (): LeagueScoreTypeMap => {
    const { gameSummary, players } = this.state;

    if (Object.keys(gameSummary).length === 0) {
      return {
        leagueScore0: 0,
        leagueScore1: 0,
        leagueScore2: 0,
        leagueScore3: 0,
      };
    }

    return players.reduce((summaryObj: LeagueScoreTypeMap, player, i) => {
      summaryObj[`leagueScore${i}` as LeagueScoreType] =
        gameSummary[player.key].leagueScore;
      return summaryObj;
    }, {});
  };

  public render() {
    const {
      columns,
      currentView,
      gameData,
      players,
      devicePlayerIndex,
    } = this.state;
    const { rounds, currentRound, gameMode, ownCardsState } = gameData;
    const { match } = this.props;
    const { params } = match;
    const { gameID } = params;
    const playersColumns = columns.slice(0, 4);

    return (
      <PlayersContext.Provider
        value={{ players, reorderPlayers: this.handleReorderPlayers }}
      >
        {createPortal(
          <Button
            className="toggle-view-btn"
            type="link"
            onClick={this.toggleSlide}
            icon={
              currentView === 'table' ? (
                <BorderOuterOutlined />
              ) : (
                <TableOutlined />
              )
            }
          />,
          document.querySelector('#app-header') || document.body
        )}

        <GameMobileView
          gameID={gameID}
          gameMode={gameMode}
          currentView={currentView}
          rounds={rounds}
          ownCardsState={ownCardsState}
          handleCardThrown={this.handleCardThrown}
          // handState={}
          playersColumns={playersColumns}
          devicePlayerIndex={devicePlayerIndex}
          currentRound={currentRound}
          handleSave={this.handleSave}
          onCurrentViewChange={this.setCurrentViewState}
          goToRound={this.selectActiveRound}
          leagueScores={this.getLeagueScores()}
        />
      </PlayersContext.Provider>
    );
  }

  private initColumns = (players: IPlayer[]): IGameColumn[] => {
    return players.map(({ nickname }, i) => {
      return {
        playerName: nickname,
        index: i,
      };
    });
  };

  private getRoundData(roundIndex: number) {
    return (this.state.gameData.rounds || []).find(
      (round) => round.round === roundIndex
    );
  }

  private handleGameModeChange() {
    const { gameData, players } = this.state;
    const { gameMode } = gameData;

    if (gameMode === 'remote') {
      const { currentRound, dealer } = gameData;
      const userId = fire.auth().currentUser?.uid;

      this.ownCardsStateRef = fire
        .database()
        .ref(
          `cardsByGame/${this.gameKey}/round${currentRound}/cardsState/${userId}`
        );

      this.ownCardsStateRef.on('value', (snap) => {
        console.log(snap.val());
        this.setState((state) => {
          return {
            gameData: {
              ...state.gameData,
              ownCardsState: snap.val() || [],
            },
          };
        });

        const {
          gameData: { currentRound },
        } = this.state;
        const roundData = this.getRoundData(currentRound as number);

        // if current round === 1 and no handsState and gameMode === remote then deal cards
        if (
          !snap.val() &&
          currentRound === 1 &&
          !roundData?.handsState &&
          dealer === userId
        ) {
          const cardsByPlayer = dealCards(players);
          GameService.setCardsToPlayers(
            this.gameKey,
            currentRound,
            cardsByPlayer
          );
        }
      });
    } else if (gameData.ownCardsState) {
      this.setState({
        gameData: {
          ...gameData,
          ownCardsState: undefined,
        },
      });
    }
  }

  private handleHandFinished(roundData: IRoundData) {
    const winner = calculateHandWinner(roundData);
    const { round, handsState, currentHand } = roundData;

    this.gameRef
      ?.child(`rounds/${round - 1}`)
      .update({
        [`won${winner.player}`]: roundData[`won${winner.player}`]
          ? roundData[`won${winner.player}`] + 1
          : 1,
        handsState: {
          ...handsState,
          [currentHand as number]: {
            ...(handsState || {})[currentHand as number],
            status: 'FINISHED',
            handWinner: winner.player,
          },
          [(currentHand as number) + 1]: {
            status: 'ACTIVE',
            turnOf: winner.player,
            thrownCards: [],
          },
        },
      })
      .then(() =>
        setTimeout(
          () => currentHand !== 13 && this.goToNextHand(roundData, winner),
          200
        )
      );
  }

  private goToNextHand(roundData: IRoundData, winner: IThrownCard) {
    const { round, currentHand } = roundData;

    this.gameRef?.child(`rounds/${round - 1}`).update({
      // [`won${winner.player}`]: roundData[`won${winner.player}`]
      //   ? roundData[`won${winner.player}`] + 1
      //   : 1,
      currentHand: (currentHand as number) + 1,
      // handsState: {
      //   // ...handsState,
      //   [currentHand + 1]: {
      //     status: 'ACTIVE',
      //     turnOf: winner.player,
      //     thrownCards: [],
      //   },
      // },
    });
  }

  private calculateHandScore(roundData: IRoundData) {
    const gameData = { ...this.state.gameData };
    const { rounds: allRounds, currentRound } = gameData;
    const newRound = { ...roundData };
    const gameToUpdate: Partial<IGameData> = {};

    [0, 1, 2, 3].forEach((player) =>
      this.calculatePlayerScore(
        newRound,
        player,
        allRounds as IRoundData[],
        (currentRound as number) - 1,
        gameToUpdate
      )
    );

    // calc if round check
    // update O/U
    const { currentTotalWon } = getTotalRemoteWonBid(newRound);

    newRound.check = currentTotalWon === 13;

    // calculate if round fell - change next round factor
    if (newRound.check && allRounds) {
      const didRoundFell = calcIfRoundFell(newRound);

      if (didRoundFell) {
        newRound.fell = true;

        if (newRound.round < 12) {
          // because metaData index is zero based row.round value is next round index
          allRounds[newRound.round].factor = newRound.factor * 2;
        } else if (newRound.factor > 1) {
          allRounds[newRound.round].factor = newRound.factor;
        }
      } else if (newRound.fell) {
        newRound.fell = false;
        if (allRounds[newRound.round]) {
          allRounds[newRound.round].factor =
            newRound.factor > 1 ? newRound.factor / 2 : newRound.factor;
        }

        for (let i = 0; i < 4; i++) {
          this.calculatePlayerScore(
            newRound,
            i,
            allRounds,
            (currentRound as number) - 1,
            gameToUpdate
          );
        }
      }

      // calculate round summary stats
      let summaryToUpdate = this.calculateSummary(
        allRounds,
        (currentRound as number) - 1
      );

      if (newRound.round === 13 && !newRound.fell) {
        gameToUpdate.status = GAME_STATUS.FINISHED;
        this.updateGameStatus(GAME_STATUS.FINISHED);

        // round summary league scores
        const {
          totalScore0,
          totalScore1,
          totalScore2,
          totalScore3,
        } = gameToUpdate;
        const scores = { totalScore0, totalScore1, totalScore2, totalScore3 };
        // scores[`totalScore${player}`] = gameToUpdate[`totalScore${player}`];
        summaryToUpdate = this.calculateLeagueScores(scores, summaryToUpdate);
      }

      this.gameSummaryRef?.update(this.mapToPlayersObj(summaryToUpdate));
    }

    allRounds?.splice((currentRound as number) - 1, 1, newRound);

    gameToUpdate.rounds = allRounds;

    this.gameRef?.update(gameToUpdate);
  }

  private updateOwnCardState(
    thrownCard: string,
    currentRound: number,
    ownCardsState: string[] = []
  ) {
    const cardIndex = Object.keys(ownCardsState).find(
      (index) => ownCardsState[+index] === thrownCard
    );
    GameService.updateHandCardsState(this.gameKey, currentRound, cardIndex);
  }
}

export default GameTab;
