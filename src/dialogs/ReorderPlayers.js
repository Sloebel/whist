import React, { Component } from 'react';
import { Modal } from 'antd';
import DragPad from '../common/dragPad/DragPad';

export default class ReorderPlayers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showDialog: this.props.visible,
      order: props.players,
    }

    this.handleOnCancel = this.handleOnCancel.bind(this);
    this.handleOnOk = this.handleOnOk.bind(this);
    this.afterClose = this.afterClose.bind(this);
    this.handleDragChange = this.handleDragChange.bind(this);
  }

  handleOnCancel() {
    this.setState({
      showDialog: false
    });
  }

  handleOnOk() {
    this.setState({
      showDialog: false
    });

    const { onOk } = this.props;
    if (typeof onOk === 'function') {
      const { order } = this.state;
      onOk(order);
    }
  }

  afterClose() {
    const { onAfterClose } = this.props;

    if (typeof onAfterClose === 'function') {
      onAfterClose();
    }
  }

  handleDragChange(order, from, to) {
    this.setState({
      order,
      from,
      to
    });
  }

  render() {
    const { players } = this.props;
    const { showDialog } = this.state;

    return (
      <Modal
        title="Reorder Players"
        visible={showDialog}
        destroyOnClose={true}
        maskClosable={false}
        width="600px"
        onOk={this.handleOnOk}
        onCancel={this.handleOnCancel}
        afterClose={this.afterClose}
      >
        <DragPad players={players} onChange={this.handleDragChange} />
      </Modal>
    );
  }
}