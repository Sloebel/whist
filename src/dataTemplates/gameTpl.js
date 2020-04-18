import { INPUT_MODE, GAME_STATUS } from '../constants/states';

export default function gameDataTpl(players, gameMode) {
  const rounds = [];
  const initRoundData = {
    segment: '',
    totalBids: '',
    trump: '',
    check: false,
    factor: 1,
    fell: false,
    highestBidder: '',
    inputMode: INPUT_MODE.BID,
    score0: '',
    aggregateScore0: '',
    bid0: '',
    won0: '',
    score1: '',
    aggregateScore1: '',
    bid1: '',
    won1: '',
    score2: '',
    aggregateScore2: '',
    bid2: '',
    won2: '',
    score3: '',
    aggregateScore3: '',
    bid3: '',
    won3: '',
  };

  if (gameMode === 'remote') {
    initRoundData.currentHand = 1;
  }

  for (let i = 0; i < 13; i++) {
    rounds.push({ round: i + 1, ...initRoundData });
  }

  return {
    gameData: {
      rounds,
      currentRound: 1,
      totalScore0: 0,
      totalScore1: 0,
      totalScore2: 0,
      totalScore3: 0,
      status: GAME_STATUS.ACTIVE,
    },
    gameSummary: {
      players: players.reduce((summaryObj, player) => {
        summaryObj[player.key] = {
          leagueScore: '',
          successRate: '',
          successRateHB: '',
          successRateOver: '',
          successRateUnder: '',
          successRateNT: '',
        };

        return summaryObj;
      }, {}),
    },
  };
}
