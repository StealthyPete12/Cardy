import { createContext, useContext } from 'react';

// Shared auth state — provides signIn, signOut, and userToken to all screens
const AuthContext = createContext(null);

// Hook to access auth functions from any component
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
