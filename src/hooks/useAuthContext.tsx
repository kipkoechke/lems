"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAuth, useLogin, useLogout, useCurrentUser, useIsAuthenticated } from "./useAuth";
import { User } from "../services/apiAuth";

// Context type definition
interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: ReturnType<typeof useLogin>;
  logout: ReturnType<typeof useLogout>;
  
  // Auth query data
  authQuery: ReturnType<typeof useAuth>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const authQuery = useAuth();
  const user = useCurrentUser();
  const isAuthenticated = useIsAuthenticated();
  const login = useLogin();
  const logout = useLogout();

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading: authQuery.isLoading,
    login,
    logout,
    authQuery,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

// Convenience hooks that can be used without context
export { useAuth, useLogin, useLogout, useCurrentUser, useIsAuthenticated };