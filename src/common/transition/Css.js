import React, { Component } from 'react';

export const CSS_TRANSITIONS = {
  FADE_IN: 'fade-in',
  SLIDE_UP: 'slide-up'
}

export default class Css extends Component {
  componentDidMount() {
    const type = this.props.type;
    this.div.classList.add(type);
    setTimeout(() => this.div.classList.remove(type), 400);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.children !== this.props.children) {
      const type = this.props.type;
      this.div.classList.add(type);
      setTimeout(() => this.div.classList.remove(type), 400);
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