import { db } from "./fire";

// User API

export const doCreateUser = (id: any, userInfo: any) =>
  db.ref(`users/${id}`).set(userInfo);

export const onceGetUsers = () => db.ref("users").once("value");

export const onceGetLeagues = () => db.ref("leagues").once("value");
