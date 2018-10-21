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

  toggleHeaderInline(inline = true) {
    this.setState({
      inlineHeader: inline
    });
  }

  handleWindowSizeChange() {
    this.setState({ isMobile: window.innerWidth < 576 });
  };

  componentWillMount() {
    const { pathname } = this.props.location;
    this.toggleHeaderInline(pathname !== '/');

    this.unlistenHistory = this.props.history.listen((location, action) => {
      const { pathname } = location;
      this.toggleHeaderInline(pathname !== '/');
    });

    window.addEventListener('resize', this.handleWindowSizeChange);
  }

  componentWillUnmount() {
    this.unlistenHistory();
    window.removeEventListener('resize', this.handleWindowSizeChange);
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
