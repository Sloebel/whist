import React, { Component } from 'react';
import { Modal } from 'antd';
import DragPad from '../common/dragPad/DragPad';
import { IBasicDialogProps } from './Dialog';
import { IPlayer } from '../models/IPlayerModel';

interface IReorderPlayersState {
  showDialog: boolean;
  order: IPlayer[];
}

export interface IReorderPlayersProps extends IBasicDialogProps<any> {
  players: IPlayer[];
  onOk: (order: IPlayer[]) => void;
}

export default class ReorderPlayers extends Component<
  IReorderPlayersProps,
  IReorderPlayersState
> {
  constructor(props: IReorderPlayersProps) {
    super(props);

    this.state = {
      showDialog: props.visible,
      order: props.players,
    };

    this.handleOnCancel = this.handleOnCancel.bind(this);
    this.handleOnOk = this.handleOnOk.bind(this);
    this.afterClose = this.afterClose.bind(this);
    this.handleDragChange = this.handleDragChange.bind(this);
  }

  public render() {
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

  private handleOnCancel() {
    this.setState({
      showDialog: false,
    });
  }

  private handleOnOk() {
    this.setState({
      showDialog: false,
    });

    const { onOk } = this.props;
    if (typeof onOk === 'function') {
      const { order } = this.state;
      onOk(order);
    }
  }

  private afterClose() {
    const { onAfterClose } = this.props;

    if (typeof onAfterClose === 'function') {
      onAfterClose();
    }
  }

  private handleDragChange(order: IPlayer[]) {
    this.setState({
      order,
    });
  }
}
