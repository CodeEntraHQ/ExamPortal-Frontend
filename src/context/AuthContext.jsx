import { createContext } from 'react';

// Create the auth context with default values
export const AuthContext = createContext({
  user: null,
  setUser: () => {},
  loading: true,
  logout: () => {}
});