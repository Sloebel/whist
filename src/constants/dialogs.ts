import NewLeagueDialog from '../dialogs/NewLeague';
import ResumeLeagueDialog from '../dialogs/ResumeLeague';
import ReorderPlayers from '../dialogs/ReorderPlayers';
import NewGameDialog from '../dialogs/NewGameDialog/NewGameDialog';
import GameInvite from '../dialogs/GameInvite';

export enum Dialogs {
  NEW_LEAGUE = 'NEW_LEAGUE',
  RESUME_LEAGUE = 'RESUME_LEAGUE',
  REORDER_PLAYERS = 'REORDER_PLAYERS',
  NEW_GAME = 'NEW_GAME',
  GAME_INVITE = 'GAME_INVITE',
}

export const DialogsMapping = {
  [Dialogs.NEW_LEAGUE]: NewLeagueDialog,
  [Dialogs.RESUME_LEAGUE]: ResumeLeagueDialog,
  [Dialogs.REORDER_PLAYERS]: ReorderPlayers,
  [Dialogs.NEW_GAME]: NewGameDialog,
  [Dialogs.GAME_INVITE]: GameInvite,
};
