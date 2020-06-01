import { INPUT_MODE } from '../constants/states';
import { IPlayerScoresSummary, IPlayer } from './IPlayerModel';
import { CARDS } from '../constants/cards';

export type GameMode = 'local' | 'remote';

export enum GAME_STATUS {
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

export interface IThrownCard {
  card: string;
  player: number;
}

export interface IHandState {
  handWinner?: number;
  status: GAME_STATUS;
  thrownCards: IThrownCard[];
}
export interface IHandsState {
  [handKey: number]: IHandState;
}

export interface IBaseRoundData {
  [index: string]: any;
  segment: string | number;
  totalBids: string | number;
  trump: CARDS | string;
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
  currentHand?: number;
}

export interface IRoundData extends IBaseRoundData {
  round: number;
  handsState?: IHandsState;  
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

export type LeagueScoreType =
  | 'leagueScore0'
  | 'leagueScore1'
  | 'leagueScore2'
  | 'leagueScore3';
export type LeagueScoreTypeMap = {
  [key in LeagueScoreType]?: number;
};

export type TotalScoreType =
  | 'totalScore0'
  | 'totalScore1'
  | 'totalScore2'
  | 'totalScore3';
export type TotalScoreTypeMap = {
  [key in TotalScoreType]?: number;
};

export interface IBaseGameData extends TotalScoreTypeMap {
  [index: string]: any;
  rounds: IRoundData[];
  currentRound: number;
  status?: GAME_STATUS;
}

export interface ILeagueGameModel {
  gameID: string;
  gameMode?: GameMode;
  playersOrder?: IPlayer[];
  status?: GAME_STATUS;
}

export interface IGameData extends IBaseGameData, ILeagueGameModel {
  [index: string]: any;
  gameID: string;
  dealer?: string;
  gameMode?: GameMode;
  playersOrder?: IPlayer[];
  ownCardsState?: string[];
}

export interface IGamePlayersSummary {
  [player: string]: IPlayerScoresSummary;
}
