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
  const { user, logout, switchToRole, cycleToNextRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  // 1-Click Auto Cycle: Admin -> Voter -> Candidate -> Admin
  const handleAutoCycle = async () => {
    if (switching) return;
    setSwitching(true);
    setUserDropdownOpen(false);
    try {
      const { dashboard } = await cycleToNextRole();
      navigate(dashboard);
    } catch (err) {
      console.error('Auto switch error', err);
    } finally {
      setSwitching(false);
    }
  };

  // 1-Click Direct Role Jump
  const handleDirectRole = async (targetRole) => {
    if (switching) return;
    setSwitching(true);
    setUserDropdownOpen(false);
    try {
      const creds = await switchToRole(targetRole);
      navigate(creds.dashboard);
    } catch (err) {
      console.error('Role jump error', err);
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
              A Blockchain-Based Framework for Transparent and Tamper-Proof Online Elections
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

          {/* Automatic 1-Click Role Switcher */}
          <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-lg border border-amber-500/50 shadow-inner">
            <button
              type="button"
              onClick={handleAutoCycle}
              disabled={switching}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm active:scale-95 disabled:opacity-60 cursor-pointer"
              title="Click to automatically cycle: Admin ➔ Voter ➔ Candidate ➔ Admin"
            >
              <Repeat className={`w-3.5 h-3.5 ${switching ? 'animate-spin' : ''}`} />
              <span>{switching ? 'Switching...' : 'Switch Panel ➔'}</span>
            </button>

            <div className="hidden lg:flex items-center space-x-1 pl-1">
              {[
                { role: 'ADMIN', label: 'Admin Desk' },
                { role: 'VOTER', label: 'Voter Panel' },
                { role: 'CANDIDATE', label: 'Candidate' },
              ].map((item) => {
                const isCurrent = user?.role === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    disabled={switching}
                    onClick={() => handleDirectRole(item.role)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-xs ring-1 ring-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
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
            type="button"
            onClick={handleAutoCycle}
            disabled={switching}
            className="p-1.5 px-2.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-1"
          >
            <Repeat className={`w-3.5 h-3.5 ${switching ? 'animate-spin' : ''}`} />
            <span>{switching ? 'Switching...' : 'Switch'}</span>
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
