import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout } from '../../../services/api';
import { clearAuthStorage } from '../../../services/api/storage';
import { getToken, removeToken } from '../../../services/api/core';

type UserRole = 'SUPERADMIN' | 'ADMIN' | 'STUDENT' | 'REPRESENTATIVE';

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
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  verify2FA: (otp: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const loadUserFromStorage = (): User | null => {
  try {
    const storedUser = localStorage.getItem('user');
    const token = getToken();
    
    // If no token, clear user data (token is source of truth)
    if (!token) {
      if (storedUser) {
        localStorage.removeItem('user');
      }
      return null;
    }
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return user;
    }
    return null;
  } catch (error) {
    console.error('❌ AuthProvider - Failed to load user from storage:', error);
    return null;
  }
};

const saveUserToStorage = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  } catch (error) {
    console.error('❌ AuthProvider - Failed to save user to localStorage:', error);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadUserFromStorage());
  const [loginCredentials, setLoginCredentials] = useState<{ email: string; password: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Validate token on mount and when user changes
  useEffect(() => {
    const token = getToken();
    const storedUser = loadUserFromStorage();
    
    // If we have a user but no token, or vice versa, clear everything
    if ((token && !storedUser) || (!token && storedUser)) {
      clearAuthStorage();
      setUser(null);
    }
  }, []);

  // Listen for unauthorized events from API calls
  useEffect(() => {
    const handleUnauthorized = () => {
      // Clear all auth data and redirect to home
      clearAuthStorage();
      setUser(null);
      setLoginCredentials(null);
      removeToken();
      
      // Only redirect if not already on landing page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prevUser => {
      const newUser = prevUser ? { ...prevUser, ...updates } : null;
      saveUserToStorage(newUser);
      return newUser;
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiLogin(email, password);
      
      if (response.requires2FA) {
        setLoginCredentials({ email, password });
        return { requires2FA: true };
      }
      if (response.user) {
        setUser(response.user);
        saveUserToStorage(response.user);
        setLoginCredentials(null);
      } else {
        console.warn('⚠️ AuthProvider - No user data in login response');
      }
      return { requires2FA: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verify2FA = useCallback(async (otp: string) => {
    if (!loginCredentials) {
      throw new Error('Cannot verify 2FA without initial login credentials.');
    }
    setIsLoading(true);
    try {
      const { email, password } = loginCredentials;
      const response = await apiLogin(email, password, otp);
      
      if (response.user) {
        setUser(response.user);
        saveUserToStorage(response.user);
        setLoginCredentials(null);
      } else {
        throw new Error('2FA verification failed.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [loginCredentials]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Call backend logout endpoint
      await apiLogout();
    } catch (error) {
      // Continue with cleanup even if API call fails
      console.warn('Logout API call failed, continuing with cleanup:', error);
    } finally {
      // Clear all authentication-related data
      clearAuthStorage();
      
      // Clear React state
      setUser(null);
      setLoginCredentials(null);
      
      // Ensure token is removed
      removeToken();
      
      setIsLoading(false);
      
      // Navigate to home page (router will handle redirect to login if needed)
      // Use window.location to ensure complete cleanup
      window.location.href = '/';
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      updateUser,
      login,
      logout,
      isAuthenticated: !!user && !!getToken(),
      verify2FA,
      isLoading,
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
