import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Award,
  BookOpen,
} from 'lucide-react';

const CandidateReviewPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Scrutiny Modal
  const [activeApp, setActiveApp] = useState(null);
  const [manifestoModalApp, setManifestoModalApp] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/candidate-applications', {
        params: { status: statusFilter, search: searchQuery },
      });
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
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplications();
  };

  const openReviewModal = (app, status) => {
    setActiveApp(app);
    setTargetStatus(status);
    setRejectionReason(status === 'REJECTED' ? 'Academic eligibility criteria not met as per Lyngdoh Committee Section 6.5.' : '');
    setError('');
  };

  const handleConfirmReview = async () => {
    if (!activeApp || !targetStatus) return;

    if (targetStatus === 'REJECTED' && !rejectionReason.trim()) {
      setError('Please provide a valid statutory reason for rejecting candidate nomination.');
      return;
    }

    setActionLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.patch(`/admin/candidate-applications/${activeApp.id}/review`, {
        status: targetStatus,
        rejection_reason: rejectionReason,
      });

      setMessage(res.message || `Candidate nomination status set to ${targetStatus}`);
      setActiveApp(null);
      await fetchApplications();
    } catch (err) {
      setError(err.message || 'Failed to update candidate application.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Candidate Nomination Scrutiny (Form 2-B)"
      subtitle="Statutory Review of Contesting Candidates, Manifestos & Symbols"
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-bold mr-1">Filter:</span>
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Candidate, Post, Reg..."
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none w-52 sm:w-64"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs"
            >
              Filter
            </button>
          </form>
        </div>

        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Nominations Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <LoadingSpinner text="Retrieving Candidate Nominations..." />
          ) : applications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No candidate applications match the selected criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="p-3.5">Candidate & Details</th>
                    <th className="p-3.5">Contested Election & Post</th>
                    <th className="p-3.5">Allotted Symbol</th>
                    <th className="p-3.5">Campaign Manifesto</th>
                    <th className="p-3.5">Scrutiny Status</th>
                    <th className="p-3.5 text-right">Commission Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      {/* Candidate */}
                      <td className="p-3.5">
                        <h4 className="font-bold text-slate-900 text-sm">{app.candidate_name}</h4>
                        <p className="text-slate-500 font-mono text-[11px]">{app.college_registration_number}</p>
                        <p className="text-slate-400 text-[11px]">{app.department_name} ({app.academic_year})</p>
                      </td>

                      {/* Election & Position */}
                      <td className="p-3.5 max-w-xs">
                        <p className="font-bold text-blue-900">{app.position_name}</p>
                        <p className="text-slate-600 text-[11px]">{app.election_title}</p>
                      </td>

                      {/* Symbol */}
                      <td className="p-3.5">
                        <span className="inline-flex items-center space-x-1 font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-300">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span>{app.symbol_name || 'Torch'}</span>
                        </span>
                      </td>

                      {/* Manifesto */}
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => setManifestoModalApp(app)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700 flex items-center space-x-1"
                        >
                          <BookOpen className="w-3 h-3 text-blue-900" />
                          <span>Inspect Manifesto</span>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <StatusBadge status={app.application_status} size="sm" />
                        {app.rejection_reason && (
                          <p className="text-[10px] text-red-600 mt-0.5 line-clamp-1" title={app.rejection_reason}>
                            Reason: {app.rejection_reason}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {app.application_status !== 'APPROVED' && (
                            <button
                              type="button"
                              onClick={() => openReviewModal(app, 'APPROVED')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-xs flex items-center space-x-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                          )}

                          {app.application_status !== 'REJECTED' && (
                            <button
                              type="button"
                              onClick={() => openReviewModal(app, 'REJECTED')}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold shadow-xs flex items-center space-x-1"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Reject</span>
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

        {/* Inspect Manifesto Modal */}
        {manifestoModalApp && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border-4 border-amber-500 overflow-hidden animate-in zoom-in-95">
              <div className="bg-[#082545] text-white p-4 flex items-center justify-between border-b border-amber-500">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-sm uppercase">
                    NOMINEE MANIFESTO & AFFIDAVIT
                  </h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="font-bold text-base text-slate-900">{manifestoModalApp.candidate_name}</h4>
                  <p className="text-xs text-slate-500">Contesting: {manifestoModalApp.position_name} • {manifestoModalApp.election_title}</p>
                </div>
                {manifestoModalApp.biography && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 uppercase mb-1">Candidate Biography</h5>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                      {manifestoModalApp.biography}
                    </p>
                  </div>
                )}
                <div>
                  <h5 className="text-xs font-bold text-slate-700 uppercase mb-1">Electoral Commitments & Manifesto</h5>
                  <div className="text-xs text-slate-800 bg-amber-50/50 p-4 rounded-xl border border-amber-200 whitespace-pre-wrap leading-relaxed font-sans">
                    {manifestoModalApp.manifesto}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-100 border-t border-slate-200 text-right">
                <button
                  type="button"
                  onClick={() => setManifestoModalApp(null)}
                  className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-bold"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review Action Modal */}
        {activeApp && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-4 border-slate-700 overflow-hidden animate-in zoom-in-95">
              <div className="bg-[#082545] text-white p-4 flex items-center justify-between border-b border-amber-500">
                <h3 className="font-bold text-sm uppercase">
                  ORDER ON NOMINATION: {targetStatus}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs space-y-1">
                  <p><strong>Nominee:</strong> {activeApp.candidate_name}</p>
                  <p><strong>Position:</strong> {activeApp.position_name}</p>
                  <p><strong>Symbol:</strong> {activeApp.symbol_name || 'Torch'}</p>
                </div>

                {targetStatus === 'REJECTED' && (
                  <div>
                    <label className="block text-xs font-bold text-red-700 uppercase mb-1">
                      Statutory Reason for Rejection *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Specify Lyngdoh Committee or Academic Grounds..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                )}

                {targetStatus === 'APPROVED' && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Approving this nomination will place this candidate onto the official electronic voting ballot for all verified electors.
                  </p>
                )}
              </div>

              <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setActiveApp(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmReview}
                  className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow ${
                    targetStatus === 'APPROVED'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionLoading ? 'Recording Order...' : `Confirm ${targetStatus}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CandidateReviewPage;

