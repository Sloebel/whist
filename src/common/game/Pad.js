import React, { Component } from 'react';
import { Radio, Switch, Badge, Row, Col, Modal, message, Button, Icon } from 'antd';
import CardsPad from '../cards/Pad';
import CardsModal from '../cards/Modal';
import { ChangePlayers } from '../cards/Icons';
import NumbersPad from '../numbers/Pad';
import PlayerPad from '../player/Pad';
import { INPUT_MODE } from '../../constants/states';
import './Pad.css';
import Dialog from '../../dialogs/Dialog';
import { Dialogs } from '../../constants/dialogs';
import { PlayersContext } from '../../game/GameTab';
import Css, { CSS_TRANSITIONS } from '../transition/Css';
import TwoWayArrow, { TWO_WAY_ARROW_DIRECTION } from '../twoWayArrow/TwoWayArrow';

const confirm = Modal.confirm;
message.config({
  top: 100,
  maxCount: 3,
});

class GamePad extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedPlayer: undefined,
      reorderPlayersDialogVisible: false,
    };

    this.handleSwitchMode = this.handleSwitchMode.bind(this);
    this.handleCardsPadChange = this.handleCardsPadChange.bind(this);
    this.handleNumberSelect = this.handleNumberSelect.bind(this);
    this.setSelectedPlayer = this.setSelectedPlayer.bind(this);
    this.showChangeHighestBidderConfirm = this.showChangeHighestBidderConfirm.bind(this);
    this.showChangePlayerDialog = this.showChangePlayerDialog.bind(this);
    this.handleReorderPlayersAfterClose = this.handleReorderPlayersAfterClose.bind(this);
  }

  handleSwitchMode(checked) {
    const { allRounds, currentRound, onChange } = this.props;
    const roundData = allRounds.length && allRounds[currentRound - 1];
    const { trump, segment } = roundData;

    if (segment === 0) {
      return message.warning('Total Bids are 13?!?!');
    }

    const everyoneBid = this.isAllBids(roundData);

    if (trump && everyoneBid) {
      this.setState({
        selectedPlayer: undefined
      });
      onChange({ ...roundData, inputMode: checked ? INPUT_MODE.WON : INPUT_MODE.BID });
    } else {
      message.warning('Bids are not completed');
    }
  }

  setSelectedPlayer(e) {
    if (e.target.type === 'radio') {
      this.setState({
        selectedPlayer: e.target.value
      });
    }
  }

  handleCardsPadChange(trump) {
    const { allRounds, currentRound, onChange } = this.props;
    const roundData = allRounds.length && allRounds[currentRound - 1];
    const { inputMode } = roundData;

    if (inputMode !== INPUT_MODE.WON) {
      onChange({ ...roundData, trump });
    }
  }

  handleNumberSelect(num) {
    const { players, allRounds, currentRound, onChange } = this.props;
    const roundData = allRounds.length && allRounds[currentRound - 1];
    const { inputMode, highestBidder } = roundData;
    const { selectedPlayer } = this.state;
    const mode = inputMode === INPUT_MODE.BID ? 'bid' : 'won';
    const prop = mode + selectedPlayer;

    const newRoundData = {};

    if (inputMode === INPUT_MODE.BID) {
      if (currentRound === 13) {
        if (num >= 5 && !roundData[`bid${highestBidder}`] || roundData[`bid${highestBidder}`] < num) {
          newRoundData.highestBidder = selectedPlayer;
        }
      } else {
        const nextPlayer = this.getNextPlayer(selectedPlayer, players);

        if (roundData[`bid${nextPlayer}`] === '' || nextPlayer === highestBidder) {
          // validate first bid is more then 5
          if ((!highestBidder && highestBidder !== 0) || highestBidder === selectedPlayer) {
            if (num < 5) {
              return message.warning('First Bid should be more then 5');
            } else {
              newRoundData.highestBidder = selectedPlayer;
            }
          } else if (num >= 5) {
            this.showChangeHighestBidderConfirm(onChange, roundData, prop, num, selectedPlayer, players);
          } else if (!Number.isInteger(roundData[`bid${this.getBeforePlayer(selectedPlayer, players)}`])) {
            return message.warning('The Bids are not in the right order!!');
          }
        } else {
          return message.warning('The Next Player already Bid, Can not change bid');
        }
      }
    }

    newRoundData[prop] = num;
    onChange({ ...roundData, ...newRoundData }, selectedPlayer);
  }

  calculateDisableNum() {
    const { players, allRounds, currentRound } = this.props;
    const roundData = allRounds.length && allRounds[currentRound - 1];
    const { highestBidder, inputMode } = roundData;
    const { selectedPlayer } = this.state;

    if (typeof selectedPlayer !== 'number') return undefined;

    if (inputMode !== INPUT_MODE.BID) return undefined;

    if (this.getNextPlayer(selectedPlayer, players) !== highestBidder) return undefined;

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

  showChangeHighestBidderConfirm(onChange, roundData, prop, num, selectedPlayer, players) {
    const getBeforePlayer = this.getBeforePlayer;

    confirm({
      title: 'Change Highest Bidder?',
      content: '(will reset the rest of the bids)',
      okType: 'danger',
      onOk() {
        onChange({ ...roundData, bid0: null, bid1: null, bid2: null, bid3: null, [prop]: num, highestBidder: selectedPlayer }, selectedPlayer);
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
    const index = players.findIndex(player => player.index === selectedPlayer);
    const nextIndex = index + 1 > 3 ? index + 1 - 4 : index + 1;

    return players[nextIndex].index;
  };

  getBeforePlayer = (selectedPlayer, players) => {
    const index = players.findIndex(player => player.index === selectedPlayer);
    const beforeIndex = index - 1 > -1 ? index - 1 : index - 1 + 4;

    return players[beforeIndex].index;
  };

  getBeforePlayers = (selectedPlayer, players) => {
    const index = players.findIndex(player => player.index === selectedPlayer);
    return players.filter(player => index !== player.index).map(player => player.index);
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

    return this.getPlayerAggregateScore(roundsData, roundIndex - 1, playerIndex);
  }

  getPlayersButtons = () => {
    const { allRounds, currentRound, players, isMobile } = this.props;
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
              score={isMobile ?
                this.getPlayerAggregateScore(allRounds, currentRound - 1, playerIndex)
                : undefined}
            />
          </Radio.Button>
        </Badge>
      );
    });
  };

  render() {
    const { isMobile, allRounds, currentRound } = this.props;
    const currentRoundData = allRounds.length && allRounds[currentRound - 1];
    const { round, check, trump, segment, inputMode } = currentRoundData;
    const { selectedPlayer, reorderPlayersDialogVisible } = this.state;
    const isAllBids = this.isAllBids(currentRoundData);
    const playersButtons = this.getPlayersButtons();

    if (isMobile) {
      return (
        <Radio.Group
          buttonStyle="solid"
          className="game-pad-container"
          onChange={this.setSelectedPlayer}
          value={selectedPlayer}
        >
          <h3>Round: {round}</h3>
          <Row type="flex" justify="space-around">
            <Col>
              <Switch
                onChange={this.handleSwitchMode}
                checkedChildren=" Won "
                unCheckedChildren=" Bid "
                checked={inputMode === INPUT_MODE.WON}
              />
              <div className="segment">
                Bids: <Css type={CSS_TRANSITIONS.FADE_IN}>
                  {!isAllBids ? `${segment && (13 + segment)}` : segment}
                </Css>
                <TwoWayArrow
                  direction={isAllBids && (segment > 0 ? TWO_WAY_ARROW_DIRECTION.TOP : TWO_WAY_ARROW_DIRECTION.BOTTOM)}
                />
              </div>
              <div>Check: {check ? 'yes' : 'no'}</div>
            </Col>
            <Col className="item item2">
              {playersButtons[0]}
            </Col>
            <Col>
              <CardsModal trump={trump} onChange={this.handleCardsPadChange} disabled={inputMode === INPUT_MODE.WON} />
            </Col>
          </Row>
          <Row type="flex" justify="space-around">
            <Col className="item item4">
              {playersButtons[3]}
            </Col>
            <Col>
              <NumbersPad isMobile={isMobile} disabledNumber={this.calculateDisableNum()} onSelect={this.handleNumberSelect} disabled={selectedPlayer === undefined} />
            </Col>
            <Col className="item item6">
              {playersButtons[1]}
            </Col>
          </Row>
          <Row type="flex" justify="center" style={{ position: 'relative' }}>
            <Col className="item item8">
              {playersButtons[2]}
            </Col>
            {round === 1
              && inputMode === INPUT_MODE.BID &&
              <div>
                <Button
                  type="dashed"
                  shape="circle"
                  className="change-players-btn"
                  onClick={this.showChangePlayerDialog}
                >
                  <Icon component={ChangePlayers} />
                </Button>
                {reorderPlayersDialogVisible &&
                  <PlayersContext.Consumer>
                    {({ players, reorderPlayers }) => (<Dialog
                      dialog={Dialogs.REORDER_PLAYERS}
                      dialogProps={{
                        onOk: reorderPlayers,
                        onAfterClose: this.handleReorderPlayersAfterClose,
                        visible: reorderPlayersDialogVisible,
                        players
                      }}
                    />)}
                  </PlayersContext.Consumer>}
              </div>
            }
          </Row>
        </Radio.Group>
      );
    }

    return (<Radio.Group
      buttonStyle="solid"
      className="game-pad-container"
      onChange={this.setSelectedPlayer}
      value={selectedPlayer}
    >
      <div className="item item1">
        <Switch onChange={this.handleSwitchMode} checkedChildren=" Won " unCheckedChildren=" Bid " checked={inputMode === INPUT_MODE.WON} />
        <div>Bids: {segment}</div>
        <div>Check: {check ? 'yes' : 'no'}</div>
      </div>
      <div className="item item2">
        {playersButtons[0]}
      </div>


      <CardsPad isMobile={isMobile} trump={trump} onChange={this.handleCardsPadChange} />
      <div className="item item4">
        {playersButtons[3]}
      </div>

      <NumbersPad isMobile={isMobile} disabledNumber={this.calculateDisableNum()} onSelect={this.handleNumberSelect} disabled={selectedPlayer === undefined} />
      <div className="item item6">
        {playersButtons[1]}
      </div>

      <div className="item item8">
        {playersButtons[2]}
      </div>
    </Radio.Group>);
  }

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

  // TODO: memoize it
  isAllBids = (roundData) => Array(4).fill(1).every((_, i) => typeof roundData[`bid${i}`] === 'number');
};

export default GamePad;