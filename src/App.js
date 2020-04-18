import React, { Component } from 'react';
import { withRouter, Route } from 'react-router-dom';
import NotificationService from './services/NotificationSrv';
import { fire } from './firebase';
import cards from './cards.png';
import phoneImg from './images/phone.png';
import * as routes from './constants/routes';
import withAuthentication from './authentication/withAuthentication';
import './App.scss';
import 'antd/dist/antd.css';
import Login from './authentication/Login';
import SignUp from './authentication/SignUp';
import Main from './main/Main';
import League from './league/League.tsx';
import { addListener, isMobileBrowser } from './utils/Utils';
import { Dialogs } from './constants/dialogs';
import Dialog from './dialogs/Dialog';
import LeagueService from './services/LeagueSrv';
import Loader from './common/loader/Loader';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inlineHeader: false,
      showGameInvite: false,
      loader: false,
    };

    this.toggleHeaderInline = this.toggleHeaderInline.bind(this);
    this.handleWindowSizeChange = this.handleWindowSizeChange.bind(this);
  }

  // set main header state by router value
  // if in main menu page header is bigger
  toggleHeaderInline(inline = true) {
    this.setState({
      inlineHeader: inline,
    });
  }

  // set if view is mobile size
  handleWindowSizeChange() {
    this.setState({
      // isMobile: window.innerWidth < 1095,
    });
  }

  // init window resize listener
  listenToWinResize(callback) {
    return addListener(window, 'resize', callback);
  }

  componentWillMount() {
    const { pathname } = this.props.location;
    // set initial header state
    this.toggleHeaderInline(pathname !== '/');

    // listen to routing changes
    this.unlistenHistory = this.props.history.listen((location, action) => {
      const { pathname } = location;
      this.toggleHeaderInline(pathname !== '/' && pathname !== '/login');
    });

    this.unlistenWinResize = this.listenToWinResize(
      this.handleWindowSizeChange
    );
  }

  componentWillUnmount() {
    this.unlistenHistory();
    this.unlistenWinResize();
  }

  componentDidMount() {
    fire.auth().onAuthStateChanged((authUser) => {
      if (authUser) {
        NotificationService.registerGameInvite(this.onGameInvite);
      }
    });
  }

  render() {
    const { inlineHeader, showGameInvite, invite, loader } = this.state;

    return (
      <div
        className={`app-wrapper ${
          isMobileBrowser() ? 'mobile-mode' : 'desktop-mode'
        }`}
      >
        <img src={phoneImg} />
        <div className={`app ${inlineHeader ? 'inline-header' : ''}`}>
          <header id="app-header">
            <img src={cards} className="app-logo" alt="logo" />
            <h1 className="app-title">Sub Whist</h1>
          </header>
          {loader && <Loader className="with-mask" />}
          <div className="app-content">
            <Route exact path="/" component={Main} />
            <Route exact path={routes.SIGN_IN} component={Login} />
            <Route exact path={routes.SIGN_UP} component={SignUp} />
            <Route
              path={`${routes.LEAGUE}/:leagueID`}
              render={(props) => <League {...props} screenSize={442} />}
            />
          </div>
        </div>
        {showGameInvite && (
          <Dialog
            dialog={Dialogs.GAME_INVITE}
            dialogProps={{
              visible: true,
              invite,
              onAfterClose: this.closeGameInvite,
              onOk: this.acceptGameInvite,
            }}
          />
        )}
      </div>
    );
  }

  onGameInvite = (invite) => {
    this.setState({
      showGameInvite: true,
      invite,
    });
  };

  acceptGameInvite = () => {
    const { invite } = this.state;

    this.setState({ loader: true });
    LeagueService.acceptGameInvite(invite).then(
      () => {
        this.setState({ loader: false });
        const { history } = this.props;
        const { leagueID, newGameId } = invite;

        setTimeout(
          () => history.push(`${routes.LEAGUE}/${leagueID}/game/${newGameId}`),
          500
        );
      },
      () => {
        this.setState({ loader: false });
      }
    );
  };

  closeGameInvite = () => {
    this.setState({
      showGameInvite: false,
    });
  };
}

export default withRouter(withAuthentication(App));
