import React, { createContext, useContext, useState, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    try { return u ? JSON.parse(u) : null; } catch { return null; }
  });

  const login = useCallback((tkn, userData) => {
    localStorage.setItem('token', tkn);
    const userObj = typeof userData === 'string' ? { username: userData } : userData;
    localStorage.setItem('user', JSON.stringify(userObj));
    setToken(tkn);
    setUser(userObj);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
