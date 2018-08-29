import React, { Component } from 'react';
import fire from './../fire.js';
import { Collapse, Tabs, Button, Carousel } from 'antd';
import './League.css';

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
        const { league, activeGame } = this.state;
        const { title, games } = league;
        return (
            <div>
                <Collapse className="league-stats" defaultActiveKey="1">
                    <Panel header={title} key="1">
                    </Panel>
                </Collapse>
                <Tabs
                    className="games-container"
                    activeKey={activeGame}
                    onChange={this.onTabChange}
                    tabBarExtraContent={<Button onClick={this.addGame}>New Game</Button>}
                >
                    {games.map((game) => <TabPane tab={game.title} key={game.key}>{game.content}</TabPane>)}
                </Tabs>
            </div>);
    }
}


export default League;