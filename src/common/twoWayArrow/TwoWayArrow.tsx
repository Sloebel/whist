import React from 'react';
import './TwoWayArrow.scss';

export enum TWO_WAY_ARROW_DIRECTION {
  TOP = 'top',
  BOTTOM = 'bottom',
}

interface TwoWayArrowProps {
  direction?: TWO_WAY_ARROW_DIRECTION | false;
}

// TODO: add option for horizontal arrow 
// https://codepen.io/hakimel/pen/gfIsk 
// https://codepen.io/Sloebel/pen/MdLKdY

const TwoWayArrow: React.FC<TwoWayArrowProps> = ({ direction }) => {
  return (
    <div className={`arrow-indicator ${direction || ''}`}>
      <span><i></i><i></i></span>
      <i></i>
      <span><i></i><i></i></span>
    </div>
  )
};

export default TwoWayArrow;
