import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [], requireApproved = false }) => {
  const { user, loading, switchToRole } = useAuth();
  const location = useLocation();
  const [autoSwitching, setAutoSwitching] = useState(false);

  const needsRoleSwitch =
    !loading && user && allowedRoles.length > 0 && !allowedRoles.includes(user.role);

  useEffect(() => {
    if (needsRoleSwitch && !autoSwitching) {
      setAutoSwitching(true);
      const targetRole = allowedRoles[0];
      switchToRole(targetRole)
        .catch(console.error)
        .finally(() => setAutoSwitching(false));
    }
  }, [needsRoleSwitch, autoSwitching, allowedRoles, switchToRole]);

  if (loading || autoSwitching) {
    const target = allowedRoles[0] || 'Portal';
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner text={`Switching to ${target} Panel automatically...`} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (needsRoleSwitch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner text={`Switching to ${allowedRoles[0]} Panel automatically...`} />
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
