import React, { Component } from 'react';
import { fire } from '../firebase';
import { Route, Link } from "react-router-dom";
import withAuthorization from '../authentication/withAuthorization';
import { Menu, Icon, Layout } from 'antd';
import './League.css';
import GameTab from './../game/GameTab';
import Arrow from '../common/arrowButton/arrow/Arrow';
import * as routes from './../constants/routes';
import gameDataTpl from './../dataTemplates/gameTpl';
import RcDrawer from 'rc-drawer';
import 'rc-drawer/assets/index.css';
import Loader from '../common/loader/Loader';

const { Content, Sider } = Layout;
const SubMenu = Menu.SubMenu;

class League extends Component {
	constructor(props) {
		super(props);

		const { location, match } = props;
		const { leagueID } = match.params;

		const matchGame = location.pathname.match(/game\/[1-9]/g) || [];
		const gameID = matchGame.length ? matchGame[0].split('/')[1] : false;

		this.state = {
			loading: true,
			siderCollapse: false,
			menuSelected: gameID || 'dashboard',
			league: { title: '', players: [] },
			leagueGames: [],
			drawerVisible: false
			// activeGame: `0`
		};

		/* Create reference to messages in Firebase Database */
		const dbRef = fire.database().ref();
		this.leagueRef = dbRef.child(`leagues/list/_${leagueID}`);
		this.leagueGamesRef = dbRef.child(`leagueGames/_${leagueID}`);

		this.setLoaderState = this.setLoaderState.bind(this);
	}

	fetch() {
		this.leagueRef.on('value', snapshot => {
			console.log(snapshot.val());
			const leagueData = snapshot.val();
			// if (!leagueData.games) {
			// 	leagueData.games = [{ title: 'Game 1', key: 1 }];
			// }
			if (leagueData) {
				this.setState({
					league: {
						...this.state.league,
						...leagueData,
					}
					// activeGame: `${leagueData.games.length}`
				});
			}
		});

		this.leagueGamesRef.on('child_added', snapshot => {
			this.setState(prevState => {
				return { leagueGames: [...prevState.leagueGames, snapshot.val()] };
			});
		});
	}

	componentDidMount() {
		this.fetch();
	}

	componentWillUnmount() {
		this.leagueRef.off('value');
	}

	// onTabChange = (activeGame) => {
	// 	this.setState({ activeGame });
	// }

	addGame = () => {
		const { league, leagueGames } = this.state;
		const { leagueID } = league;

		const newGameId = leagueGames.length + 1;

		const newGameKey = fire.database().ref().child('games').push().key;

		const updates = {};
		const gameTpl = { gameID: newGameId, ...gameDataTpl() };

		updates[`/games/${newGameKey}`] = gameTpl;
		updates[`/leagueGames/_${leagueID}/${newGameKey}`] = { gameID: newGameId };

		fire.database().ref().update(updates);
	}

	handleMenuItemClick = (item) => {
		const key = item.key;

		if (key === 'new_game') {
			this.addGame();
		}

		if (key !== "main_menu" && key !== this.state.menuSelected) {
			this.setState({ menuSelected: key });
			setTimeout(this.toggleDrawer, 500);
			this.setLoaderState(true);
		}
	}

	setLoaderState(loading) {
		this.setState({ loading });
	}

	toggleSider = () => {
		this.setState({
			siderCollapse: !this.state.siderCollapse,
		});
	}

	toggleDrawer = () => {
		this.setState({
			drawerVisible: !this.state.drawerVisible,
		});
	};

	getMenu() {
		const { match } = this.props;
		const { leagueGames, menuSelected } = this.state;

		return (<Menu
			mode="inline"
			selectedKeys={[menuSelected]}
			defaultOpenKeys={['gamesSub']}
			onClick={this.handleMenuItemClick}
			className="league-menu"
		>
			<Menu.Item key="dashboard">
				<Icon type="dashboard" />
				<Link to={`${match.url}`}>League Summary</Link>
			</Menu.Item>
			<SubMenu
				key="gamesSub"
				title={<span><Icon type="gold" /><span>Games</span></span>}
			>
				{leagueGames.map((game, i) => (
					<Menu.Item key={game.gameID.toString()}><Link to={`${match.url}${routes.GAME}/${game.gameID}`}>Game {game.gameID}</Link></Menu.Item>
				))}

				<Menu.Item key="new_game">
					<Icon type="plus" />
					<span>New Game</span>
				</Menu.Item>
			</SubMenu>

			<Menu.Item key="main_menu">
				<Icon type="export" className={'rotate-180'} />
				<Link to={`/`}>To Main Menu</Link>
			</Menu.Item>
		</Menu>);
	}

	render() {
		const { isMobile, screenSize, match } = this.props;
		const { league, siderCollapse, loading, drawerVisible } = this.state;
		const { leagueID, title, players } = league;

		return (
			<Layout className="league-container">
				{isMobile ? (
					<RcDrawer
						getContainer="#root"
						width="250px"
						open={drawerVisible}
						onHandleClick={this.toggleDrawer}
						onMaskClick={this.toggleDrawer}
					>
						{this.getMenu()}
					</RcDrawer>
				)
					: <Sider
						trigger={null}
						collapsible
						collapsed={siderCollapse}
						style={{ background: '#fff' }}
					>
						<Arrow direction={'left'} onClick={this.toggleSider} />
						{this.getMenu()}
					</Sider>}
				<Layout>
					<Content
					// style={{
					// 	margin: '24px 16px', padding: 24, minHeight: 280,
					// }}
					>
						<Route path={`${routes.LEAGUE}/:leagueID/game/:gameID`} render={(props) => !!leagueID ? <GameTab {...props} isMobile={isMobile} screenSize={screenSize} players={players} loading={loading} loaderStateCb={this.setLoaderState} /> : <Loader />} />
						<Route
							exact
							path={match.url}
							render={() => <h3>{title}</h3>}
						/>
					</Content>

				</Layout>
			</Layout>
		);
	}
}

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(League);