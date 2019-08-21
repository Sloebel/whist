import React, { Component } from 'react';
import { fire } from './../firebase';
import { Layout, Menu, Table, Card, Button, message } from 'antd';
import ReactDragListView from "react-drag-listview";
import { EditableFormRow, EditableCell } from './../common/table/EditableCell.js';
import './GameTab.css';
import GamePad from './../common/game/Pad';
import { GAME_STATUS } from '../constants/states';
import { cardsRenderer } from '../common/table/renderers.js';
import Css, { CSS_TRANSITIONS } from '../common/transition/Css.js';
import Loader from '../common/loader/Loader';
import GameMobileView from './GameMobileView';
import { GAME_DEFAULT_SCORES } from '../constants/scores';

export const PlayersContext = React.createContext();

const { Header, Content, Sider } = Layout;

class GameTab extends Component {
  constructor(props) {
    super(props);

    // this.columns = [
    // 	{
    // 		player: 1,
    // 		children: [{
    // 			title: 'Bid',
    // 			dataIndex: 'bid1',
    // 			width: 100,
    // 		}, {
    // 			title: 'Won',
    // 			dataIndex: 'won1',
    // 			width: 100,
    // 		}]
    // 	},
    // 	//  {
    // 	// 	title: 'Bid',
    // 	// 	dataIndex: 'bid1',
    // 	// 	width: 100,
    // 	// }, {
    // 	// 	title: 'Won',
    // 	// 	dataIndex: 'won1',
    // 	// 	width: 100,
    // 	// }, 
    // 	{
    // 		player: 2,
    // 		children: [{
    // 			title: 'Bid',
    // 			dataIndex: 'bid2',
    // 			width: 100,
    // 		}, {
    // 			title: 'Won',
    // 			dataIndex: 'won2',
    // 			width: 100,
    // 		}]
    // 	},
    // 	// {
    // 	// 	title: 'Bid',
    // 	// 	dataIndex: 'bid2',
    // 	// 	width: 100,
    // 	// }, {
    // 	// 	title: 'Won',
    // 	// 	dataIndex: 'won2',
    // 	// 	width: 100,
    // 	// }, 
    // 	{
    // 		player: 3,
    // 		children: [{
    // 			title: 'Bid',
    // 			dataIndex: 'bid3',
    // 			width: 100,
    // 		}, {
    // 			title: 'Won',
    // 			dataIndex: 'won3',
    // 			width: 100,
    // 		}]
    // 	},
    // 	// {
    // 	// 	title: 'Bid',
    // 	// 	dataIndex: 'bid3',
    // 	// 	width: 100,
    // 	// }, {
    // 	// 	title: 'Won',
    // 	// 	dataIndex: 'won3',
    // 	// 	width: 100,
    // 	// }, 
    // 	{
    // 		player: 4,
    // 		children: [{
    // 			title: 'Bid',
    // 			dataIndex: 'bid4',
    // 			width: 100,
    // 		}, {
    // 			title: 'Won',	
    // 			dataIndex: 'won4',
    // 			width: 100,
    // 		}]
    // 	},
    // 	// {
    // 	// 	title: 'Bid',
    // 	// 	dataIndex: 'bid4',
    // 	// 	width: 100,
    // 	// }, {
    // 	// 	title: 'Won',
    // 	// 	dataIndex: 'won4',
    // 	// 	width: 100,
    // 	// },
    // 	{
    // 		children: [{
    // 			title: 'Trump',
    // 			dataIndex: 'trump',
    // 			width: 75,
    // 			render: cardsRenderer,
    // 		}, {
    // 			title: 'O/U',
    // 			dataIndex: 'segment',
    // 			width: 55,
    // 			render: (text, record) => {
    // 				return {
    // 					props: {
    // 						className: text === 0 ? 'failed-check' : '',
    // 					},
    // 					children: text,
    // 				};
    // 			},
    // 		}]
    // 	}
    // ];

    this.state = {
      players: props.players,
      columns: this.initColumns(props.players),
      currentView: 'table',
      gameData: {
        currentRound: 1,
        rounds: [],
        totalScore0: 0,
        totalScore1: 0,
        totalScore2: 0,
        totalScore3: 0,
        status: '',
      },
      gameSummary: {
        // leagueScore0: '',
        // leagueScore1: '',
        // leagueScore2: '',
        // leagueScore3: '',
      }
    }

    const columns = [
      {
        children: [{
          title: 'Score',
          children: [{
            title: 'round',
            dataIndex: 'round',
            width: 75,
          }]
        }]
      }, {
        title: 'player 1',
        player: 1,
        children: [{
          children: [{
            title: 'Bid',
            dataIndex: 'bid1',
          }, {
            title: 'Won',
            dataIndex: 'won1',
          }]
        }],
      }, {
        title: 'player 2',
        player: 2,
        children: [{
          children: [{
            title: 'Bid',
            dataIndex: 'bid2',
          }, {
            title: 'Won',
            dataIndex: 'won2',
          }]
        }],
      }, {
        title: 'player 3',
        player: 3,
        children: [{
          children: [{
            title: 'Bid',
            dataIndex: 'bid3',
          }, {
            title: 'Won',
            dataIndex: 'won3',
          }]
        }],
      }, {
        title: 'player 4',
        player: 4,
        children: [{
          children: [{
            title: 'Bid',
            dataIndex: 'bid4',
          }, {
            title: 'Won',
            dataIndex: 'won4',
          }]
        }],
      }, {
        editable: true,
        children: [{
          children: [{
            title: 'Trump',
            dataIndex: 'trump',
            width: 75,
            render: cardsRenderer,
          }]
        }]
      }, {
        children: [{
          children: [{
            title: 'O/U',
            dataIndex: 'segment',
            width: 55,
            render: (text, record) => {
              return {
                props: {
                  className: text === 0 ? 'failed-check' : '',
                },
                children: text,
              };
            },
          }]
        }]
      }
    ];

    this.columns1 = this.initColumns1(columns);

    this.selectActiveRound = this.selectActiveRound.bind(this);
    this.setCurrentViewState = this.setCurrentViewState.bind(this);
    this.selectActiveRound = this.selectActiveRound.bind(this);
    this.handleReorderPlayers = this.handleReorderPlayers.bind(this);
  }

  fetch() {
    const { match } = this.props;
    const { params } = match;
    const { leagueID, gameID } = params;

    const db = fire.database();

    if (this.gameRef) {
      this.gameRef.off('value');
    }

    this.leagueGamesRef = db.ref(`leagueGames/_${leagueID * 1}`).orderByChild('gameID').equalTo(gameID * 1);

    this.leagueGamesRef.once('value', snapshot => {
      const gameData = Object.values(snapshot.val())[0];
      const gameKey = Object.keys(snapshot.val())[0];
      this.gameKey = gameKey;
      this.gameRef = db.ref(`games/${gameKey}`);
      this.gameSummaryRef = db.ref(`leagueGamesSummary/_${leagueID * 1}/${gameKey}/players`);

      if (gameData.playersOrder) {
        this.setState({
          players: gameData.playersOrder,
          columns: this.initColumns(gameData.playersOrder)
        });
      } else {
        this.setState({
          players: this.props.players,
          columns: this.initColumns(this.props.players)
        });
      }

      this.gameRef.on('value', snap => {
        this.setState({
          gameData: {
            ...this.state.gameData,
            ...snap.val()
          }
        });
        this.props.loaderStateCb(false);
      });

      this.gameSummaryRef.on('value', snap => {
        this.setState({
          gameSummary: {
            ...snap.val()
          }
        });
      })
    });
  }

  componentDidMount() {
    this.fetch();
  }

  componentWillUnmount() {
    this.gameRef.off('value');
    this.gameSummaryRef.off('value');
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.match.params.gameID !== this.props.match.params.gameID) {
      this.fetch();
    }
  }

  handleSave = (row, player) => {
    const stateToUpdate = {};
    let summaryToUpdate;
    const newData = [...this.state.gameData.rounds];
    const index = newData.findIndex(item => row.round === item.round);

    const item = newData[index];

    newData.splice(index, 1, {
      ...item,
      ...row,
    });

    // reference to the new Data relevant row to update with score and segment
    row = newData[index];

    if (typeof player === 'number') {
      // calculate score
      this.calculatePlayerscore(row, player, newData, index, stateToUpdate);

      //update O/U
      let currentTotalBid = null;
      let currentTotalWon = null;
      let allWonInput = true;

      for (const [key, value] of Object.entries(row)) {
        if (key.indexOf('bid') > -1 && value !== null && value !== '') {
          currentTotalBid += (value * 1);
        }

        if (key.indexOf('won') > -1) {
          if (value !== null && value !== '') {
            currentTotalWon += (value * 1);
          } else {
            allWonInput = false;
          }
        }
      }

      row.segment = currentTotalBid !== null ? currentTotalBid - 13 : null;
      row.check = allWonInput && currentTotalWon === 13;

      // calculate if round fell - change next round factor 
      if (row.check) {
        let didRoundFell = true;

        for (let i = 0; i < 4; i++) {
          if (typeof row[`bid${i}`] !== 'number' || typeof row[`won${i}`] !== 'number') {
            didRoundFell = false;
            break;
          } else if (row[`bid${i}`] === row[`won${i}`]) {
            didRoundFell = false;
            break;
          }
        }

        if (didRoundFell) {
          row.fell = true;

          if (row.round < 12) {
            // because metaData index is zero based row.round value is next round index
            newData[row.round].factor = row.factor * 2;
          } else if (row.factor > 1) {
            newData[row.round].factor = row.factor
          }
        } else if (row.fell) {
          row.fell = false;
          if (newData[row.round]) {
            newData[row.round].factor = row.factor > 1 ? row.factor / 2 : row.factor;
          }

          for (let i = 0; i < 4; i++) {
            this.calculatePlayerscore(row, i, newData, index, stateToUpdate);
          }
        }

        // calculate round summary stats
        summaryToUpdate = this.calculateSummary(newData, index);

        if (row.round === 13 && !row.fell) {
          stateToUpdate.status = GAME_STATUS.FINISHED;
          this.updateGameStatus(GAME_STATUS.FINISHED);

          // round summary league scores
          const { totalScore0, totalScore1, totalScore2, totalScore3 } = this.state.gameData;
          const scores = { totalScore0, totalScore1, totalScore2, totalScore3 };
          scores[`totalScore${player}`] = stateToUpdate[`totalScore${player}`];
          summaryToUpdate = this.calculateLeagueScores(scores, summaryToUpdate);
        }

        this.gameSummaryRef.update(this.mapToPlayersObj(summaryToUpdate));
      }
    }

    stateToUpdate.rounds = newData;

    // this.setState(stateToUpdate);
    this.gameRef.update(stateToUpdate);
  }

  calculatePlayerscore = (round, player, roundsData, currentRound, stateToUpdate) => {
    let rowScore;

    const bid = round[`bid${player}`];
    const won = round[`won${player}`];

    if (won !== '' && bid !== '') {
      if (won === bid) {
        if ((won * 1) === 0) {
          rowScore = round.segment > 0 ? 25 : 50;
        } else {
          rowScore = (Math.pow(won, 2) + 10);
        }
      } else {
        const diff = Math.abs(won - bid);

        if ((bid * 1) === 0) {
          rowScore = -(round.segment > 0 ? 25 : 50) + (diff - 1) * 10;
        } else {
          rowScore = diff * -10;
        }
      }

      rowScore *= round.factor;

      round[`score${player}`] = rowScore;

      //calculate aggregate score
      let aggregateScore = 0;
      for (let i = 0; i <= currentRound; i++) {
        const round = roundsData[i];

        if (typeof round[`score${player}`] === 'number' && !round.fell) {
          aggregateScore += round[`score${player}`];
        }
      }
      round[`aggregateScore${player}`] = aggregateScore;
      stateToUpdate[`totalScore${player}`] = round[`aggregateScore${player}`];
    }
  }

  calculateLeagueScores = (scores, summaryToUpdate) => {
    const sortedScores = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);

    sortedScores.forEach((scoreIndex, i) => {
      const score = scores[scoreIndex];
      let leagueScore = GAME_DEFAULT_SCORES[i];

      // score < 0 => -1
      if (score < 0) {
        leagueScore--;
      }

      // score reminder from 100 == 0 => leagueScore + 1
      if (score % 100 === 0) {
        leagueScore++;
      }

      // score > 300 => +3
      if (score > 300) {
        leagueScore += 3;
      }

      // score < -100 => -3
      if (score < -100) {
        leagueScore -= 3;
      }

      summaryToUpdate[`${scoreIndex.slice(-1)}`].leagueScore = leagueScore;
    });

    return summaryToUpdate;
  }

  calculateSummary = (roundsData, currentRoundIndex) => {
    const currentRound = currentRoundIndex + 1;
    const playersSummary = {};

    for (let pIndex = 0; pIndex < 4; pIndex++) {
      playersSummary[pIndex] = {};
      let stood = 0;
      let totalRounds = 0;
      let totalHBrounds = 0;
      let stoodWhileHB = 0;
      let stoodInOver = 0;
      let totalOverRounds = 0;
      let stoodInUnder = 0;
      let totalNTrounds = 0;
      let stoodInNT = 0;
      let stoodWhenLastBidder = 0;
      let totalStoodWhenLastBidder = 0;

      for (let rIndex = 0; rIndex < currentRound; rIndex++) {
        const round = roundsData[rIndex];
        if (!round.fell) {
          totalRounds++;
          const highestBidder = round.highestBidder === pIndex;
          const lastBidder = !highestBidder && (pIndex + 1 > 3 ? 0 : pIndex + 1) === round.highestBidder;

          if (highestBidder) {
            totalHBrounds++;
          } else if (lastBidder) {
            totalStoodWhenLastBidder++;
          }

          if (round.segment > 0) {
            totalOverRounds++;
          }

          if (round.trump === 'NT') {
            totalNTrounds++;
          }

          if (round[`bid${pIndex}`] === round[`won${pIndex}`]) {
            stood++;

            if (highestBidder) {
              stoodWhileHB++;
            } else if (lastBidder) {
              stoodWhenLastBidder++;
            }

            if (round.trump === 'NT') {
              stoodInNT++;
            }

            round.segment > 0 ? stoodInOver++ : stoodInUnder++;
          }
        }
      }

      const successRate = { wins: stood, total: totalRounds };
      const successRateHB = { wins: stoodWhileHB, total: totalHBrounds };
      const successRateOver = { wins: stoodInOver, total: totalOverRounds };
      const successRateUnder = { wins: stoodInUnder, total: (totalRounds - totalOverRounds) };
      const successRateNT = { wins: stoodInNT, total: totalNTrounds };
      const successRateLastBidder = { wins: stoodWhenLastBidder, total: totalStoodWhenLastBidder };

      playersSummary[pIndex] = {
        successRate: Number.isNaN(successRate) ? '' : successRate,
        successRateHB,
        successRateOver,
        successRateUnder,
        successRateNT,
        successRateLastBidder,
      };
    }

    return playersSummary;
  }

  mapToPlayersObj = (summaryToUpdate) => {
    const { players, gameSummary } = this.state;

    return players.reduce((obj, player, index) => {
      obj[player.key] = {
        ...gameSummary[player.key],
        ...summaryToUpdate[index]
      };

      return obj;
    }, {});
  }

  updateGameStatus = (status) => {
    const { match } = this.props;
    const { params } = match;
    const { leagueID } = params;

    fire.database().ref(`leagueGames/_${leagueID * 1}/${this.gameKey}`).update({ status });
  }

  toggleSlide = () => {
    const currentView = this.state.currentView === 'panel' ? 'table' : 'panel';
    this.setCurrentViewState(currentView);
  }

  setCurrentViewState(currentView) {
    this.setState({ currentView });
  }

  selectActiveRound(newRound) {
    const { gameData, currentView } = this.state;
    const { rounds, currentRound } = gameData;

    if (Number(newRound) < Number(currentRound) || rounds[currentRound - 1].check) {
      this.gameRef.update({
        currentRound: Number(newRound)
      });

      const { isMobile } = this.props;
      if (isMobile && currentView === 'table') {
        this.toggleSlide();
      }
    } else {
      message.warning('Current round is not completed');
    }
  }

  onDragEnd = (fromIndex, toIndex) => {
    const { columns, players } = this.state;

    const columnsCopy = columns.slice();
    const column = columnsCopy.splice(fromIndex, 1)[0];
    columnsCopy.splice(toIndex, 0, column);

    const playersCopy = players.slice();
    const player = playersCopy.splice(fromIndex, 1)[0];
    playersCopy.splice(toIndex, 0, player);

    this.setState({
      columns: columnsCopy,
      players: playersCopy
    });
  };

  handleReorderPlayers(newOrder) {
    this.setState({
      players: newOrder,
      columns: this.initColumns(newOrder),
    });
    const { params } = this.props.match;
    const { leagueID } = params;
    fire.database().ref(`leagueGames/_${leagueID * 1}/${this.gameKey}`).update({ playersOrder: newOrder });
  }

  getLeagueScores = () => {
    const players = this.state.players;
    const { gameSummary } = this.state;

    if (Object.keys(gameSummary).length === 0) {
      return {
        leagueScore0: '',
        leagueScore1: '',
        leagueScore2: '',
        leagueScore3: '',
      };
    }

    return players.reduce((summaryObj, player, i) => {
      summaryObj[`leagueScore${i}`] = gameSummary[player.key].leagueScore;
      return summaryObj;
    }, {});
  }

  render() {
    const { columns, currentView, gameData, players } = this.state;
    const { rounds, currentRound } = gameData;
    const { screenSize, isMobile, loading, match } = this.props;
    const { params } = match;
    const { gameID } = params;
    // const columns1 = this.columns1;
    const playersColumns = columns.slice(0, 4);
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    //table width = 930px
    // const siderWidth = (screenSize - 930) / 2;
    // 200 is league layout sider width
    const siderWidth = (screenSize - 200 - 930) / 2;
    let translate;
    if (siderWidth < 130) {
      translate = siderWidth - 65;
    } else {
      translate = siderWidth / 2;
    }

    if (loading) {
      return <Loader />
    }

    if (isMobile) {
      return (
        <PlayersContext.Provider value={{ players, reorderPlayers: this.handleReorderPlayers }}>
          <GameMobileView
            gameID={gameID}
            currentView={currentView}
            rounds={rounds}
            playersColumns={playersColumns}
            currentRound={currentRound}
            handleSave={this.handleSave}
            onCurrentViewChange={this.setCurrentViewState}
            goToRound={this.selectActiveRound}
            leagueScores={this.getLeagueScores()}
          />
        </PlayersContext.Provider>
      );
    }

    return (
      <Layout className="game-layout">
        <Sider width={siderWidth} style={{ background: 'transparent' }} >
          <div style={{ height: 119 }}>
            <Button icon="table" onClick={this.toggleSlide} />
          </div>
          <Menu
            defaultSelectedKeys={['1']}
            mode="inline"
            style={{ left: `${currentView === 'table' ? 0 : translate / 2 * -1}px` }}
            onSelect={(item) => this.selectActiveRound(item.key)}
            selectedKeys={[`${currentRound}`]}
          >
            {Array(13).fill(1).map((_, i) => <Menu.Item key={i + 1} style={{ textAlign: 'center' }}>
              <span className="round-text" style={{ display: siderWidth < 200 ? 'none' : '' }}>Round</span> {i + 1}
            </Menu.Item>)}

          </Menu>
        </Sider>
        <Layout className={currentView === 'table' ? 'game-table' : 'game-panel'}>
          <Header style={{ background: 'transparent', padding: '0 0px', height: 80, }}>
            <ReactDragListView
              onDragEnd={this.onDragEnd}
              nodeSelector="div.card"
            >
              {playersColumns.map(({ index: playerIndex, playerName }, i) => (
                <Card
                  key={i}
                  title={playerName}
                  className="card"
                  style={{ transform: `translate(${currentView === 'table' ? 0 : (60 + i * 20)}px)` }}
                >
                  <Css type={CSS_TRANSITIONS.SLIDE_UP}>
                    {gameData[`totalScore${playerIndex}`]}
                  </Css>
                </Card>
              ))}
            </ReactDragListView>
          </Header>
          <Content>
            {/* <Carousel
									ref={node => this.carousel = node}
									dots={false}
									afterChange={(current) => this.currentSlide = current}
								>
									<div>
										<Table
											className='game-table'
											components={components}
											columns={this.columns}
											rowKey='round'
											dataSource={rounds}
											size='small'
											bordered
											pagination={false}
											// scroll={{ y: 520 }}
											rowClassName={row => !row.check || row.segment === 0 ? 'failed-check' : ''}
											style={{ display: 'inline-block' }}
										/>
									</div>
									{console.log('before gamepad')}
									<GamePad
										isMobile={false}
										roundData={rounds[currentRound]}
										onChange={this.handleSave}
									/>

								</Carousel> */}
            <div className="my-carousel">
              <div className={`my-carousel-slides-container ${currentView}`}>
                <div className="my-carousel-slide">
                  <Table
                    className='game-table'
                    components={components}
                    columns={columns}
                    rowKey='round'
                    dataSource={rounds}
                    size='small'
                    bordered
                    pagination={false}
                    //TODO: give class to active row when row===currentRound
                    //TODO: find a way to validate a row other then row.check
                    // rowClassName={row => !row.check || row.segment === 0 ? 'failed-check' : ''}
                    style={{ display: 'inline-block' }}
                  />
                </div>
                <div className="my-carousel-slide">
                  <GamePad
                    isMobile={false}
                    currentRound={currentRound}
                    allRounds={rounds}
                    players={playersColumns}
                    onChange={this.handleSave}
                  />
                </div>
              </div>
            </div>


          </Content>

        </Layout>
      </Layout>
    );
  }

  initColumns = (players) => {
    const playersColumn = players.map(({ nickname }, i) => {
      return {
        playerName: nickname,
        index: i,
        children: [{
          title: 'Bid',
          dataIndex: `bid${i}`,
          width: 100,
        }, {
          title: 'Won',
          dataIndex: `won${i}`,
          width: 100,
        }]
      };
    });

    const columns = playersColumn.concat([{
      children: [{
        title: 'Trump',
        dataIndex: 'trump',
        width: 75,
        render: cardsRenderer,
      }, {
        title: 'O/U',
        dataIndex: 'segment',
        width: 55,
        render: (text, record) => {
          return {
            props: {
              className: text === 0 ? 'failed-check' : '',
            },
            children: text,
          };
        },
      }]
    }]);

    return columns;
  };

  initColumns1 = (columns) => columns.map((col) => {
    if (!col.editable && !col.player) {
      return col;
    }
    const playerScore = this.state.gameData[`totalScore${col.player}`];

    return {
      ...col,
      children: col.children.map((child) => {
        return {
          ...child,
          title: playerScore,
          children: child.children.map((subChild) => {
            return {
              ...subChild,
              width: 100,
              onCell: record => ({
                record,
                editable: true,
                editorType: subChild.dataIndex === 'trump' ? 'trump' : 'bidWin',
                dataIndex: subChild.dataIndex,
                player: col.player,
                handleSave: this.handleSave,
              }),
            }
          })
        }
      })
    };
  });
}

export default GameTab;




/** editable table */
/* <Table
			className='game-table'
			components={components}
			columns={columns1}
			rowKey='round'
			dataSource={rounds}
			size='small'
			bordered
			pagination={false}
			scroll={{ y: 520 }}
			rowClassName={row => !row.check || row.segment === 0 ? 'failed-check' : ''}
		/> */