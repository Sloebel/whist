import React from 'react';
import Icon from '@ant-design/icons';
import { Spade, Hart, Diamond, Club } from '../cards/Icons';
import { CARDS } from '../../constants/cards';

export const cardsRenderer = (text) => {
  switch (text) {
    case CARDS.SPADE:
      return <Icon component={Spade} />;
    case CARDS.HART:
      return <Icon component={Hart} />;
    case CARDS.DIAMOND:
      return <Icon component={Diamond} />;
    case CARDS.CLUB:
      return <Icon component={Club} />;
    case CARDS.NT:
      return 'NT';
  }
};
