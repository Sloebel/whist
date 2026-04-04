import React, { Component } from 'react';
import { Radio, Switch, Badge, Row, Col, Modal, message, Button } from 'antd';
import { SoundOutlined, UndoOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons';
import type { RadioChangeEvent } from 'antd';
import CardsModal from '../../common/cards/Modal';
import { ChangePlayers } from '../../common/cards/Icons';
import NumbersPad from '../../common/numbers/Pad';
import PlayerPad from '../../common/player/Pad';
import { INPUT_MODE } from '../../constants/states';
import Dialog from '../../dialogs/Dialog';
import { Dialogs } from '../../constants/dialogs';
import { PlayersContext } from '../GameTab';
import Css, { CSS_TRANSITIONS } from '../../common/transition/Css';
import TwoWayArrow, { TWO_WAY_ARROW_DIRECTION } from '../../common/twoWayArrow/TwoWayArrow';
import PlayCard from '../PlayCard/PlayCard';
import ThrownCard, { ThrownCardType } from '../ThrownCard/ThrownCard';
import {
	nextPlayerIndex,
	uniqueHand,
	getFromToCalc,
	getToWinnerCalc,
	CARD_MARKER_HEIGHT
} from '../../utils/game-utils';
import {
	IRoundData,
	IGameColumn,
	IThrownCard,
	ICardsPosition,
	ICardsFromTo,
	IPlayerHand,
	IClaimApproved
} from '../../models/IGameModel';
import PassTag from './Pass/PassTag';
import PassButton from './Pass/PassButton';

import './GamePad.scss';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const playerTurn = require('../../assets/sounds/playerTurn.mp3');

const confirm = Modal.confirm;
message.config({
	top: 100,
	maxCount: 3
});

interface GamePadProps {
	gameMode?: string;
	ownCardsState?: (string | null)[];
	onCardThrown: (card: string, player: number, currentRound: number, currentHand: number) => void;
	currentRound?: number;
	allRounds?: IRoundData[];
	players: IGameColumn[];
	devicePlayerIndex: number | null;
	onChange: (roundData: IRoundData, player?: number) => void;
	isDealer?: boolean;
	claimApproved?: IClaimApproved;
	claimActivated?: boolean;
	revealedCards?: { [playerIndex: number]: string[] };
	onClaimActivated?: () => void;
	onDropCards?: () => void;
}

interface GamePadState {
	selectedPlayer: number | undefined;
	reorderPlayersDialogVisible: boolean;
	trumpModalVisible: boolean;
	preSelectedCard: string | undefined;
	thrownCard: string | undefined;
	thrownCards: IThrownCard[];
	handCardType: string | undefined;
	isMute: boolean;
	claimWinnerAnimating: boolean;
}

class GamePad extends Component<GamePadProps, GamePadState> {
	audio = new Audio(playerTurn);
	private cardsMarkerRef: HTMLDivElement | null = null;
	private ownThrownCardInitPos: ICardsPosition | undefined;
	private claimAnimationTimer?: ReturnType<typeof setTimeout>;

	constructor(props: GamePadProps) {
		super(props);

		this.state = {
			selectedPlayer: undefined,
			reorderPlayersDialogVisible: false,
			trumpModalVisible: false,
			preSelectedCard: undefined,
			thrownCard: undefined,
			thrownCards: [],
			handCardType: undefined,
			isMute: false,
			claimWinnerAnimating: false
		};

		this.handleSwitchMode = this.handleSwitchMode.bind(this);
		this.handleCardsPadChange = this.handleCardsPadChange.bind(this);
		this.handleNumberSelect = this.handleNumberSelect.bind(this);
		this.setSelectedPlayer = this.setSelectedPlayer.bind(this);
		this.showChangeHighestBidderConfirm = this.showChangeHighestBidderConfirm.bind(this);
		this.showChangePlayerDialog = this.showChangePlayerDialog.bind(this);
		this.handleReorderPlayersAfterClose = this.handleReorderPlayersAfterClose.bind(this);
	}

	componentDidUpdate(prevProps: GamePadProps) {
		if (this.props.gameMode === 'remote') {
			const { devicePlayerIndex, ownCardsState } = this.props;
			const currentRoundData = this.getRoundData();
			const { handsState, currentHand, inputMode } = currentRoundData;

			const { allRounds: prevAllRounds, currentRound: prevCurrentRound } = prevProps;
			const prevCurrentRoundData = prevAllRounds!.length && prevAllRounds![prevCurrentRound! - 1];

			if ((prevCurrentRoundData as IRoundData).inputMode !== inputMode && inputMode === INPUT_MODE.WON) {
				this.setState({
					selectedPlayer: currentRoundData.highestBidder as number
				});

				if (currentRoundData.highestBidder === devicePlayerIndex) {
					this.playAudio();
				}
			}

			if (
				(prevCurrentRoundData as IRoundData).currentBidder !== currentRoundData.currentBidder &&
				inputMode === INPUT_MODE.BID
			) {
				this.setState({
					selectedPlayer: currentRoundData.currentBidder
				});
			}

			const prevHandsState = (prevCurrentRoundData as IRoundData).handsState;
			if (prevHandsState !== handsState) {
				const stateToUpdate: Partial<GamePadState> = {};
				const thrown =
					handsState &&
					handsState[currentHand!] &&
					(handsState[currentHand!]['thrownCards'] || []).find(thrown => thrown.player === devicePlayerIndex);

				if (thrown && thrown.card && (ownCardsState || []).length > 1) {
					stateToUpdate.thrownCard = thrown.card;
				} else {
					stateToUpdate.thrownCard = undefined;
				}

				if (handsState) {
					const thrownCards = handsState[currentHand!]['thrownCards']
						? (uniqueHand([
								...this.state.thrownCards,
								...handsState[currentHand!]['thrownCards']
							] as unknown as IPlayerHand[]) as unknown as IThrownCard[])
						: [];

					stateToUpdate.thrownCards = thrownCards;
					stateToUpdate.selectedPlayer = handsState[currentHand!]['turnOf'] as number | undefined;
					stateToUpdate.handCardType = thrownCards[0] && thrownCards[0].card.split('-')[1];
				} else {
					stateToUpdate.thrownCards = [];
					stateToUpdate.selectedPlayer = currentRoundData.highestBidder as number;
					stateToUpdate.handCardType = undefined;
				}

				if (inputMode === INPUT_MODE.WON && stateToUpdate.selectedPlayer === devicePlayerIndex) {
					this.playAudio();
				}

				this.setState(stateToUpdate as GamePadState);
			}

			const { revealedCards, claimActivated } = this.props;
			const prevRevealed = prevProps.revealedCards;
			const lastHand = currentHand as number;
			const roundFinished = handsState && handsState[lastHand] && handsState[lastHand].status === 'FINISHED';

			if (claimActivated && revealedCards && !roundFinished) {
				const allRevealed = [0, 1, 2, 3].every(i => revealedCards[i] != null);
				const prevAllRevealed = prevRevealed && [0, 1, 2, 3].every(i => prevRevealed[i] != null);

				if (allRevealed && !prevAllRevealed && !this.state.claimWinnerAnimating) {
					this.claimAnimationTimer = setTimeout(() => {
						this.setState({ claimWinnerAnimating: true });
					}, 1500);
				}
			}

			if (!claimActivated && prevProps.claimActivated) {
				this.setState({ claimWinnerAnimating: false });

				if (this.claimAnimationTimer) {
					clearTimeout(this.claimAnimationTimer);
				}
			}
		}
	}

	handleSwitchMode(checked: boolean) {
		const { onChange } = this.props;
		const roundData = this.getRoundData();
		const { trump, segment, handsState } = roundData;

		if (segment === 0) {
			return message.warning('Total Bids are 13?!?!');
		}

		if (this.state.thrownCard || handsState) {
			return message.warning('Can`t change bids after a card was thrown');
		}

		const everyoneBid = this.isAllBids(roundData);

		if (trump && everyoneBid) {
			this.setState({
				selectedPlayer: undefined
			});

			onChange({
				...roundData,
				inputMode: checked ? INPUT_MODE.WON : INPUT_MODE.BID
			});
		} else {
			message.warning('Bids are not completed');
		}
	}

	setSelectedPlayer(e: RadioChangeEvent) {
		if (this.isAllowedToSelectPlayer() && e.target.type === 'radio') {
			this.setState({
				selectedPlayer: e.target.value
			});
		}
	}

	isAllowedToSelectPlayer(): boolean {
		const { gameMode } = this.props;
		const roundData = this.getRoundData();

		if (gameMode === 'remote') {
			const { inputMode, highestBidder } = roundData;

			return inputMode === INPUT_MODE.WON || typeof highestBidder === 'number' ? false : true;
		}

		return true;
	}

	handleCardsPadChange(trump: string) {
		const { onChange } = this.props;
		const roundData = this.getRoundData();
		const { inputMode } = roundData;

		this.setState({ trumpModalVisible: false });

		if (inputMode !== INPUT_MODE.WON) {
			onChange({ ...roundData, trump });
		}
	}

	handleNumberSelect(num: number) {
		const { players, currentRound, onChange } = this.props;
		const roundData = this.getRoundData();
		const { inputMode, highestBidder } = roundData;

		if (inputMode === INPUT_MODE.BID && this.props.gameMode === 'remote') {
			return this.handleRemoteBidFlow(num);
		}

		const { selectedPlayer } = this.state;
		const mode = inputMode === INPUT_MODE.BID ? 'bid' : 'won';
		const prop = mode + selectedPlayer;

		const newRoundData: Partial<IRoundData> = {};

		if (inputMode === INPUT_MODE.BID) {
			if (currentRound === 13) {
				if ((num >= 5 && !roundData[`bid${highestBidder}`]) || roundData[`bid${highestBidder}`] < num) {
					newRoundData.highestBidder = selectedPlayer;
				}
			} else {
				const nextPlayer = this.getNextPlayer(selectedPlayer!, players);
				const nextPlayerBid = roundData[`bid${nextPlayer}`];
				const beforePlayerBid = this.getBeforePlayerBid(selectedPlayer!, players);

				if (nextPlayerBid === undefined || nextPlayerBid === '' || nextPlayer === highestBidder) {
					if ((!highestBidder && highestBidder !== 0) || highestBidder === selectedPlayer) {
						if (num < 5) {
							return message.warning('First Bid should be more then 5');
						} else {
							newRoundData.highestBidder = selectedPlayer;
						}
					} else if (num >= 5) {
						this.showChangeHighestBidderConfirm(onChange, roundData, prop, num, selectedPlayer!, players);
					} else if (!beforePlayerBid && beforePlayerBid !== 0) {
						return message.warning('The Bids are not in the right order!!');
					}
				} else {
					return message.warning('The Next Player already Bid, Can not change bid');
				}
			}
		}

		newRoundData[prop] = num;
		onChange({ ...roundData, ...newRoundData } as IRoundData, selectedPlayer);
	}

	calculateDisableNum(): number | undefined {
		const { players } = this.props;
		const roundData = this.getRoundData();
		const { highestBidder, inputMode } = roundData;
		const { selectedPlayer } = this.state;

		if (typeof selectedPlayer !== 'number') return undefined;

		if (inputMode !== INPUT_MODE.BID) return undefined;

		if (this.getNextPlayer(selectedPlayer, players) !== highestBidder) return undefined;

		const beforePlayers = this.getBeforePlayers(selectedPlayer, players);

		let bids = 0;

		for (const player of beforePlayers) {
			const aBid = roundData[`bid${player}`];
			if (aBid === null) return undefined;

			bids += aBid;
		}

		return 13 - bids;
	}

	showChangeHighestBidderConfirm(
		onChange: GamePadProps['onChange'],
		roundData: IRoundData,
		prop: string,
		num: number,
		selectedPlayer: number,
		players: IGameColumn[]
	) {
		confirm({
			title: 'Change Highest Bidder?',
			content: '(will reset the rest of the bids)',
			okType: 'danger',
			onOk() {
				onChange(
					{
						...roundData,
						bid0: '',
						bid1: '',
						bid2: '',
						bid3: '',
						[prop]: num,
						highestBidder: selectedPlayer
					},
					selectedPlayer
				);
			},
			onCancel: () => {
				const beforePlayerBid = this.getBeforePlayerBid(selectedPlayer, players);

				if (beforePlayerBid || beforePlayerBid === 0) {
					onChange({ ...roundData, [prop]: num }, selectedPlayer);
				} else {
					message.warning('The Bids are not in the right order!!');
					onChange({ ...roundData }, selectedPlayer);
				}
			}
		});
	}

	getNextPlayer = (selectedPlayer: number, players: IGameColumn[]): number => {
		const index = players.findIndex(player => player.index === selectedPlayer);
		const nextIndex = index + 1 > 3 ? index + 1 - 4 : index + 1;

		return players[nextIndex].index;
	};

	getBeforePlayer = (selectedPlayer: number, players: IGameColumn[]): number => {
		const index = players.findIndex(player => player.index === selectedPlayer);
		const beforeIndex = index - 1 > -1 ? index - 1 : index - 1 + 4;

		return players[beforeIndex].index;
	};

	getBeforePlayerBid = (selectedPlayer: number, players: IGameColumn[]) => {
		const roundData = this.getRoundData();

		return roundData[`bid${this.getBeforePlayer(selectedPlayer, players)}`];
	};

	getBeforePlayers = (selectedPlayer: number, players: IGameColumn[]): number[] => {
		const index = players.findIndex(player => player.index === selectedPlayer);
		return players.filter(player => index !== player.index).map(player => player.index);
	};

	getPlayerAggregateScore = (roundsData: IRoundData[], roundIndex: number, playerIndex: number): number => {
		const roundData = roundsData[roundIndex];

		if (!roundData) {
			return 0;
		}

		const aggregateScore = roundData[`aggregateScore${playerIndex}`];
		if (typeof aggregateScore === 'number' && !roundData.fell) {
			return aggregateScore;
		}

		return this.getPlayerAggregateScore(roundsData, roundIndex - 1, playerIndex);
	};

	render() {
		const { devicePlayerIndex, gameMode, isDealer } = this.props;
		const currentRoundData = this.getRoundData();
		const { round, check, trump, segment, inputMode, fell, factor } = currentRoundData;
		const { selectedPlayer, reorderPlayersDialogVisible, trumpModalVisible, isMute } = this.state;
		const isAllBids = this.isAllBids(currentRoundData);
		const playersButtons = this.getPlayersButtons();
		const isRemote = gameMode === 'remote';
		const showReorderPlayers = !isRemote && round === 1 && inputMode === INPUT_MODE.BID;
		const hasAnyBid = [0, 1, 2, 3].some(i => typeof currentRoundData[`bid${i}`] === 'number');
		const hasAnyWon = [0, 1, 2, 3].some(i => typeof currentRoundData[`won${i}`] === 'number');
		const showResetBids = inputMode === INPUT_MODE.BID && hasAnyBid && !hasAnyWon && (!isRemote || isDealer);
		const showPassButton =
			isRemote && inputMode === INPUT_MODE.BID && typeof currentRoundData.highestBidder !== 'number';
		const devicePlayerPassed =
			showPassButton && (currentRoundData.passedPlayers || []).includes(devicePlayerIndex!);

		return (
			<Radio.Group
				buttonStyle="solid"
				className={`game-pad-container ${fell ? 'round-fell' : ''}`}
				onChange={this.setSelectedPlayer}
				value={selectedPlayer}
			>
				<h3>Round: {round}</h3>
				<Row justify="space-around">
					<Col>
						<Switch
							onChange={this.handleSwitchMode}
							checkedChildren={isRemote ? ' Play ' : ' Won '}
							unCheckedChildren=" Bid "
							checked={inputMode === INPUT_MODE.WON}
						/>
						<div className="segment">
							Bids:{' '}
							<Css type={CSS_TRANSITIONS.FADE_IN}>
								{!isAllBids ? `${segment && 13 + (segment as number)}` : segment}
							</Css>
							<TwoWayArrow
								direction={
									isAllBids &&
									(Number(segment) > 0 ? TWO_WAY_ARROW_DIRECTION.TOP : TWO_WAY_ARROW_DIRECTION.BOTTOM)
								}
							/>
						</div>
						<div>Check: {check ? 'yes' : 'no'}</div>
						<Css type={CSS_TRANSITIONS.FADE_IN}>
							{fell ? <div className="fell-indicator">round fell</div> : ''}
						</Css>
						{!fell && factor > 1 && <div className="factor-indicator">{`x${factor}`}</div>}
						{isRemote && (
							<Button
								className={`toggle-sound-btn ${isMute ? 'is-mute' : ''}`}
								type="link"
								icon={<SoundOutlined />}
								onClick={this.toggleMute}
							/>
						)}
					</Col>
					<Col className="item item2">{playersButtons[nextPlayerIndex(devicePlayerIndex! + 1)]}</Col>
					<Col>
						<CardsModal
							trump={trump}
							onChange={this.handleCardsPadChange}
							disabled={inputMode === INPUT_MODE.WON}
							visible={trumpModalVisible}
						/>
					</Col>
				</Row>

				<div className="thrown-cards-marker" ref={el => (this.cardsMarkerRef = el)}></div>

				<Row justify="space-around">
					<Col className="item item4">{playersButtons[nextPlayerIndex(devicePlayerIndex!)]}</Col>
					<Col style={{ zIndex: 1 }}>
						{isRemote && inputMode === INPUT_MODE.WON ? (
							<div className="number-pad-placement"></div>
						) : (
							<NumbersPad
								disabledNumber={this.calculateDisableNum()}
								onSelect={this.handleNumberSelect}
								disabled={this.isNumberPadDisabled()}
							/>
						)}
					</Col>
					<Col className="item item6">{playersButtons[nextPlayerIndex(devicePlayerIndex! + 2)]}</Col>
				</Row>
				<Row justify="center" style={{ position: 'relative', zIndex: 1 }}>
					<Col className="item item8">{playersButtons[devicePlayerIndex!]}</Col>
					{showReorderPlayers && (
						<div>
							<Button
								type="dashed"
								shape="circle"
								className="change-players-btn"
								onClick={this.showChangePlayerDialog}
							>
								<Icon component={ChangePlayers} />
							</Button>
							{reorderPlayersDialogVisible && (
								<PlayersContext.Consumer>
									{({ players, reorderPlayers }) => (
										<Dialog
											dialog={Dialogs.REORDER_PLAYERS}
											dialogProps={{
												onOk: reorderPlayers,
												onAfterClose: this.handleReorderPlayersAfterClose,
												visible: reorderPlayersDialogVisible,
												players
											}}
										/>
									)}
								</PlayersContext.Consumer>
							)}
						</div>
					)}

					{showPassButton && <PassButton checked={devicePlayerPassed} onChange={this.handlePassToggle} />}

					{showResetBids && (
						<div className="reset-bids-btn" onClick={this.handleResetBids}>
							<Button type="dashed" shape="circle">
								<UndoOutlined />
							</Button>
							<span className="reset-label">Reset Bids</span>
						</div>
					)}
				</Row>
				{isRemote && this.getThrownCardsPlacement()}
				{this.getCards()}
				{isRemote && this.getClaimControls()}
				{isRemote && this.getRevealedCardsDisplay()}
			</Radio.Group>
		);
	}

	getClaimControls() {
		const { claimApproved, claimActivated, revealedCards, devicePlayerIndex, onClaimActivated, onDropCards } =
			this.props;
		const roundData = this.getRoundData();
		const { currentHand } = roundData;

		if (!currentHand || currentHand < 8) return null;

		const showClaimButton = claimApproved && claimApproved.player === devicePlayerIndex && !claimActivated;

		const showDropButton =
			claimActivated &&
			claimApproved &&
			devicePlayerIndex !== claimApproved.player &&
			!(revealedCards && revealedCards[devicePlayerIndex!] != null);

		if (!showClaimButton && !showDropButton) return null;

		return (
			<div className="claim-controls">
				{showClaimButton && (
					<Button type="primary" className="claim-btn" onClick={onClaimActivated}>
						Claim Cards
					</Button>
				)}
				{showDropButton && (
					<Button type="primary" className="drop-cards-btn" onClick={onDropCards}>
						Drop Cards
					</Button>
				)}
			</div>
		);
	}

	getRevealedCardsDisplay() {
		const { claimActivated, claimApproved, revealedCards, devicePlayerIndex } = this.props;
		const { claimWinnerAnimating } = this.state;

		if (!claimActivated || !revealedCards || !this.cardsMarkerRef) return null;

		const roundData = this.getRoundData();
		const { handsState, currentHand } = roundData;
		const lastHand = currentHand as number;

		if (handsState && handsState[lastHand] && handsState[lastHand].status === 'FINISHED') return null;

		const markerTop = this.cardsMarkerRef.offsetTop;
		const markerWidth = this.cardsMarkerRef.offsetWidth;
		const fn = nextPlayerIndex;

		const playerOnPadMap: Record<number, ThrownCardType> = {
			[devicePlayerIndex!]: 'bottom',
			[fn(devicePlayerIndex!)]: 'left',
			[fn(devicePlayerIndex! + 1)]: 'top',
			[fn(devicePlayerIndex! + 2)]: 'right'
		};

		const winnerDirection = claimApproved ? playerOnPadMap[claimApproved.player] : undefined;
		const toWinner =
			claimWinnerAnimating && winnerDirection
				? getToWinnerCalc(winnerDirection, markerTop, markerWidth)!.to
				: null;

		return (
			<div className="revealed-cards-container">
				{Object.entries(revealedCards).map(([idx, cards]) => {
					const playerIndex = Number(idx);
					if (!cards || cards.length === 0) return null;

					const thrownType = playerOnPadMap[playerIndex];
					const basePos = getFromToCalc(thrownType, markerTop, markerWidth, { top: 0, left: 0 });

					const from =
						thrownType === 'bottom' ? getToWinnerCalc('bottom', markerTop, markerWidth)!.to : basePos.from;

					const fanSpacing = 18;
					const cardWidth = 90;
					const cardHeight = 126;
					const centerLeft = markerWidth / 2;
					const centerTop = markerTop + CARD_MARKER_HEIGHT / 2;

					const inset = 100;
					const gapAnchor: Record<ThrownCardType, { top: number; left: number }> = {
						top: { top: centerTop - cardHeight - inset, left: centerLeft - cardWidth / 2 },
						bottom: { top: centerTop + inset, left: centerLeft - cardWidth / 2 },
						left: { top: centerTop - cardHeight / 2, left: centerLeft - cardWidth - inset },
						right: { top: centerTop - cardHeight / 2, left: centerLeft + inset }
					};

					const anchor = gapAnchor[thrownType];

					const getRevealedTo = (i: number) => {
						if (toWinner) return toWinner;

						const centerOffset = i - (cards.length - 1) / 2;
						switch (thrownType) {
							case 'top':
								return {
									top: anchor.top,
									left: anchor.left + -centerOffset * fanSpacing
								};
							case 'left':
								return {
									top: anchor.top + centerOffset * fanSpacing,
									left: anchor.left
								};
							case 'right':
								return {
									top: anchor.top + -centerOffset * fanSpacing,
									left: anchor.left
								};
							case 'bottom':
							default:
								return {
									top: anchor.top,
									left: anchor.left + centerOffset * fanSpacing
								};
						}
					};

					return (
						<div key={`revealed-group-${playerIndex}`} className={`revealed-player-group ${thrownType}`}>
							{cards.map((card, i) => (
								<ThrownCard
									key={`revealed-${playerIndex}-${card}`}
									thrownType={thrownType}
									card={card}
									from={from}
									to={getRevealedTo(i)}
									hasWinner={claimWinnerAnimating}
								/>
							))}
						</div>
					);
				})}
			</div>
		);
	}

	getPlayersButtons = () => {
		const { allRounds, currentRound, players, gameMode } = this.props;
		const currentRoundData = allRounds!.length && allRounds![currentRound! - 1];
		const highestBidder = (currentRoundData as IRoundData).highestBidder;
		const passedPlayers = (currentRoundData as IRoundData).passedPlayers || [];
		const isRemote = gameMode === 'remote';
		const showPassTag =
			isRemote &&
			(currentRoundData as IRoundData).inputMode === INPUT_MODE.BID &&
			typeof highestBidder !== 'number';

		return players.map(({ index: playerIndex, playerName }) => {
			const hasPassed = showPassTag && passedPlayers.includes(playerIndex);

			return (
				<div
					key={playerIndex}
					style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
				>
					<PassTag visible={hasPassed} />
					<Badge dot={highestBidder === playerIndex}>
						<Radio.Button value={playerIndex}>
							<PlayerPad
								name={playerName}
								bid={(currentRoundData as IRoundData)[`bid${playerIndex}`]}
								won={(currentRoundData as IRoundData)[`won${playerIndex}`]}
								score={this.getPlayerAggregateScore(allRounds!, currentRound! - 1, playerIndex)}
							/>
						</Radio.Button>
					</Badge>
				</div>
			);
		});
	};

	showChangePlayerDialog() {
		this.setState({
			reorderPlayersDialogVisible: true
		});
	}

	handleReorderPlayersAfterClose() {
		this.setState({
			reorderPlayersDialogVisible: false
		});
	}

	handlePassToggle = () => {
		const { devicePlayerIndex, onChange } = this.props;
		const roundData = this.getRoundData();
		const passedPlayers = roundData.passedPlayers || [];

		const updatedPassedPlayers = passedPlayers.includes(devicePlayerIndex!)
			? passedPlayers.filter((p: number) => p !== devicePlayerIndex)
			: [...passedPlayers, devicePlayerIndex!];

		onChange({ ...roundData, passedPlayers: updatedPassedPlayers });
	};

	handleResetBids = () => {
		const { onChange } = this.props;
		const roundData = this.getRoundData();

		confirm({
			title: 'Reset all bids?',
			okType: 'danger',
			onOk: () => {
				onChange({
					...roundData,
					bid0: '',
					bid1: '',
					bid2: '',
					bid3: '',
					highestBidder: '',
					trump: '',
					segment: '',
					passedPlayers: []
				});
				this.setState({ selectedPlayer: undefined });
			}
		});
	};

	handleRemoteBidFlow(num: number) {
		const { devicePlayerIndex, onChange } = this.props;
		const roundData = this.getRoundData();
		const { highestBidder } = roundData;
		const { selectedPlayer } = this.state;
		const stateToUpdate: Partial<IRoundData> = {};

		if (typeof highestBidder !== 'number') {
			if (num < 5) {
				return message.warning('First Bid should be more then 5');
			} else {
				stateToUpdate.highestBidder = selectedPlayer;
				stateToUpdate[`bid${selectedPlayer}`] = num;
				stateToUpdate.currentBidder = nextPlayerIndex(selectedPlayer!);
				stateToUpdate.passedPlayers = [];

				if (!roundData.trump) {
					setTimeout(
						() =>
							this.setState({
								trumpModalVisible: true
							}),
						300
					);
				}
			}
		} else if (devicePlayerIndex === selectedPlayer) {
			stateToUpdate[`bid${selectedPlayer}`] = num;
			const nextPlayer = nextPlayerIndex(selectedPlayer!);

			if (nextPlayer === highestBidder) {
				stateToUpdate.currentBidder = '' as any;

				setTimeout(() => this.handleSwitchMode(true), 1500);
			} else {
				stateToUpdate.currentBidder = nextPlayerIndex(selectedPlayer!);
			}
		}

		if (Object.keys(stateToUpdate).length) {
			onChange({ ...roundData, ...stateToUpdate } as IRoundData, selectedPlayer);
		}
	}

	getCards() {
		const { ownCardsState, devicePlayerIndex, claimActivated, claimApproved, revealedCards } = this.props;
		const { preSelectedCard, thrownCard, handCardType, selectedPlayer } = this.state;

		if (claimActivated && revealedCards && revealedCards[devicePlayerIndex!] != null) {
			return null;
		}

		if (ownCardsState) {
			const cards = ownCardsState.filter((c): c is string => c !== null);
			const hasCardType = cards.some(card => card.split('-')[1] === handCardType);
			const isDevicePlayer = devicePlayerIndex === selectedPlayer;

			return (
				<div className="cards-container">
					{cards.map(card => (
						<PlayCard
							key={card}
							card={card}
							preSelected={preSelectedCard === card}
							thrown={thrownCard === card}
							onCardClick={this.handleCardClick(card)}
							disabled={
								!!claimApproved ||
								(isDevicePlayer && hasCardType && card.split('-')[1] !== handCardType)
							}
						/>
					))}
				</div>
			);
		}

		return '';
	}

	// TODO: memoize it
	getThrownCardsPlacement() {
		if (!this.cardsMarkerRef) {
			return '';
		}
		const currentRoundData = this.getRoundData();
		const { handsState, currentHand } = currentRoundData;
		const handWinner = handsState && handsState[currentHand!].handWinner;
		const { thrownCards } = this.state;
		const { devicePlayerIndex } = this.props;
		const fn = nextPlayerIndex;

		const playerOnPadMap: Record<number, string> = {
			[devicePlayerIndex!]: 'bottom',
			[fn(devicePlayerIndex!)]: 'left',
			[fn(devicePlayerIndex! + 1)]: 'top',
			[fn(devicePlayerIndex! + 2)]: 'right'
		};

		const toWinner = handWinner !== undefined && this.getFromTo(playerOnPadMap[handWinner], true);

		return (
			<div className="hand-cards-container">
				{thrownCards.map(thrown => {
					const { from, to } = (toWinner || this.getFromTo(playerOnPadMap[thrown.player])) as ICardsFromTo;

					return (
						<ThrownCard
							key={thrown.player}
							thrownType={playerOnPadMap[thrown.player] as any}
							card={thrown.card}
							from={from}
							to={to}
							hasWinner={handWinner !== undefined}
						/>
					);
				})}
			</div>
		);
	}

	handleCardClick = (card: string) => (e: React.MouseEvent<HTMLDivElement>) => {
		const { claimApproved } = this.props;

		if (claimApproved) return;

		const { preSelectedCard, selectedPlayer } = this.state;
		const { currentRound, devicePlayerIndex, onCardThrown } = this.props;
		const roundData = this.getRoundData();
		const { inputMode } = roundData;

		if (inputMode === INPUT_MODE.WON && selectedPlayer === devicePlayerIndex) {
			if (preSelectedCard === card) {
				const top = (e.currentTarget.offsetParent as HTMLElement).offsetTop - 15;
				const left = e.currentTarget.offsetLeft;
				this.ownThrownCardInitPos = { top, left };

				this.setState({
					thrownCards: [
						...this.state.thrownCards,
						{
							player: selectedPlayer!,
							card
						}
					]
				});

				onCardThrown(card, selectedPlayer!, currentRound!, roundData.currentHand!);

				this.setState({
					thrownCard: card
				});
			} else {
				this.setState({
					preSelectedCard: card
				});
			}
		}
	};

	getFromTo(type: string, toWinner?: boolean) {
		const markerTop = this.cardsMarkerRef && this.cardsMarkerRef.offsetTop;
		const markerWidth = this.cardsMarkerRef && this.cardsMarkerRef.offsetWidth;

		if (toWinner) {
			return getToWinnerCalc(type as any, markerTop!, markerWidth!);
		}

		return getFromToCalc(type as any, markerTop!, markerWidth!, this.ownThrownCardInitPos!);
	}

	// TODO: memoize it
	isAllBids = (roundData: IRoundData): boolean =>
		Array(4)
			.fill(1)
			.every((_, i) => typeof roundData[`bid${i}`] === 'number');

	getRoundData(): IRoundData {
		const { allRounds, currentRound } = this.props;
		return (allRounds!.length && allRounds![currentRound! - 1]) as IRoundData;
	}

	playAudio() {
		!this.state.isMute && this.audio.play();
	}

	isNumberPadDisabled(): boolean {
		const { devicePlayerIndex, gameMode } = this.props;
		const { selectedPlayer } = this.state;

		return typeof selectedPlayer !== 'number' || (gameMode === 'remote' && devicePlayerIndex !== selectedPlayer);
	}

	toggleMute = () => {
		this.setState({
			isMute: !this.state.isMute
		});
	};
}

export default GamePad;
