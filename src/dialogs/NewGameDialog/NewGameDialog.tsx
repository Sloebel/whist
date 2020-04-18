import React from 'react';
import { Modal } from 'antd';
import './NewGameDialog.scss';
import { GameMode } from '../../models/IGameModel';
import { IBasicDialogProps } from '../Dialog';

interface INewGameDialogState {
  showDialog: boolean;
  modeSelected?: GameMode;
}

export interface INewGameDialogProps extends IBasicDialogProps<GameMode> {}

export default class NewGameDialog extends React.Component<
  INewGameDialogProps,
  INewGameDialogState
> {
  public constructor(props: INewGameDialogProps) {
    super(props);

    this.state = {
      showDialog: props.visible,
    };
  }

  public render() {
    const { showDialog } = this.state;

    return (
      <Modal
        wrapClassName="remote-local-dialog"
        visible={showDialog}
        destroyOnClose={true}
        closable={false}
        maskClosable={false}
        centered={true}
        width="300px"
        okText={'Frontal'}
        cancelText={'OnLine'}
        onOk={this.setGameMode('local')}
        onCancel={this.setGameMode('remote')}
        afterClose={this.handleAfterClose}
        bodyStyle={{ display: 'none' }}
      />
    );
  }

  private setGameMode = (mode: GameMode) => () => {
    this.setState({
      showDialog: false,
      modeSelected: mode,
    });
  };

  private handleAfterClose = () => {
    const { onAfterClose } = this.props;

    if (typeof onAfterClose === 'function' && this.state.modeSelected) {
      onAfterClose(this.state.modeSelected);
    }
  };
}
