import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Vote,
  UserCheck,
  Award,
  Shield,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  ChevronDown,
  BarChart3,
  HelpCircle,
  Repeat,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, switchAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const handleRoleQuickSwitch = async (email, password, dest) => {
    setSwitching(true);
    setRoleSwitcherOpen(false);
    setUserDropdownOpen(false);
    try {
      await switchAccount(email, password);
      navigate(dest);
    } catch (err) {
      console.error(err);
    } finally {
      setSwitching(false);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'CANDIDATE') return '/candidate/dashboard';
    return '/voter/dashboard';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="w-full bg-[#082545] text-white border-b-2 border-amber-500 shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* ECI Emblem and Title */}
        <Link to="/" className="flex items-center space-x-3.5 group">
          <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-[#082545] rounded-full flex items-center justify-center border border-amber-300">
              <Vote className="w-6 h-6 text-amber-400 group-hover:scale-105 transition-transform" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm font-semibold tracking-wider text-amber-400 uppercase">
                ई-वोटर्स आयोग
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-400/40">
                E-VOTERS
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-white flex items-center">
              E-VOTERS COMMISSION
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium">
              Statutory Student Council Voting Portal • Session 2026-27
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-md text-xs lg:text-sm font-medium transition-colors ${
              isActive('/') ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-200 hover:bg-slate-800'
            }`}
          >
            Home
          </Link>

          <Link
            to="/about"
            className={`px-3 py-1.5 rounded-md text-xs lg:text-sm font-medium transition-colors ${
              isActive('/about') ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-200 hover:bg-slate-800'
            }`}
          >
            About Commission
          </Link>

          <Link
            to="/results"
            className={`px-3 py-1.5 rounded-md text-xs lg:text-sm font-medium flex items-center space-x-1 transition-colors ${
              isActive('/results') ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Official Results</span>
          </Link>

          <Link
            to="/help"
            className={`px-3 py-1.5 rounded-md text-xs lg:text-sm font-medium flex items-center space-x-1 transition-colors ${
              isActive('/help') ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-200 hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>Voter FAQ</span>
          </Link>

          {/* Quick 1-Click Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 hover:bg-amber-500/30 transition-colors"
              title="Quickly switch between Admin, Voter, and Candidate accounts"
            >
              <Repeat className="w-3.5 h-3.5 text-amber-400" />
              <span>Switch Panel</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {roleSwitcherOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-xl shadow-2xl border-2 border-amber-500 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    ECI 1-Click Role Switcher
                  </p>
                </div>

                <div className="p-1.5 space-y-1 text-xs">
                  <button
                    onClick={() => handleRoleQuickSwitch('admin@college.edu', 'Admin@123', '/admin/dashboard')}
                    className="w-full text-left p-2 rounded-lg hover:bg-blue-50 flex items-center space-x-2 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-blue-900 flex-shrink-0" />
                    <div>
                      <span className="font-bold block text-slate-900">Admin Desk (CEO)</span>
                      <span className="text-[10px] text-slate-500">Prof. S. K. Sharma</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleQuickSwitch('aarav.sharma@college.edu', 'Password@123', '/voter/dashboard')}
                    className="w-full text-left p-2 rounded-lg hover:bg-emerald-50 flex items-center space-x-2 transition-colors"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold block text-slate-900">Voter Panel (Approved)</span>
                      <span className="text-[10px] text-slate-500">Aarav Sharma • Form 6-C Verified</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleQuickSwitch('vikram.roy@college.edu', 'Password@123', '/candidate/dashboard')}
                    className="w-full text-left p-2 rounded-lg hover:bg-amber-50 flex items-center space-x-2 transition-colors"
                  >
                    <Award className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold block text-slate-900">Candidate Panel</span>
                      <span className="text-[10px] text-slate-500">Vikramaditya Roy (Nominee)</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          {user ? (
            <div className="relative ml-1">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md border border-slate-700 text-xs font-medium"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold leading-tight max-w-[120px] truncate text-white">
                    {user.full_name}
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold leading-tight">
                    {user.role}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Currently Signed In</p>
                    <p className="text-xs font-bold text-slate-900 truncate">{user.full_name}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                      {user.role} PANEL
                    </span>
                  </div>

                  <Link
                    to={getDashboardLink()}
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Shield className="w-3.5 h-3.5 mr-2 text-blue-900" />
                    Open {user.role} Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-bold border-t border-slate-100"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 ml-2">
              <Link
                to="/login"
                className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-300"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register (Form 6-C)</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-2">
          <button
            onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
            className="p-1.5 rounded bg-amber-500 text-slate-950 text-xs font-bold flex items-center space-x-1"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Switch</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#051C34] border-t border-slate-700 px-4 pt-2 pb-4 space-y-2">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-slate-200">
            Home
          </Link>
          <Link to="/results" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-slate-200">
            Official Results
          </Link>
          <Link to="/help" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-slate-200">
            Voter FAQ
          </Link>

          {user ? (
            <div className="border-t border-slate-700 pt-2 space-y-2">
              <div className="px-3 py-1">
                <p className="text-xs text-amber-400 font-bold">{user.full_name} ({user.role})</p>
              </div>
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded bg-amber-500 text-slate-950 font-bold text-center text-xs"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 text-red-300 text-xs"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-700 pt-3 flex flex-col space-y-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-center rounded bg-slate-800 text-amber-300 text-xs font-bold">
                Portal Login
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
