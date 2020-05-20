import { IBaseGameData, IGamePlayersSummary } from './IGameModel';
import { IPlayer } from './IPlayerModel';

export interface ILeagueModel {
  leagueID: number;
  active: boolean;
  title: string;
  description: string;
  players: IPlayer[];
  blockedBy?: string;
}

export interface IGameDataTpl {
  gameData: IBaseGameData;
  gameSummary: {
    players: IGamePlayersSummary;
  };
}
