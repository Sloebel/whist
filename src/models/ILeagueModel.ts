export interface IRawPlayer {
  email: string;
  name: string;
  nickname: string;
}

export interface IPlayer {
  key: string;
  nickname: string;
}

export interface ILeagueModel {
  leagueID: number;
  active: boolean;
  title: string;
  description: string;
  players: IPlayer[];
  blockedBy?: string;
}
