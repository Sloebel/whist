import React, { useState } from 'react';
import { Button } from 'antd';
import './Pad.scss';

interface NumbersPadProps {
  disabled?: boolean;
  disabledNumber?: number;
  onSelect: (value: number) => void;
}

const NumbersPad: React.FC<NumbersPadProps> = ({ disabled, disabledNumber, onSelect }) => {
  const [showMore, setShowMore] = useState(false);

  const onBtnClick = (e: React.MouseEvent<HTMLElement>) => {
    onSelect(Number((e.target as HTMLElement).textContent));
  };

  const getButtons = (baseNum: number, amount: number): React.ReactNode[] => {
    return Array(amount)
      .fill(baseNum)
      .map((num: number, i: number) => (
        <Button
          key={i}
          onClick={onBtnClick}
          size="middle"
          disabled={disabled || disabledNumber === i + num}
        >
          {i + num}
        </Button>
      ));
  };

  return (
    <div>
      <div className="dial-pad">
        {!showMore ? getButtons(0, 10) : getButtons(10, 4)}
        <Button
          size="middle"
          onClick={() => setShowMore(prev => !prev)}
          className="more-less-btn"
          disabled={disabled}
        >
          {!showMore ? 'More...' : 'Less...'}
        </Button>
      </div>
    </div>
  );
};

export default NumbersPad;
