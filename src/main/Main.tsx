import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { fire, auth } from '../firebase';
import withAuthorization from '../authentication/withAuthorization';
import { UserContext } from '../authentication/AuthUserContext';
import { ILeagueModel } from '../models/ILeagueModel';
import MainMenu from './MainMenu';
import * as routes from './../constants/routes';
import { Dialogs } from './../constants/dialogs';

interface IMainState {
	activeLeagues: ILeagueModel[];
	newLeague: boolean;
	resumeLeague: boolean;
	loading: boolean;
}

interface IMainProps extends RouteComponentProps {}

class Main extends Component<IMainProps, IMainState> {
	private activeLeaguesRef = fire.database().ref('leagues/list').orderByChild('active').equalTo(true);

	state: IMainState = {
		activeLeagues: [],
		newLeague: false,
		resumeLeague: false,
		loading: false
	};

	componentDidMount() {
		this.fetch();
	}

	componentWillUnmount() {
		this.activeLeaguesRef.off('value');
	}

	private fetch() {
		this.activeLeaguesRef.on('value', snapshot => {
			if (snapshot.val()) {
				const userId = fire.auth().currentUser?.uid;

				// TODO: Denormalize by maintaining a `userLeagues/{userId}` index in Firebase
				// so we can query the user's leagues directly instead of fetching all active
				// leagues and filtering client-side.

				this.setState({
					activeLeagues: Object.values(snapshot.val() as Record<string, ILeagueModel>).filter(({ players }) =>
						Object.values(players).some(({ key }) => key === userId)
					),
					loading: false
				});
			}
		});
	}

	private showResumeLeagueDialog = () => {
		this.setState({ resumeLeague: true });
	};

	private closeResumeLeagueDialog = (leagueID?: number) => {
		this.setState({ resumeLeague: false });
		this.navigateToLeague(leagueID);
	};

	private showNewLeagueDialog = () => {
		this.setState({ newLeague: true });
	};

	private closeNewLeagueDialog = (leagueID?: number) => {
		this.setState({ newLeague: false });
		this.navigateToLeague(leagueID);
	};

	private navigateToLeague(leagueID?: number) {
		if (leagueID) {
			this.props.history.push(`${routes.LEAGUE}/${leagueID}`);
		}
	}

	render() {
		return (
			<div className="app-main">
				<MainMenu
					items={[
						{
							text: 'Resume League',
							onClick: this.showResumeLeagueDialog,
							dialog: Dialogs.RESUME_LEAGUE,
							disabled: this.state.activeLeagues.length === 0,
							dialogProps: {
								afterClose: this.closeResumeLeagueDialog,
								visible: this.state.resumeLeague,
								activeLeagues: this.state.activeLeagues
							}
						},
						{
							text: 'Create League',
							onClick: this.showNewLeagueDialog,
							dialog: Dialogs.NEW_LEAGUE,
							dialogProps: {
								onAfterClose: this.closeNewLeagueDialog,
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

const authCondition = (authUser: UserContext) => !!authUser;

export default withAuthorization<IMainProps>(authCondition)(Main);
