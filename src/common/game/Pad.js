import React, { Component } from 'react';
import { Radio, Switch, Badge, Row, Col, Modal, message } from 'antd';
import CardsPad from '../cards/Pad';
import CardsModal from '../cards/Modal';
import NumbersPad from '../numbers/Pad';
import PlayerPad from '../player/Pad';
import { INPUT_MODE } from '../../constants/states';

const confirm = Modal.confirm;
message.config({
  top: 100,
  maxCount: 3,
});

class GamePad extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedPlayer: undefined
    };

    this.handleSwitchMode = this.handleSwitchMode.bind(this);
    this.handleCardsPadChange = this.handleCardsPadChange.bind(this);
    this.handleNumberSelect = this.handleNumberSelect.bind(this);
    this.setSelectedPlayer = this.setSelectedPlayer.bind(this);
    this.showChangeHighestBidderConfirm = this.showChangeHighestBidderConfirm.bind(this);
  }

  handleSwitchMode(checked) {
    const { allRounds, currentRound, onChange } = this.props;
    const roundData = allRounds.length && allRounds[currentRound - 1];

    const everyoneBid = Array(4).fill(1).every((_, i) => typeof roundData[`bid${i}`] === 'number');

    if (roundData.trump && everyoneBid) {
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

  getPlayerAggregateScore = (playerIndex) => {
    const { isMobile, allRounds, currentRound } = this.props;
    const currentRoundData = allRounds.length && allRounds[currentRound - 1];
    const roundBeforeData = currentRound > 1 ? allRounds.length && allRounds[currentRound - 2] : undefined;

    if (isMobile) {
      if (currentRoundData[`aggregateScore${playerIndex}`]) {
        return currentRoundData[`aggregateScore${playerIndex}`];
      }
      if (roundBeforeData) {
        return roundBeforeData[`aggregateScore${playerIndex}`];
      }

      return 0;
    }

    return undefined;
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
              score={this.getPlayerAggregateScore(playerIndex)}
            />
          </Radio.Button>
        </Badge>
      );
    });
  };

  render() {
    const { isMobile, allRounds, currentRound, players } = this.props;
    const currentRoundData = allRounds.length && allRounds[currentRound - 1];
    const { round, check, trump, segment, inputMode } = currentRoundData;
    const { selectedPlayer } = this.state;
    const highestBidder = currentRoundData.highestBidder;

    const playersButtons = this.getPlayersButtons(players, currentRoundData, highestBidder);

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
              <div>Bids: {segment}</div>
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
          <Row type="flex" justify="center">
            <Col className="item item8">
              {playersButtons[2]}
            </Col>

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
};

export default GamePad;