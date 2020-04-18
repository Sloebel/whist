import React, { useCallback } from 'react';
import './PlayCard.scss';

export interface IPlayCardProps {
  card: string;
  preSelected: boolean;
  thrown: boolean;
  disabled: boolean;
  onCardClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const PlayCard = (props: IPlayCardProps) => {
  const { card, preSelected, thrown, onCardClick, disabled } = props;

  const clickHandler = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!disabled) {
        onCardClick(event);
      }
    },
    [onCardClick, disabled]
  );

  return (
    <div
      className={`play-card ${preSelected ? 'pre-selected' : ''} ${
        thrown ? 'thrown' : ''
      } ${disabled ? 'disabled' : ''}`}
      onClick={clickHandler}
    >
      <img src={require(`../../images/playCards/${card}.svg`)} />
    </div>
  );
};

export default PlayCard;
