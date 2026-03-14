import React from 'react';
import { Row, Col } from 'antd';
import { TrophyTwoTone } from '@ant-design/icons';
import { cardsRenderer } from './renderers';
import { IGameColumn, IRoundData, LeagueScoreTypeMap } from '../../models/IGameModel';

interface MobileTableProps {
  dataSource?: IRoundData[];
  players: IGameColumn[];
  currentRound?: number;
  leagueScores: LeagueScoreTypeMap;
  gameID: string;
  leagueTitle?: string;
}

const MobileTable: React.FC<MobileTableProps> = ({
  dataSource: rounds = [],
  players,
  currentRound = 0,
  leagueScores,
  gameID,
  leagueTitle,
}) => {
  return (
    <div className="game-table">
      <h3 className="game-header">{leagueTitle && `${leagueTitle} - `}Game {gameID}</h3>
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
            currentRound - 1 === i ? 'current-round' : ''
          } ${round.fell ? 'round-fell' : ''}`}
          key={i}
        >
          <Col span={4}>
            <div className="table-cell">
              {i + 1}{' '}
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

export const getTableHeaders = (players: IGameColumn[]) =>
  players.map(({ index: playerIndex, playerName }) => (
    <Col key={playerIndex} span={5}>
      <div className="table-cell">{playerName}</div>
    </Col>
  ));

const getRoundCol = (players: IGameColumn[], roundData: IRoundData) =>
  players.map(({ index: playerIndex }) => (
    <Col span={5} key={playerIndex}>
      <div
        className={`table-cell score-cell ${
          roundData[`bid${playerIndex}`] !== roundData[`won${playerIndex}`]
            ? 'fell'
            : ''
        } ${playerIndex === roundData.highestBidder ? 'highest-bidder' : ''}`}
      >
        {roundData[`aggregateScore${playerIndex}`]}
        {playerIndex === roundData.highestBidder && (
          <span className="trump">{cardsRenderer(roundData.trump)}</span>
        )}
      </div>
    </Col>
  ));

const getLeagueScoresCol = (players: IGameColumn[], leagueScores: LeagueScoreTypeMap) =>
  players.map(({ index: playerIndex }) => (
    <Col span={5} key={playerIndex}>
      <div className={`table-cell`}>
        {leagueScores[`leagueScore${playerIndex}` as keyof LeagueScoreTypeMap] != null
          ? leagueScores[`leagueScore${playerIndex}` as keyof LeagueScoreTypeMap]
          : '-'}
      </div>
    </Col>
  ));
