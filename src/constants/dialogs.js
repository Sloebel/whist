import NewLeagueDialog from '../dialogs/NewLeague';
import ResumeLeagueDialog from '../dialogs/ResumeLeague';
import ReorderPlayers from '../dialogs/ReorderPlayers';

export const Dialogs = {
  NEW_LEAGUE: 'NEW_LEAGUE',
  RESUME_LEAGUE: 'RESUME_LEAGUE',
  REORDER_PLAYERS: 'REORDER_PLAYERS'
};

export const DialogsMapping = {
  [Dialogs.NEW_LEAGUE]: NewLeagueDialog,
  [Dialogs.RESUME_LEAGUE]: ResumeLeagueDialog,
  [Dialogs.REORDER_PLAYERS]: ReorderPlayers,
};