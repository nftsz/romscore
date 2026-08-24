import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User } from '../types/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: { access: string; refresh: string }) => Promise<void>;
  logout: () => void;
}

export const TOKEN_KEY = '@RideAnalytics:access_token';
export const REFRESH_KEY = '@RideAnalytics:refresh_token';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get<User>('/auth/me/');
      setUser(response.data);
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async ({ access, refresh }: { access: string; refresh: string }) => {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    await fetchCurrentUser();
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);