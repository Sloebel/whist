import React, { Component } from 'react';
import { Button } from 'antd';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import MobileTable from '../common/table/MobileTable';
import GamePad from './GamePad/GamePad';
import { hasTouch, addListener } from '../utils/Utils';

export default class GameMobileView extends Component {
  constructor(props) {
    super(props);

    this.carouselEl = React.createRef();
    this.carouselSwipedRight = this.carouselSwipedRight.bind(this);
    this.carouselSwipedLeft = this.carouselSwipedLeft.bind(this);
  }

  componentDidMount() {
    if (hasTouch()) {
      this.unListenSwipedLeft = addListener(
        this.carouselEl,
        'swiped-left',
        this.carouselSwipedLeft
      );
      this.unListenSwipedRight = addListener(
        this.carouselEl,
        'swiped-right',
        this.carouselSwipedRight
      );
    }
  }

  componentWillUnmount() {
    if (hasTouch()) {
      this.unListenSwipedLeft();
      this.unListenSwipedRight();
    }
  }

  carouselSwipedLeft = () => {
    const { currentView, onCurrentViewChange } = this.props;

    if (currentView !== 'panel') {
      onCurrentViewChange('panel');
    } else {
      this.carouselEl.classList.add('bounce-left');
      setTimeout(() => this.carouselEl.classList.remove('bounce-left'), 400);
    }
  };

  carouselSwipedRight() {
    const { currentView, onCurrentViewChange } = this.props;

    if (currentView !== 'table') {
      onCurrentViewChange('table');
    } else {
      this.carouselEl.classList.add('bounce-right');
      setTimeout(() => this.carouselEl.classList.remove('bounce-right'), 400);
    }
  }

  nextRound = () => {
    const { goToRound, currentRound } = this.props;
    const round = Number(currentRound);

    if (round < 13) {
      goToRound && goToRound(round + 1);
    }
  };

  toRoundBefore = () => {
    const { goToRound, currentRound } = this.props;
    const round = Number(currentRound);

    if (round !== 1) {
      goToRound && goToRound(round - 1);
    }
  };

  render() {
    const {
      gameID,
      gameMode,
      ownCardsState,
      currentView,
      rounds,
      playersColumns,
      currentRound,
      handleSave,
      leagueScores,
      devicePlayerIndex,
      handleCardThrown,
    } = this.props;

    return (
      <div
        className={`game-mobile-view ${
          gameMode === 'remote' ? 'mode-remote' : ''
        }`}
      >
        <div className="my-carousel" ref={(el) => (this.carouselEl = el)}>
          <div className={`my-carousel-slides-container ${currentView}`}>
            <div className="my-carousel-slide">
              <MobileTable
                dataSource={rounds}
                leagueScores={leagueScores}
                players={playersColumns}
                currentRound={currentRound}
                gameID={gameID}
              />
            </div>
            <div className="my-carousel-slide">
              <GamePad
                gameMode={gameMode}
                ownCardsState={ownCardsState}
                onCardThrown={handleCardThrown}
                currentRound={currentRound}
                allRounds={rounds}
                players={playersColumns}
                devicePlayerIndex={devicePlayerIndex}
                onChange={handleSave}
              />
            </div>
          </div>
        </div>
        {gameMode !== 'remote' ||
          (((ownCardsState || []).length === 0 || currentView === 'table') && (
            <div className="round-navigation">
              {currentRound !== 1 && (
                <Button
                  type="primary"
                  className="left"
                  ghost
                  onClick={this.toRoundBefore}
                >
                  <LeftOutlined />
                  {`Round ${currentRound - 1}`}
                </Button>
              )}

              {currentRound !== 13 && (
                <Button type="primary" ghost onClick={this.nextRound}>
                  {`Round ${Number(currentRound) + 1}`}
                  <RightOutlined />
                </Button>
              )}
            </div>
          ))}
      </div>
    );
  }
}
