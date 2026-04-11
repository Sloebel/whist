import React, { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { Motion, spring, Style } from "react-motion";
import { addListener } from "../../utils/Utils";
import { UserOutlined } from "@ant-design/icons";
import "./DragPad.scss";
import { IPlayer } from "../../models/IPlayerModel";

type Position = [number, number];

const springSetting1 = { stiffness: 180, damping: 10 };
const springSetting2 = { stiffness: 120, damping: 17 };

export function reorder<T>(arr: T[], from: number, to: number): T[] {
  const _arr = [...arr];

  if (Math.abs(from - to) === arr.length - 1) {
    [_arr[to], _arr[from]] = [_arr[from], _arr[to]];
  } else if (from < to && to - from > 1) {
    const val = _arr[from];
    _arr.splice(from, 1);
    _arr.unshift(_arr.pop()!);
    _arr.splice(to, 0, val);
  } else {
    const val = _arr[from];
    _arr.splice(from, 1);
    _arr.splice(to, 0, val);
  }

  return _arr;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(Math.min(n, max), min);
}

const allColors = ["#EF767A", "#9acaff", "#49BEAA", "#49DCB1"];
const [count, width, height] = [4, 80, 80];

const layout: Position[] = [
  [width * 1, height * 0],
  [width * 2, height * 1],
  [width * 1, height * 2],
  [width * 0, height * 1],
];

interface DragPadProps {
  players: IPlayer[];
  onChange?: (order: IPlayer[], from: number | null, to: number | null) => void;
}

interface DragPadState {
  mouseXY: Position;
  mouseCircleDelta: Position;
  lastPress: string | null;
  isPressed: boolean;
  order: IPlayer[];
  from: number | null;
  to: number | null;
}

type DragAction =
  | { type: "MOUSE_MOVE"; pageX: number; pageY: number }
  | {
      type: "MOUSE_DOWN";
      key: string;
      pressX: number;
      pressY: number;
      pageX: number;
      pageY: number;
    }
  | { type: "MOUSE_UP" };

function dragReducer(state: DragPadState, action: DragAction): DragPadState {
  switch (action.type) {
    case "MOUSE_MOVE": {
      if (!state.isPressed) return state;

      const [dx, dy] = state.mouseCircleDelta;
      const mouseXY: Position = [action.pageX - dx, action.pageY - dy];

      const col = clamp(Math.round(mouseXY[0] / width), 0, 2);
      const row = clamp(
        Math.round(mouseXY[1] / height),
        0,
        Math.floor(count / 2)
      );

      let to: number | null = null;
      if (col === 1 && row === 0) to = 0;
      else if (col === 2 && row === 1) to = 1;
      else if (col === 1 && row === 2) to = 2;
      else if (col === 0 && row === 1) to = 3;

      const from = state.order.findIndex((p) => p.key === state.lastPress);
      const newOrder =
        typeof to === "number" && to !== from && reorder(state.order, from, to);

      return {
        ...state,
        mouseXY,
        order: newOrder ? newOrder : [...state.order],
        from: newOrder ? from : state.from,
        to: newOrder ? to : state.to,
      };
    }
    case "MOUSE_DOWN":
      return {
        ...state,
        lastPress: action.key,
        isPressed: true,
        mouseCircleDelta: [
          action.pageX - action.pressX,
          action.pageY - action.pressY,
        ],
        mouseXY: [action.pressX, action.pressY],
      };
    case "MOUSE_UP":
      return {
        ...state,
        isPressed: false,
        mouseCircleDelta: [0, 0],
      };
  }
}

const DragPad: React.FC<DragPadProps> = ({ players, onChange }) => {
  const [state, dispatch] = useReducer(dragReducer, {
    mouseXY: [0, 0],
    mouseCircleDelta: [0, 0],
    lastPress: null,
    isPressed: false,
    order: players,
    from: null,
    to: null,
  });

  const colors = useMemo(
    () =>
      players.reduce<Record<string, string>>((colorObj, player, i) => {
        colorObj[player.key] = allColors[i];
        return colorObj;
      }, {}),
    [players]
  );

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const prevIsPressedRef = useRef(false);

  useEffect(() => {
    if (prevIsPressedRef.current && !state.isPressed) {
      onChangeRef.current?.(state.order, state.from, state.to);
    }
    prevIsPressedRef.current = state.isPressed;
  }, [state.isPressed, state.order, state.from, state.to]);

  const handleTouchMove = useCallback((e: Event) => {
    e.preventDefault();
    const touch = (e as TouchEvent).touches[0];
    dispatch({ type: "MOUSE_MOVE", pageX: touch.pageX, pageY: touch.pageY });
  }, []);

  const handleMouseMoveEvent = useCallback((e: Event) => {
    const { pageX, pageY } = e as MouseEvent;
    dispatch({ type: "MOUSE_MOVE", pageX, pageY });
  }, []);

  const handleMouseUp = useCallback(() => {
    dispatch({ type: "MOUSE_UP" });
  }, []);

  useEffect(() => {
    const unlistenTouchmove = addListener(window, "touchmove", handleTouchMove);
    const unlistenTouchend = addListener(window, "touchend", handleMouseUp);
    const unlistenMousemove = addListener(
      window,
      "mousemove",
      handleMouseMoveEvent
    );
    const unlistenMouseup = addListener(window, "mouseup", handleMouseUp);

    return () => {
      unlistenTouchmove();
      unlistenTouchend();
      unlistenMousemove();
      unlistenMouseup();
    };
  }, [handleTouchMove, handleMouseMoveEvent, handleMouseUp]);

  const { order, lastPress, isPressed, mouseXY } = state;

  return (
    <div className="drag-pad">
      <div className="drag-pad-content">
        {order.map((player) => {
          let style: Style;
          let x: number;
          let y: number;
          const visualPosition = order.findIndex(
            (p) => p.key === player.key
          );

          if (player.key === lastPress && isPressed) {
            [x, y] = mouseXY;
            style = {
              translateX: x,
              translateY: y,
              scale: spring(1.2, springSetting1),
              boxShadow: spring(
                (x - (3 * width - 50) / 2) / 15,
                springSetting1
              ),
            };
          } else {
            [x, y] = layout[visualPosition];
            style = {
              translateX: spring(x, springSetting2),
              translateY: spring(y, springSetting2),
              scale: spring(1, springSetting1),
              boxShadow: spring(
                (x - (3 * width - 50) / 2) / 15,
                springSetting1
              ),
            };
          }

          return (
            <Motion key={player.key} style={style}>
              {({ translateX, translateY, scale, boxShadow }) => (
                <div
                  onMouseDown={(e) =>
                    dispatch({
                      type: "MOUSE_DOWN",
                      key: player.key,
                      pressX: x,
                      pressY: y,
                      pageX: e.pageX,
                      pageY: e.pageY,
                    })
                  }
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    dispatch({
                      type: "MOUSE_DOWN",
                      key: player.key,
                      pressX: x,
                      pressY: y,
                      pageX: touch.pageX,
                      pageY: touch.pageY,
                    });
                  }}
                  className="player-icon"
                  style={{
                    backgroundColor: colors[player.key],
                    WebkitTransform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                    transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                    zIndex: player.key === lastPress ? 99 : visualPosition,
                    boxShadow: `${boxShadow}px 5px 5px rgba(0,0,0,0.5)`,
                  }}
                >
                  <UserOutlined />
                  <span>{player.nickname}</span>
                </div>
              )}
            </Motion>
          );
        })}
      </div>
    </div>
  );
};

export default DragPad;
