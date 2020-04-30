import React, { Component } from 'react';
import { Radio, Switch, Badge, Row, Col, Modal, message, Button } from 'antd';
import Icon from '@ant-design/icons';
import CardsModal from '../../common/cards/Modal';
import { ChangePlayers } from '../../common/cards/Icons';
import NumbersPad from '../../common/numbers/Pad';
import PlayerPad from '../../common/player/Pad';
import { INPUT_MODE } from '../../constants/states';
import './GamePad.scss';
import Dialog from '../../dialogs/Dialog';
import { Dialogs } from '../../constants/dialogs';
import { PlayersContext } from '../GameTab';
import Css, { CSS_TRANSITIONS } from '../../common/transition/Css';
import TwoWayArrow, {
  TWO_WAY_ARROW_DIRECTION,
} from '../../common/twoWayArrow/TwoWayArrow';
import PlayCard from '../PlayCard/PlayCard';
import ThrownCard from '../ThrownCard/ThrownCard';
import {
  nextPlayerIndex,
  uniqueHand,
  getFromToCalc,
  getToWinnerCalc,
} from '../../utils/game-utils';
import playerTurn from '../../assets/sounds/playerTurn.mp3';

const confirm = Modal.confirm;
message.config({
  top: 100,
  maxCount: 3,
});

class GamePad extends Component {
  audio = new Audio(playerTurn);
  constructor(props) {
    super(props);

    this.state = {
      selectedPlayer: undefined,
      reorderPlayersDialogVisible: false,
      trumpModalVisible: false,
      preSelectedCard: undefined,
      thrownCard: undefined,
      thrownCards: [],
      handCardType: undefined,
    };

    this.handleSwitchMode = this.handleSwitchMode.bind(this);
    this.handleCardsPadChange = this.handleCardsPadChange.bind(this);
    this.handleNumberSelect = this.handleNumberSelect.bind(this);
    this.setSelectedPlayer = this.setSelectedPlayer.bind(this);
    this.showChangeHighestBidderConfirm = this.showChangeHighestBidderConfirm.bind(
      this
    );
    this.showChangePlayerDialog = this.showChangePlayerDialog.bind(this);
    this.handleReorderPlayersAfterClose = this.handleReorderPlayersAfterClose.bind(
      this
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.gameMode === 'remote') {
      const { devicePlayerIndex, ownCardsState } = this.props;
      const currentRoundData = this.getRoundData();
      const { handsState, currentHand, inputMode } = currentRoundData;

      const {
        allRounds: prevAllRounds,
        currentRound: prevCurrentRound,
      } = prevProps;
      const prevCurrentRoundData =
        prevAllRounds.length && prevAllRounds[prevCurrentRound - 1];

      if (
        prevCurrentRoundData.inputMode !== inputMode &&
        inputMode === INPUT_MODE.WON
      ) {
        this.setState({
          selectedPlayer: currentRoundData.highestBidder,
        });

        if (currentRoundData.highestBidder === devicePlayerIndex) {
          this.playAudio();
        }
      }

      if (
        prevCurrentRoundData.currentBidder !== currentRoundData.currentBidder &&
        inputMode === INPUT_MODE.BID
      ) {
        this.setState({
          selectedPlayer: currentRoundData.currentBidder,
        });
      }

      const prevHandsState = prevCurrentRoundData.handsState;
      if (prevHandsState !== handsState) {
        const stateToUpdate = {};
        const thrown =
          handsState &&
          handsState[currentHand] &&
          (handsState[currentHand]['thrownCards'] || []).find(
            (thrown) => thrown.player === devicePlayerIndex
          );

        if (thrown && thrown.card && (ownCardsState || []).length > 1) {
          stateToUpdate.thrownCard = thrown.card;
        } else {
          stateToUpdate.thrownCard = undefined;
        }

        if (handsState) {
          const thrownCards = handsState[currentHand]['thrownCards']
            ? uniqueHand([
                ...this.state.thrownCards,
                ...handsState[currentHand]['thrownCards'],
              ])
            : [];

          stateToUpdate.thrownCards = thrownCards;
          stateToUpdate.selectedPlayer = handsState[currentHand]['turnOf'];
          stateToUpdate.handCardType =
            thrownCards[0] && thrownCards[0].card.split('-')[1];
        } else {
          stateToUpdate.thrownCards = [];
          stateToUpdate.selectedPlayer = currentRoundData.highestBidder;
          stateToUpdate.handCardType = undefined;
        }

        if (
          inputMode === INPUT_MODE.WON &&
          stateToUpdate.selectedPlayer === devicePlayerIndex
        ) {
          this.playAudio();
        }

        this.setState(stateToUpdate);
      }
    }
  }

  handleSwitchMode(checked) {
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
        selectedPlayer: undefined,
      });

      onChange({
        ...roundData,
        inputMode: checked ? INPUT_MODE.WON : INPUT_MODE.BID,
      });
    } else {
      message.warning('Bids are not completed');
    }
  }

  setSelectedPlayer(e) {
    if (this.isAllowedToSelectPlayer() && e.target.type === 'radio') {
      this.setState({
        selectedPlayer: e.target.value,
      });
    }
  }

  isAllowedToSelectPlayer() {
    const { gameMode } = this.props;
    const roundData = this.getRoundData();

    if (gameMode === 'remote') {
      const { inputMode, highestBidder } = roundData;

      return inputMode === INPUT_MODE.WON || typeof highestBidder === 'number'
        ? false
        : true;
    }

    return true;
  }

  handleCardsPadChange(trump) {
    const { onChange } = this.props;
    const roundData = this.getRoundData();
    const { inputMode } = roundData;

    this.setState({ trumpModalVisible: false });

    if (inputMode !== INPUT_MODE.WON) {
      onChange({ ...roundData, trump });
    }
  }

  handleNumberSelect(num) {
    const { players, currentRound, onChange } = this.props;
    const roundData = this.getRoundData();
    const { inputMode, highestBidder } = roundData;

    if (inputMode === INPUT_MODE.BID && this.props.gameMode === 'remote') {
      return this.handleRemoteBidFlow(num);
    }

    const { selectedPlayer } = this.state;
    const mode = inputMode === INPUT_MODE.BID ? 'bid' : 'won';
    const prop = mode + selectedPlayer;

    const newRoundData = {};

    if (inputMode === INPUT_MODE.BID) {
      if (currentRound === 13) {
        if (
          (num >= 5 && !roundData[`bid${highestBidder}`]) ||
          roundData[`bid${highestBidder}`] < num
        ) {
          newRoundData.highestBidder = selectedPlayer;
        }
      } else {
        const nextPlayer = this.getNextPlayer(selectedPlayer, players);

        if (
          roundData[`bid${nextPlayer}`] === '' ||
          nextPlayer === highestBidder
        ) {
          // validate first bid is more then 5
          if (
            (!highestBidder && highestBidder !== 0) ||
            highestBidder === selectedPlayer
          ) {
            if (num < 5) {
              return message.warning('First Bid should be more then 5');
            } else {
              newRoundData.highestBidder = selectedPlayer;
            }
          } else if (num >= 5) {
            this.showChangeHighestBidderConfirm(
              onChange,
              roundData,
              prop,
              num,
              selectedPlayer,
              players
            );
          } else if (
            !Number.isInteger(
              roundData[`bid${this.getBeforePlayer(selectedPlayer, players)}`]
            )
          ) {
            return message.warning('The Bids are not in the right order!!');
          }
        } else {
          return message.warning(
            'The Next Player already Bid, Can not change bid'
          );
        }
      }
    }

    newRoundData[prop] = num;
    onChange({ ...roundData, ...newRoundData }, selectedPlayer);
  }

  calculateDisableNum() {
    const { players } = this.props;
    const roundData = this.getRoundData();
    const { highestBidder, inputMode } = roundData;
    const { selectedPlayer } = this.state;

    if (typeof selectedPlayer !== 'number') return undefined;

    if (inputMode !== INPUT_MODE.BID) return undefined;

    if (this.getNextPlayer(selectedPlayer, players) !== highestBidder)
      return undefined;

    // get the list of players bided before
    const beforePlayers = this.getBeforePlayers(selectedPlayer, players);

    // loop through 3 players before selectedPlayer
    // if all bid already return segment else return undefined

    let bids = 0;

    for (const player of beforePlayers) {
      const aBid = roundData[`bid${player}`];
      if (aBid === null) return undefined;

      bids += aBid;
    }

    return 13 - bids;
  }

  showChangeHighestBidderConfirm(
    onChange,
    roundData,
    prop,
    num,
    selectedPlayer,
    players
  ) {
    const getBeforePlayer = this.getBeforePlayer;

    confirm({
      title: 'Change Highest Bidder?',
      content: '(will reset the rest of the bids)',
      okType: 'danger',
      onOk() {
        onChange(
          {
            ...roundData,
            bid0: null,
            bid1: null,
            bid2: null,
            bid3: null,
            [prop]: num,
            highestBidder: selectedPlayer,
          },
          selectedPlayer
        );
      },
      onCancel() {
        if (!roundData[`bid${getBeforePlayer(selectedPlayer, players)}`]) {
          message.warning('The Bids are not in the right order!!');
          onChange({ ...roundData }, selectedPlayer);
        } else {
          onChange({ ...roundData, [prop]: num }, selectedPlayer);
        }
      },
    });
  }

  getNextPlayer = (selectedPlayer, players) => {
    const index = players.findIndex(
      (player) => player.index === selectedPlayer
    );
    const nextIndex = index + 1 > 3 ? index + 1 - 4 : index + 1;

    return players[nextIndex].index;
  };

  getBeforePlayer = (selectedPlayer, players) => {
    const index = players.findIndex(
      (player) => player.index === selectedPlayer
    );
    const beforeIndex = index - 1 > -1 ? index - 1 : index - 1 + 4;

    return players[beforeIndex].index;
  };

  getBeforePlayers = (selectedPlayer, players) => {
    const index = players.findIndex(
      (player) => player.index === selectedPlayer
    );
    return players
      .filter((player) => index !== player.index)
      .map((player) => player.index);
  };

  // getAfterPlayers = (selectedPlayer) => [1, 2, 3].map(afterPlayer => selectedPlayer + afterPlayer > 4 ? selectedPlayer + afterPlayer - 4 : selectedPlayer + afterPlayer);

  getPlayerAggregateScore = (roundsData, roundIndex, playerIndex) => {
    const roundData = roundsData[roundIndex];

    if (!roundData) {
      return 0;
    }

    const aggregateScore = roundData[`aggregateScore${playerIndex}`];
    // if round.fell == true, look for round before
    if (typeof aggregateScore === 'number' && !roundData.fell) {
      return aggregateScore;
    }

    return this.getPlayerAggregateScore(
      roundsData,
      roundIndex - 1,
      playerIndex
    );
  };

  render() {
    const { devicePlayerIndex, gameMode } = this.props;
    const currentRoundData = this.getRoundData();
    const {
      round,
      check,
      trump,
      segment,
      inputMode,
      fell,
      factor,
    } = currentRoundData;
    const {
      selectedPlayer,
      reorderPlayersDialogVisible,
      trumpModalVisible,
    } = this.state;
    const isAllBids = this.isAllBids(currentRoundData);
    const playersButtons = this.getPlayersButtons();
    const isRemote = gameMode === 'remote';

    return (
      <Radio.Group
        buttonStyle="solid"
        className={`game-pad-container ${fell ? 'round-fell' : ''}`}
        onChange={this.setSelectedPlayer}
        value={selectedPlayer}
      >
        <h3>Round: {round}</h3>
        <Row type="flex" justify="space-around">
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
                {!isAllBids ? `${segment && 13 + segment}` : segment}
              </Css>
              <TwoWayArrow
                direction={
                  isAllBids &&
                  (segment > 0
                    ? TWO_WAY_ARROW_DIRECTION.TOP
                    : TWO_WAY_ARROW_DIRECTION.BOTTOM)
                }
              />
            </div>
            <div>Check: {check ? 'yes' : 'no'}</div>
            <Css type={CSS_TRANSITIONS.FADE_IN}>
              {fell ? <div className="fell-indicator">round fell</div> : ''}
            </Css>
            {!fell && factor > 1 && (
              <div className="factor-indicator">{`x${factor}`}</div>
            )}
          </Col>
          <Col className="item item2">
            {playersButtons[nextPlayerIndex(devicePlayerIndex + 1)]}
          </Col>
          <Col>
            <CardsModal
              trump={trump}
              onChange={this.handleCardsPadChange}
              disabled={inputMode === INPUT_MODE.WON}
              visible={trumpModalVisible}
            />
          </Col>
        </Row>

        <div
          className="thrown-cards-marker"
          ref={(el) => (this.cardsMarkerRef = el)}
        ></div>

        <Row type="flex" justify="space-around">
          <Col className="item item4">
            {playersButtons[nextPlayerIndex(devicePlayerIndex)]}
          </Col>
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
          <Col className="item item6">
            {playersButtons[nextPlayerIndex(devicePlayerIndex + 2)]}
          </Col>
        </Row>
        <Row type="flex" justify="center" style={{ position: 'relative' }}>
          <Col className="item item8">{playersButtons[devicePlayerIndex]}</Col>
          {!isRemote && round === 1 && inputMode === INPUT_MODE.BID && (
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
                        players,
                      }}
                    />
                  )}
                </PlayersContext.Consumer>
              )}
            </div>
          )}
        </Row>
        {isRemote && this.getThrownCardsPlacement()}
        {this.getCards()}
      </Radio.Group>
    );
  }

  getPlayersButtons = () => {
    const { allRounds, currentRound, players } = this.props;
    const currentRoundData = allRounds.length && allRounds[currentRound - 1];
    const highestBidder = currentRoundData.highestBidder;

    return players.map(({ index: playerIndex, playerName }, i) => {
      return (
        <Badge key={playerIndex} dot={highestBidder === playerIndex}>
          <Radio.Button value={playerIndex}>
            <PlayerPad
              name={playerName}
              bid={currentRoundData[`bid${playerIndex}`]}
              won={currentRoundData[`won${playerIndex}`]}
              score={this.getPlayerAggregateScore(
                allRounds,
                currentRound - 1,
                playerIndex
              )}
            />
          </Radio.Button>
        </Badge>
      );
    });
  };

  showChangePlayerDialog() {
    this.setState({
      reorderPlayersDialogVisible: true,
    });
  }

  handleReorderPlayersAfterClose() {
    this.setState({
      reorderPlayersDialogVisible: false,
    });
  }

  handleRemoteBidFlow(num) {
    const { devicePlayerIndex, onChange } = this.props;
    const roundData = this.getRoundData();
    const { highestBidder } = roundData;
    const { selectedPlayer } = this.state;
    const stateToUpdate = {};

    if (typeof highestBidder !== 'number') {
      if (num < 5) {
        return message.warning('First Bid should be more then 5');
      } else {
        stateToUpdate.highestBidder = selectedPlayer;
        stateToUpdate[`bid${selectedPlayer}`] = num;
        stateToUpdate.currentBidder = nextPlayerIndex(selectedPlayer);

        if (!roundData.trump) {
          setTimeout(
            () =>
              this.setState({
                trumpModalVisible: true,
              }),
            300
          );
        }
      }
    } else if (devicePlayerIndex === selectedPlayer) {
      stateToUpdate[`bid${selectedPlayer}`] = num;
      const nextPlayer = nextPlayerIndex(selectedPlayer);

      if (nextPlayer === highestBidder) {
        stateToUpdate.currentBidder = '';

        setTimeout(() => this.handleSwitchMode(true), 1500);
      } else {
        stateToUpdate.currentBidder = nextPlayerIndex(selectedPlayer);
      }
    }

    if (Object.keys(stateToUpdate).length) {
      onChange({ ...roundData, ...stateToUpdate }, selectedPlayer);
    }
  }

  getCards() {
    const { ownCardsState, devicePlayerIndex } = this.props;
    const {
      preSelectedCard,
      thrownCard,
      handCardType,
      selectedPlayer,
    } = this.state;

    if (ownCardsState) {
      const hasCardType = Object.values(ownCardsState).some(
        (card) => card.split('-')[1] === handCardType
      );
      const isDevicePlayer = devicePlayerIndex === selectedPlayer;

      return (
        <div className="cards-container">
          {Object.values(ownCardsState).map((card) => (
            <PlayCard
              key={card}
              card={card}
              preSelected={preSelectedCard === card}
              thrown={thrownCard === card}
              onCardClick={this.handleCardClick(card)}
              disabled={
                isDevicePlayer &&
                hasCardType &&
                card.split('-')[1] !== handCardType
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
    const handWinner = handsState && handsState[currentHand].handWinner;
    const { thrownCards } = this.state;
    const { devicePlayerIndex } = this.props;
    const fn = nextPlayerIndex;

    const playerOnPadMap = {
      [devicePlayerIndex]: 'bottom',
      [fn(devicePlayerIndex)]: 'left',
      [fn(devicePlayerIndex + 1)]: 'top',
      [fn(devicePlayerIndex + 2)]: 'right',
    };

    const toWinner =
      handWinner !== undefined &&
      this.getFromTo(playerOnPadMap[handWinner], true);

    return (
      <div className="hand-cards-container">
        {thrownCards.map((thrown) => {
          const { from, to } =
            toWinner || this.getFromTo(playerOnPadMap[thrown.player]);

          return (
            <ThrownCard
              key={thrown.player}
              thrownType={playerOnPadMap[thrown.player]}
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

  handleCardClick = (card) => (e) => {
    const { preSelectedCard, selectedPlayer } = this.state;
    const {
      currentRound,
      devicePlayerIndex,
      onCardThrown,
      ownCardsState,
    } = this.props;
    const roundData = this.getRoundData();
    const { inputMode } = roundData;

    if (inputMode === INPUT_MODE.WON && selectedPlayer === devicePlayerIndex) {
      if (preSelectedCard === card) {
        // throw card

        // set the initial position of own thrown card
        const top = e.currentTarget.offsetParent.offsetTop - 15;
        const left = e.currentTarget.offsetLeft;
        this.ownThrownCardInitPos = { top, left };

        this.setState({
          thrownCards: [
            ...this.state.thrownCards,
            {
              player: selectedPlayer,
              card,
            },
          ],
        });

        onCardThrown(card, selectedPlayer, currentRound, roundData.currentHand);

        this.setState({
          thrownCard: card,
          // preSelectedCard: undefined,
        });
      } else {
        this.setState({
          preSelectedCard: card,
        });
      }
    }
  };

  // calculate end position by thrownType
  getFromTo(type, toWinner) {
    const markerTop = this.cardsMarkerRef && this.cardsMarkerRef.offsetTop;
    const markerWidth = this.cardsMarkerRef && this.cardsMarkerRef.offsetWidth;

    if (toWinner) {
      return getToWinnerCalc(type, markerTop, markerWidth);
    }

    return getFromToCalc(
      type,
      markerTop,
      markerWidth,
      this.ownThrownCardInitPos
    );
  }

  // TODO: memoize it
  isAllBids = (roundData) =>
    Array(4)
      .fill(1)
      .every((_, i) => typeof roundData[`bid${i}`] === 'number');

  getRoundData() {
    const { allRounds, currentRound } = this.props;
    return allRounds.length && allRounds[currentRound - 1];
  }

  playAudio() {
    this.audio.play();
  }

  isNumberPadDisabled() {
    const { devicePlayerIndex, gameMode } = this.props;
    const { selectedPlayer } = this.state;

    return (
      typeof selectedPlayer !== 'number' ||
      (gameMode === 'remote' && devicePlayerIndex !== selectedPlayer)
    );
  }
}

export default GamePad;
