import React, { Component } from 'react';

export default class CssUp extends Component {
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.children !== this.props.children) {
      this.div.classList.add('slide-up');
      setTimeout(() => this.div.classList.remove('slide-up'), 400);
    }
  }
  render() {
    return (
      <div
        className={''}
        ref={(el) => this.div = el}
      >
        {this.props.children}
      </div>
    );
  }
}