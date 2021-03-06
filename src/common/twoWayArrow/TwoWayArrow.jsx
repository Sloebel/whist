import React from 'react';
import './TwoWayArrow.css';

export const TWO_WAY_ARROW_DIRECTION = {
  TOP: 'top',
  BOTTOM: 'bottom'
};

// TODO: add option for horizontal arrow 
// https://codepen.io/hakimel/pen/gfIsk 
// https://codepen.io/Sloebel/pen/MdLKdY

const TwoWayArrow = (props) => {
  return (
    <div className={`arrow-indicator ${props.direction || ''}`}>
      <span><i></i><i></i></span>
      <i></i>
      <span><i></i><i></i></span>
    </div>
  )
};

export default TwoWayArrow;