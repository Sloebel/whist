import NewLeagueDialog from '../dialogs/NewLeague';
import ResumeLeagueDialog from '../dialogs/ResumeLeague';
import ReorderPlayers from '../dialogs/ReorderPlayers';
import RemoteOrLocaLDialog from '../dialogs/RemoteOrLocalDialog/RemoteOrLocalDialog';

export enum Dialogs {
  NEW_LEAGUE = 'NEW_LEAGUE',
  RESUME_LEAGUE = 'RESUME_LEAGUE',
  REORDER_PLAYERS = 'REORDER_PLAYERS',
  REMOTE_OR_LOCAL_GAME = 'REMOTE_OR_LOCAL_GAME',
}

export const DialogsMapping = {
  [Dialogs.NEW_LEAGUE]: NewLeagueDialog,
  [Dialogs.RESUME_LEAGUE]: ResumeLeagueDialog,
  [Dialogs.REORDER_PLAYERS]: ReorderPlayers,
  [Dialogs.REMOTE_OR_LOCAL_GAME]: RemoteOrLocaLDialog,
};
