import React, { Component } from 'react';
import { Button } from 'antd';
import NewLeagueDialog from './../dialogs/NewLeague';

function Menu(props) {
    return (
        <ul className="App-menu">
            {props.items.map(function (item, index) {
                const { onClick, text, dialogProps } = item;
                return <li key={index}>
                    <Button onClick={onClick} size="large" block>{text}</Button>
                    {dialogProps ? <NewLeagueDialog {...dialogProps} /> : ''}
                </li>;
            })
            }
        </ul>
    );
}

class Main extends Component {
    state = {
        dialogsPlayers: false
    };

    showPlayersDialog() {
        this.setState({
            dialogsPlayers: true
        });
    }

    closePlayersDialog() {
        return new Promise((resolve, reject) => {
            this.setState({
                dialogsPlayers: false
            });
            resolve();
        });
    }

    render() {
        return (<div className="App-main">
            <Menu items={[
                {
                    text: 'Resume League',
                    onClick: () => { console.log(this); }
                }, {
                    text: 'Create League',
                    onClick: this.showPlayersDialog.bind(this),
                    dialogProps: {
                        onCancel: this.closePlayersDialog.bind(this),
                        // content: <SelectionTool />,
                        visible: this.state.dialogsPlayers
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