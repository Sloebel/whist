import React, { useState, useEffect } from 'react';
import './ThrownCard.scss';

export type ThrownCardType = 'top' | 'left' | 'right' | 'bottom';

export interface IThrownCardProps {
  card?: string;
  thrownType: ThrownCardType;
  from?: { top: number; left: number };
  to: { top: number; left: number };
  hasWinner?: boolean;
}

const ThrownCard = (props: IThrownCardProps) => {
  const { card, thrownType, from, to, hasWinner } = props;
  const [style, setStyle] = useState(from ? from : to);

  useEffect(() => {
    setStyle(to);
  }, [to]);

  return (
    <div
      className={`thrown-card ${thrownType} ${hasWinner ? 'has-winner' : ''}`}
      style={{ ...style }}
    >
      {card && (
        <img
          src={require(`../../images/playCards/${card}.svg`)}
          style={{ width: '90px' }}
        />
      )}
    </div>
  );
};

export default ThrownCard;
