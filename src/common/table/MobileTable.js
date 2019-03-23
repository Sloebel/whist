import React from 'react';
import { Row, Col, Icon } from 'antd';
import ReactDragListView from "react-drag-listview";
import { cardsRenderer } from './renderers';

const MobileTable = (props) => {
  const { dataSource: rounds, players, currentRound, leagueScores } = props;

  const onDragEnd = (fromIndex, toIndex) => {
    console.log('onDragEnd');
  }

  return (
    <div className="game-table">
      <Row gutter={1} className="table-header" style={{ marginBottom: 1 }}>
        <Col span={4}><div className="table-cell">round</div></Col>
        <ReactDragListView
          onDragEnd={onDragEnd}
          nodeSelector="div"
        >
          {getTableHeaders(players)}
        </ReactDragListView>
      </Row>

      {Array(13).fill(1).map((_, i) => (
        <Row
          gutter={1}
          className={`table-row ${currentRound - 1 === i ? 'current-round' : ''}`}
          key={i}
        >
          <Col span={4}><div className="table-cell">{i + 1}</div></Col>
          {getRoundCol(players, rounds[i])}
        </Row>
      ))}

      <Row
        gutter={1}
        className={`table-row`}
      >
        <Col span={4}><div className="table-cell"><Icon type="trophy" theme="twoTone" twoToneColor="#52c41a" /></div></Col>
        {getLeagueScoresCol(players, leagueScores)}
      </Row>
    </div>
  );
};

export default MobileTable;

///////////////////////////
//
// helpers
// 
///////////////////////////


const getTableHeaders = (players) => players.map(({ index: playerIndex, playerName }) => (<Col key={playerIndex} span={5}><div className="table-cell">{playerName}</div></Col>));

const getRoundCol = (players, roundData) => players.map(({ index: playerIndex }) => (
  <Col span={5} key={playerIndex}>
    <div className={`table-cell ${roundData[`bid${playerIndex}`] !== roundData[`won${playerIndex}`] ? 'fell' : ''} ${playerIndex === roundData.highestBidder ? 'highest-bidder' : ''}`}>
      {roundData[`aggregateScore${playerIndex}`]}
      {playerIndex === roundData.highestBidder && (<span className="trump">{cardsRenderer(roundData.trump).children}</span>)}
    </div>
  </Col>
));

const getLeagueScoresCol = (players, leagueScores) => players.map(({ index: playerIndex }) => (
  <Col span={5} key={playerIndex}>
    <div className={`table-cell`}>
      {leagueScores[`leagueScore${playerIndex}`] !== '' ? leagueScores[`leagueScore${playerIndex}`] : '-'}
    </div>
  </Col>
));