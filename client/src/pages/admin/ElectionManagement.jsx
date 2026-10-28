import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Vote,
  PlusCircle,
  Play,
  Pause,
  StopCircle,
  FileCheck,
  Award,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

const ElectionManagement = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchElections = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/elections');
      if (res.success) {
        setElections(res.elections || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handleAction = async (electionId, actionEndpoint, actionName) => {
    if (!window.confirm(`Are you sure you want to execute [${actionName}] for this election?`)) {
      return;
    }

    setError('');
    setMessage('');
    setActionLoading(`${electionId}-${actionEndpoint}`);

    try {
      const res = await api.post(`/admin/elections/${electionId}/${actionEndpoint}`);
      setMessage(res.message || `Action ${actionName} executed successfully.`);
      await fetchElections();
    } catch (err) {
      setError(err.message || `Failed to execute ${actionName}.`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout
      title="Election Lifecycle & Polling Operations"
      subtitle="Complete Administrative Control for Campus Polls, Nominations & Tally"
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-900">Elections Registry</h3>
            <p className="text-xs text-slate-500">
              Control the official lifecycle transitions under university statutes.
            </p>
          </div>
          <Link
            to="/admin/elections/new"
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Create New Election</span>
          </Link>
        </div>

        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Elections Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <LoadingSpinner text="Loading Elections..." />
          ) : elections.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No elections configured yet. Click "Create New Election" above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="p-3.5">Election Details</th>
                    <th className="p-3.5">Current Status</th>
                    <th className="p-3.5">Key Dates</th>
                    <th className="p-3.5">Positions & Nominees</th>
                    <th className="p-3.5">Ballots Cast</th>
                    <th className="p-3.5 text-right">Lifecycle Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {elections.map((el) => {
                    const isBusy = actionLoading && actionLoading.startsWith(String(el.id));

                    return (
                      <tr key={el.id} className="hover:bg-slate-50 transition-colors">
                        {/* Title & Type */}
                        <td className="p-3.5 max-w-xs">
                          <h4 className="font-bold text-slate-900 text-sm">{el.title}</h4>
                          <p className="text-slate-500 text-[11px] mt-0.5">{el.election_type}</p>
                          <span className="inline-block mt-1 text-[10px] bg-slate-200 text-slate-700 font-semibold px-1.5 py-0.5 rounded">
                            {el.scope} • {el.academic_year}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          <StatusBadge status={el.status} size="sm" />
                          {el.is_results_published ? (
                            <span className="block mt-1 text-[10px] text-emerald-700 font-bold">
                              ✓ Results Declared
                            </span>
                          ) : (
                            <span className="block mt-1 text-[10px] text-slate-400">
                              Results Unpublished
                            </span>
                          )}
                        </td>

                        {/* Dates */}
                        <td className="p-3.5 space-y-0.5 text-slate-600 font-mono text-[11px]">
                          <div>App Deadline: {new Date(el.application_deadline).toLocaleDateString()}</div>
                          <div>Start: {new Date(el.start_at).toLocaleDateString()}</div>
                          <div>End: {new Date(el.end_at).toLocaleDateString()}</div>
                        </td>

                        {/* Stats */}
                        <td className="p-3.5 text-slate-700">
                          <p><strong>{el.positions?.length || 1}</strong> Contested Positions</p>
                          <p className="text-emerald-700 font-semibold">
                            <strong>{el.approved_candidates_count || 0}</strong> Approved Nominees
                          </p>
                        </td>

                        {/* Ballots */}
                        <td className="p-3.5 font-bold text-slate-900">
                          {el.total_votes || 0}
                        </td>

                        {/* Action Buttons */}
                        <td className="p-3.5 text-right space-y-1">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            {/* Draft or Upcoming -> Open Applications */}
                            {(el.status === 'DRAFT' || el.status === 'UPCOMING') && (
                              <button
                                disabled={isBusy}
                                onClick={() => handleAction(el.id, 'open-applications', 'Open Nominations')}
                                className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-[11px] font-bold"
                              >
                                Open Nominations
                              </button>
                            )}

                            {/* Open Applications -> Close Applications */}
                            {el.status === 'APPLICATION_OPEN' && (
                              <button
                                disabled={isBusy}
                                onClick={() => handleAction(el.id, 'close-applications', 'Close Nominations')}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-bold"
                              >
                                Close Nominations
                              </button>
                            )}

                            {/* Scheduled / Closed -> Start Voting */}
                            {(el.status === 'APPLICATION_CLOSED' || el.status === 'UPCOMING') && (
                              <button
                                disabled={isBusy}
                                onClick={() => handleAction(el.id, 'start', 'Open Polls')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center space-x-1"
                              >
                                <Play className="w-3 h-3" />
                                <span>Start Voting</span>
                              </button>
                            )}

                            {/* Active -> Pause or Stop */}
                            {el.status === 'ACTIVE' && (
                              <>
                                <button
                                  disabled={isBusy}
                                  onClick={() => handleAction(el.id, 'pause', 'Pause Polls')}
                                  className="px-2.5 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-[11px] font-bold flex items-center space-x-1"
                                >
                                  <Pause className="w-3 h-3" />
                                  <span>Pause</span>
                                </button>
                                <button
                                  disabled={isBusy}
                                  onClick={() => handleAction(el.id, 'stop', 'Stop & Close Polls')}
                                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold flex items-center space-x-1"
                                >
                                  <StopCircle className="w-3 h-3" />
                                  <span>Close Polls</span>
                                </button>
                              </>
                            )}

                            {/* Paused -> Resume or Stop */}
                            {el.status === 'PAUSED' && (
                              <>
                                <button
                                  disabled={isBusy}
                                  onClick={() => handleAction(el.id, 'resume', 'Resume Polls')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold"
                                >
                                  Resume Voting
                                </button>
                                <button
                                  disabled={isBusy}
                                  onClick={() => handleAction(el.id, 'stop', 'Stop & Close Polls')}
                                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold"
                                >
                                  Close Polls
                                </button>
                              </>
                            )}

                            {/* Completed -> Publish Results or View Certificate */}
                            {el.status === 'COMPLETED' && (
                              <Link
                                to={`/admin/results?electionId=${el.id}`}
                                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-[11px] flex items-center space-x-1"
                              >
                                <Award className="w-3 h-3" />
                                <span>{el.is_results_published ? 'View Results' : 'Review & Publish'}</span>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ElectionManagement;

