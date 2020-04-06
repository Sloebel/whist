import React from 'react';

export type UserContext = firebase.User | null;

const AuthUserContext = React.createContext<UserContext>(null);

export default AuthUserContext;
