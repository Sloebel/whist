import React from 'react';
import { DialogsMapping } from '../constants/dialogs';

const Dialog = ({
    dialog,
    dialogProps
}) => {

    const DialogEl = DialogsMapping[dialog];

    return <DialogEl {...dialogProps} />;
}

export default Dialog;

