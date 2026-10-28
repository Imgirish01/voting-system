import React, { useState } from 'react';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Shield, UserCheck, ArrowRight, LogIn } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles = [], requireApproved = false }) => {
  const { user, loading, switchAccount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner text="Verifying ECI Electoral Credentials..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle Role mismatch (e.g. Admin visiting Voter page or vice versa)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const handleRoleSwitch = async (email, password, dest) => {
      setSwitching(true);
      try {
        await switchAccount(email, password);
        navigate(dest, { replace: true });
      } catch (err) {
        console.error('Role switch error', err);
      } finally {
        setSwitching(false);
      }
    };

    const legitimateDashboard =
      user.role === 'ADMIN'
        ? '/admin/dashboard'
        : user.role === 'CANDIDATE'
        ? '/candidate/dashboard'
        : '/voter/dashboard';

    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border-4 border-amber-500 max-w-md w-full p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center shadow-inner">
            <Shield className="w-7 h-7" />
          </div>

          <div>
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              ECI ROLE BOUNDARY NOTICE
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">
              Role Permission Check
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              You are currently signed in as <strong>{user.full_name}</strong> (
              <span className="font-bold text-blue-900">{user.role}</span>).
              <br />
              This page requires the <strong>{allowedRoles.join(' or ')}</strong> role.
            </p>
          </div>

          <div className="pt-2 space-y-2 text-xs">
            {allowedRoles.includes('VOTER') && (
              <button
                type="button"
                disabled={switching}
                onClick={() => handleRoleSwitch('aarav.sharma@college.edu', 'Password@123', location.pathname)}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shadow transition-all flex items-center justify-center space-x-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>
                  {switching ? 'Switching Session...' : 'Switch to Verified Voter (Aarav Sharma)'}
                </span>
              </button>
            )}

            {allowedRoles.includes('ADMIN') && (
              <button
                type="button"
                disabled={switching}
                onClick={() => handleRoleSwitch('admin@college.edu', 'Admin@123', location.pathname)}
                className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg shadow transition-all flex items-center justify-center space-x-1.5"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>
                  {switching ? 'Switching Session...' : 'Switch to Chief Election Officer (Admin)'}
                </span>
              </button>
            )}

            <Link
              to={legitimateDashboard}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 block"
            >
              <span>Return to My {user.role} Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check approved voter requirement (specifically for ballot voting)
  if (requireApproved && user.role === 'VOTER' && user.account_status !== 'APPROVED') {
    return <Navigate to="/voter/verification" replace />;
  }

  return children;
};

export default ProtectedRoute;
