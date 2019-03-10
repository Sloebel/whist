import React from 'react';
import { Row, Col } from 'antd';
import ReactDragListView from "react-drag-listview";

const MobileTable = (props) => {
  console.log('mobile table');
  const { dataSource: rounds, players } = props;

  const getTableHeaders = (players) => players.map(({ index: playerIndex, playerName }) => (<Col key={playerIndex} span={5}><div className="table-cell">{playerName}</div></Col>));

  const getRoundCol = (players, roundData) => players.map(({ index: playerIndex }) => (
    <Col span={5} key={playerIndex}>
      <div className={`table-cell ${roundData[`bid${playerIndex}`] !== roundData[`won${playerIndex}`] ? 'fell' : ''}`}> {roundData[`aggregateScore${playerIndex}`]} </div>
    </Col>
  ));
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
          className="table-row"
          key={i}
        >
          <Col span={4}><div className="table-cell">{i + 1}</div></Col>
          {getRoundCol(players, rounds[i])}
        </Row>
      ))}
    </div>
  );
};

export default MobileTable;