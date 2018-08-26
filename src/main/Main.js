import React, { Component } from 'react';
import { Button } from 'antd';
import Dialog from './../dialogs/Dialog';

function Menu(props) {
    return (
        <ul className="App-menu">
            {props.items.map(function (item, index) {
                const { onClick, text, dialog, dialogProps } = item;
                return <li key={index}>
                    <Button onClick={onClick} size="large" block>{text}</Button>
                    {dialog && dialogProps.visible ? <Dialog dialog={dialog} dialogProps={dialogProps} /> : ''}
                </li>;
            })
            }
        </ul>
    );
}

class Main extends Component {
    state = {
        newLeague: false,
        resumeLeague: false
    };

    showResumeLeagueDialog() {
        this.setState({
            resumeLeague: true
        });
    }

    closeResumeLeagueDialog() {
        this.setState({
            resumeLeague: false
        });
    }

    showNewLeagueDialog() {
        this.setState({
            newLeague: true
        });
    }

    closeNewLeagueDialog() {
        return new Promise((resolve, reject) => {
            this.setState({
                newLeague: false
            });
            resolve();
        });
    }

    render() {
        return (<div className="App-main">
            <Menu items={[
                {
                    text: 'Resume League',
                    onClick: this.showResumeLeagueDialog.bind(this),
                    dialog: 'resumeLeague',
                    dialogProps: {
                        onCancel: this.closeResumeLeagueDialog.bind(this),
                        visible: this.state.resumeLeague
                    }
                }, {
                    text: 'Create League',
                    onClick: this.showNewLeagueDialog.bind(this),
                    dialog: 'newLeague',
                    dialogProps: {
                        onCancel: this.closeNewLeagueDialog.bind(this),
                        visible: this.state.newLeague
                    }
                },
                { text: 'Settings' },
                { text: 'Scores' }
            ]}
            >
            </Menu>
        </div>);
    }
}

export default Main;