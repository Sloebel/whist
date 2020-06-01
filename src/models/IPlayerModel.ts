export interface IRawPlayer {
  email: string;
  name: string;
  nickname: string;
}

export interface IPlayer {
  key: string;
  nickname: string;
}

export interface ISuccessRate {
  wins: number;
  total: number;
}

export interface IPlayerScoresSummary {
  leagueScore: number;
  successRate: ISuccessRate;
  successRateHB: ISuccessRate;
  successRateOver: ISuccessRate;
  successRateUnder: ISuccessRate;
  successRateNT: ISuccessRate;
  successRateLastBidder: ISuccessRate;
}
