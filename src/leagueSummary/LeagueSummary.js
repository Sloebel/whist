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
    console.log(players);
    return (
      <div className="game-summery">
        <h3>{title}</h3>

        <Row gutter={1} className="table-header" style={{ marginBottom: 1 }}>
          <Col span={4}><div className="table-cell"></div></Col>
          {this.getTableHeaders(players)}
        </Row>
        <Row>
          <Col span={4}>Score:</Col>
          {this.getScoreRow(players)}
        </Row>
      </div>
    );
  }

  getTableHeaders = (
    players
  ) => players.map(({ key, nickname }) => (
    <Col key={key} span={5}><div className="table-cell">{nickname}</div></Col>
  ));

  getScoreRow = (players) => players.map(player => (
    <Col span={5} key={player.key}>
      {player.games && player.games.reduce((score, game) => score + game.leagueScore, 0)}
    </Col>
  ));
}

///////////////////////////
// helpers
///////////////////////////

