import React, { Component } from 'react';
import { Button } from 'antd';
import fire from './../fire.js';
import Dialog from './../dialogs/Dialog';

function Menu(props) {
    return (
        <ul className="App-menu">
            {props.items.map(function (item, index) {
                const { onClick, text, dialog, dialogProps, disabled } = item;
                return <li key={index}>
                    <Button onClick={onClick} size="large" disabled={disabled} block>{text}</Button>
                    {dialog && dialogProps.visible ? <Dialog dialog={dialog} dialogProps={dialogProps} /> : ''}
                </li>;
            })
            }
        </ul>
    );
}

class Main extends Component {
    state = {
        activeLeagues: [],
        newLeague: false,
        resumeLeague: false
    };

    /* Create reference to activeLeagues in Firebase Database */
    activeLeagues = fire.database().ref('leagues/list').orderByChild("active").equalTo(true);

    fetch() {
        this.activeLeagues.on('value', snapshot => {
            console.log(snapshot.val());
            if (snapshot.val()) {
                this.setState({ activeLeagues: Object.values(snapshot.val()), loading: false });
            }
        });
    }

    componentDidMount() {
        this.fetch();
    }

    componentWillUnmount() {
        this.activeLeagues.off('value');
    }


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
                    disabled: this.state.activeLeagues.length === 0,
                    dialogProps: {
                        onCancel: this.closeResumeLeagueDialog.bind(this),
                        visible: this.state.resumeLeague,
                        activeLeagues: this.state.activeLeagues
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