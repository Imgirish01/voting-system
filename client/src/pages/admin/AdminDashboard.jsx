import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Users,
  UserCheck,
  Vote,
  Award,
  Clock,
  PlusCircle,
  FileCheck,
  Activity,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Play,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [voterApplications, setVoterApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, voterRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/voter-applications'),
      ]);

      if (statsRes.success) {
        setStats(statsRes.stats);
        setRecentActivities(statsRes.recentActivities || []);
      }

      if (voterRes.success) {
        setVoterApplications(voterRes.applications || []);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 1-Click Fast Approval directly from Dashboard
  const handleDirectApprove = async (appId, voterName) => {
    setApprovingId(appId);
    setActionMessage('');
    try {
      const res = await api.patch(`/admin/voter-applications/${appId}/review`, {
        status: 'APPROVED',
      });
      setActionMessage(`✓ Elector "${voterName}" approved successfully! They can now vote on EVM.`);
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setApprovingId(null);
    }
  };

  // 1-Click Fast Approve All Pending
  const handleApproveAllPending = async () => {
    const pending = voterApplications.filter((a) => a.application_status === 'PENDING');
    if (pending.length === 0) return;

    setApprovingId('ALL');
    setActionMessage('');
    try {
      for (const app of pending) {
        await api.patch(`/admin/voter-applications/${app.id}/review`, {
          status: 'APPROVED',
        });
      }
      setActionMessage(`✓ All ${pending.length} pending voters have been approved and granted franchise!`);
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Chief Election Officer Administration Desk">
        <LoadingSpinner text="Compiling Electoral Statistics & Applications..." />
      </DashboardLayout>
    );
  }

  const pendingVoters = voterApplications.filter((a) => a.application_status === 'PENDING');

  return (
    <DashboardLayout
      title="Chief Election Officer Administration Desk"
      subtitle="Comprehensive ECI Governance, Scrutiny & Polling Control Room"
    >
      <div className="space-y-6">
        {/* Quick Action Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SYSTEM STATUS: <strong>OPERATIONAL • ALL ENGINES ONLINE</strong></span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/elections/new"
              className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Create New Election</span>
            </Link>
            <Link
              to="/admin/voter-applications"
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow"
            >
              <UserCheck className="w-4 h-4" />
              <span>Full Voter Scrutiny ({pendingVoters.length})</span>
            </Link>
            <Link
              to="/admin/candidate-applications"
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Scrutinize Nominees ({stats?.pendingCandApps || 0})</span>
            </Link>
          </div>
        </div>

        {/* Global Action Banner */}
        {actionMessage && (
          <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-xl text-emerald-950 text-xs flex items-center space-x-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-bold">{actionMessage}</span>
          </div>
        )}

        {/* Primary Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Verified Electors
              </p>
              <h3 className="text-2xl font-extrabold text-blue-950 mt-1">
                {stats?.verifiedVoters || 0}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Out of {stats?.totalUsers || 0} registered
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Pending Form 6-C
              </p>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">
                {pendingVoters.length}
              </h3>
              <Link to="/admin/voter-applications" className="text-[11px] text-amber-700 font-bold hover:underline">
                Awaiting Scrutiny →
              </Link>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Active Polls Live
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
                {stats?.activeElections || 0}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Total {stats?.totalElections || 0} elections
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Vote className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Total Ballots Cast
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {stats?.totalVotesCast || 0}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                Cryptographically Sealed
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* PROMINENT SECTION: Newly Registered Voters & Instant Scrutiny Desk */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-amber-500/80 overflow-hidden">
          <div className="bg-[#082545] text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-amber-500">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shadow">
                6-C
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  Registered Elector Applications (Form 6-C Scrutiny Queue)
                </h3>
                <p className="text-xs text-slate-300">
                  Newest applicants appear here immediately. Click "Approve" to instantly grant EVM voting rights.
                </p>
              </div>
            </div>

            {pendingVoters.length > 0 && (
              <button
                type="button"
                disabled={approvingId === 'ALL'}
                onClick={handleApproveAllPending}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow flex items-center space-x-1.5 transition-all active:scale-95 flex-shrink-0"
              >
                <Check className="w-4 h-4" />
                <span>
                  {approvingId === 'ALL' ? 'Approving All...' : `Approve All (${pendingVoters.length}) Pending`}
                </span>
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-200">
            {voterApplications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No voter registration applications found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="p-3">Elector Details</th>
                      <th className="p-3">College Roll / Reg No</th>
                      <th className="p-3">Department & Course</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Quick Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {voterApplications.slice(0, 10).map((app) => {
                      const isPending = app.application_status === 'PENDING';
                      const isApproved = app.application_status === 'APPROVED';

                      return (
                        <tr key={app.id} className="hover:bg-amber-50/40 transition-colors">
                          <td className="p-3">
                            <span className="font-bold text-slate-900 text-sm block">{app.full_name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{app.email}</span>
                          </td>

                          <td className="p-3 font-mono font-bold text-blue-900 text-xs">
                            {app.college_registration_number || app.student_id_number}
                          </td>

                          <td className="p-3 text-slate-600 text-[11px]">
                            {app.department_name} • {app.course}
                          </td>

                          <td className="p-3">
                            <StatusBadge status={app.application_status} size="sm" />
                          </td>

                          <td className="p-3 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  type="button"
                                  disabled={approvingId === app.id}
                                  onClick={() => handleDirectApprove(app.id, app.full_name)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow flex items-center space-x-1 active:scale-95 transition-all"
                                  title="Approve voter & grant voting franchise"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{approvingId === app.id ? 'Approving...' : 'Approve'}</span>
                                </button>

                                <Link
                                  to="/admin/voter-applications"
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                                >
                                  Details
                                </Link>
                              </div>
                            ) : isApproved ? (
                              <span className="inline-flex items-center text-emerald-700 font-bold text-xs">
                                <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                                Franchise Active
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs font-semibold">
                                {app.application_status}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>Showing recent applications (Sorted newest first)</span>
            <Link
              to="/admin/voter-applications"
              className="font-bold text-blue-900 hover:text-amber-600 flex items-center"
            >
              <span>Open Complete Voter Scrutiny Section →</span>
            </Link>
          </div>
        </div>

        {/* Audit Trail Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-900" />
              <h3 className="text-base font-bold text-slate-900">
                Official Electoral Audit Trail & Recent Commission Actions
              </h3>
            </div>
            <Link to="/admin/audit-logs" className="text-xs font-bold text-blue-900 hover:text-amber-600 flex items-center">
              <span>View Full Immutable Log</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentActivities.slice(0, 6).map((act) => (
              <div key={act.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-blue-950 font-mono px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[10px]">
                      {act.action}
                    </span>
                    <span className="text-slate-500 text-[11px]">{act.details}</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                  {new Date(act.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
