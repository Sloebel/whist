import React from 'react';
// import fire from './../fire.js';
import { Tabs, Table } from 'antd';
import { EditableFormRow, EditableCell } from './../common/table/EditableCell.js'
import './GameTab.css';

const TabPane = Tabs.TabPane;

class GameTab extends TabPane {
	constructor(props) {
		super(props);

		const rounds = []

		for (let i = 0; i < 13; i++) {
			rounds.push({
				round: i + 1,
				score: null,
				bid1: null,
				won1: null,
				bid2: null,
				won2: null,
				bid3: null,
				won3: null,
				bid4: null,
				won4: null,
				trump: null
			});
		}

		this.state = {
			rounds,
			totalScore1: 0,
			totalScore2: 0,
			totalScore3: 0,
			totalScore4: 0
		}

		this.columns = [{
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

		row = newData[index];

		if (player) {
			let totalScore = 0;
			// calculate score
			const bid = row[`bid${player}`];
			const won = row[`won${player}`];

			if (won && bid) {
				if (won === bid) {
					if ((won * 1) === 0) {
						row.score = 50;
					} else {
						row.score = (Math.pow(won, 2) + 10);
					}
				} else {
					const diff = Math.abs(won - bid);

					if ((bid * 1) === 0) {
						row.score = -50 + (diff - 1) * 10;
					} else {
						row.score = diff * -10;
					}
				}

			} else {
				row.score = 0;
			}

			newData.forEach(function (round, i) {
				totalScore += round.score;
			});

			stateToUpdate[`totalScore${player}`] = totalScore;
		}
		

		stateToUpdate.rounds = newData;


		this.setState(stateToUpdate);
	}

	render() {
		const {
			rounds
		} = this.state;

		const columns = this.columns.map((col) => {
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

		return (
			<Table
				className='game-table'
				components={components}
				columns={columns}
				rowKey='round'
				dataSource={rounds}
				size='small'
				bordered
				pagination={false}
				scroll={{ y: 520 }}
			/>
		);
	}
}

export default GameTab;
