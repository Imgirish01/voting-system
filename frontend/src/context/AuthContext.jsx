import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
const USER_KEY = 'eci_election_current_user';
const TOKEN_KEY = 'token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [voterApplication, setVoterApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const persistUser = (newUser) => {
    setUser(newUser);
    if (newUser) {
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      } catch (e) {}
    } else {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.user) {
        persistUser(res.user);
        setVoterApplication(res.voterApplication || null);
      }
    } catch (err) {
      // Keep existing cached user if present
      console.warn('Silent session refresh:', err.message);
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
        if (res.token) {
          localStorage.setItem(TOKEN_KEY, res.token);
        }
        persistUser(res.user);
        if (res.voterApplication) {
          setVoterApplication(res.voterApplication);
        }
        return res;
      }
      throw new Error(res.message || 'Login failed');
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
        if (res.token) {
          localStorage.setItem(TOKEN_KEY, res.token);
        }
        persistUser(res.user);
        if (res.voterApplication) {
          setVoterApplication(res.voterApplication);
        }
        return res;
      }
      throw new Error(res.message || 'Registration failed');
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
      persistUser(null);
      setVoterApplication(null);
    }
  };

  const switchAccount = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success) {
        if (res.token) {
          localStorage.setItem(TOKEN_KEY, res.token);
        }
        persistUser(res.user);
        if (res.voterApplication) {
          setVoterApplication(res.voterApplication);
        }
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
    setLoading(true);
    try {
      const res = await api.post('/auth/switch-role', { role: targetRole });
      if (res.success && res.user) {
        if (res.token) {
          localStorage.setItem(TOKEN_KEY, res.token);
        }
        persistUser(res.user);
        if (res.voterApplication) {
          setVoterApplication(res.voterApplication);
        }
        const dashboards = {
          ADMIN: '/admin/dashboard',
          VOTER: '/voter/dashboard',
          CANDIDATE: '/candidate/dashboard',
        };
        return {
          user: res.user,
          dashboard: dashboards[targetRole] || '/admin/dashboard',
          label: `${targetRole} Panel`,
        };
      }
    } catch (err) {
      console.error('Instant switch fallback', err);
      const creds = ROLE_DEFAULT_CREDENTIALS[targetRole] || ROLE_DEFAULT_CREDENTIALS.ADMIN;
      await switchAccount(creds.email, creds.password);
      return creds;
    } finally {
      setLoading(false);
    }
  };

  const cycleToNextRole = async () => {
    const currentRole = user?.role || 'ADMIN';
    let nextRole = 'VOTER';
    if (currentRole === 'ADMIN') nextRole = 'VOTER';
    else if (currentRole === 'VOTER') nextRole = 'CANDIDATE';
    else if (currentRole === 'CANDIDATE') nextRole = 'ADMIN';

    return await switchToRole(nextRole);
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
