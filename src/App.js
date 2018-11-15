import React, { Component } from 'react';
import { withRouter, Route, Redirect } from "react-router-dom";
import cards from './cards.png';
import { Spin } from 'antd';
import * as routes from './constants/routes';
import { fire } from './firebase';
import './App.css';
import 'antd/dist/antd.css';

import Login from './authentication/Login';
import Main from './main/Main';
import League from './league/League.js';


const PrivateRoute = ({
  component: Component,
  authenticated,
  ...rest
}) => {
  console.log(authenticated);

  return (
    <Route
      {...rest}
      render={props =>
        authenticated === true ? (
          <Component {...props} {...rest} />
        ) : (
            <Redirect to="/login" />
          )
      }
    />
  )
};


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      inlineHeader: false,
      authenticated: false,
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
    fire.auth().onAuthStateChanged(user => {
      console.log(user);
      if (user) {
        this.setState({
          authenticated: true,
          isLoading: false
        }, () => this.props.history.push("/"));
      } else {
        this.setState({
          authenticated: false,
          isLoading: false
        }, () => this.props.history.push("/login"));
      }
    });

    const { pathname } = this.props.location;
    // set initial header state
    this.toggleHeaderInline(pathname !== '/');

    // listen to routing changes
    this.unistenHistory = this.props.history.listen((location, action) => {
      const { pathname } = location;
      this.toggleHeaderInline(pathname !== '/' && pathname !== '/login');
    });

    this.unlistenWinResize = this.listenToWinResize(this.handleWindowSizeChange);
  }

  componentWillUnmount() {
    this.unistenHistory();
    this.unlistenWinResize();
  }

  render() {
    const { inlineHeader, isMobile, isLoading, authenticated } = this.state;

    return (
      <div className="app">
        <header id="app-header" className={`${inlineHeader ? 'inline' : ''}`}>
          <img src={cards} className="app-logo" alt="logo" />
          <h1 className="app-title">Sub Whist</h1>
        </header>

        {isLoading ? <div className="full-view loader"><Spin size="large" style={{ width: '100%', position: 'relative', top: '50%' }} /></div> :
          <div>
            <PrivateRoute exact path={routes.MAIN} component={Main} authenticated={authenticated} />
            {/* <Route exact path="/" component={Main} /> */}
            <Route exact path={routes.SIGN_IN} component={Login} />
            <Route path={`${routes.LEAGUE}/:id`} render={(props) => <League {...props} isMobile={isMobile} />} />
          </div>
        }
      </div>
    );
  }
}

export default withRouter(App);
