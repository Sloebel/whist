import React, { Component } from 'react';
import NewLeagueDialog from './NewLeague';
import ResumeLeagueDialog from './ResumeLeague';

class Dialog extends Component {
    dialogs = {
        newLeague: NewLeagueDialog,
        resumeLeague: ResumeLeagueDialog
    };
    render() {
        const { dialog, dialogProps } = this.props;
        const DialogEl = this.dialogs[dialog];
        return <DialogEl {...dialogProps}/>
    }
}
export default Dialog;

