import React, { Component } from 'react';
import { Button } from 'antd';
import './Pad.css';

export default class NumbersPad extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showMore: false
    };

    this.toggleMore = this.toggleMore.bind(this);
    this.onBtnClick = this.onBtnClick.bind(this);
  }

  toggleMore() {
    this.setState({
      showMore: !this.state.showMore
    });
  }

  onBtnClick(e) {
    this.props.onSelect(e.target.textContent * 1);
  }

  render() {
    const { isMobile, disabled } = this.props;
    const btnSize = isMobile ? 'default' : 'large';
    const { showMore } = this.state;

    return (
      <div>
        <div className="dial-pad">
          {!showMore ? this.getButtons(0, 10) : this.getButtons(10, 4)}
          <Button size={btnSize} onClick={this.toggleMore} className="more-less-btn" disabled={disabled}>{!showMore ? 'More...' : 'Less...'}</Button>
        </div>
      </div>
    );
  }

  getButtons = (baseNum, amount) => {
    const { isMobile, disabled, disabledNumber } = this.props;
    const btnSize = isMobile ? 'default' : 'large';

    return Array(amount).fill(baseNum).map((num, i) => (
      <Button key={i} onClick={this.onBtnClick} size={btnSize} disabled={disabled || disabledNumber === (i + num)}>{i + num}</Button>
    ))
  }
};