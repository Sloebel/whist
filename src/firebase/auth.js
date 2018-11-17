import { auth } from './fire';

// Sign Up
export const createUser = (email, password) =>
  auth.createUserWithEmailAndPassword(email, password);

// Sign In
export const signInUser = (email, password) =>
  auth.signInWithEmailAndPassword(email, password);

// Sign out
export const signOut = () =>
  auth.signOut();