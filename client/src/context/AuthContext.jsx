import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

/**
 * Authentication Provider
 * Manages user state, login, register, and logout sessions backed by localStorage.
 */
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('flood_token') || null;
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('flood_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (err) {
        console.error('Failed to parse saved user in localStorage:', err);
        return null;
      }
    }
    return null;
  });

  // Login handler
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = response.data;

    setToken(newToken);
    setUser(userData);

    localStorage.setItem('flood_token', newToken);
    localStorage.setItem('flood_user', JSON.stringify(userData));

    return response.data;
  };

  // Register handler
  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    const { token: newToken, user: userData } = response.data;

    setToken(newToken);
    setUser(userData);

    localStorage.setItem('flood_token', newToken);
    localStorage.setItem('flood_user', JSON.stringify(userData));

    return response.data;
  };

  // Logout handler
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('flood_token');
    localStorage.removeItem('flood_user');
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to consume authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
