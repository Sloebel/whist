import React, { useCallback } from 'react';
import Card2C from '../../images/playCards/2-C.svg'
import Card2D from '../../images/playCards/2-D.svg'
import Card2H from '../../images/playCards/2-H.svg'
import Card2J from '../../images/playCards/2-J.svg'
import Card2S from '../../images/playCards/2-S.svg'
import Card3C from '../../images/playCards/3-C.svg'
import Card3D from '../../images/playCards/3-D.svg'
import Card3H from '../../images/playCards/3-H.svg'
import Card3S from '../../images/playCards/3-S.svg'
import Card4C from '../../images/playCards/4-C.svg'
import Card4D from '../../images/playCards/4-D.svg'
import Card4H from '../../images/playCards/4-H.svg'
import Card4S from '../../images/playCards/4-S.svg'
import Card5C from '../../images/playCards/5-C.svg'
import Card5D from '../../images/playCards/5-D.svg'
import Card5H from '../../images/playCards/5-H.svg'
import Card5S from '../../images/playCards/5-S.svg'

import Card6C from '../../images/playCards/6-C.svg'
import Card6D from '../../images/playCards/6-D.svg'
import Card6H from '../../images/playCards/6-H.svg'
import Card6S from '../../images/playCards/6-S.svg'

import Card7C from '../../images/playCards/7-C.svg'
import Card7D from '../../images/playCards/7-D.svg'
import Card7H from '../../images/playCards/7-H.svg'
import Card7S from '../../images/playCards/7-S.svg'

import Card8C from '../../images/playCards/8-C.svg'
import Card8D from '../../images/playCards/8-D.svg'
import Card8H from '../../images/playCards/8-H.svg'
import Card8S from '../../images/playCards/8-S.svg'

import Card9C from '../../images/playCards/9-C.svg'
import Card9D from '../../images/playCards/9-D.svg'
import Card9H from '../../images/playCards/9-H.svg'
import Card9S from '../../images/playCards/9-S.svg'

import Card10C from '../../images/playCards/10-C.svg'
import Card10D from '../../images/playCards/10-D.svg'
import Card10H from '../../images/playCards/10-H.svg'
import Card10S from '../../images/playCards/10-S.svg'

import Card11C from '../../images/playCards/11-C.svg'
import Card11D from '../../images/playCards/11-D.svg'
import Card11H from '../../images/playCards/11-H.svg'
import Card11S from '../../images/playCards/11-S.svg'

import Card12C from '../../images/playCards/12-C.svg'
import Card12D from '../../images/playCards/12-D.svg'
import Card12H from '../../images/playCards/12-H.svg'
import Card12S from '../../images/playCards/12-S.svg'

import Card13C from '../../images/playCards/13-C.svg'
import Card13D from '../../images/playCards/13-D.svg'
import Card13H from '../../images/playCards/13-H.svg'
import Card13S from '../../images/playCards/13-S.svg'

import Card14C from '../../images/playCards/14-C.svg'
import Card14D from '../../images/playCards/14-D.svg'
import Card14H from '../../images/playCards/14-H.svg'
import Card14S from '../../images/playCards/14-S.svg'

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
  console.log('card', Card2C)

  const getCard = (card: string) => {
    switch (card) {
      case '2-C':
        return Card2C
      case '2-D':
        return Card2D
      case '2-H':
        return Card2H
      case '2-J':
        return Card2J
      case '2-S':
        return Card2S
      case '3-C':
        return Card3C
      case '3-D':
        return Card3D
      case '3-H':
        return Card3H
      case '3-S':
        return Card3S

      case '4-C':
        return Card4C
      case '4-D':
        return Card4D
      case '4-H':
        return Card4H
      case '4-S':
        return Card4S


      case '5-C':
        return Card5C
      case '5-D':
        return Card5D
      case '5-H':
        return Card5H
      case '5-S':
        return Card5S

      case '6-C':
        return Card6C
      case '6-D':
        return Card6D
      case '6-H':
        return Card6H
      case '6-S':
        return Card6S

      case '7-C':
        return Card7C
      case '7-D':
        return Card7D
      case '7-H':
        return Card7H
      case '7-S':
        return Card7S

      case '8-C':
        return Card8C
      case '8-D':
        return Card8D
      case '8-H':
        return Card8H
      case '8-S':
        return Card8S

      case '9-C':
        return Card9C
      case '9-D':
        return Card9D
      case '9-H':
        return Card9H
      case '9-S':
        return Card9S

      case '10-C':
        return Card10C;
      case '10-D':
        return Card10D;
      case '10-H':
        return Card10H;
      case '10-S':
        return Card10S;

      case '11-C':
        return Card11C;
      case '11-D':
        return Card11D;
      case '11-H':
        return Card11H;
      case '11-S':
        return Card11S;

      case '12-C':
        return Card12C;
      case '12-D':
        return Card12D;
      case '12-H':
        return Card12H;
      case '12-S':
        return Card12S;

      case '13-C':
        return Card13C;
      case '13-D':
        return Card13D;
      case '13-H':
        return Card13H;
      case '13-S':
        return Card13S;

      case '14-C':
        return Card14C;
      case '14-D':
        return Card14D;
      case '14-H':
        return Card14H;
      case '14-S':
        return Card14S;
    }
  }

  return (
    <div
      className={`play-card ${preSelected ? 'pre-selected' : ''} ${thrown ? 'thrown' : ''
        } ${disabled ? 'disabled' : ''}`}
      onClick={clickHandler}
    >
      <img src={getCard(card)} />
    </div>
  );
};

export default PlayCard;
