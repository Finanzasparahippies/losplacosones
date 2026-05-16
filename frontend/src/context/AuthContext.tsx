'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/lib/api';

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  is_staff: boolean;
  is_superuser: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const userData = await auth.getUser();
        setUser(userData);
      }
    } catch (error) {
      console.error("Auth error:", error);
      auth.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    await auth.login(email, password);
    await fetchUser();
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  const isAdmin = user?.is_staff || user?.is_superuser || ['ADMIN', 'BUSINESS', 'ANALYST'].includes(user?.role || '');

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
