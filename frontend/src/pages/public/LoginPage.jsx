import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { Shield, LogIn, Lock, Mail, AlertCircle, CheckCircle2, User, KeyRound, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 1-Click Auto Login Demo Helper
  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    try {
      const res = await login(demoEmail, demoPassword);
      const targetUser = res.user;

      if (targetUser.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (targetUser.role === 'CANDIDATE') {
        navigate('/candidate/dashboard', { replace: true });
      } else {
        navigate('/voter/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      const loggedUser = res.user;

      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (loggedUser.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (loggedUser.role === 'CANDIDATE') {
        navigate('/candidate/dashboard', { replace: true });
      } else {
        navigate('/voter/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto my-6">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 overflow-hidden">
          <div className="eci-tricolor-bar w-full"></div>

          {/* Header */}
          <div className="bg-[#082545] text-white p-6 text-center border-b-2 border-amber-500">
            <div className="w-14 h-14 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xl mx-auto shadow-md mb-2">
              ECI
            </div>
            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              महाविद्यालय निर्वाचन आयोग
            </p>
            <h2 className="text-xl font-extrabold tracking-tight">
              PORTAL LOGIN & ROLE ACCESS
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Select your role below or enter your credentials
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {/* Already Logged In Banner */}
            {user && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs space-y-2">
                <div className="flex items-center space-x-1.5 text-blue-950 font-bold">
                  <Shield className="w-4 h-4 text-blue-900" />
                  <span>Currently Signed In: {user.full_name}</span>
                </div>
                <p className="text-slate-600">
                  Role: <strong className="text-blue-900">{user.role} PANEL</strong>
                </p>
                <div className="flex items-center space-x-2 pt-1">
                  <Link
                    to={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'CANDIDATE' ? '/candidate/dashboard' : '/voter/dashboard'}
                    className="px-3 py-1.5 bg-blue-900 text-white font-bold rounded text-[11px]"
                  >
                    Go to My Dashboard →
                  </Link>
                  <button
                    onClick={logout}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-[11px]"
                  >
                    Sign Out First
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* 1-Click Fast Role Switcher */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center">
                <KeyRound className="w-3.5 h-3.5 mr-1 text-amber-600" />
                1-Click Direct Role Logins:
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin('admin@college.edu', 'Admin@123')}
                  className="p-2.5 rounded-lg bg-white hover:bg-blue-50 border-2 border-blue-900 text-center transition-all shadow-xs active:scale-95"
                >
                  <span className="font-bold block text-blue-950 text-xs">🛡️ Admin</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">CEO Desk</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin('aarav.sharma@college.edu', 'Password@123')}
                  className="p-2.5 rounded-lg bg-white hover:bg-emerald-50 border-2 border-emerald-600 text-center transition-all shadow-xs active:scale-95"
                >
                  <span className="font-bold block text-emerald-800 text-xs">🗳️ Voter</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Approved Elector</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin('vikram.roy@college.edu', 'Password@123')}
                  className="p-2.5 rounded-lg bg-white hover:bg-amber-50 border-2 border-amber-600 text-center transition-all shadow-xs active:scale-95"
                >
                  <span className="font-bold block text-amber-800 text-xs">🎯 Candidate</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Nominee</span>
                </button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase font-bold">Or enter credentials</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  College Registered Email ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shadow transition-all flex items-center justify-center space-x-2 text-xs"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>LOGIN WITH CREDENTIALS</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-600">
                New college student?{' '}
                <Link to="/register" className="font-bold text-blue-900 hover:text-amber-600 underline">
                  Submit Form 6-C Voter Verification
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
