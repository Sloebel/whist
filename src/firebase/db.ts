import { db } from './fire';

// database refs
export const usersRef = db.ref('users');
export const leaguesRef = db.ref('leagues');

// User API

export const doCreateUser = (id: any, userInfo: any) =>
  db.ref(`users/${id}`).set(userInfo);

export const onceGetUsers = () => usersRef.once('value');

export const onceGetLeagues = () => leaguesRef.once('value');
