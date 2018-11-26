import React, { Component } from 'react';
// import fire from './../fire.js';
import { Layout, Menu, Tabs, Table, Card, Carousel, Button, Row, Col } from 'antd';
import { EditableFormRow, EditableCell } from './../common/table/EditableCell.js'
import './GameTab.css';

const { Header, Content, Sider } = Layout;

class GameTab extends Component {
	constructor(props) {
		super(props);

		const rounds = []

		for (let i = 0; i < 13; i++) {
			rounds.push({
				round: i + 1,
				segement: null,
				trump: null,
				check: true,
				factor: 1,
				score1: null,
				bid1: null,
				won1: null,
				score2: null,
				bid2: null,
				won2: null,
				score3: null,
				bid3: null,
				won3: null,
				score4: null,
				bid4: null,
				won4: null
			});
		}

		this.currentSlide = 0;

		this.state = {
			currentView: 'table',
			rounds,
			totalScore1: 0,
			totalScore2: 0,
			totalScore3: 0,
			totalScore4: 0
		}

		this.columns = [{
			title: 'Bid',
			dataIndex: 'bid1',
			width: 100,
		}, {
			title: 'Won',
			dataIndex: 'won1',
			width: 100,
		}, {
			title: 'Bid',
			dataIndex: 'bid2',
			width: 100,
		}, {
			title: 'Won',
			dataIndex: 'won2',
			width: 100,
		}, {
			title: 'Bid',
			dataIndex: 'bid3',
			width: 100,
		}, {
			title: 'Won',
			dataIndex: 'won3',
			width: 100,
		}, {
			title: 'Bid',
			dataIndex: 'bid4',
			width: 100,
		}, {
			title: 'Won',
			dataIndex: 'won4',
			width: 100,
		}, {
			title: 'Trump',
			dataIndex: 'trump',
			width: 75,
		}, {
			title: 'O/U',
			dataIndex: 'segement',
			width: 55,
			render: (text, record) => {
				return {
					props: {
						className: text === 0 ? 'failed-check' : '',
					},
					children: text,
				};
			},
		}];

		this.columns1 = [{
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
				}]
			}]
		}, {
			children: [{
				children: [{
					title: 'O/U',
					dataIndex: 'segement',
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
		}];
	}

	handleSave = (row, player) => {
		const stateToUpdate = {};
		const newData = [...this.state.rounds];

		const index = newData.findIndex(item => row.round === item.round);

		const item = newData[index];

		newData.splice(index, 1, {
			...item,
			...row,
		});

		//reference to the new Data relevent row to update with score and segment
		row = newData[index];

		if (player) {
			let rowScore;
			// calculate score
			const bid = row[`bid${player}`];
			const won = row[`won${player}`];

			if (won && bid) {
				if (won === bid) {
					if ((won * 1) === 0) {
						rowScore = 50;
					} else {
						rowScore = (Math.pow(won, 2) + 10);
					}
				} else {
					const diff = Math.abs(won - bid);

					if ((bid * 1) === 0) {
						rowScore = -50 + (diff - 1) * 10;
					} else {
						rowScore = diff * -10;
					}
				}

			} else {
				rowScore = 0;
			}

			row[`score${player}`] = rowScore;

			let totalScore = 0;
			newData.forEach((round, i) => {
				totalScore += round[`score${player}`];

				//to do - calculate if round fell - change next round factor 
			});

			stateToUpdate[`totalScore${player}`] = totalScore;

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

			row.segement = currentTotalBid !== null ? currentTotalBid - 13 : null;
			row.check = allWonInput ? currentTotalWon === 13 : true;
		}

		stateToUpdate.rounds = newData;


		this.setState(stateToUpdate);
	}

	// toggleSlide = () => this.state.currentSlide ? this.carousel.prev() : this.carousel.next()
	toggleSlide = () => {
		this.setState({ currentView: this.currentSlide ? 'table' : 'panel' });
		// this.currentSlide = !this.currentSlide;
		this.currentSlide ? this.carousel.prev() : this.carousel.next()
	}

	next = () => this.carousel.next()

	render() {
		const {
			currentView,
			rounds
		} = this.state;
		const { screenSize } = this.props;

		const columns = this.columns1.map((col) => {
			if (!col.editable && !col.player) {
				return col;
			}
			return {
				...col,
				children: col.children.map((child) => {
					return {
						...child,
						title: this.state[`totalScore${col.player}`],
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

		const components = {
			body: {
				row: EditableFormRow,
				cell: EditableCell,
			},
		};

		//table width = 930px
		const siderWidth = (screenSize - 930) / 2;
		const menuTranslateX = siderWidth / 2 > 120 ? siderWidth - 120 : siderWidth / 2;

		return (
			<div>
				<Layout className="game-layout">
					<Sider width={siderWidth} style={{ background: 'transparent' }} >
						<div style={{ height: 119 }}>
							<Button icon="table" onClick={this.toggleSlide} />
						</div>
						<Menu defaultSelectedKeys={['1']} mode="inline" style={{ background: '#fff', transform: `translate(${currentView === 'table' ? menuTranslateX : siderWidth / 2 > 120 ? 120 : 0}px)` }}>
							{Array(13).fill(1).map((_, i) => <Menu.Item key={i + 1}>
								Round {i + 1}
							</Menu.Item>)}

						</Menu>
					</Sider>
					<Layout className={currentView === 'table' ? 'game-table' : 'game-panel'}>
						<Header style={{ background: 'transparent', padding: '0 0px', height: 80, }}>

							{Array(4).fill(1).map((_, i) => (

								<Card
									key={i}
									title="Card title"
									className="card"
									style={{ transform: `translate(${currentView === 'table' ? 0 : (60 + i * 20)}px)` }}
								>
									Card content
								</Card>

							))}

						</Header>
						<Content>
							<Carousel
								ref={node => this.carousel = node}
								dots={false}
								// afterChange={(current) => this.setState({ currentSlide: current })}
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
										rowClassName={row => !row.check || row.segement === 0 ? 'failed-check' : ''}
										style={{ display: 'inline-block' }}
									/>
								</div>
								<div><h3>2</h3></div>
							</Carousel>


						</Content>

					</Layout>
				</Layout>
				{/* <Table
					className='game-table'
					components={components}
					columns={columns}
					rowKey='round'
					dataSource={rounds}
					size='small'
					bordered
					pagination={false}
					scroll={{ y: 520 }}
					rowClassName={row => !row.check || row.segement === 0 ? 'failed-check' : ''}
				/> */}
			</div>
		);
	}
}

export default GameTab;
