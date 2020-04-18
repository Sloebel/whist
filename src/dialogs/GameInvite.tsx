import React from 'react';
import { Modal } from 'antd';
import { IGameInvite } from '../services/LeagueSrv';
import { IBasicDialogProps } from './Dialog';

interface IGameInviteState {
  showDialog: boolean;
}

export interface IGameInviteProps extends IBasicDialogProps<any> {
  invite: IGameInvite;
  onOk: () => void;
}

export default class GameInvite extends React.Component<
  IGameInviteProps,
  IGameInviteState
> {
  public constructor(props: IGameInviteProps) {
    super(props);

    this.state = {
      showDialog: props.visible,
    };
  }

  public render() {
    const { showDialog } = this.state;
    const { leagueTitle, newGameId, inviter } = this.props.invite;

    return (
      <Modal
        title="Game Invite"
        visible={showDialog}
        destroyOnClose={true}
        closable={true}
        maskClosable={false}
        centered={true}
        width="300px"
        okText={'Join'}
        cancelText={'Cancel'}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        afterClose={this.handleAfterClose}
      >
        <div>
          {`${inviter.nickname} from ${leagueTitle} invites you to join game ${newGameId}`}
        </div>
      </Modal>
    );
  }

  private handleOk = () => {
    this.setState({
      showDialog: false,
    });

    const { onOk } = this.props;
    if (typeof onOk === 'function') {
      onOk();
    }
  };

  private handleCancel = () => {
    this.setState({
      showDialog: false,
    });
  };

  private handleAfterClose = () => {
    const { onAfterClose } = this.props;

    if (typeof onAfterClose === 'function') {
      onAfterClose();
    }
  };
}
