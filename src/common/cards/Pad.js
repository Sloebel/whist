import React, { Component } from 'react';
import { Radio } from 'antd';
import Icon from '@ant-design/icons';
import { Spade, Hart, Diamond, Club } from './Icons';
import './Pad.css';

class CardsPad extends Component {
  onChange = e => this.props.onChange(e.target.value);

  render() {
    const { trump } = this.props;

    return (
      <Radio.Group
        buttonStyle="solid"
        className="cards-pad"
        size={'small'}
        value={trump}
        onChange={this.onChange}
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
  }
}

export default CardsPad;
