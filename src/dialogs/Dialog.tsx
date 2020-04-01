import React from 'react';
import { DialogsMapping, Dialogs } from '../constants/dialogs';
import { IRemoteOrLocalDialogProps } from './RemoteOrLocalDialog/RemoteOrLocalDialog';

export type DialogProps = IRemoteOrLocalDialogProps | any;

export interface IDialogProps {
  dialog: Dialogs;
  dialogProps?: DialogProps;
}

const Dialog: React.SFC<IDialogProps> = props => {
  const { dialog, dialogProps } = props;
  const DialogEl = DialogsMapping[dialog];

  return <DialogEl {...dialogProps} />;
};

export default Dialog;
