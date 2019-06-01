import React, { Component } from 'react';
import { fire } from '../firebase';
import './LeagueSummary.css';
import { Row, Col } from 'antd';
import { Bar } from 'react-chartjs-2';

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
    const data = {
      labels: [1, 2, 3],
      datasets: [
        {
          label: 'Sales',
          type: 'line',
          data: [3, 13, 20],
          fill: false,
          borderColor: '#71B37C',
          backgroundColor: '#71B37C',
          pointBorderColor: '#71B37C',
          pointBackgroundColor: '#71B37C',
          pointHoverBackgroundColor: '#71B37C',
          pointHoverBorderColor: '#71B37C',
          // yAxisID: 'y-axis-2'
        },
        {
          type: 'bar',
          label: 'Visitor',
          data: [3, 10, 7, 3, 10, 7, 1],
          fill: false,
          backgroundColor: '#71B37C',
          borderColor: '#71B37C',
          hoverBackgroundColor: '#71B37C',
          hoverBorderColor: '#71B37C',
          // yAxisID: 'y-axis-1'
        },
        {
          label: 'Sales',
          type: 'line',
          data: [7, 10, 11],
          fill: false,
          borderColor: '#bb7628',
          backgroundColor: '#bb7628',
          pointBorderColor: '#bb7628',
          pointBackgroundColor: '#bb7628',
          pointHoverBackgroundColor: '#bb7628',
          pointHoverBorderColor: '#bb7628',
          // yAxisID: 'y-axis-2'
        },
        {
          type: 'bar',
          label: 'Visitor',
          data: [7, 3, 1],
          fill: false,
          backgroundColor: '#EC932F',
          borderColor: '#EC932F',
          hoverBackgroundColor: '#EC932F',
          hoverBorderColor: '#EC932F',
          // yAxisID: 'y-axis-1'
        },
        {
          label: 'Sales',
          type: 'line',
          data: [10, 17, 20],
          fill: false,
          borderColor: '#4bc0c0',
          backgroundColor: '#4bc0c0',
          pointBorderColor: '#4bc0c0',
          pointBackgroundColor: '#4bc0c0',
          pointHoverBackgroundColor: '#4bc0c0',
          pointHoverBorderColor: '#4bc0c0',
          // yAxisID: 'y-axis-2'
        },
        {
          type: 'bar',
          label: 'Visitor',
          data: [10, 7, 3],
          fill: false,
          backgroundColor: '#4bc0d0',
          borderColor: '#4bc0d0',
          hoverBackgroundColor: '#4bc0d0',
          hoverBorderColor: '#4bc0d0',
          // yAxisID: 'y-axis-1'
        }
      ]
    };

    const options = {
      responsive: true,
      legend: { display: false },
      scales: {
        xAxes: [
          {
            display: true,
            gridLines: {
              display: false
            }
          }
        ],
        yAxes: [
          {
            type: 'linear',
            display: true,
            position: 'left',
            id: 'y-axis-2',
            gridLines: {
              display: false
            }
          },
          // {
          //   type: 'linear',
          //   display: true,
          //   position: 'right',
          //   id: 'y-axis-1',
          //   gridLines: {
          //     display: false
          //   }
          // }
        ]
      }
    };

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
        <Bar
          data={data}
          options={options}
        />
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

