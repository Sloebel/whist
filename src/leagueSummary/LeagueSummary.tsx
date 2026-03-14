import React, { Component } from 'react';
import { fire } from '../firebase';
import { Row, Col, Tooltip as AntTooltip, Spin } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import Icon from '@ant-design/icons';
import { Spade, Hart, Diamond, Club } from '../common/cards/Icons';
import { ILeagueModel } from '../models/ILeagueModel';
import { IPlayer } from '../models/IPlayerModel';
import { ISuccessRate, IPlayerScoresSummary } from '../models/IPlayerModel';
import { IRoundData } from '../models/IGameModel';

import './LeagueSummary.scss';

const PLAYER_COLORS = ['#1890ff', '#f5222d', '#fa8c16', '#722ed1', '#13c2c2', '#eb2f96', '#2f54eb', '#faad14'];

const TRUMP_ICON_MAP: Record<string, React.ComponentType> = {
	SPADE: Spade,
	HART: Hart,
	DIAMOND: Diamond,
	CLUB: Club
};

const statsObj: Record<string, string> = {
	successRate: 'Succes Win Rates',
	successRateHB: 'Highest Bidding Win Rates',
	successRateOver: 'Over Win Rate',
	successRateUnder: 'Under Win Rate',
	successRateNT: 'NT Win Rates',
	successRateLastBidder: 'Last Bidder Win Rate'
};

const gameStatsObj: Record<string, string> = {
	gameWins: 'Game Wins',
	totalGamePoints: 'Total Game Points',
	highestBidderWins: 'Highest Bidder Wins'
};

interface PlayerWithGames extends IPlayer {
	games?: IPlayerScoresSummary[];
}

interface GameWithMeta {
	gameKey: string;
	gameID: number;
	playersOrder: IPlayer[] | null;
	rounds: IRoundData[];
	totalScore0: number;
	totalScore1: number;
	totalScore2: number;
	totalScore3: number;
}

interface StatCard {
	label: string;
	value: React.ReactNode;
	detail: React.ReactNode;
}

interface RecordEntry {
	player: string;
	gameNum: number;
}

interface NumericRecord {
	value: number;
	entries: RecordEntry[];
}

interface LeagueStats {
	highestBid: NumericRecord | null;
	trumpDistribution: Record<string, number>;
	highestGameScore: NumericRecord | null;
	lowestGameScore: NumericRecord | null;
	mostTimesHighestBidder: { count: number; player: string } | null;
	bestRoundScore: NumericRecord | null;
	worstRoundScore: NumericRecord | null;
	totalRoundsFell: number;
	totalGames: number;
	overRounds: number;
	underRounds: number;
}

interface LeagueSummaryProps {
	league: Partial<ILeagueModel>;
}

interface LeagueSummaryState {
	players: PlayerWithGames[];
	allGamesData: GameWithMeta[];
	loading: boolean;
}

interface ChartDataPoint {
	game: number;
	[playerNickname: string]: number;
}

export default class LeagueSummary extends Component<LeagueSummaryProps, LeagueSummaryState> {
	private gameSummaryRef!: firebase.database.Reference;
	private leagueGamesRef!: firebase.database.Query;

	constructor(props: LeagueSummaryProps) {
		super(props);

		this.state = {
			players: props.league.players || [],
			allGamesData: [],
			loading: true
		};
	}

	componentDidMount() {
		this.fetch();
	}

	componentWillUnmount() {
		this.gameSummaryRef.off('value');
	}

	fetch() {
		const {
			league: { leagueID }
		} = this.props;
		const { players } = this.state;

		const dbRef = fire.database().ref();
		this.gameSummaryRef = dbRef.child(`leagueGamesSummary/_${leagueID}`);
		this.leagueGamesRef = dbRef.child(`leagueGames/_${leagueID}`).orderByChild('status').equalTo('FINISHED');

		this.leagueGamesRef.on('value', snap => {
			if (!snap.val()) {
				this.setState({ loading: false });
				return;
			}
			if (snap.val()) {
				const leagueGamesData = snap.val();
				const gameKeys = Object.keys(leagueGamesData);
				const lastKey = gameKeys[gameKeys.length - 1];

				this.gameSummaryRef
					.orderByKey()
					.endAt(lastKey)
					.on('value', snap => {
						const gameSummary: any[] = Object.values(snap.val());
						this.setState({
							players: players.map(player => {
								const playerKey = player.key;

								return {
									...player,
									games: gameSummary.map(game => game.players[playerKey])
								};
							})
						});
					});

				this.fetchGamesData(gameKeys, leagueGamesData, dbRef);
			}
		});
	}

	private fetchGamesData(
		gameKeys: string[],
		leagueGamesData: Record<string, any>,
		dbRef: firebase.database.Reference
	) {
		const promises = gameKeys.map(key => dbRef.child(`games/${key}`).once('value'));

		Promise.all(promises).then(snapshots => {
			const allGamesData: GameWithMeta[] = snapshots.map((snap, i) => {
				const gameKey = gameKeys[i];
				const gameData = snap.val();
				const leagueGameInfo = leagueGamesData[gameKey];
				const playersOrderRaw = leagueGameInfo.playersOrder;
				const playersOrder: IPlayer[] | null = playersOrderRaw
					? Array.isArray(playersOrderRaw)
						? playersOrderRaw
						: Object.values(playersOrderRaw)
					: null;

				const rounds: IRoundData[] = gameData?.rounds
					? Array.isArray(gameData.rounds)
						? gameData.rounds
						: Object.values(gameData.rounds)
					: [];

				return {
					gameKey,
					gameID: leagueGameInfo.gameID,
					playersOrder,
					rounds,
					totalScore0: Number(gameData?.totalScore0 || 0),
					totalScore1: Number(gameData?.totalScore1 || 0),
					totalScore2: Number(gameData?.totalScore2 || 0),
					totalScore3: Number(gameData?.totalScore3 || 0)
				};
			});
			this.setState({ allGamesData, loading: false });
		});
	}

	buildChartData = (players: PlayerWithGames[]): ChartDataPoint[] => {
		const hasGames = players.some(p => p.games && p.games.length > 0);
		if (!hasGames) return [];

		const gameCount = Math.max(...players.map(p => (p.games ? p.games.length : 0)));
		const data: ChartDataPoint[] = [];

		for (let i = 0; i < gameCount; i++) {
			const point: ChartDataPoint = { game: i + 1 };
			players.forEach(player => {
				if (!player.games) return;
				let cumulative = 0;
				for (let j = 0; j <= i && j < player.games.length; j++) {
					cumulative += Number(player.games[j].leagueScore);
				}
				point[player.nickname] = cumulative;
			});
			data.push(point);
		}

		return data;
	};

	computeLeagueStats = (allGamesData: GameWithMeta[], leaguePlayers: IPlayer[]): LeagueStats => {
		const stats: LeagueStats = {
			highestBid: null,
			trumpDistribution: {},
			highestGameScore: null,
			lowestGameScore: null,
			mostTimesHighestBidder: null,
			bestRoundScore: null,
			worstRoundScore: null,
			totalRoundsFell: 0,
			totalGames: allGamesData.length,
			overRounds: 0,
			underRounds: 0
		};

		if (!allGamesData.length) return stats;

		const highestBidderCount: Record<string, number> = {};

		for (const game of allGamesData) {
			const getPlayerNickname = (idx: number): string => {
				if (game.playersOrder?.[idx]) {
					return game.playersOrder[idx].nickname;
				}
				return leaguePlayers[idx]?.nickname || `Player ${idx + 1}`;
			};

			const totalScores = [game.totalScore0, game.totalScore1, game.totalScore2, game.totalScore3];

			for (let i = 0; i < 4; i++) {
				const totalScore = totalScores[i];
				const player = getPlayerNickname(i);
				const entry: RecordEntry = { player, gameNum: game.gameID };

				if (stats.highestGameScore === null || totalScore > stats.highestGameScore.value) {
					stats.highestGameScore = { value: totalScore, entries: [entry] };
				} else if (totalScore === stats.highestGameScore.value) {
					stats.highestGameScore.entries.push(entry);
				}

				if (stats.lowestGameScore === null || totalScore < stats.lowestGameScore.value) {
					stats.lowestGameScore = { value: totalScore, entries: [entry] };
				} else if (totalScore === stats.lowestGameScore.value) {
					stats.lowestGameScore.entries.push(entry);
				}
			}

			for (const round of game.rounds) {
				if (!round || !round.trump) continue;

				const trump = String(round.trump);
				stats.trumpDistribution[trump] = (stats.trumpDistribution[trump] || 0) + 1;

				if (round.fell) {
					stats.totalRoundsFell++;
				} else if (round.segment && Number(round.segment) > 0) {
					stats.overRounds++;
				} else {
					stats.underRounds++;
				}

				if (round.highestBidder !== undefined && round.highestBidder !== '') {
					const bidderIdx = Number(round.highestBidder);
					const bidderName = getPlayerNickname(bidderIdx);
					highestBidderCount[bidderName] = (highestBidderCount[bidderName] || 0) + 1;
				}

				for (let i = 0; i < 4; i++) {
					const bid = Number(round[`bid${i}`] || 0);
					const score = Number(round[`score${i}`] || 0);
					const player = getPlayerNickname(i);
					const entry: RecordEntry = { player, gameNum: game.gameID };

					if (bid > 0) {
						if (stats.highestBid === null || bid > stats.highestBid.value) {
							stats.highestBid = { value: bid, entries: [entry] };
						} else if (bid === stats.highestBid.value) {
							stats.highestBid.entries.push(entry);
						}
					}
					if (score !== 0) {
						if (stats.bestRoundScore === null || score > stats.bestRoundScore.value) {
							stats.bestRoundScore = { value: score, entries: [entry] };
						} else if (score === stats.bestRoundScore.value) {
							stats.bestRoundScore.entries.push(entry);
						}
					}
					if (score !== 0) {
						if (stats.worstRoundScore === null || score < stats.worstRoundScore.value) {
							stats.worstRoundScore = { value: score, entries: [entry] };
						} else if (score === stats.worstRoundScore.value) {
							stats.worstRoundScore.entries.push(entry);
						}
					}
				}
			}
		}

		let maxCount = 0;
		let maxPlayer = '';

		for (const [player, count] of Object.entries(highestBidderCount)) {
			if (count > maxCount) {
				maxCount = count;
				maxPlayer = player;
			}
		}

		if (maxCount > 0) {
			stats.mostTimesHighestBidder = { count: maxCount, player: maxPlayer };
		}

		return stats;
	};

	render() {
		const { league } = this.props;
		const { title } = league;
		const { players, allGamesData, loading } = this.state;
		const hasFinishedGames = players.some(p => p.games && p.games.length > 0);
		const chartData = this.buildChartData(players);
		const leagueStats = this.computeLeagueStats(allGamesData, league.players || []);

		return (
			<div className="game-summery">
				<h3 className="summary-title">{title}</h3>

				{loading ? (
					<div className="summary-loading">
						<Spin size="large" />
					</div>
				) : (
					<>
						{hasFinishedGames && (
							<div className="summary-table">
								<h3>League Score:</h3>
								<Row gutter={4} className="table-header" style={{ marginBottom: 1 }}>
									{this.getTableHeaders(players)}
								</Row>
								{allGamesData.length > 0 && (
									<div className="game-stats-section">
										{Object.keys(gameStatsObj).map(key =>
											this.getGameStatsRow(
												key,
												this.computePlayerGameStats(allGamesData, league.players || [])
											)
										)}
									</div>
								)}
								{Object.keys(statsObj).map(this.getStatsRow)}
							</div>
						)}

						{this.renderLeagueRecords(leagueStats)}

						{chartData.length > 0 && (
							<div className="league-chart">
								<h3>League Points Over Games:</h3>
								<ResponsiveContainer width="100%" height={350}>
									<LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis
											dataKey="game"
											label={{ value: 'Game', position: 'insideBottomRight', offset: -5 }}
										/>
										<YAxis label={{ value: 'League Points', angle: -90, position: 'insideLeft' }} />
										<Tooltip />
										<Legend />
										{players.map((player, idx) => (
											<Line
												key={player.key}
												type="monotone"
												dataKey={player.nickname}
												stroke={PLAYER_COLORS[idx % PLAYER_COLORS.length]}
												strokeWidth={2}
												dot={{ r: 4 }}
												activeDot={{ r: 6 }}
											/>
										))}
									</LineChart>
								</ResponsiveContainer>
							</div>
						)}
					</>
				)}
			</div>
		);
	}

	renderRecordDetail = (entries: RecordEntry[]): React.ReactNode => {
		const grouped: Record<string, number[]> = {};
		for (const e of entries) {
			if (!grouped[e.player]) grouped[e.player] = [];
			grouped[e.player].push(e.gameNum);
		}

		const players = Object.keys(grouped);

		if (players.length === 1 && grouped[players[0]].length === 1) {
			return `${players[0]} · Game ${grouped[players[0]][0]}`;
		}

		const tooltipText = players.map(player => `${player}: Game ${grouped[player].join(', ')}`).join(' | ');

		return (
			<AntTooltip title={tooltipText}>
				<span>{players.length === 1 ? players[0] : `${players.length} players`}</span>
			</AntTooltip>
		);
	};

	renderLeagueRecords = (stats: LeagueStats) => {
		const mostCommonTrump = Object.entries(stats.trumpDistribution).sort(([, a], [, b]) => b - a)[0];

		const statCards: StatCard[] = [
			{
				label: 'Total Games',
				value: stats.totalGames,
				detail: 'finished games'
			}
		];

		if (mostCommonTrump) {
			const trumpKey = mostCommonTrump[0];
			const trumpIcon = TRUMP_ICON_MAP[trumpKey];
			statCards.push({
				label: 'Most Common Trump',
				value: trumpIcon ? <Icon component={trumpIcon} /> : trumpKey,
				detail: `${mostCommonTrump[1]} rounds`
			});
		}

		if (stats.highestBid) {
			statCards.push({
				label: 'Highest Single Bid',
				value: stats.highestBid.value,
				detail: this.renderRecordDetail(stats.highestBid.entries)
			});
		}

		if (stats.highestGameScore) {
			statCards.push({
				label: 'Highest Game Score',
				value: stats.highestGameScore.value,
				detail: this.renderRecordDetail(stats.highestGameScore.entries)
			});
		}

		if (stats.lowestGameScore) {
			statCards.push({
				label: 'Lowest Game Score',
				value: stats.lowestGameScore.value,
				detail: this.renderRecordDetail(stats.lowestGameScore.entries)
			});
		}

		if (stats.mostTimesHighestBidder) {
			statCards.push({
				label: 'Top Bidder',
				value: stats.mostTimesHighestBidder.player,
				detail: `${stats.mostTimesHighestBidder.count} times`
			});
		}

		if (stats.bestRoundScore) {
			statCards.push({
				label: 'Best Round Score',
				value: stats.bestRoundScore.value,
				detail: this.renderRecordDetail(stats.bestRoundScore.entries)
			});
		}

		if (stats.worstRoundScore) {
			statCards.push({
				label: 'Worst Round Score',
				value: stats.worstRoundScore.value,
				detail: this.renderRecordDetail(stats.worstRoundScore.entries)
			});
		}

		if (statCards.length > 0) {
			statCards.push({
				label: 'Total Rounds Fell',
				value: stats.totalRoundsFell,
				detail: 'across all games'
			});

			const totalPlayed = stats.overRounds + stats.underRounds;
			if (totalPlayed > 0) {
				const overPct = Math.round((stats.overRounds / totalPlayed) * 100);
				const underPct = 100 - overPct;
				statCards.push({
					label: 'Over vs Under',
					value: `${overPct}% / ${underPct}%`,
					detail: `${stats.overRounds} over · ${stats.underRounds} under`
				});
			}
		}

		return (
			<div className="league-records">
				<h3>Other League Records:</h3>
				{statCards.length === 0 ? (
					<div className="records-empty">No statistics yet — finish a game to see league records here.</div>
				) : (
					<div className="records-grid">
						{statCards.map((card, i) => (
							<div className="record-card" key={i}>
								<div className="record-label">{card.label}</div>
								<div className="record-value">{card.value}</div>
								<div className="record-detail">{card.detail}</div>
							</div>
						))}
					</div>
				)}
			</div>
		);
	};

	private getGamePosition(game: GameWithMeta, leaguePlayers: IPlayer[], leagueIdx: number): number {
		if (game.playersOrder) {
			const playerKey = leaguePlayers[leagueIdx].key;
			return game.playersOrder.findIndex(p => p.key === playerKey);
		}

		return leagueIdx;
	}

	computePlayerGameStats = (allGamesData: GameWithMeta[], leaguePlayers: IPlayer[]): Record<string, number>[] => {
		const playerStats = leaguePlayers.map(() => ({ gameWins: 0, totalGamePoints: 0, highestBidderWins: 0 }));

		for (const game of allGamesData) {
			const scores = [game.totalScore0, game.totalScore1, game.totalScore2, game.totalScore3];
			const maxScore = Math.max(...scores);

			for (let i = 0; i < leaguePlayers.length; i++) {
				const pos = this.getGamePosition(game, leaguePlayers, i);
				if (pos === -1) continue;

				const score = scores[pos];
				playerStats[i].totalGamePoints += score;

				if (score === maxScore) {
					playerStats[i].gameWins++;
				}
			}

			for (const round of game.rounds) {
				if (!round || round.highestBidder === undefined || round.highestBidder === '') continue;

				const bidderPos = Number(round.highestBidder);
				const bid = Number(round[`bid${bidderPos}`] || 0);
				const won = Number(round[`won${bidderPos}`] || 0);

				if (bid === won) {
					const leagueIdx = leaguePlayers.findIndex(
						(p, idx) => this.getGamePosition(game, leaguePlayers, idx) === bidderPos
					);
					if (leagueIdx !== -1) {
						playerStats[leagueIdx].highestBidderWins++;
					}
				}
			}
		}

		return playerStats;
	};

	getGameStatsRow = (statsKey: string, playerGameStats: Record<string, number>[]) => (
		<div className="stats-row" key={statsKey}>
			<h4>{gameStatsObj[statsKey]}</h4>
			<Row gutter={4}>
				{playerGameStats.map((stat, i) => (
					<Col span={6} key={this.state.players[i]?.key ?? i}>
						<div className="table-cell">{stat[statsKey]}</div>
					</Col>
				))}
			</Row>
		</div>
	);

	getTableHeaders = (players: PlayerWithGames[]) =>
		players.map(({ key, nickname, games }) => (
			<Col key={key} span={6}>
				<div className="table-cell header">{nickname}</div>
				<div className="table-cell score">{games && this.scoreReducer(games, 'leagueScore')}</div>
			</Col>
		));

	getStatsRow = (statsKey: string) => {
		const { players } = this.state;

		return (
			<div className="stats-row" key={statsKey}>
				<h4>{statsObj[statsKey]}</h4>
				<Row gutter={4}>{this.getWinRateRow(players, statsKey)}</Row>
			</div>
		);
	};

	getWinRateRow = (players: PlayerWithGames[], statsKey: string) =>
		players.map(player => (
			<Col span={6} key={player.key}>
				<div className="table-cell">{player.games && this.calculateRate(player.games, statsKey)}%</div>
			</Col>
		));

	scoreReducer = (games: IPlayerScoresSummary[], prop: keyof IPlayerScoresSummary) =>
		games.reduce((sum, game) => sum + Number(game[prop]), 0);

	calculateRate = (games: IPlayerScoresSummary[], prop: string) =>
		this.toPercentage(this.preCalculateRate(games, prop));

	toPercentage = ({ wins, total }: ISuccessRate) => Number.parseFloat(String((wins / total) * 100)).toFixed(0);

	preCalculateRate = (games: IPlayerScoresSummary[], prop: string): ISuccessRate =>
		games.reduce(
			(sumObj: ISuccessRate, game: any) => {
				const category: ISuccessRate = game[prop];
				sumObj.wins += category.wins;
				sumObj.total += category.total;
				return sumObj;
			},
			{ wins: 0, total: 0 }
		);
}
