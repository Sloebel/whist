import { INPUT_MODE } from '../constants/states';
import { IPlayerScoresSummary } from './IPlayerModel';

export type GameMode = 'local' | 'remote';

export enum GAME_STATUS {
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

export interface IBaseRoundData {
  [index: string]: any;
  segment: string;
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

export interface IRoundData extends IBaseRoundData {
  round: number;
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

export interface IGameColumn {
  playerName: string;
  index: number;
}

export type GameViewType = 'table' | 'panel';

export interface IBaseGameData {
  rounds: IRoundData[];
  currentRound: number;
  totalScore0: number;
  totalScore1: number;
  totalScore2: number;
  totalScore3: number;
  status: GAME_STATUS;
}

export interface IGameData extends IBaseGameData {
  gameID: string;
}

export interface IGamePlayersSummary {
  [player: string]: IPlayerScoresSummary;
}
