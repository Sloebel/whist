import React, { useState, useEffect, useCallback } from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import { Spin, Modal } from 'antd';
import Icon, { TrophyOutlined, ArrowLeftOutlined, BarChartOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import withAuthorization from '../authentication/withAuthorization';
import { UserContext } from '../authentication/AuthUserContext';
import { fire } from '../firebase';
import { ILeagueModel } from '../models/ILeagueModel';
import { IPlayer, IPlayerScoresSummary, ISuccessRate } from '../models/IPlayerModel';
import { GameWithMeta, IRoundData } from '../models/IGameModel';
import {
	computeCumulativeScores,
	computePlayerGameStats,
	getGamePosition,
	PlayerGameStats
} from '../utils/league-stats';
import { Spade, Hart, Diamond, Club } from '../common/cards/Icons';
import * as routes from '../constants/routes';

import './ScoreBoard.scss';

const gameStatsLabels: Record<keyof PlayerGameStats, string> = {
	gameWins: 'Game Wins',
	totalGamePoints: 'Total Game Pts',
	highestBidderWins: 'HB Wins'
};

const detailWinRateLabels: Record<string, string> = {
	successRateHB: 'HB',
	successRateOver: 'Over',
	successRateUnder: 'Under',
	successRateNT: 'NT',
	successRateLastBidder: 'Last Bidder'
};

const PLAYER_COLORS = ['#1890ff', '#f5222d', '#fa8c16', '#722ed1'];

const TRUMP_SUITS: { key: string; icon: React.ComponentType; color: string; label: string }[] = [
	{ key: 'SPADE', icon: Spade, color: '#2a4d8f', label: 'S' },
	{ key: 'HART', icon: Hart, color: '#d71e00', label: 'H' },
	{ key: 'DIAMOND', icon: Diamond, color: '#e8880a', label: 'D' },
	{ key: 'CLUB', icon: Club, color: '#1a7a2e', label: 'C' },
	{ key: 'NT', icon: () => null, color: '#999', label: 'NT' }
];

function computeWinRate(games: IPlayerScoresSummary[], prop: string): string {
	const { wins, total } = games.reduce(
		(acc: ISuccessRate, game: any) => {
			const category: ISuccessRate = game[prop];
			acc.wins += category.wins;
			acc.total += category.total;
			return acc;
		},
		{ wins: 0, total: 0 }
	);
	if (total === 0) return '0';
	return Number.parseFloat(String((wins / total) * 100)).toFixed(0);
}

interface InsightRecord {
	value: number;
	player: string;
	leagueTitle: string;
	gameNum: number;
}

interface PlayerInsights {
	avgGameScore: number;
	avgBid: number;
	gameWinRate: number;
	longestWinStreak: number;
}

interface GroupInsights {
	highestGameScore: InsightRecord | null;
	lowestGameScore: InsightRecord | null;
	highestBid: InsightRecord | null;
	bestRoundScore: InsightRecord | null;
	worstRoundScore: InsightRecord | null;
	fellPct: number;
	totalRounds: number;
	hbKing: { player: string; count: number } | null;
	perPlayer: Record<string, PlayerInsights>;
}

function computeGroupInsights(leagues: LeagueWithScores[], players: IPlayer[]): GroupInsights {
	const insights: GroupInsights = {
		highestGameScore: null,
		lowestGameScore: null,
		highestBid: null,
		bestRoundScore: null,
		worstRoundScore: null,
		fellPct: 0,
		totalRounds: 0,
		hbKing: null,
		perPlayer: {}
	};

	let fellCount = 0;
	let totalRounds = 0;
	const hbCount: Record<string, number> = {};
	const playerScoreSums: Record<string, number> = {};
	const playerGameCounts: Record<string, number> = {};
	const playerBidSums: Record<string, number> = {};
	const playerBidCounts: Record<string, number> = {};
	const playerGameResults: Record<string, boolean[]> = {};

	for (const p of players) {
		playerScoreSums[p.key] = 0;
		playerGameCounts[p.key] = 0;
		playerBidSums[p.key] = 0;
		playerBidCounts[p.key] = 0;
		playerGameResults[p.key] = [];
	}

	for (const entry of leagues) {
		for (const game of entry.allGamesData) {
			const scores = [game.totalScore0, game.totalScore1, game.totalScore2, game.totalScore3];
			const maxScore = Math.max(...scores);

			for (let i = 0; i < entry.players.length; i++) {
				const pos = getGamePosition(game.playersOrder, entry.players, i);

				if (pos === -1) continue;

				const player = entry.players[i];
				const score = scores[pos];
				const nickname = player.nickname;

				playerScoreSums[player.key] += score;
				playerGameCounts[player.key]++;
				playerGameResults[player.key].push(score === maxScore);

				const record: InsightRecord = {
					value: score,
					player: nickname,
					leagueTitle: entry.league.title,
					gameNum: game.gameID
				};

				if (!insights.highestGameScore || score > insights.highestGameScore.value) {
					insights.highestGameScore = record;
				}

				if (!insights.lowestGameScore || score < insights.lowestGameScore.value) {
					insights.lowestGameScore = record;
				}
			}

			for (const round of game.rounds) {
				if (!round || !round.trump) continue;

				totalRounds++;

				if (round.fell) {
					fellCount++;
				}

				if (round.highestBidder !== undefined && round.highestBidder !== '') {
					const bidderPos = Number(round.highestBidder);
					const leagueIdx = entry.players.findIndex(
						(_, idx) => getGamePosition(game.playersOrder, entry.players, idx) === bidderPos
					);

					if (leagueIdx !== -1) {
						const pKey = entry.players[leagueIdx].key;
						hbCount[pKey] = (hbCount[pKey] || 0) + 1;
					}
				}

				for (let i = 0; i < entry.players.length; i++) {
					const pos = getGamePosition(game.playersOrder, entry.players, i);

					if (pos === -1) continue;
					const player = entry.players[i];
					const bid = Number(round[`bid${pos}`] || 0);
					const score = Number(round[`score${pos}`] || 0);

					if (bid > 0) {
						playerBidSums[player.key] += bid;
						playerBidCounts[player.key]++;

						const bidRecord: InsightRecord = {
							value: bid,
							player: player.nickname,
							leagueTitle: entry.league.title,
							gameNum: game.gameID
						};

						if (!insights.highestBid || bid > insights.highestBid.value) {
							insights.highestBid = bidRecord;
						}
					}

					if (score !== 0) {
						const scoreRecord: InsightRecord = {
							value: score,
							player: player.nickname,
							leagueTitle: entry.league.title,
							gameNum: game.gameID
						};

						if (!insights.bestRoundScore || score > insights.bestRoundScore.value) {
							insights.bestRoundScore = scoreRecord;
						}

						if (!insights.worstRoundScore || score < insights.worstRoundScore.value) {
							insights.worstRoundScore = scoreRecord;
						}
					}
				}
			}
		}
	}

	insights.totalRounds = totalRounds;
	insights.fellPct = totalRounds > 0 ? (fellCount / totalRounds) * 100 : 0;

	let maxHb = 0;
	let hbKingKey = '';

	for (const [key, count] of Object.entries(hbCount)) {
		if (count > maxHb) {
			maxHb = count;
			hbKingKey = key;
		}
	}

	if (hbKingKey) {
		const hbPlayer = players.find(p => p.key === hbKingKey);
		insights.hbKing = { player: hbPlayer?.nickname || hbKingKey, count: maxHb };
	}

	for (const p of players) {
		const totalGames = playerGameCounts[p.key] || 0;
		const wins = playerGameResults[p.key]?.filter(Boolean).length || 0;

		let longest = 0;
		let current = 0;
		for (const won of playerGameResults[p.key] || []) {
			if (won) {
				current++;
				if (current > longest) longest = current;
			} else {
				current = 0;
			}
		}

		insights.perPlayer[p.key] = {
			avgGameScore: totalGames > 0 ? Math.round(playerScoreSums[p.key] / totalGames) : 0,
			avgBid: playerBidCounts[p.key] > 0 ? Number((playerBidSums[p.key] / playerBidCounts[p.key]).toFixed(1)) : 0,
			gameWinRate: totalGames > 0 ? Number(((wins / totalGames) * 100).toFixed(0)) : 0,
			longestWinStreak: longest
		};
	}

	return insights;
}

interface LeagueWithScores {
	league: ILeagueModel;
	cumulativeScores: number[];
	players: IPlayer[];
	perPlayerGames: IPlayerScoresSummary[][];
	allGamesData: GameWithMeta[];
}

interface PlayerGroupStats {
	leaguesWon: Record<string, number>;
	gameStats: Record<string, PlayerGameStats>;
	aggregatedGames: Record<string, IPlayerScoresSummary[]>;
	trumpDistribution: Record<string, number>;
	totalGames: number;
	insights: GroupInsights;
}

interface PlayerGroup {
	compositeKey: string;
	players: IPlayer[];
	leagues: LeagueWithScores[];
	stats: PlayerGroupStats;
}

interface IScoreBoardProps extends RouteComponentProps {}

async function fetchLeagueScores(league: ILeagueModel): Promise<LeagueWithScores | null> {
	const dbRef = fire.database().ref();

	const snap = await dbRef.child(`leagueGamesSummary/_${league.leagueID}`).once('value');

	if (!snap.val()) return null;

	const players: IPlayer[] = Object.values(league.players);
	const gameSummaries: { players: Record<string, IPlayerScoresSummary> }[] = Object.values(snap.val());

	const perPlayerGames: IPlayerScoresSummary[][] = players.map(player =>
		gameSummaries.map(game => game.players[player.key]).filter(Boolean)
	);

	const leagueGamesSnap = await dbRef
		.child(`leagueGames/_${league.leagueID}`)
		.orderByChild('status')
		.equalTo('FINISHED')
		.once('value');

	let allGamesData: GameWithMeta[] = [];

	if (leagueGamesSnap.val()) {
		const leagueGamesData: Record<string, any> = leagueGamesSnap.val();
		const gameKeys = Object.keys(leagueGamesData);

		const gameSnapshots = await Promise.all(gameKeys.map(key => dbRef.child(`games/${key}`).once('value')));

		allGamesData = gameSnapshots.map((gameSnap, i) => {
			const gameKey = gameKeys[i];
			const gameData = gameSnap.val();
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
	}

	return {
		league,
		cumulativeScores: computeCumulativeScores(perPlayerGames),
		players,
		perPlayerGames,
		allGamesData
	};
}

function groupByPlayers(leagues: LeagueWithScores[]): PlayerGroup[] {
	const groupMap = new Map<string, PlayerGroup>();

	for (const entry of leagues) {
		const sortedKeys = [...entry.players].sort((a, b) => a.key.localeCompare(b.key));
		const compositeKey = sortedKeys.map(p => p.key).join('_');

		if (!groupMap.has(compositeKey)) {
			groupMap.set(compositeKey, {
				compositeKey,
				players: sortedKeys,
				leagues: [],
				stats: {
					leaguesWon: {},
					gameStats: {},
					aggregatedGames: {},
					trumpDistribution: {},
					totalGames: 0,
					insights: {
						highestGameScore: null,
						lowestGameScore: null,
						highestBid: null,
						bestRoundScore: null,
						worstRoundScore: null,
						fellPct: 0,
						totalRounds: 0,
						hbKing: null,
						perPlayer: {}
					}
				}
			});
		}

		const group = groupMap.get(compositeKey)!;
		group.leagues.push(entry);

		const perPlayerStats = computePlayerGameStats(entry.allGamesData, entry.players);

		entry.players.forEach((player, idx) => {
			const newStats = perPlayerStats[idx];
			const existing = group.stats.gameStats[player.key];

			if (existing) {
				existing.gameWins += newStats.gameWins;
				existing.totalGamePoints += newStats.totalGamePoints;
				existing.highestBidderWins += newStats.highestBidderWins;
			} else {
				group.stats.gameStats[player.key] = { ...newStats };
			}

			if (!group.stats.aggregatedGames[player.key]) {
				group.stats.aggregatedGames[player.key] = [];
			}

			group.stats.aggregatedGames[player.key].push(...entry.perPlayerGames[idx]);
		});

		group.stats.totalGames += entry.allGamesData.length;

		for (const game of entry.allGamesData) {
			for (const round of game.rounds) {
				if (!round || !round.trump) continue;
				const trump = String(round.trump);
				group.stats.trumpDistribution[trump] = (group.stats.trumpDistribution[trump] || 0) + 1;
			}
		}

		if (entry.league.winner) {
			group.stats.leaguesWon[entry.league.winner.key] =
				(group.stats.leaguesWon[entry.league.winner.key] || 0) + 1;
		}
	}

	const groups = Array.from(groupMap.values());

	for (const group of groups) {
		group.leagues.sort((a, b) => b.league.leagueID - a.league.leagueID);
		group.stats.insights = computeGroupInsights(group.leagues, group.players);
	}

	return groups;
}

function renderLeagueRow(entry: LeagueWithScores, groupPlayers: IPlayer[]) {
	const { league, cumulativeScores, players } = entry;

	return (
		<Link className="league-row" key={league.leagueID} to={`${routes.LEAGUE}/${league.leagueID}`}>
			<div className="league-title">{league.title}</div>
			<div className="league-scores">
				{groupPlayers.map(gp => {
					const idx = players.findIndex(p => p.key === gp.key);
					const score = idx !== -1 ? cumulativeScores[idx] : 0;
					const isWinner = league.winner?.key === gp.key;

					return (
						<span className={`score-cell ${isWinner ? 'winner' : ''}`} key={gp.key}>
							{score}
							{isWinner && <TrophyOutlined className="winner-trophy" />}
						</span>
					);
				})}
			</div>
		</Link>
	);
}

function renderUnderOverBar(aggregatedGames: Record<string, IPlayerScoresSummary[]>, players: IPlayer[]) {
	const anyPlayerKey = players[0]?.key;
	const games = aggregatedGames[anyPlayerKey] || [];
	const underTotal = games.reduce((sum, g) => sum + (g.successRateUnder?.total || 0), 0);
	const overTotal = games.reduce((sum, g) => sum + (g.successRateOver?.total || 0), 0);
	const total = underTotal + overTotal;
	if (total === 0) return null;
	const underPct = (underTotal / total) * 100;
	const overPct = (overTotal / total) * 100;

	return (
		<div className="bar-section">
			<div className="bar-section-title">Under vs Over</div>
			<div className="under-over-row">
				<div className="stacked-bar">
					<div
						className="bar-segment bar-under"
						style={{ width: `${underPct}%` }}
						title={`Under: ${underPct.toFixed(0)}%`}
					/>
					<div
						className="bar-segment bar-over"
						style={{ width: `${overPct}%` }}
						title={`Over: ${overPct.toFixed(0)}%`}
					/>
				</div>
				<div className="bar-legend">
					<div className="legend-item">
						<span className="legend-swatch bar-under" />
						<span className="legend-pct">
							{underPct.toFixed(0)}% under ({underTotal})
						</span>
					</div>
					<div className="legend-item">
						<span className="legend-swatch bar-over" />
						<span className="legend-pct">
							{overPct.toFixed(0)}% over ({overTotal})
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

function renderTrumpDistribution(trumpDistribution: Record<string, number>) {
	if (Object.keys(trumpDistribution).length === 0) return null;
	const totalRounds = Object.values(trumpDistribution).reduce((a, b) => a + b, 0);

	return (
		<div className="bar-section">
			<div className="bar-section-title">Trump Distribution</div>
			<div className="trump-bar-row">
				<div className="stacked-bar trump-bar">
					{TRUMP_SUITS.map(suit => {
						const count = trumpDistribution[suit.key] || 0;
						if (count === 0) return null;
						const pct = (count / totalRounds) * 100;
						return (
							<div
								className="bar-segment"
								key={suit.key}
								style={{ width: `${pct}%`, backgroundColor: suit.color }}
								title={`${suit.label}: ${pct.toFixed(0)}%`}
							/>
						);
					})}
				</div>
			</div>
			<div className="bar-legend">
				{TRUMP_SUITS.map(suit => {
					const count = trumpDistribution[suit.key] || 0;
					if (count === 0) return null;
					const pct = (count / totalRounds) * 100;
					return (
						<div className="legend-item" key={suit.key}>
							<span className="legend-swatch" style={{ backgroundColor: suit.color }} />
							<span className="legend-icon" style={{ color: suit.color }}>
								{suit.key !== 'NT' ? <Icon component={suit.icon} /> : 'NT'}
							</span>
							<span className="legend-pct">{pct.toFixed(0)}%</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function renderGroupInsights(insights: GroupInsights, players: IPlayer[]) {
	const recordCards: { label: string; value: string; playerName: string; context: string }[] = [];

	if (insights.highestGameScore) {
		recordCards.push({
			label: 'Highest Game Score',
			value: String(insights.highestGameScore.value),
			playerName: insights.highestGameScore.player,
			context: `${insights.highestGameScore.leagueTitle} · G#${insights.highestGameScore.gameNum}`
		});
	}
	if (insights.lowestGameScore) {
		recordCards.push({
			label: 'Lowest Game Score',
			value: String(insights.lowestGameScore.value),
			playerName: insights.lowestGameScore.player,
			context: `${insights.lowestGameScore.leagueTitle} · G#${insights.lowestGameScore.gameNum}`
		});
	}
	if (insights.highestBid) {
		recordCards.push({
			label: 'Highest Bid',
			value: String(insights.highestBid.value),
			playerName: insights.highestBid.player,
			context: `${insights.highestBid.leagueTitle} · G#${insights.highestBid.gameNum}`
		});
	}
	if (insights.bestRoundScore) {
		recordCards.push({
			label: 'Best Round Score',
			value: String(insights.bestRoundScore.value),
			playerName: insights.bestRoundScore.player,
			context: `${insights.bestRoundScore.leagueTitle} · G#${insights.bestRoundScore.gameNum}`
		});
	}
	if (insights.worstRoundScore) {
		recordCards.push({
			label: 'Worst Round Score',
			value: String(insights.worstRoundScore.value),
			playerName: insights.worstRoundScore.player,
			context: `${insights.worstRoundScore.leagueTitle} · G#${insights.worstRoundScore.gameNum}`
		});
	}
	recordCards.push({
		label: 'Fell Rate',
		value: `${insights.fellPct.toFixed(0)}%`,
		playerName: `${insights.totalRounds} total rounds`,
		context: ''
	});

	if (insights.hbKing) {
		recordCards.push({
			label: 'HB Crown',
			value: insights.hbKing.player,
			playerName: `${insights.hbKing.count} HBs taken`,
			context: ''
		});
	}

	const insightRows: { label: string; values: (string | number)[] }[] = [
		{ label: 'Avg Game Score', values: players.map(p => insights.perPlayer[p.key]?.avgGameScore ?? 0) },
		{ label: 'Avg Bid', values: players.map(p => insights.perPlayer[p.key]?.avgBid ?? 0) },
		{ label: 'Game Win Rate', values: players.map(p => `${insights.perPlayer[p.key]?.gameWinRate ?? 0}%`) },
		{ label: 'Game Win Streak', values: players.map(p => insights.perPlayer[p.key]?.longestWinStreak ?? 0) }
	];

	return (
		<div className="group-insights">
			<div className="insights-cards">
				{recordCards.map(card => (
					<div className="insight-card" key={card.label}>
						<div className="insight-card-value">{card.value}</div>
						<div className="insight-card-label">{card.label}</div>
						<div className="insight-card-player">{card.playerName}</div>
						{card.context && <div className="insight-card-context">{card.context}</div>}
					</div>
				))}
			</div>

			<div className="insights-table">
				{insightRows.map(row => (
					<div className="detail-row" key={row.label}>
						<div className="detail-row-label">{row.label}</div>
						<div className="detail-row-values">
							{row.values.map((val, i) => (
								<span className="detail-value" key={players[i].key}>
									{val}
								</span>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function PlayerGroupCard({ group }: { group: PlayerGroup }) {
	const [modalOpen, setModalOpen] = useState(false);

	const barData = Object.keys(detailWinRateLabels).map(key => ({
		category: detailWinRateLabels[key],
		...Object.fromEntries(
			group.players.map(p => [p.nickname, Number(computeWinRate(group.stats.aggregatedGames[p.key] || [], key))])
		)
	}));

	return (
		<div className="player-group">
			<div className="group-header">
				{group.players.map(p => (
					<span className="player-name" key={p.key}>
						{p.nickname}
					</span>
				))}
			</div>

			<div className="group-stats">
				{group.players.map(p => (
					<div className="stat-cell" key={p.key}>
						<div className="stat-wins">
							{group.stats.leaguesWon[p.key] || 0}
							<TrophyOutlined className="wins-trophy" />
						</div>
					</div>
				))}
			</div>

			{Object.keys(group.stats.gameStats).length > 0 && (
				<div className="group-detail-stats">
					{(Object.keys(gameStatsLabels) as (keyof PlayerGameStats)[]).map(key => (
						<div className="detail-row" key={key}>
							<div className="detail-row-label">{gameStatsLabels[key]}</div>
							<div className="detail-row-values">
								{group.players.map(p => (
									<span className="detail-value" key={p.key}>
										{group.stats.gameStats[p.key]?.[key] ?? 0}
									</span>
								))}
							</div>
						</div>
					))}

					<div className="detail-row">
						<div className="detail-row-label">
							Success
							<span className="chart-icon" onClick={() => setModalOpen(true)}>
								<BarChartOutlined />
							</span>
						</div>
						<div className="detail-row-values">
							{group.players.map(p => {
								const games = group.stats.aggregatedGames[p.key];
								return (
									<span className="detail-value" key={p.key}>
										{games?.length ? computeWinRate(games, 'successRate') : 0}%
									</span>
								);
							})}
						</div>
					</div>
				</div>
			)}

			{group.stats.insights.totalRounds > 0 && renderGroupInsights(group.stats.insights, group.players)}

			<Modal
				visible={modalOpen}
				onCancel={() => setModalOpen(false)}
				footer={null}
				title="Win Rate Breakdown"
				width={480}
				centered
				bodyStyle={{ padding: '12px 8px' }}
			>
				<ResponsiveContainer width="100%" height={280}>
					<BarChart data={barData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis dataKey="category" tick={{ fontSize: 11 }} />
						<YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
						<Tooltip formatter={(value: number) => `${value}%`} />
						<Legend />
						{group.players.map((p, i) => (
							<Bar
								key={p.key}
								dataKey={p.nickname}
								fill={PLAYER_COLORS[i % PLAYER_COLORS.length]}
								radius={[3, 3, 0, 0]}
							/>
						))}
					</BarChart>
				</ResponsiveContainer>
			</Modal>

			{group.stats.totalGames > 0 && (
				<div className="group-extra-stats">
					<div className="extra-stats-summary">
						<div className="summary-item">
							<span className="summary-value">{group.leagues.length}</span>
							<span className="summary-label">Leagues</span>
						</div>
						<div className="summary-item">
							<span className="summary-value">
								{(group.stats.totalGames / group.leagues.length).toFixed(1)}
							</span>
							<span className="summary-label">Avg Games / League</span>
						</div>
					</div>

					{renderUnderOverBar(group.stats.aggregatedGames, group.players)}

					{renderTrumpDistribution(group.stats.trumpDistribution)}
				</div>
			)}

			<div className="league-list">{group.leagues.map(entry => renderLeagueRow(entry, group.players))}</div>
		</div>
	);
}

const ScoreBoard: React.FC<IScoreBoardProps> = ({ history }) => {
	const [groups, setGroups] = useState<PlayerGroup[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchFinishedLeagues = useCallback(async () => {
		const userId = fire.auth().currentUser?.uid;
		if (!userId) {
			setLoading(false);
			return;
		}

		const snapshot = await fire.database().ref('leagues/list').orderByChild('active').equalTo(false).once('value');

		if (!snapshot.val()) {
			setGroups([]);
			setLoading(false);
			return;
		}

		const allLeagues = Object.values(snapshot.val() as Record<string, ILeagueModel>);
		const userLeagues = allLeagues.filter(({ players }) =>
			Object.values(players).some(({ key }) => key === userId)
		);

		if (userLeagues.length === 0) {
			setGroups([]);
			setLoading(false);
			return;
		}

		const leaguesWithScores = await Promise.all(userLeagues.map(league => fetchLeagueScores(league)));

		setGroups(groupByPlayers(leaguesWithScores.filter(Boolean) as LeagueWithScores[]));
		setLoading(false);
	}, []);

	useEffect(() => {
		fetchFinishedLeagues();
	}, [fetchFinishedLeagues]);

	return (
		<div className="score-board">
			<div className="score-board-header">
				<button className="back-btn" onClick={() => history.push(routes.MAIN)}>
					<ArrowLeftOutlined />
				</button>
				<h2>Score Board</h2>
			</div>

			{loading ? (
				<div className="score-board-loading">
					<Spin size="large" />
				</div>
			) : groups.length === 0 ? (
				<div className="score-board-empty">
					<TrophyOutlined className="empty-icon" />
					<p>No finished leagues yet</p>
					<span>Complete a league to see your scores here</span>
				</div>
			) : (
				<div className="score-board-content">
					{groups.map(group => (
						<PlayerGroupCard key={group.compositeKey} group={group} />
					))}
				</div>
			)}
		</div>
	);
};

const authCondition = (authUser: UserContext) => !!authUser;

export default withAuthorization<IScoreBoardProps>(authCondition)(ScoreBoard);
