import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import cards from './cards.png';
import './App.css';
import fire from './fire.js';
import { Modal, Button } from 'antd';
import 'antd/dist/antd.css';
import SelectionTool from './players/SelectionTool';
import NewLeagueDialog from './dialogs/NewLeague';

function Menu(props) {
  return (
    <ul className="App-menu">
      {props.items.map(function (item, index) {
        const { onClick, text, dialogProps } = item;
        return <li key={index}>
          <Button onClick={onClick} size="large" block>{text}</Button>
          <NewLeagueDialog {...dialogProps} />
        </li>;
      })
      }
    </ul>
  );
}

class App extends Component {
  state = {
    dialogsPlayers: false
  };

  showPlayersDialog() {
    this.setState({
      dialogsPlayers: true
    });
  }

  closePlayersDialog() {
    this.setState({
      dialogsPlayers: false
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={cards} className="App-logo" alt="logo" />
          <h1 className="App-title">Sub Whist</h1>
        </header>
        <div className="App-main">
          <Menu items={[
            {
              text: 'Resume League',
              onClick: () => { console.log(this); }
            }, {
              text: 'Create League',
              onClick: this.showPlayersDialog.bind(this),
              dialogProps: {
                onCancel: this.closePlayersDialog.bind(this),
                // content: <SelectionTool />,
                visible: this.state.dialogsPlayers
              }
            },
            { text: 'Settings' },
            { text: 'Scores' }
          ]}
          >
          </Menu>
        </div>
      </div>
    );
  }

  // constructor(props) {
  //   super(props);
  //   this.state = { messages: [] }; // <- set up react state
  // }
  // componentWillMount() {
  //   /* Create reference to messages in Firebase Database */
  //   let messagesRef = fire.database().ref('messages').orderByKey().limitToLast(100);
  //   messagesRef.on('child_added', snapshot => {
  //     /* Update React state when message is added at Firebase Database */
  //     let message = { text: snapshot.val(), id: snapshot.key };
  //     this.setState({ messages: [message].concat(this.state.messages) });
  //   })
  // }
  // addMessage(e) {
  //   e.preventDefault(); // <- prevent form submit from reloading the page
  //   /* Send the message to Firebase */
  //   fire.database().ref('messages').push(this.inputEl.value);
  //   this.inputEl.value = ''; // <- clear the input
  // }
  // render() {
  //   return (
  //     <form onSubmit={this.addMessage.bind(this)}>
  //       <input type="text" ref={el => this.inputEl = el} />
  //       <input type="submit" />
  //       <ul>
  //         { /* Render the list of messages */
  //           this.state.messages.map(message => <li key={message.id}>{message.text}</li>)
  //         }
  //       </ul>
  //     </form>
  //   );
  // }
}

export default App;
