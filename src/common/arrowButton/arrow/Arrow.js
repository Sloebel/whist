import React, { Component } from 'react';
import './Arrow.css';

class Arrow extends Component {
  state = {
    isActive: false
  };

  handleClick = () => {
    this.setState({
      isActive: !this.state.isActive
    });

    const { onClick } = this.props;

    if (onClick) {
      onClick();
    }
  }

  render() {
    const { direction } = this.props;
    const { isActive } = this.state;

    return (
      <div
        className={`btn-menu-arrow-container`}
        onClick={this.handleClick}
      >
        <div className={`btn-menu-arrow ${direction} ${isActive ? 'spin' : 'arrow'}`}>
          <span></span>
        </div>
      </div>
    );
  }
}

export default Arrow;