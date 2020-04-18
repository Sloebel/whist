import React, { Component } from 'react';
import { fire, auth } from '../firebase';
import withAuthorization from '../authentication/withAuthorization';
import MainMenu from './MainMenu';
import * as routes from './../constants/routes';
import { Dialogs } from './../constants/dialogs';

class Main extends Component {
  // Dialogs visible states controling if the Dialog should be instansiated or not
  // this outer state is for saving unnecessary access to the DB
  state = {
    activeLeagues: [],
    newLeague: false,
    resumeLeague: false,
  };

  /* Create reference to activeLeagues in Firebase Database */
  activeLeagues = fire
    .database()
    .ref('leagues/list')
    .orderByChild('active')
    .equalTo(true);

  fetch() {
    this.activeLeagues.on('value', (snapshot) => {
      if (snapshot.val()) {
        const userId = fire.auth().currentUser.uid;

        // filtering leagues data by userId,
        // TODO: check if possible to fix the data differently in the database for better queries
        // TODO: fix the loader functionality
        this.setState({
          activeLeagues: Object.values(snapshot.val()).filter(({ players }) =>
            Object.values(players).some(({ key }) => key === userId)
          ),
          loading: false,
        });
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
      resumeLeague: true,
    });
  }

  closeResumeLeagueDialog(leagueID) {
    this.setState({
      resumeLeague: false,
    });

    this.navigateToLeague(leagueID);
  }

  showNewLeagueDialog() {
    this.setState({
      newLeague: true,
    });
  }

  closeNewLeagueDialog(leagueID) {
    this.setState({
      newLeague: false,
    });

    this.navigateToLeague(leagueID);
  }

  navigateToLeague(leagueID) {
    if (leagueID) {
      this.props.history.push(`${routes.LEAGUE}/` + leagueID);
    }
  }

  render() {
    return (
      <div className="app-main">
        <MainMenu
          items={[
            {
              text: 'Resume League',
              onClick: this.showResumeLeagueDialog.bind(this),
              dialog: Dialogs.RESUME_LEAGUE,
              disabled: this.state.activeLeagues.length === 0,
              dialogProps: {
                afterClose: this.closeResumeLeagueDialog.bind(this),
                visible: this.state.resumeLeague,
                activeLeagues: this.state.activeLeagues,
              },
            },
            {
              text: 'Create League',
              onClick: this.showNewLeagueDialog.bind(this),
              dialog: Dialogs.NEW_LEAGUE,
              dialogProps: {
                onAfterClose: this.closeNewLeagueDialog.bind(this),
                visible: this.state.newLeague,
              },
            },
            { text: 'Settings' },
            { text: 'Scores' },
            {
              text: 'Sign Out',
              onClick: auth.signOut,
            },
          ]}
        />
      </div>
    );
  }
}

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(Main);
