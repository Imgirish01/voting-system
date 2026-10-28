import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [voterApplication, setVoterApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
        setVoterApplication(res.voterApplication || null);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success) {
        setUser(res.user);
        // Refresh full profile
        await fetchCurrentUser();
        return res;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (formData) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', formData);
      if (res.success) {
        setUser(res.user);
        await fetchCurrentUser();
        return res;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout error', err);
    } finally {
      setUser(null);
      setVoterApplication(null);
    }
  };

  const switchAccount = async (email, password) => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
      const res = await api.post('/auth/login', { email, password });
      if (res.success) {
        setUser(res.user);
        await fetchCurrentUser();
        return res.user;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        voterApplication,
        loading,
        error,
        login,
        register,
        logout,
        switchAccount,
        refreshUser: fetchCurrentUser,
      }}
    >
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

