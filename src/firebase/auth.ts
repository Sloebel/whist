import { auth } from './fire';

// Sign Up
export const createUser = (email: string, password: string) =>
  auth.createUserWithEmailAndPassword(email, password);

// Sign In
export const signInUser = (email: string, password: string) =>
  auth.signInWithEmailAndPassword(email, password);

// Sign out
export const signOut = () => auth.signOut();
