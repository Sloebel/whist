import React from 'react';
import { Radio } from 'antd';
import type { RadioChangeEvent } from 'antd';
import Icon from '@ant-design/icons';
import { Spade, Hart, Diamond, Club } from './Icons';
import { CARDS } from '../../constants/cards';
import './Pad.scss';

interface CardsPadProps {
  trump?: CARDS;
  onChange: (value: string) => void;
}

const CardsPad: React.FC<CardsPadProps> = ({ trump, onChange }) => {
  const handleChange = (e: RadioChangeEvent) => onChange(e.target.value);

  return (
    <Radio.Group
      buttonStyle="solid"
      className="cards-pad"
      size={'small'}
      value={trump}
      onChange={handleChange}
    >
      <Radio.Button value={'SPADE'} className="spade card-btn">
        <Icon component={Spade} />
      </Radio.Button>
      <Radio.Button value={'HART'} className="hart card-btn">
        <Icon component={Hart} />
      </Radio.Button>
      <Radio.Button value={'DIAMOND'} className="diamond card-btn">
        <Icon component={Diamond} />
      </Radio.Button>
      <Radio.Button value={'CLUB'} className="club card-btn">
        <Icon component={Club} />
      </Radio.Button>
      <Radio.Button value={'NT'} className="NT card-btn">
        <span>NT</span>
      </Radio.Button>
    </Radio.Group>
  );
};

export default CardsPad;
