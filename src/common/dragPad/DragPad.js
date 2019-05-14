import React from 'react';
import { Motion, spring } from 'react-motion';
import { addListener } from '../../utils/Utils';
import './DragPad.css';
import { Icon } from 'antd';


const springSetting1 = { stiffness: 180, damping: 10 };
const springSetting2 = { stiffness: 120, damping: 17 };

export function reorder(arr, from, to) {
  const _arr = [...arr];

  if (Math.abs(from - to) === arr.length - 1) {
    [_arr[to], _arr[from]] = [_arr[from], _arr[to]];
  } else if (from < to && to - from > 1) {
    const val = _arr[from];
    _arr.splice(from, 1);
    _arr.unshift(_arr.pop());
    _arr.splice(to, 0, val);
  } else {
    const val = _arr[from];
    _arr.splice(from, 1);
    _arr.splice(to, 0, val);
  }

  return _arr;
}

function clamp(n, min, max) {
  return Math.max(Math.min(n, max), min);
}

const allColors = [
  '#EF767A', '#9acaff', '#49BEAA', '#49DCB1', '#EEB868', '#EF767A', '#456990',
  '#49BEAA', '#49DCB1', '#EEB868', '#EF767A',
];
const [count, width, height] = [4, 80, 80];

// indexed by visual position
// const layout = [0, 1, 2, 3].map(n => {
//   const row = Math.floor(n / 3);
//   const col = n % 3;
//   return [width * col, height * row];
// });

const layout = [
  [width * 1, height * 0],
  [width * 2, height * 1],
  [width * 1, height * 2],
  [width * 0, height * 1]
];

export default class DragPad extends React.Component {
  unListenTouchmove;
  unListenTouchend;
  unListenMousemove;
  unListenMouseup;

  constructor(props) {
    super(props);

    this.state = {
      mouseXY: [0, 0],
      mouseCircleDelta: [0, 0], // difference between mouse and circle pos for x + y coords, for dragging
      lastPress: null, // key of the last pressed component
      isPressed: false,
      order: props.players,
      from: null,
      to: null
    };
  }

  componentDidMount() {
    this.unListenTouchmove = addListener(window, 'touchmove', this.handleTouchMove);
    this.unListenTouchend = addListener(window, 'touchend', this.handleMouseUp);
    this.unListenMousemove = addListener(window, 'mousemove', this.handleMouseMove);
    this.unListenMouseup = addListener(window, 'mouseup', this.handleMouseUp);
  };

  componentWillUnmount() {
    this.unListenTouchmove();
    this.unListenTouchend();
    this.unListenMousemove();
    this.unListenMouseup();
  }

  handleTouchStart = (key, pressLocation, e) => {
    this.handleMouseDown(key, pressLocation, e.touches[0]);
  };

  handleTouchMove = (e) => {
    e.preventDefault();
    this.handleMouseMove(e.touches[0]);
  };

  handleMouseMove = ({ pageX, pageY }) => {
    const { order, lastPress, isPressed, mouseCircleDelta: [dx, dy] } = this.state;

    if (isPressed) {
      const mouseXY = [pageX - dx, pageY - dy];

      const col = clamp(Math.round(mouseXY[0] / width), 0, 2);
      const row = clamp(Math.round(mouseXY[1] / height), 0, Math.floor(count / 2));

      // if col === 1 && row === 0 => index = 0;
      // if col === 2 && row === 1 => index = 1;
      // if col === 1 && row === 2 => index = 2;
      // if col === 0 && row === 1 => index = 3;

      let to = null;

      if (col === 1 && row === 0) {
        to = 0;
      } else if (col === 2 && row === 1) {
        to = 1;
      } else if (col === 1 && row === 2) {
        to = 2;
      } else if (col === 0 && row === 1) {
        to = 3;
      }

      const from = order.findIndex(p => p.index === lastPress);

      const newOrder = typeof to === 'number' && to !== from && reorder(order, from, to);

      this.setState({
        mouseXY,
        order: newOrder ? newOrder : [...order],
        from: newOrder ? from : this.state.from,
        to: newOrder ? to : this.state.to
      });
    }
  };

  handleMouseDown = (key, [pressX, pressY], { pageX, pageY }) => {
    this.setState({
      lastPress: key,
      isPressed: true,
      mouseCircleDelta: [pageX - pressX, pageY - pressY],
      mouseXY: [pressX, pressY],
    });
  };

  handleMouseUp = () => {
    this.setState({ isPressed: false, mouseCircleDelta: [0, 0] });

    if (typeof this.props.onChange === 'function') {
      const { order, from, to } = this.state;
      this.props.onChange(order, from, to);
    }
  };

  render() {
    const { order, lastPress, isPressed, mouseXY } = this.state;
    return (
      <div className="drag-pad">
        <div className="drag-pad-content">
          {order.map((player, key) => {
            let style;
            let x;
            let y;
            const visualPosition = order.findIndex(p => p.index === player.index);
            // const visualPosition = order.indexOf(player.index);
            if (player.index === lastPress && isPressed) {
              [x, y] = mouseXY;
              style = {
                translateX: x,
                translateY: y,
                scale: spring(1.2, springSetting1),
                boxShadow: spring((x - (3 * width - 50) / 2) / 15, springSetting1),
              };
            } else {
              [x, y] = layout[visualPosition];
              style = {
                translateX: spring(x, springSetting2),
                translateY: spring(y, springSetting2),
                scale: spring(1, springSetting1),
                boxShadow: spring((x - (3 * width - 50) / 2) / 15, springSetting1),
              };
            }
            return (
              <Motion key={player.index} style={style}>
                {({ translateX, translateY, scale, boxShadow }) =>
                  <div
                    onMouseDown={this.handleMouseDown.bind(null, player.index, [x, y])}
                    onTouchStart={this.handleTouchStart.bind(null, player.index, [x, y])}
                    className="player-icon"
                    style={{
                      backgroundColor: allColors[player.index],
                      WebkitTransform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                      transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                      zIndex: player.index === lastPress ? 99 : visualPosition,
                      boxShadow: `${boxShadow}px 5px 5px rgba(0,0,0,0.5)`,
                    }}
                  >
                    <Icon type="user" />
                    <span>{player.playerName}</span>
                  </div>
                }
              </Motion>
            );
          })}
        </div>
      </div>
    );
  };
}
