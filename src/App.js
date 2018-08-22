import React, { Component } from 'react';
import { withRouter, Route } from "react-router-dom";
import cards from './cards.png';
import './App.css';
// import fire from './fire.js';
import 'antd/dist/antd.css';
// import SelectionTool from './players/SelectionTool';
import Main from './main/Main';

class League extends Component {
  render() {
    return (<h3>League</h3>);
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { inlineHeader: false };
    this.toggleHeaderInline = this.toggleHeaderInline.bind(this);
  }

  toggleHeaderInline(inline = true) {
    this.setState({
      inlineHeader: inline
    });
  }

  componentWillMount() {
    this.unlisten = this.props.history.listen((location, action) => {
      const { pathname } = location;
      this.toggleHeaderInline(pathname !== '/');
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  render() {
    const { inlineHeader } = this.state;
    return (
      <div className="App">
        <header id="app-header" className={`${inlineHeader ? 'inline' : ''}`}>
          <img src={cards} className="App-logo" alt="logo" />
          <h1 className="App-title">Sub Whist</h1>
        </header>
        <Route exact path="/" component={Main} />
        <Route path="/about" component={League} />
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

export default withRouter(App);
