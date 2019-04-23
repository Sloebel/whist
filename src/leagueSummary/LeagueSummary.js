import React, { Component } from 'react';
import { fire } from '../firebase';
import './LeagueSummary.css';
import { Row, Col } from 'antd';

export default class LeagueSummary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      players: props.league.players,
    }
  }

  componentDidMount() {
    this.fetch();
  }

  componentWillUnmount() {
    this.gameSummaryRef.off('value');
  }

  fetch() {
    const { league } = this.props;
    const { leagueID } = league;
    const { players } = this.state;

    const dbRef = fire.database().ref();
    this.gameSummaryRef = dbRef.child(`leagueGamesSummary/_${leagueID}`);

    this.gameSummaryRef.on('value', snap => {
      const gameSummary = Object.values(snap.val());

      this.setState({
        players: players.map(player => {
          const playerKey = player.key;

          return {
            ...player,
            games: gameSummary.map((game, i) => game.players[playerKey])
          };
        })
      });
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
        <Row gutter={1}>
          {this.getScoreRow(players)}
        </Row>
      </div>
    );
  }

  getTableHeaders = (
    players
  ) => players.map(({ key, nickname }) => (
    <Col key={key} span={6}><div className="table-cell">{nickname}</div></Col>
  ));

  getScoreRow = (players) => players.map(player => (
    <Col span={6} key={player.key}>
      <div className="table-cell">
        {player.games && player.games.reduce((score, game) => score + game.leagueScore, 0)}
      </div>
    </Col>
  ));
}

