import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  UserCheck,
  Search,
  CheckCircle2,
  XCircle,
  Ban,
  AlertCircle,
  Check,
  Sparkles,
} from 'lucide-react';

const VoterVerificationPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Review modal state
  const [reviewModalApp, setReviewModalApp] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [directApprovingId, setDirectApprovingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/voter-applications');
      if (res.success) {
        setApplications(res.applications || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // 1-Click Direct Approval
  const handleDirectApprove = async (appId, voterName) => {
    setDirectApprovingId(appId);
    setError('');
    setMessage('');
    try {
      const res = await api.patch(`/admin/voter-applications/${appId}/review`, {
        status: 'APPROVED',
      });
      setMessage(`✓ Elector "${voterName}" approved successfully! Active franchise granted.`);
      await fetchApplications();
    } catch (err) {
      setError(err.message || 'Failed to approve voter.');
    } finally {
      setDirectApprovingId(null);
    }
  };

  // 1-Click Approve All Pending
  const handleApproveAll = async () => {
    const pendingList = applications.filter((a) => a.application_status === 'PENDING');
    if (pendingList.length === 0) return;

    setDirectApprovingId('ALL');
    setError('');
    setMessage('');
    try {
      for (const a of pendingList) {
        await api.patch(`/admin/voter-applications/${a.id}/review`, {
          status: 'APPROVED',
        });
      }
      setMessage(`✓ All ${pendingList.length} pending voters have been approved!`);
      await fetchApplications();
    } catch (err) {
      setError(err.message || 'Failed to approve all voters.');
    } finally {
      setDirectApprovingId(null);
    }
  };

  const openActionModal = (app, status) => {
    setReviewModalApp(app);
    setTargetStatus(status);
    setRejectionReason(
      status === 'REJECTED'
        ? 'Uploaded ID proof is blurred or does not match institutional student directory.'
        : ''
    );
    setError('');
  };

  const handleConfirmReview = async () => {
    if (!reviewModalApp || !targetStatus) return;

    if (targetStatus === 'REJECTED' && !rejectionReason.trim()) {
      setError('Please provide a specific rejection reason for the student elector.');
      return;
    }

    setActionLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.patch(`/admin/voter-applications/${reviewModalApp.id}/review`, {
        status: targetStatus,
        rejection_reason: rejectionReason,
      });

      setMessage(res.message || `Application updated to ${targetStatus}`);
      setReviewModalApp(null);
      await fetchApplications();
    } catch (err) {
      setError(err.message || 'Failed to update application.');
    } finally {
      setActionLoading(false);
    }
  };

  // Real-time client-side filtering
  const filteredApplications = applications.filter((app) => {
    const matchesStatus = statusFilter === 'ALL' || app.application_status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (app.full_name && app.full_name.toLowerCase().includes(q)) ||
      (app.college_registration_number && app.college_registration_number.toLowerCase().includes(q)) ||
      (app.email && app.email.toLowerCase().includes(q)) ||
      (app.department_name && app.department_name.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const pendingCount = applications.filter((a) => a.application_status === 'PENDING').length;

  return (
    <DashboardLayout
      title="Voter Scrutiny & Verification Desk (Form 6-C)"
      subtitle="Electoral Roll Scrutiny under Chief Election Officer Supervision"
    >
      <div className="space-y-6">
        {/* Filters & Instant Live Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-bold mr-1">Status:</span>
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1 ${
                  statusFilter === st
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{st}</span>
                {st === 'PENDING' && pendingCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] flex items-center justify-center font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {pendingCount > 0 && (
              <button
                type="button"
                disabled={directApprovingId === 'ALL'}
                onClick={handleApproveAll}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow flex items-center space-x-1.5 active:scale-95 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve All Pending ({pendingCount})</span>
              </button>
            )}

            {/* Live Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Instant filter by Name, Roll No..."
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none w-56 sm:w-64"
              />
            </div>
          </div>
        </div>

        {message && (
          <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-xl text-emerald-950 text-xs flex items-center space-x-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-bold">{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-xl text-red-950 text-xs flex items-center space-x-2 shadow-xs">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {/* Voter Applications Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <LoadingSpinner text="Retrieving Voter Applications..." />
          ) : filteredApplications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No voter applications matching the current criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="p-3.5">Elector Name & Reg No</th>
                    <th className="p-3.5">Department & Course</th>
                    <th className="p-3.5">Application Date</th>
                    <th className="p-3.5">Verification Details</th>
                    <th className="p-3.5">Scrutiny Status</th>
                    <th className="p-3.5 text-right">Scrutiny Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-amber-50/30 transition-colors">
                      {/* Name & Reg */}
                      <td className="p-3.5">
                        <h4 className="font-bold text-slate-900 text-sm">{app.full_name}</h4>
                        <p className="text-slate-500 font-mono text-[11px] font-bold text-blue-900">
                          {app.college_registration_number || app.student_id_number}
                        </p>
                        <p className="text-slate-400 text-[11px] truncate max-w-[180px]">{app.email}</p>
                      </td>

                      {/* Dept & Course */}
                      <td className="p-3.5 text-slate-700">
                        <p className="font-semibold">{app.department_name}</p>
                        <p className="text-slate-500 text-[11px]">{app.course} ({app.academic_year})</p>
                      </td>

                      {/* Date */}
                      <td className="p-3.5 text-slate-600 font-mono text-[11px]">
                        {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : 'Recent'}
                      </td>

                      {/* Verification Details */}
                      <td className="p-3.5 text-slate-700 max-w-xs">
                        <p className="font-medium">{app.id_proof_type || 'College Identity Card'}</p>
                        {app.rejection_reason && (
                          <div className="mt-1 p-1.5 bg-red-50 text-red-700 rounded border border-red-200 text-[10px]">
                            <strong>Reason:</strong> {app.rejection_reason}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <StatusBadge status={app.application_status} size="sm" />
                        {app.reviewer_name && (
                          <span className="block mt-1 text-[10px] text-slate-400">
                            By {app.reviewer_name}
                          </span>
                        )}
                      </td>

                      {/* 1-Click Fast Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {app.application_status !== 'APPROVED' && (
                            <button
                              type="button"
                              disabled={directApprovingId === app.id}
                              onClick={() => handleDirectApprove(app.id, app.full_name)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow active:scale-95 transition-all"
                              title="1-Click Approve"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{directApprovingId === app.id ? 'Approving...' : 'Approve'}</span>
                            </button>
                          )}

                          {app.application_status !== 'REJECTED' && (
                            <button
                              type="button"
                              onClick={() => openActionModal(app, 'REJECTED')}
                              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow active:scale-95 transition-all"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}

                          {app.application_status === 'APPROVED' && (
                            <button
                              type="button"
                              onClick={() => openActionModal(app, 'SUSPENDED')}
                              className="px-2.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow active:scale-95 transition-all"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Suspend</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rejection / Suspension Modal */}
        {reviewModalApp && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-4 border-slate-700 overflow-hidden animate-in zoom-in-95">
              <div className="bg-[#082545] text-white p-4 flex items-center justify-between border-b border-amber-500">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-sm uppercase">
                    VOTER SCRUTINY ORDER: {targetStatus}
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs space-y-1">
                  <p><strong>Elector Name:</strong> {reviewModalApp.full_name}</p>
                  <p><strong>Registration No:</strong> {reviewModalApp.college_registration_number}</p>
                  <p><strong>Department:</strong> {reviewModalApp.department_name}</p>
                </div>

                {targetStatus === 'REJECTED' && (
                  <div>
                    <label className="block text-xs font-bold text-red-700 uppercase mb-1">
                      Statutory Reason for Rejection (Visible to Student) *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Specify reason..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                )}

                {targetStatus === 'SUSPENDED' && (
                  <p className="text-xs text-red-600 leading-relaxed">
                    Suspending this account will block the user from casting ballots in any active elections.
                  </p>
                )}
              </div>

              <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setReviewModalApp(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmReview}
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow"
                >
                  {actionLoading ? 'Executing Order...' : `Confirm ${targetStatus}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VoterVerificationPage;
