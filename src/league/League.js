import React, { Component } from "react";
import { fire } from "../firebase";
import { Route, Link } from "react-router-dom";
import withAuthorization from "../authentication/withAuthorization";
import { Menu, Layout, message } from "antd";
import {
  DashboardOutlined,
  GoldOutlined,
  ExportOutlined,
  PlusOutlined
} from "@ant-design/icons";
import "./League.css";
import GameTab from "./../game/GameTab";
import Arrow from "../common/arrowButton/arrow/Arrow";
import * as routes from "./../constants/routes";
import gameDataTpl from "./../dataTemplates/gameTpl";
import RcDrawer from "rc-drawer";
import "rc-drawer/assets/index.css";
import Loader from "../common/loader/Loader";
import { GAME_STATUS } from "../constants/states";
import LeagueSummary from "../leagueSummary/LeagueSummary";

const { Content, Sider } = Layout;
const SubMenu = Menu.SubMenu;

class League extends Component {
  constructor(props) {
    super(props);

    const { location, match } = props;
    const { leagueID } = match.params;

    const matchGame = location.pathname.match(/game\/[1-9]/g) || [];
    const gameID = matchGame.length ? matchGame[0].split("/")[1] : false;

    this.state = {
      loading: true,
      siderCollapse: false,
      menuSelected: gameID || "dashboard",
      league: { title: "", players: [] },
      leagueGames: [],
      drawerVisible: false
      // activeGame: `0`
    };

    /* Create reference to messages in Firebase Database */
    const dbRef = fire.database().ref();
    this.leagueRef = dbRef.child(`leagues/list/_${leagueID}`);
    this.leagueGamesRef = dbRef.child(`leagueGames/_${leagueID}`);

    this.setLoaderState = this.setLoaderState.bind(this);
  }

  fetch() {
    this.leagueRef.on("value", snapshot => {
      console.log(snapshot.val());
      const leagueData = snapshot.val();

      if (leagueData) {
        this.setState({
          league: {
            ...this.state.league,
            ...leagueData
          }
          // activeGame: `${leagueData.games.length}`
        });
      }
    });

    this.leagueGamesRef.on("child_added", snapshot => {
      this.setState(prevState => {
        return { leagueGames: [...prevState.leagueGames, snapshot.val()] };
      });
    });

    this.leagueGamesRef.on("child_changed", snapshot => {
      this.setState(prevState => {
        const leagueGames = prevState.leagueGames;
        const changedIndex = leagueGames.findIndex(
          game => game.gameID === snapshot.val().gameID
        );

        return {
          leagueGames: [
            ...leagueGames.slice(0, changedIndex),
            {
              ...snapshot.val()
            },
            ...leagueGames.slice(changedIndex + 1)
          ]
        };
      });
    });
  }

  componentDidMount() {
    this.fetch();
  }

  componentWillUnmount() {
    this.leagueRef.off("value");
  }

  // onTabChange = (activeGame) => {
  // 	this.setState({ activeGame });
  // }

  addGame = () => {
    const { league, leagueGames } = this.state;
    const { leagueID, players } = league;
    const lastGame = leagueGames[leagueGames.length - 1];

    if (!lastGame || lastGame.status === GAME_STATUS.FINISHED) {
      const { history, match } = this.props;
      const newGameId = leagueGames.length + 1;

      const newGameKey = fire
        .database()
        .ref()
        .child("games")
        .push().key;

      const gameTpl = gameDataTpl(players);
      const updates = {};

      updates[`/games/${newGameKey}`] = {
        gameID: newGameId,
        ...gameTpl.gameData
      };
      updates[`/leagueGames/_${leagueID}/${newGameKey}`] = {
        gameID: newGameId,
        status: GAME_STATUS.ACTIVE
      };
      updates[`/leagueGamesSummary/_${leagueID}/${newGameKey}`] = {
        ...gameTpl.gameSummary
      };

      fire
        .database()
        .ref()
        .update(updates, error => {
          if (!error) {
            this.setState({ menuSelected: `${newGameId}` });
            history.push(`${match.url}${routes.GAME}/${newGameId}`);
            setTimeout(this.toggleDrawer, 400);
          }
        });
    } else {
      setTimeout(this.toggleDrawer, 200);
      message.warning("Last Game is not finished yet!!");
    }
  };

  handleMenuItemClick = item => {
    const key = item.key;

    if (key === "new_game") {
      return this.addGame();
    }

    if (key !== "main_menu" && key !== this.state.menuSelected) {
      this.setState({ menuSelected: key });
      setTimeout(this.toggleDrawer, 400);
      this.setLoaderState(true);
    }
  };

  setLoaderState(loading) {
    this.setState({ loading });
  }

  toggleSider = () => {
    this.setState({
      siderCollapse: !this.state.siderCollapse
    });
  };

  toggleDrawer = () => {
    this.setState({
      drawerVisible: !this.state.drawerVisible
    });
  };

  getMenu() {
    const { match } = this.props;
    const { leagueGames, menuSelected } = this.state;

    return (
      <Menu
        mode="inline"
        selectedKeys={[menuSelected]}
        defaultOpenKeys={["gamesSub"]}
        onClick={this.handleMenuItemClick}
        className="league-menu"
      >
        <Menu.Item key="dashboard">
          <DashboardOutlined />
          <Link to={`${match.url}`}>League Summary</Link>
        </Menu.Item>
        <SubMenu
          key="gamesSub"
          title={
            <span>
              <GoldOutlined />
              <span>Games</span>
            </span>
          }
        >
          {leagueGames.map((game, i) => (
            <Menu.Item key={game.gameID.toString()}>
              <Link to={`${match.url}${routes.GAME}/${game.gameID}`}>
                Game {game.gameID}
              </Link>
            </Menu.Item>
          ))}

          <Menu.Item key="new_game">
            <PlusOutlined />
            <span>New Game</span>
          </Menu.Item>
        </SubMenu>

        <Menu.Item key="main_menu">
          <ExportOutlined className={"rotate-180"} />
          <Link to={`/`}>To Main Menu</Link>
        </Menu.Item>
      </Menu>
    );
  }

  render() {
    const { isMobile, screenSize, match } = this.props;
    const { league, siderCollapse, loading, drawerVisible } = this.state;
    const { leagueID, players } = league;

    return (
      <Layout className="league-container">
        {isMobile ? (
          <RcDrawer
            getContainer="#root"
            width="250px"
            open={drawerVisible}
            onHandleClick={this.toggleDrawer}
            onClose={this.toggleDrawer}
          >
            <div className="drawer-title">{league.title}</div>
            {this.getMenu()}
          </RcDrawer>
        ) : (
          <Sider
            trigger={null}
            collapsible
            collapsed={siderCollapse}
            style={{ background: "#fff" }}
          >
            <Arrow direction={"left"} onClick={this.toggleSider} />
            {this.getMenu()}
          </Sider>
        )}
        <Layout>
          <Content
          // style={{
          // 	margin: '24px 16px', padding: 24, minHeight: 280,
          // }}
          >
            <Route
              path={`${routes.LEAGUE}/:leagueID/game/:gameID`}
              render={props =>
                !!leagueID ? (
                  <GameTab
                    {...props}
                    isMobile={isMobile}
                    screenSize={screenSize}
                    players={players}
                    loading={loading}
                    loaderStateCb={this.setLoaderState}
                  />
                ) : (
                  <Loader />
                )
              }
            />
            <Route
              exact
              path={match.url}
              render={props =>
                !!leagueID ? (
                  <LeagueSummary {...props} league={league} />
                ) : (
                  <Loader />
                )
              }
            />
          </Content>
        </Layout>
      </Layout>
    );
  }
}

const authCondition = authUser => !!authUser;

export default withAuthorization(authCondition)(League);
