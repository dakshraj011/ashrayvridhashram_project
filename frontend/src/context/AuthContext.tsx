import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('aashray_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('aashray_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('aashray_user', JSON.stringify(res.data.user));
        }
      } catch (err: any) {
        console.warn('Session verify notice:', err.message);
        // Only invalidate if server explicitly rejects with 401 Unauthorized
        if (err?.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('aashray_token', newToken);
    localStorage.setItem('aashray_user', JSON.stringify(newUser));
    sessionStorage.setItem('admin_pwd_verified', 'true');
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('aashray_token');
    localStorage.removeItem('aashray_user');
    sessionStorage.removeItem('admin_pwd_verified');
    setToken(null);
    setUser(null);
  };


  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
