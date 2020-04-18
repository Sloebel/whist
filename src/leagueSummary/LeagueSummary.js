import React, { Component } from 'react';
import { fire } from '../firebase';
import './LeagueSummary.css';
import { Row, Col } from 'antd';

const statsObj = {
  successRate: 'Succes Win Rates',
  successRateHB: 'Highest Bidding Win Rates',
  successRateOver: 'Over Win Rate',
  successRateUnder: 'Under Win Rate',
  successRateNT: 'NT Win Rates',
  successRateLastBidder: 'Last Bidder Win Rate',
};

export default class LeagueSummary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      players: props.league.players,
    };
  }

  componentDidMount() {
    this.fetch();
  }

  componentWillUnmount() {
    this.gameSummaryRef.off('value');
  }

  fetch() {
    const {
      league: { leagueID },
    } = this.props;
    const { players } = this.state;

    const dbRef = fire.database().ref();
    this.gameSummaryRef = dbRef.child(`leagueGamesSummary/_${leagueID}`);
    this.leagueGamesRef = dbRef
      .child(`leagueGames/_${leagueID}`)
      .orderByChild('status')
      .equalTo('FINISHED');

    this.leagueGamesRef.on('value', (snap) => {
      if (snap.val()) {
        const gameKeys = Object.keys(snap.val());
        const lastKey = gameKeys[gameKeys.length - 1];

        this.gameSummaryRef
          .orderByKey()
          .endAt(lastKey)
          .on('value', (snap) => {
            const gameSummary = Object.values(snap.val());
            this.setState({
              players: players.map((player) => {
                const playerKey = player.key;

                return {
                  ...player,
                  games: gameSummary.map((game, i) => game.players[playerKey]),
                };
              }),
            });
          });
      }
    });
  }

  render() {
    const { league } = this.props;
    const { title } = league;
    const { players } = this.state;

    return (
      <div className="game-summery">
        <h3>{title}</h3>

        <h3>League Score:</h3>
        <Row gutter={1} className="table-header" style={{ marginBottom: 1 }}>
          {this.getTableHeaders(players)}
        </Row>
        <Row gutter={1}>{this.getScoreRow(players)}</Row>
        {Object.keys(statsObj).map(this.getStatsRow)}
      </div>
    );
  }

  getTableHeaders = (players) =>
    players.map(({ key, nickname }) => (
      <Col key={key} span={6}>
        <div className="table-cell">{nickname}</div>
      </Col>
    ));

  getScoreRow = (players) =>
    players.map((player) => (
      <Col span={6} key={player.key}>
        <div className="table-cell">
          {player.games && this.scoreReducer(player.games, 'leagueScore')}
        </div>
      </Col>
    ));

  getStatsRow = (statsKey) => {
    const { players } = this.state;

    return (
      <div className="stats-row" key={statsKey}>
        <h4>{statsObj[statsKey]}</h4>
        <Row gutter={1}>{this.getWinRateRow(players, statsKey)}</Row>
      </div>
    );
  };

  getWinRateRow = (players, statsKey) =>
    players.map((player) => (
      <Col span={6} key={player.key}>
        <div className="table-cell">
          {player.games && this.calculateRate(player.games, statsKey)}%
        </div>
      </Col>
    ));

  scoreReducer = (games, prop) =>
    games.reduce((sum, game) => sum + Number(game[prop]), 0);

  calculateRate = (games, prop) =>
    this.toPercentage(this.preCalculateRate(games, prop));

  toPercentage = ({ wins, total }) =>
    Number.parseFloat((wins / total) * 100).toFixed(0);

  preCalculateRate = (games, prop) =>
    games.reduce(
      (sumObj, game) => {
        const category = game[prop];
        sumObj.wins += category.wins;
        sumObj.total += category.total;
        return sumObj;
      },
      { wins: 0, total: 0 }
    );
}
