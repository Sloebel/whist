import React from 'react';
import { fire } from '../firebase';
import { Route, Link, RouteComponentProps } from 'react-router-dom';
import withAuthorization from '../authentication/withAuthorization';
import { Menu, Layout, message } from 'antd';
import {
  DashboardOutlined,
  GoldOutlined,
  ExportOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import './League.scss';
import GameTab from '../game/GameTab';
import * as routes from '../constants/routes';
import gameDataTpl from '../dataTemplates/gameTpl';
import RcDrawer from 'rc-drawer';
import 'rc-drawer/assets/index.css';
import Loader from '../common/loader/Loader';
import { GAME_STATUS } from '../constants/states';
import LeagueSummary from '../leagueSummary/LeagueSummary';
import Dialog from '../dialogs/Dialog';
import { Dialogs } from '../constants/dialogs';
import { ILeagueModel, IPlayer } from '../models/ILeagueModel';
import { ClickParam } from 'antd/lib/menu';
import { GameMode } from '../models/IGameModel';
import { UserContext } from '../authentication/AuthUserContext';
import LeagueService from '../services/LeagueSrv';
import { shufflePlayers } from '../utils/game-utils';

const { Content } = Layout;
const SubMenu = Menu.SubMenu;

export interface ILeagueState {
  loading: boolean;
  menuSelected: string | 'dashboard';
  league: Partial<ILeagueModel>;
  leagueGames: Array<any>;
  drawerVisible: boolean;
  newGameDialog: boolean;
}

type TParams = { leagueID?: string };

export interface ILeagueProps extends RouteComponentProps<TParams> {}

class League extends React.Component<ILeagueProps, ILeagueState> {
  private leagueRef: firebase.database.Reference;
  private leagueGamesRef: firebase.database.Reference;

  constructor(props: ILeagueProps) {
    super(props);

    const { location, match } = props;
    const { leagueID } = match.params;

    const matchGame = location.pathname.match(/game\/[1-9]/g) || [];
    const gameID = matchGame.length ? matchGame[0].split('/')[1] : false;

    this.state = {
      loading: false,
      menuSelected: gameID || 'dashboard',
      league: { title: '', players: [] },
      leagueGames: [],
      drawerVisible: false,
      newGameDialog: false,
      // activeGame: `0`
    };

    /* Create reference to messages in Firebase Database */
    const dbRef = fire.database().ref();
    this.leagueRef = dbRef.child(`leagues/list/_${leagueID}`);
    this.leagueGamesRef = dbRef.child(`leagueGames/_${leagueID}`);

    this.handleMenuItemClick = this.handleMenuItemClick.bind(this);
    this.newGameDialogHandler = this.newGameDialogHandler.bind(this);
  }

  public componentDidMount() {
    this.fetch();
  }

  public componentWillUnmount() {
    this.leagueRef.off('value');
  }

  private fetch() {
    this.setState({ loading: true });
    this.leagueRef.on('value', (snapshot) => {
      const leagueData: ILeagueModel = snapshot.val();
      console.log(leagueData);
      if (leagueData) {
        this.setState({
          league: {
            ...this.state.league,
            ...leagueData,
          },
          loading: false,
        });
      }
    });

    this.leagueGamesRef.on('child_added', (snapshot) => {
      this.setState((prevState) => {
        return { leagueGames: [...prevState.leagueGames, snapshot.val()] };
      });
    });

    this.leagueGamesRef.on('child_changed', (snapshot) => {
      console.log('child_changed', snapshot.val());
      this.setState((prevState) => {
        const leagueGames = prevState.leagueGames;
        const changedIndex = leagueGames.findIndex(
          (game) => game.gameID === snapshot.val().gameID
        );

        return {
          leagueGames: [
            ...leagueGames.slice(0, changedIndex),
            {
              ...snapshot.val(),
            },
            ...leagueGames.slice(changedIndex + 1),
          ],
        };
      });
    });
  }

  public render() {
    const { match } = this.props;
    const { league, loading, drawerVisible } = this.state;
    const { leagueID, players } = league;

    return (
      <Layout className="league-container">
        <RcDrawer
          getContainer=".app"
          width="250px"
          open={drawerVisible}
          onHandleClick={this.toggleDrawer}
          onClose={this.toggleDrawer}
        >
          <div className="drawer-title">{league.title}</div>
          {this.getMenu()}
        </RcDrawer>
        {loading && <Loader className="with-mask" />}
        <Layout>
          <Content>
            <Route
              path={`${routes.LEAGUE}/:leagueID/game/:gameID`}
              render={(props) =>
                !!leagueID ? (
                  <GameTab
                    {...props}
                    players={players}
                    // loading={loading}
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
              render={(props) =>
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

  private getMenu() {
    const { match } = this.props;
    const { leagueGames, menuSelected, newGameDialog } = this.state;

    return (
      <Menu
        mode="inline"
        selectedKeys={[menuSelected]}
        defaultOpenKeys={['gamesSub']}
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
        {newGameDialog && (
          <Dialog
            dialog={Dialogs.NEW_GAME}
            dialogProps={{
              visible: true,
              onAfterClose: this.newGameDialogHandler,
            }}
          />
        )}
        <Menu.Item key="main_menu">
          <ExportOutlined className={'rotate-180'} />
          <Link to={`/`}>To Main Menu</Link>
        </Menu.Item>
      </Menu>
    );
  }

  private toggleDrawer = () => {
    this.setState({
      drawerVisible: !this.state.drawerVisible,
    });
  };

  private setLoaderState = (loading: boolean) => {
    this.setState({ loading });
  };

  private handleMenuItemClick(item: ClickParam) {
    const key = item.key;

    if (key === 'new_game') {
      if (this.isAddGameOk()) {
        // trying to block the leauge database by adding to the league blockedBy attribute value with the user Id
        // together with the database rules preventing other user from updating the league data
        this.blockLeague().then(
          () => {
            this.setNewGameDialogState(true);
          },
          (error: Error | null) => {
            console.error(error);
            message.warning('One of the players is blocking!!');
          }
        );
      } else {
        message.warning('Last Game is not finished yet!!');
      }
    } else if (key !== 'main_menu' && key !== this.state.menuSelected) {
      this.setState({ menuSelected: key });
    }

    setTimeout(this.toggleDrawer, 200);
  }

  private blockLeague() {
    const userId = fire.auth().currentUser?.uid;

    return this.leagueRef.child('blockedBy').set(userId);
  }

  private unblockLeague() {
    this.leagueRef.update({
      blockedBy: null,
    });
  }

  private setNewGameDialogState = (show: boolean) => {
    this.setState({
      newGameDialog: show,
    });
  };

  private newGameDialogHandler(gameMode: GameMode) {
    this.setState({
      newGameDialog: false,
    });

    if (gameMode === 'local') {
      this.unblockLeague();
      this.addGame(gameMode);
    } else if (gameMode === 'remote') {
      this.setState({ loading: true });
      // ask other players to join the game
      const { league, leagueGames } = this.state;
      const newGameId = leagueGames.length + 1;

      LeagueService.invitePlayers({ ...league }, newGameId).then(() => {
        console.log('inventation resolved- ok to add game');
        this.addGame('remote');
        this.setState({ loading: false });
      });
    }
  }

  private addGame = (gameMode: GameMode) => {
    const { league, leagueGames } = this.state;
    const { leagueID, players, blockedBy } = league;

    const { history, match } = this.props;
    const newGameId = leagueGames.length + 1;

    const newGameKey = fire.database().ref().child('games').push().key;

    const gameTpl = gameDataTpl(players, gameMode);
    const updates: { [key: string]: any } = {};

    updates[`/games/${newGameKey}`] = {
      gameID: newGameId,
      dealer: gameMode === 'remote' && blockedBy ? blockedBy : '',
      ...gameTpl.gameData,
    };
    updates[`/leagueGames/_${leagueID}/${newGameKey}`] = {
      gameID: newGameId,
      gameMode,
      playersOrder: this.addGamePlayers(gameMode, players),
      status: GAME_STATUS.ACTIVE,
    };
    updates[`/leagueGamesSummary/_${leagueID}/${newGameKey}`] = {
      ...gameTpl.gameSummary,
    };

    fire
      .database()
      .ref()
      .update(updates, (error) => {
        if (!error) {
          this.setState({ menuSelected: `${newGameId}` });
          history.push(`${match.url}${routes.GAME}/${newGameId}`);
        }
      });
  };

  private addGamePlayers(gameMode: GameMode, players?: IPlayer[]) {
    return players && gameMode === 'remote' ? shufflePlayers(players) : null;
  }

  private isAddGameOk() {
    const { leagueGames } = this.state;
    const lastGame = leagueGames[leagueGames.length - 1];

    return !lastGame || lastGame.status === GAME_STATUS.FINISHED;
  }
}

const authCondition = (authUser: UserContext) => !!authUser;

export default withAuthorization<ILeagueProps>(authCondition)(League);
