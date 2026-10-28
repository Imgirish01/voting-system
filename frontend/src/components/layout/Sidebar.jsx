import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Vote,
  PlusCircle,
  UserCheck,
  Users,
  Award,
  FileText,
  Shield,
  Bell,
  CreditCard,
  History,
  CheckCircle,
  HelpCircle,
  Repeat,
} from 'lucide-react';

const Sidebar = () => {
  const { user, switchToRole, cycleToNextRole } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const role = user.role;

  // Nav configurations
  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard Overview' },
    { to: '/admin/elections', icon: Vote, label: 'Elections Management' },
    { to: '/admin/elections/new', icon: PlusCircle, label: 'Create New Election' },
    { to: '/admin/voter-applications', icon: UserCheck, label: 'Voter Scrutiny (Form 6-C)' },
    { to: '/admin/candidate-applications', icon: Users, label: 'Candidate Nominations (2-B)' },
    { to: '/admin/results', icon: Award, label: 'Results & Certification' },
    { to: '/admin/audit-logs', icon: History, label: 'Audit & Integrity Logs' },
  ];

  const voterLinks = [
    { to: '/voter/dashboard', icon: LayoutDashboard, label: 'Elector Dashboard' },
    { to: '/voter/digital-epic', icon: CreditCard, label: 'Digital E-EPIC Card' },
    { to: '/voter/verification', icon: UserCheck, label: 'Voter Status / Form 6-C' },
    { to: '/voter/elections', icon: Vote, label: 'Active Polls & Ballot' },
    { to: '/voter/results', icon: Award, label: 'Declared Results' },
    { to: '/voter/notifications', icon: Bell, label: 'ECI Notifications' },
  ];

  const candidateLinks = [
    { to: '/candidate/dashboard', icon: LayoutDashboard, label: 'Nominee Dashboard' },
    { to: '/candidate/apply', icon: PlusCircle, label: 'File Nomination (Form 2-B)' },
    { to: '/candidate/my-applications', icon: FileText, label: 'My Nominations' },
    { to: '/candidate/results', icon: Award, label: 'Official Result Declarations' },
  ];

  const links = role === 'ADMIN' ? adminLinks : role === 'CANDIDATE' ? candidateLinks : voterLinks;

  const roleHeaderColors = {
    ADMIN: 'from-blue-900 to-indigo-950 text-amber-300 border-amber-500',
    VOTER: 'from-[#082545] to-slate-900 text-amber-300 border-emerald-500',
    CANDIDATE: 'from-amber-950 to-slate-900 text-amber-300 border-amber-500',
  }[role] || 'from-slate-900 to-slate-950 text-white border-amber-500';

  return (
    <aside className="w-full lg:w-64 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6 lg:mb-0 flex-shrink-0">
      {/* Role Profile Badge */}
      <div className={`p-4 bg-gradient-to-r ${roleHeaderColors} border-b-2`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-base shadow">
            {user.full_name ? user.full_name.charAt(0) : 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-white truncate">{user.full_name}</h4>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/20 text-white">
                {role} DESK
              </span>
              <span className="text-[10px] text-slate-300 truncate font-mono">
                {user.college_registration_number || user.email}
              </span>
            </div>
          </div>
        </div>

        {/* Voter Verification Chip */}
        {role === 'VOTER' && (
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-300 text-[11px]">Elector Status:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                user.account_status === 'APPROVED'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                  : user.account_status === 'PENDING'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                  : 'bg-red-500/20 text-red-300 border border-red-400/40'
              }`}
            >
              {user.account_status}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin/dashboard' || link.to === '/voter/dashboard' || link.to === '/candidate/dashboard'}
              className={({ isActive }) =>
                `flex items-center px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* 1-Click Instant Panel Switcher */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Instant Panel Switch
          </span>
          <button
            type="button"
            onClick={async () => {
              const { dashboard } = await cycleToNextRole();
              navigate(dashboard);
            }}
            className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center cursor-pointer"
            title="Automatically switch to next panel"
          >
            <Repeat className="w-3 h-3 mr-0.5" /> Next ➔
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1 text-[11px]">
          {[
            { role: 'ADMIN', label: 'Admin', to: '/admin/dashboard' },
            { role: 'VOTER', label: 'Voter', to: '/voter/dashboard' },
            { role: 'CANDIDATE', label: 'Candidate', to: '/candidate/dashboard' },
          ].map((item) => {
            const isCurrent = user?.role === item.role;
            return (
              <button
                key={item.role}
                type="button"
                onClick={async () => {
                  const creds = await switchToRole(item.role);
                  navigate(creds.dashboard);
                }}
                className={`py-1.5 px-1 rounded-md font-bold text-center transition-all cursor-pointer truncate ${
                  isCurrent
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Official Statutory Footnote in Sidebar */}
      <div className="p-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500">
        <p className="flex items-center font-medium text-slate-700">
          <Shield className="w-3.5 h-3.5 mr-1 text-blue-900" />
          ECI Official E-Governance
        </p>
        <p className="mt-0.5 text-[10px] text-slate-500">
          All transactions are logged with digital audit seals.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;

