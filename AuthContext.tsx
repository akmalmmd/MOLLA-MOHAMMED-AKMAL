import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../types.js';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  quickSwitch: (role: 'alice' | 'bob' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('hotel_jwt_token');
      const savedUser = localStorage.getItem('hotel_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } else {
        // Default to logged-in test customer Alice Johnson for immediate convenience
        quickSwitch('alice');
      }
    } catch (e) {
      console.error('Auth restoration error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/customers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Login failed' };
      }

      setToken(data.token);
      setUser(data.customer);
      localStorage.setItem('hotel_jwt_token', data.token);
      localStorage.setItem('hotel_user', JSON.stringify(data.customer));
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error occurred' };
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const res = await fetch('/api/customers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Registration failed' };
      }

      setToken(data.token);
      setUser(data.customer);
      localStorage.setItem('hotel_jwt_token', data.token);
      localStorage.setItem('hotel_user', JSON.stringify(data.customer));
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error occurred' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hotel_jwt_token');
    localStorage.removeItem('hotel_user');
  };

  const quickSwitch = async (role: 'alice' | 'bob' | 'admin') => {
    let email = 'alice@example.com';
    let password = 'password123';
    if (role === 'bob') {
      email = 'bob@example.com';
      password = 'password123';
    } else if (role === 'admin') {
      email = 'admin@grandpalace.com';
      password = 'admin123';
    }
    await login(email, password);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, quickSwitch }}>
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
