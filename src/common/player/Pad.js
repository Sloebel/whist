import React from 'react';
import './Pad.css';
import Css, { CSS_TRANSITIONS } from '../transition/Css';

const PlayerPad = (props) => {
  const { name, bid, won, score } = props;

  return (
    <div className="player-pad">
      <div className="pad-name">
        {name}&nbsp;
        {score !== undefined &&
          <span className="pad-score">
            [<Css type={CSS_TRANSITIONS.SLIDE_UP}>{score}</Css>]
        </span>}
      </div>

      <div className="pad-bid-won">
        Bid: {typeof bid === 'number' ? bid : ' '} Won: {won}
      </div>
    </div>
  );
};

export default PlayerPad;