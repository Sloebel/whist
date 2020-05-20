import { fire } from '../firebase';
import { CardsType } from '../constants/cards';
import {
  IPlayerHand,
  ICardsFromTo,
  ICardsPosition,
  IRoundData,
} from '../models/IGameModel';
import { ThrownCardType } from '../game/ThrownCard/ThrownCard';
import { shuffle } from './Utils';
import { IPlayer } from '../models/IPlayerModel';

export const getTotalWonBid = (roundData: IRoundData) => {
  let currentTotalBid: number = 0;
  let currentTotalWon: number = 0;
  let allHasWonInput: boolean = true;

  for (const [key, value] of Object.entries(roundData)) {
    if (key.indexOf('bid') > -1 && value !== null && value !== '') {
      currentTotalBid += value * 1;
    }

    if (key.indexOf('won') > -1) {
      if (value !== null && value !== '') {
        currentTotalWon += value * 1;
      } else {
        allHasWonInput = false;
      }
    }
  }

  return { currentTotalBid, currentTotalWon, allHasWonInput };
};

export const getTotalRemoteWonBid = (roundData: IRoundData) => {
  let currentTotalBid: number = 0;
  let currentTotalWon: number = 0;

  [0, 1, 2, 3].forEach((player) => {
    currentTotalBid += +roundData[`bid${player}`];
    currentTotalWon += +roundData[`won${player}`];
  });

  return { currentTotalBid, currentTotalWon };
};

export const calcIfRoundFell = (roundData: IRoundData): boolean => {
  let didRoundFell = true;

  for (let i = 0; i < 4; i++) {
    const bid = `bid${i}`;
    const won = `won${i}`;

    if (
      typeof roundData[bid] !== 'number' ||
      typeof roundData[won] !== 'number'
    ) {
      didRoundFell = false;
      break;
    } else if (roundData[bid] === roundData[won]) {
      didRoundFell = false;
      break;
    }
  }

  return didRoundFell;
};

export const cardsList: string[] = (function () {
  const arr: string[] = [];
  for (const type of Object.values(CardsType)) {
    for (let i = 2; i < 15; i++) {
      arr.push(`${i}-${type}`);
    }
  }

  return arr;
})();

const cardsFamilyScoreMap = {
  [CardsType.CLUB]: 1,
  [CardsType.DIAMOND]: 0,
  [CardsType.HART]: 2,
  [CardsType.SPADE]: 3,
};

export const getDevicePlayerIndex = (players: IPlayer[]): number => {
  return players.findIndex(
    (player) => player.key === fire.auth().currentUser?.uid
  );
};

export const nextPlayerIndex = (index: number) => {
  return index + 1 > 3 ? index + 1 - 4 : index + 1;
};

export const dealCards = (players: IPlayer[]) => {
  const shuffledCards = shuffleCards(cardsList);
  const arrayOf4: string[][] = [[], [], [], []];

  for (let i = 0; i < 52; i += 4) {
    for (let j = 0; j < arrayOf4.length; j++) {
      arrayOf4[j].push(shuffledCards[i + j]);
    }
  }

  sortCardsArrays(arrayOf4);

  return setCardsByPlayer(players, arrayOf4);
};

export const shuffleCards = (cardsArray: string[]) => shuffle(cardsArray);

export const shufflePlayers = (players: IPlayer[]) => shuffle(players);

const setCardsByPlayer = (players: IPlayer[], cardsArr: string[][]) =>
  players.reduce((obj, player, index) => {
    obj[player.key] = cardsArr[index];
    return obj;
  }, {} as { [key: string]: string[] });

const sortCardsArrays = (cardsArray: string[][]) => {
  cardsArray.forEach((arr) => sortCards(arr));
};

const sortCards = (cards: string[]) =>
  cards.sort((cardX, cardY) => {
    const [cardXNum, cardXType] = cardX.split('-');
    const [cardYNum, cardYType] = cardY.split('-');

    if (cardsFamilyScoreMap[cardXType] < cardsFamilyScoreMap[cardYType]) {
      return 1;
    }
    if (cardsFamilyScoreMap[cardXType] > cardsFamilyScoreMap[cardYType]) {
      return -1;
    }

    return +cardYNum - +cardXNum;
  });

export const uniqueHand = (hand: IPlayerHand[]) => {
  const uniqueResult = [];
  const map = new Map();

  for (const playerHand of hand) {
    if (!map.has(playerHand.player)) {
      map.set(playerHand.player, true);

      uniqueResult.push(playerHand);
    }
  }

  return uniqueResult;
};

const CARD_WIDTH = 90;
const CARD_HEIGHT = 126;
const CARD_MARKER_HEIGHT = 188;

export const getFromToCalc = (
  thrownType: ThrownCardType,
  markerTop: number,
  markerWidth: number,
  ownThrownCardInitPos: ICardsPosition
): ICardsFromTo => {
  switch (thrownType) {
    case 'right':
      return {
        from: {
          top: CARD_MARKER_HEIGHT / 2 + markerTop - CARD_HEIGHT / 2,
          left: markerWidth + CARD_WIDTH,
        },
        to: {
          top: CARD_MARKER_HEIGHT / 2 + markerTop - CARD_HEIGHT / 2,
          left: markerWidth / 2,
        },
      };

    case 'left':
      return {
        from: {
          top: CARD_MARKER_HEIGHT / 2 + markerTop - CARD_HEIGHT / 2,
          left: -CARD_WIDTH,
        },
        to: {
          top: CARD_MARKER_HEIGHT / 2 + markerTop - CARD_HEIGHT / 2,
          left: markerWidth / 2 - CARD_WIDTH,
        },
      };

    case 'top':
      return {
        from: {
          top: CARD_HEIGHT / 2,
          left: markerWidth / 2 - CARD_WIDTH / 2,
        },
        to: {
          top: CARD_MARKER_HEIGHT / 2 + markerTop - CARD_HEIGHT * 0.8,
          left: markerWidth / 2 - CARD_WIDTH / 2,
        },
      };

    case 'bottom':
      let fromTop: number | undefined = undefined;
      let fromLeft: number | undefined = undefined;

      if (ownThrownCardInitPos) {
        fromTop = ownThrownCardInitPos.top;
        fromLeft = ownThrownCardInitPos.left;
      }

      return {
        from:
          typeof fromTop === 'number' && typeof fromLeft === 'number'
            ? {
                top: fromTop,
                left: fromLeft,
              }
            : undefined,
        to: {
          top: CARD_MARKER_HEIGHT / 2 + markerTop - CARD_HEIGHT * 0.2,
          left: markerWidth / 2 - CARD_WIDTH / 2,
        },
      };

    default:
      return {
        to: {
          top: CARD_MARKER_HEIGHT / 2 + markerTop,
          left: markerWidth / 2,
        },
      };
  }
};

export const getToWinnerCalc = (
  direction: ThrownCardType,
  markerTop: number,
  markerWidth: number
) => {
  switch (direction) {
    case 'right':
      return {
        to: {
          top: CARD_MARKER_HEIGHT / 2 + markerTop - CARD_HEIGHT / 2,
          left: markerWidth + CARD_WIDTH,
        },
      };

    case 'left':
      return {
        to: {
          top: CARD_MARKER_HEIGHT / 2 + markerTop - CARD_HEIGHT / 2,
          left: -CARD_WIDTH,
        },
      };

    case 'top':
      return {
        to: {
          top: 0,
          left: markerWidth / 2 - CARD_WIDTH / 2,
        },
      };

    case 'bottom':
      return {
        to: {
          top: CARD_MARKER_HEIGHT + CARD_HEIGHT * 3,
          left: markerWidth / 2 - CARD_WIDTH / 2,
        },
      };
  }
};
