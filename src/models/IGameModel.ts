import { INPUT_MODE } from '../constants/states';

export type GameMode = 'local' | 'remote';

export interface IRoundData {
  [index: string]: any;
  segment: number;
  totalBids: string | number;
  trump: string;
  check: boolean;
  factor: number;
  fell: boolean;
  highestBidder: string | number;
  currentBidder?: number;
  inputMode: INPUT_MODE;
  score0: string | number;
  score1: string | number;
  score2: string | number;
  score3: string | number;
  aggregateScore0: string | number;
  aggregateScore1: string | number;
  aggregateScore2: string | number;
  aggregateScore3: string | number;
  bid0: string | number;
  bid1: string | number;
  bid2: string | number;
  bid3: string | number;
  won0: string | number;
  won1: string | number;
  won2: string | number;
  won3: string | number;
}

export interface IPlayerHand {
  player: number;
  hand: string;
}

export interface ICardsPosition {
  top: number;
  left: number;
}

export interface ICardsFromTo {
  from?: ICardsPosition;
  to: ICardsPosition;
}
