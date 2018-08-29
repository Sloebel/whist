import React, { Component } from 'react';
import { withRouter, Route } from "react-router-dom";
import cards from './cards.png';
import './App.css';
// import fire from './fire.js';
import 'antd/dist/antd.css';
// import SelectionTool from './players/SelectionTool';
import Main from './main/Main';
import League from './league/League.js';

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
    const { pathname } = this.props.location;
    this.toggleHeaderInline(pathname !== '/');

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
        <Route path="/league/:id" component={League} />
      </div>
    );
  }
}

export default withRouter(App);
