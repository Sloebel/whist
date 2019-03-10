import React, { Component } from 'react';
import { Select, Icon, Button, Modal } from 'antd';
import { Spade, Hart, Diamond, Club } from './Icons';
import './Modal.css';

const Option = Select.Option;

class CardsModal extends Component {
  state = { visible: false }

  showModal = () => {
    this.setState({
      visible: true,
    });
  }

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  }

  onTrumpSelect(value) {
    this.props.onChange(value);
    this.setState({
      visible: false,
    });
  }

  trumpIconMap = {
    SPADE: Spade,
    HART: Hart,
    DIAMOND: Diamond,
    CLUB: Club,
    NT: 'NT'
  }

  render() {
    const { trump, disabled } = this.props;

    return (
      <div>
        <Button ghost className="card-btn" onClick={this.showModal} disabled={disabled}>
          {trump ? trump === 'NT' ? 'NT' : <Icon component={this.trumpIconMap[trump]} /> : <Icon type="question" />}
        </Button>
        <Modal
          footer={null}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          className="cards-modal"
        >
          <Button className="card-btn" onClick={this.onTrumpSelect.bind(this, 'SPADE')}><Icon component={Spade} /></Button>
          <Button className="card-btn" onClick={this.onTrumpSelect.bind(this, 'HART')}><Icon component={Hart} /></Button>
          <Button className="card-btn" onClick={this.onTrumpSelect.bind(this, 'DIAMOND')}><Icon component={Diamond} /></Button>
          <Button className="card-btn" onClick={this.onTrumpSelect.bind(this, 'CLUB')}><Icon component={Club} /></Button>
          <Button className="card-btn" onClick={this.onTrumpSelect.bind(this, 'NT')}>NT</Button>
        </Modal>
      </div>
    );
  }
};

export default CardsModal;