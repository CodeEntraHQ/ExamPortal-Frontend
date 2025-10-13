import React, { createContext, useContext, useState } from 'react';
import { login as apiLogin } from '../services/api';
import { removeToken } from '../services/api';

type UserRole = 'SUPERADMIN' | 'ADMIN' | 'STUDENT';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  entityId?: string;
  entityName?: string;
  profile_picture_link?: string;
  phone_number?: string;
  address?: string;
  bio?: string;
  created_at?: string;
  gender?: string;
  roll_number?: string;
  last_login_at?: string;
  two_fa_enabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  updateUser: (updates: Partial<User>) => void;
  login: (email: string, password: string) => Promise<{ requires2FA: boolean }>;
  logout: () => void;
  isAuthenticated: boolean;
  verify2FA: (otp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loginCredentials, setLoginCredentials] = useState<{ email: string; password: string } | null>(null);

  const updateUser = (updates: Partial<User>) => {
    setUser(prevUser => (prevUser ? { ...prevUser, ...updates } : null));
  };

  const login = async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    if (response.requires2FA) {
      setLoginCredentials({ email, password });
      return { requires2FA: true };
    }
    if (response.user) {
      setUser(response.user);
      setLoginCredentials(null);
    }
    return { requires2FA: false };
  };

  const verify2FA = async (otp: string) => {
    if (!loginCredentials) {
      throw new Error('Cannot verify 2FA without initial login credentials.');
    }
    const { email, password } = loginCredentials;
    const response = await apiLogin(email, password, otp);
    if (response.user) {
      setUser(response.user);
      setLoginCredentials(null);
    } else {
      // The apiLogin function will throw an error for non-200 responses,
      // which should cover cases like incorrect OTP.
      throw new Error('2FA verification failed.');
    }
  };

  const logout = () => {
    setUser(null);
    removeToken();
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      updateUser,
      login,
      logout,
      isAuthenticated: !!user,
      verify2FA,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
