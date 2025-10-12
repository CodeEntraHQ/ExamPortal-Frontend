import React, { createContext, useContext, useState } from 'react';
import { login as apiLogin } from '../services/api/auth';
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
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const userData = await apiLogin(email, password);
    if (userData) {
      setUser(userData);
    } else {
      throw new Error('Login failed: No user data returned');
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
      login,
      logout,
      isAuthenticated: !!user
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
