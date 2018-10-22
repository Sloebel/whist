import React, { Component } from 'react';
import { withRouter, Route } from "react-router-dom";
import cards from './cards.png';
import './App.css';
import 'antd/dist/antd.css';
import Main from './main/Main';
import League from './league/League.js';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inlineHeader: false,
      isMobile: window.innerWidth < 576
    };
    
    this.toggleHeaderInline = this.toggleHeaderInline.bind(this);
    this.handleWindowSizeChange = this.handleWindowSizeChange.bind(this);
  }

  // set main header state by router value
  // if in main menu page header is bigger
  toggleHeaderInline(inline = true) {
    this.setState({
      inlineHeader: inline
    });
  }

  // set if view is mobile size 
  handleWindowSizeChange() {
    this.setState({ isMobile: window.innerWidth < 576 });
  };

  // init window resize listener
  listenToWinResize(callback) {
    window.addEventListener('resize', callback);

    return () => {
      window.removeEventListener('resize', callback);
    };
  }

  componentWillMount() {
    const { pathname } = this.props.location;
    // set initial header state
    this.toggleHeaderInline(pathname !== '/');

    // listen to routing changes
    this.unistenHistory = this.props.history.listen((location, action) => {
      const { pathname } = location;
      this.toggleHeaderInline(pathname !== '/');
    });

    this.unlistenWinResize = this.listenToWinResize(this.handleWindowSizeChange);
  }

  componentWillUnmount() {
    this.unistenHistory();
    this.unlistenWinResize();
  }

  render() {
    const { inlineHeader, isMobile } = this.state;

    return (
      <div className="app">
        <header id="app-header" className={`${inlineHeader ? 'inline' : ''}`}>
          <img src={cards} className="app-logo" alt="logo" />
          <h1 className="app-title">Sub Whist</h1>
        </header>
        <Route exact path="/" component={Main} />
        <Route path="/league/:id" render={(props) => <League {...props} isMobile={isMobile} />} />
      </div>
    );
  }
}

export default withRouter(App);
