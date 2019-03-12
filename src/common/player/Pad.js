import React from 'react';
import './Pad.css';
import CssUp from '../transition/CssUp';

const PlayerPad = (props) => {
  const { name, bid, won, score } = props;

  return (
    <div className="player-pad">
      <div className="pad-name">
        {name}&nbsp;
        {score !== undefined &&
          <span className="pad-score">
            [<CssUp>{score}</CssUp>]
        </span>}
      </div>

      <div className="pad-bid-won">
        Bid: {typeof bid === 'number' ? bid : ' '} Won: {won}
      </div>
    </div>
  );
};

export default PlayerPad;