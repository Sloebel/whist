import React, { Component } from 'react';
import { Button, Modal } from 'antd';
import Icon, { QuestionOutlined } from '@ant-design/icons';
import { Spade, Hart, Diamond, Club } from './Icons';
import './Modal.scss';

class CardsModal extends Component {
  state = { visible: false };

  componentDidUpdate(prevProp) {
    if (
      prevProp.visible !== this.props.visible &&
      this.props.visible !== this.state.visible
    ) {
      this.setState({
        visible: this.props.visible,
      });
    }
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

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
    NT: 'NT',
  };

  render() {
    const { trump, disabled } = this.props;

    return (
      <div className="cards-modal">
        trump
        <Button
          ghost
          className="card-btn"
          onClick={this.showModal}
          disabled={disabled}
        >
          {trump ? (
            trump === 'NT' ? (
              'NT'
            ) : (
              <Icon component={this.trumpIconMap[trump]} />
            )
          ) : (
            <QuestionOutlined />
          )}
        </Button>
        <Modal
          footer={null}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          className="cards-modal-dialog"
        >
          <Button
            className="card-btn"
            onClick={this.onTrumpSelect.bind(this, 'SPADE')}
          >
            <Icon component={Spade} />
          </Button>
          <Button
            className="card-btn"
            onClick={this.onTrumpSelect.bind(this, 'HART')}
          >
            <Icon component={Hart} />
          </Button>
          <Button
            className="card-btn"
            onClick={this.onTrumpSelect.bind(this, 'DIAMOND')}
          >
            <Icon component={Diamond} />
          </Button>
          <Button
            className="card-btn"
            onClick={this.onTrumpSelect.bind(this, 'CLUB')}
          >
            <Icon component={Club} />
          </Button>
          <Button
            className="card-btn"
            onClick={this.onTrumpSelect.bind(this, 'NT')}
          >
            NT
          </Button>
        </Modal>
      </div>
    );
  }
}

export default CardsModal;
