export interface IRawPlayer {
  email: string;
  name: string;
  nickname: string;
}

export interface IPlayer {
  key: string;
  nickname: string;
}

export interface IPlayerScoresSummary {
  leagueScore: string;
  successRate: string;
  successRateHB: string;
  successRateOver: string;
  successRateUnder: string;
  successRateNT: string;
}
