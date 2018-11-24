import React, { Component } from 'react';
import { fire } from '../firebase';
import withAuthorization from '../authentication/withAuthorization';
import { Collapse, Tabs, Button, Row, Col } from 'antd';
import './League.css';
import GameTab from './../game/GameTab';

const Panel = Collapse.Panel;
const TabPane = Tabs.TabPane;

class League extends Component {
	constructor(props) {
		super(props);

		this.state = {
			league: { title: '', games: [] },
			activeGame: `0`
		};

		this.leagueID = props.match.params.id;
		/* Create reference to messages in Firebase Database */
		this.league = fire.database().ref('leagues/list').orderByChild("leagueID").equalTo(this.leagueID * 1);
	}

	fetch() {
		this.league.on('value', snapshot => {
			console.log(snapshot.val());
			const leagueData = snapshot.val() && snapshot.val()['_' + this.leagueID];
			if (!leagueData.games) {
				leagueData.games = [{ title: 'Game 1', key: 1 }];
			}
			if (leagueData) {
				this.setState({ league: leagueData, activeGame: `${leagueData.games.length}` });
			}
		});
	}

	componentDidMount() {
		this.fetch();
	}

	componentWillUnmount() {
		this.league.off('value');
	}

	onTabChange = (activeGame) => {
		this.setState({ activeGame });
	}

	addGame = () => {
		const { league } = this.state;
		const { games } = league;
		const activeGame = `${games.length + 1}`;
		games.push({ title: 'Game ' + activeGame, key: activeGame });
		this.setState({ league, activeGame });
	}

	render() {
		const { isMobile } = this.props;
		const { league, activeGame } = this.state;
		const { title, games } = league;

		return (
			<div>				
				<Tabs
					className="games-container"
					activeKey={activeGame}
					onChange={this.onTabChange}
					tabBarExtraContent={<Button onClick={this.addGame}>New Game</Button>}
				>
					{games.map((game) => <TabPane tab={game.title} key={game.key}><GameTab>{game.content}</GameTab></TabPane>)}
				</Tabs>
			</div>);
	}
}

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(League);

/*
<Collapse className="league-stats" defaultActiveKey="1">
					<Panel header={title} key="1">
						{isMobile ? (<div>'Mobile view'</div>) :
							(<Row>
								<Col lg={{ span: 22, offset: 1 }} xl={{ span: 11, offset: 1 }}>
									<Row className="row-header">
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 4 }}>Col Header</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Header</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Header</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Header</Col>
									</Row>
									<Row className="row-data">
										<Col xs={{ span: 24, offset: 0 }} lg={{ span: 4, offset: 0 }} className="col-subject">Col Subject</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
									</Row>
									<Row className="row-data">
										<Col xs={{ span: 24, offset: 0 }} lg={{ span: 4, offset: 0 }}>Col Subject</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
									</Row>
									<Row className="row-data">
										<Col xs={{ span: 24, offset: 0 }} lg={{ span: 4, offset: 0 }}>Col Subject</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
									</Row>
									<Row className="row-data">
										<Col xs={{ span: 24, offset: 0 }} lg={{ span: 4, offset: 0 }}>Col Subject</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
									</Row>
									<Row className="row-data">
										<Col xs={{ span: 24, offset: 0 }} lg={{ span: 4, offset: 0 }}>Col Subject</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
									</Row>
								</Col>
								<Col lg={{ span: 22, offset: 1 }} xl={{ span: 11, offset: 1 }}>
									<Row className="row-header">
										<Col xs={{ span: 0, offset: 4 }} xl={{ span: 5, offset: 4 }}>Col Header</Col>
										<Col xs={{ span: 0, offset: 0 }} xl={{ span: 5, offset: 0 }}>Col Header</Col>
										<Col xs={{ span: 0, offset: 0 }} xl={{ span: 5, offset: 0 }}>Col Header</Col>
										<Col xs={{ span: 0, offset: 0 }} xl={{ span: 5, offset: 0 }}>Col Header</Col>
									</Row>
									<Row className="row-data">
										<Col xs={{ span: 24, offset: 0 }} lg={{ span: 4, offset: 0 }} className="col-subject">Col Subject</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
									</Row>
									<Row className="row-data">
										<Col xs={{ span: 24, offset: 0 }} lg={{ span: 4, offset: 0 }}>Col Subject</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
										<Col xs={{ span: 6, offset: 0 }} lg={{ span: 5, offset: 0 }}>Col Data</Col>
									</Row>
								</Col>
							</Row>)
						}

					</Panel>
				</Collapse>
*/