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

  render() {
    const {
      currentView,
      rounds,
      playersColumns,
      currentRound,
      handleSave,
      setNextRound
    } = this.props;

    return (
      <div>
        <div
          className="my-carousel"
          ref={el => (this.carouselEl = el)}
        >
          <div className={`my-carousel-slides-container ${currentView}`}>
            <div className="my-carousel-slide">
              <MobileTable dataSource={rounds} players={playersColumns} />
            </div>
            <div className="my-carousel-slide">
              <GamePad
                isMobile={true}
                roundData={rounds.length && rounds[currentRound - 1]}
                players={playersColumns}
                onChange={handleSave}
              />
            </div>
          </div>
        </div>
        <div className="round-navigation">
          <Button type="primary" onClick={setNextRound}>
            Next<Icon type="right" />
          </Button>
        </div>
      </div>
    );
  }
}