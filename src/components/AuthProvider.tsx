import React, { createContext, useContext, useState } from 'react';

type UserRole = 'SUPERADMIN' | 'ADMIN' | 'STUDENT';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  entityId?: string;
  entityName?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Super Admin',
    email: 'superadmin@example.com',
    role: 'SUPERADMIN'
  },
  {
    id: '2',
    name: 'School Admin',
    email: 'admin@school.com',
    role: 'ADMIN',
    entityId: 'school-1',
    entityName: 'Springfield High School'
  },
  {
    id: '3',
    name: 'John Student',
    email: 'student@example.com',
    role: 'STUDENT',
    entityId: 'school-1',
    entityName: 'Springfield High School'
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Mock login - in real app this would call an API
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
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