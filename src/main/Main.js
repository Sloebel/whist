import React, { Component } from 'react';
import { fire, auth } from '../firebase';
import withAuthorization from '../authentication/withAuthorization';
import MainMenu from './MainMenu';

class Main extends Component {
    // Dialogs visible states controling if the Dialog should be instansiated or not
    // this outer state is for saving unnecessary access to the DB
    state = {
        activeLeagues: [],
        newLeague: false,
        resumeLeague: false
    };

    /* Create reference to activeLeagues in Firebase Database */
    activeLeagues = fire.database().ref('leagues/list').orderByChild("active").equalTo(true);

    fetch() {
        this.activeLeagues.on('value', snapshot => {
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

    closeResumeLeagueDialog(leagueID) {
        this.setState({
            resumeLeague: false
        });

        if (leagueID) {
            this.props.history.push('/league/' + leagueID)
        }
    }

    showNewLeagueDialog() {
        this.setState({
            newLeague: true
        });
    }

    closeNewLeagueDialog(leagueID) {
        this.setState({
            newLeague: false
        });

        if (leagueID) {
            this.props.history.push('/league/' + leagueID)
        }
    }

    render() {
        return (
            <div className="app-main">
                <MainMenu items={[
                    {
                        text: 'Resume League',
                        onClick: this.showResumeLeagueDialog.bind(this),
                        dialog: 'resumeLeague',
                        disabled: this.state.activeLeagues.length === 0,
                        dialogProps: {
                            afterClose: this.closeResumeLeagueDialog.bind(this),
                            visible: this.state.resumeLeague,
                            activeLeagues: this.state.activeLeagues
                        }
                    }, {
                        text: 'Create League',
                        onClick: this.showNewLeagueDialog.bind(this),
                        dialog: 'newLeague',
                        dialogProps: {
                            afterClose: this.closeNewLeagueDialog.bind(this),
                            visible: this.state.newLeague
                        }
                    },
                    { text: 'Settings' },
                    { text: 'Scores' },
                    {
                        text: 'Sign Out',
                        onClick: auth.signOut
                    }
                ]}
                />
            </div>
        );
    }
}

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(Main);