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

  const ROLE_DEFAULT_CREDENTIALS = {
    ADMIN: {
      email: 'admin@college.edu',
      password: 'Admin@123',
      dashboard: '/admin/dashboard',
      label: 'Admin Desk (CEO)',
    },
    VOTER: {
      email: 'aarav.sharma@college.edu',
      password: 'Password@123',
      dashboard: '/voter/dashboard',
      label: 'Voter Panel (Approved)',
    },
    CANDIDATE: {
      email: 'vikram.roy@college.edu',
      password: 'Password@123',
      dashboard: '/candidate/dashboard',
      label: 'Candidate Panel',
    },
  };

  const switchToRole = async (targetRole) => {
    const creds = ROLE_DEFAULT_CREDENTIALS[targetRole] || ROLE_DEFAULT_CREDENTIALS.ADMIN;
    await switchAccount(creds.email, creds.password);
    return creds;
  };

  const cycleToNextRole = async () => {
    const currentRole = user?.role || 'ADMIN';
    let nextRole = 'VOTER';
    if (currentRole === 'ADMIN') nextRole = 'VOTER';
    else if (currentRole === 'VOTER') nextRole = 'CANDIDATE';
    else if (currentRole === 'CANDIDATE') nextRole = 'ADMIN';

    const creds = ROLE_DEFAULT_CREDENTIALS[nextRole];
    await switchAccount(creds.email, creds.password);
    return { nextRole, dashboard: creds.dashboard };
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
        switchToRole,
        cycleToNextRole,
        ROLE_DEFAULT_CREDENTIALS,
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

