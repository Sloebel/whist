import React, { Component } from 'react';
import NewLeagueDialog from './NewLeague';
import ResumeLeagueDialog from './ResumeLeague';

const Dialog = ({
    dialog,
    dialogProps
}) => {
    const dialogs = {
        newLeague: NewLeagueDialog,
        resumeLeague: ResumeLeagueDialog
    };
    const DialogEl = dialogs[dialog];

    return <DialogEl {...dialogProps} />;
}

export default Dialog;

