import React from "react";
import { Row, Col } from "antd";
import { TrophyTwoTone } from "@ant-design/icons";
import { cardsRenderer } from "./renderers";

const MobileTable = props => {
  const {
    dataSource: rounds,
    players,
    currentRound,
    leagueScores,
    gameID
  } = props;

  const onDragEnd = (fromIndex, toIndex) => {
    console.log("onDragEnd");
  };

  return (
    <div className="game-table">
      <h3 className="game-header">Game {gameID}</h3>
      <Row gutter={1} className="table-header" style={{ marginBottom: 1 }}>
        <Col span={4}>
          <div className="table-cell">round</div>
        </Col>
        {getTableHeaders(players)}
      </Row>

      {rounds.map((round, i) => (
        <Row
          gutter={1}
          className={`table-row ${
            currentRound - 1 === i ? "current-round" : ""
          } ${round.fell ? "round-fell" : ""}`}
          key={i}
        >
          <Col span={4}>
            <div className="table-cell">
              {i + 1}{" "}
              {round.factor > 1 && (
                <span className="round-factor">{`x${round.factor}`}</span>
              )}
            </div>
          </Col>
          {getRoundCol(players, round)}
        </Row>
      ))}

      <Row gutter={1} className={`table-row`}>
        <Col span={4}>
          <div className="table-cell">
            <TrophyTwoTone twoToneColor="#52c41a" />
          </div>
        </Col>
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

export const getTableHeaders = players =>
  players.map(({ index: playerIndex, playerName }) => (
    <Col key={playerIndex} span={5}>
      <div className="table-cell">{playerName}</div>
    </Col>
  ));

const getRoundCol = (players, roundData) =>
  players.map(({ index: playerIndex }) => (
    <Col span={5} key={playerIndex}>
      <div
        className={`table-cell score-cell ${
          roundData[`bid${playerIndex}`] !== roundData[`won${playerIndex}`]
            ? "fell"
            : ""
        } ${playerIndex === roundData.highestBidder ? "highest-bidder" : ""}`}
      >
        {roundData[`aggregateScore${playerIndex}`]}
        {playerIndex === roundData.highestBidder && (
          <span className="trump">
            {cardsRenderer(roundData.trump).children}
          </span>
        )}
      </div>
    </Col>
  ));

const getLeagueScoresCol = (players, leagueScores) =>
  players.map(({ index: playerIndex }) => (
    <Col span={5} key={playerIndex}>
      <div className={`table-cell`}>
        {leagueScores[`leagueScore${playerIndex}`] !== ""
          ? leagueScores[`leagueScore${playerIndex}`]
          : "-"}
      </div>
    </Col>
  ));
