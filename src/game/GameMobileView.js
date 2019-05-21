import React, { Component } from 'react';
import { Icon, Button } from 'antd';
import MobileTable from "../common/table/MobileTable";
import GamePad from "../common/game/Pad";
import { hasTouch } from '../utils/Utils';

export default class GameMobileView extends Component {
  constructor(props) {
    super(props);

    this.carouselEl = React.createRef();
    this.carouselSwipedRight = this.carouselSwipedRight.bind(this);
    this.carouselSwipedLeft = this.carouselSwipedLeft.bind(this);
  }

  componentDidMount() {
    if (hasTouch()) {
      this.carouselEl.addEventListener("swiped-left", this.carouselSwipedLeft);
      this.carouselEl.addEventListener("swiped-right", this.carouselSwipedRight);
    }
  }

  componentWillUnmount() {
    if (hasTouch()) {
      this.carouselEl.removeEventListener("swiped-left", this.carouselSwipedLeft);
      this.carouselEl.removeEventListener("swiped-right", this.carouselSwipedRight);
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
  }

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
  }

  toRoundBefore = () => {
    const { goToRound, currentRound } = this.props;
    const round = Number(currentRound);

    if (round !== 1) {
      goToRound && goToRound(round - 1);
    }
  }

  render() {
    const {
      gameID,
      currentView,
      rounds,
      playersColumns,
      currentRound,
      handleSave,
      leagueScores,
    } = this.props;

    return (
      <div className="game-mobile-view">
        <div
          className="my-carousel"
          ref={el => (this.carouselEl = el)}
        >
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
                isMobile={true}
                currentRound={currentRound}
                allRounds={rounds}
                players={playersColumns}
                onChange={handleSave}
              />
            </div>
          </div>
        </div>
        <div className="round-navigation">
          {currentRound !== 1 &&
            <Button type="primary" className="left" ghost onClick={this.toRoundBefore}>
              <Icon type="left" />{`Round ${currentRound - 1}`}
            </Button>
          }

          {currentRound !== 13 &&
            <Button type="primary" ghost onClick={this.nextRound}>
              {`Round ${parseInt(currentRound) + 1}`}<Icon type="right" />
            </Button>
          }
        </div>
      </div>
    );
  }
}