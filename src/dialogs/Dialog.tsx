import React from 'react';
import { DialogsMapping, Dialogs } from '../constants/dialogs';
import { INewGameDialogProps } from './NewGameDialog/NewGameDialog';
import { IGameInviteProps } from './GameInvite';
import { IReorderPlayersProps } from './ReorderPlayers';
import { INewLeagueProps } from './NewLeague';

export interface IBasicDialogProps<T> {
  visible: boolean;
  onAfterClose?: <T>(arg?: T) => void;
}

// TODO: remove the any once all the dialogs are ts and implement dinamic typing
export type DialogProps =
  | INewGameDialogProps
  | IGameInviteProps
  | IReorderPlayersProps
  | INewLeagueProps
  | any;

export interface IDialogProps {
  dialog: Dialogs;
  dialogProps?: DialogProps;
}

const Dialog: React.FC<IDialogProps> = (props) => {
  const { dialog, dialogProps } = props;
  const DialogEl = DialogsMapping[dialog];

  return <DialogEl {...dialogProps} />;
};

export default Dialog;
