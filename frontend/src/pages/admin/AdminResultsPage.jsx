import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Award,
  BarChart3,
  Printer,
  CheckCircle2,
  AlertCircle,
  Users,
  ShieldCheck,
  TrendingUp,
  Percent,
} from 'lucide-react';

const AdminResultsPage = () => {
  const [searchParams] = useSearchParams();
  const initialElectionId = searchParams.get('electionId') || '';

  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState(initialElectionId);
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch elections list
  useEffect(() => {
    const fetchElections = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/elections');
        if (res.success) {
          const all = res.elections || [];
          setElections(all);
          if (!selectedElectionId && all.length > 0) {
            setSelectedElectionId(String(all[0].id));
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, []);

  // Fetch results when election selected
  const fetchResults = async (id) => {
    if (!id) return;
    setResultsLoading(true);
    setError('');
    try {
      const res = await api.get(`/admin/elections/${id}/results`);
      if (res.success) {
        setResultsData(res.results);
      }
    } catch (err) {
      setError(err.message);
      setResultsData(null);
    } finally {
      setResultsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedElectionId) {
      fetchResults(selectedElectionId);
    }
  }, [selectedElectionId]);

  const handlePublishResults = async () => {
    if (!selectedElectionId) return;
    if (!window.confirm('Are you sure you want to officially CERTIFY and PUBLISH the results? This will make the final tally visible to all voters and candidates across the portal.')) {
      return;
    }

    setPublishing(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post(`/admin/elections/${selectedElectionId}/publish-results`);
      setMessage('Official Election Results published and certified successfully! Voters and Candidates have been notified.');
      await fetchResults(selectedElectionId);
    } catch (err) {
      setError(err.message || 'Failed to publish results.');
    } finally {
      setPublishing(false);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const selectedElection = elections.find((e) => String(e.id) === String(selectedElectionId));

  return (
    <DashboardLayout
      title="Official Results & Tally Certification Desk"
      subtitle="Final Vote Tabulation, Margin Calculations & Formal Result Publication"
    >
      <div className="space-y-6">
        {/* Selector Header */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Select Election to Tabulate
            </label>
            <select
              value={selectedElectionId}
              onChange={(e) => setSelectedElectionId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
            >
              {elections.map((el) => (
                <option key={el.id} value={el.id}>
                  {el.title} ({el.status}) {el.is_results_published ? '• [PUBLISHED]' : '• [UNPUBLISHED]'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintCertificate}
              disabled={!resultsData}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Declaration</span>
            </button>

            {selectedElection?.status === 'COMPLETED' && !selectedElection?.is_results_published && (
              <button
                onClick={handlePublishResults}
                disabled={publishing || !resultsData}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow-md flex items-center space-x-1.5"
              >
                <Award className="w-4 h-4" />
                <span>{publishing ? 'Publishing...' : 'CERTIFY & PUBLISH RESULTS'}</span>
              </button>
            )}
          </div>
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

        {/* Results Body */}
        {resultsLoading ? (
          <LoadingSpinner text="Tabulating Electronic Votes..." />
        ) : !resultsData ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            Please choose an election to review the official tabulation.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Turnout Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] text-slate-500 uppercase font-bold">Total Eligible Electors</span>
                <h4 className="text-xl font-extrabold text-slate-900 mt-1">
                  {resultsData.total_eligible_voters}
                </h4>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] text-slate-500 uppercase font-bold">Total Ballots Cast</span>
                <h4 className="text-xl font-extrabold text-blue-900 mt-1">
                  {resultsData.total_votes_cast}
                </h4>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] text-slate-500 uppercase font-bold">Elector Turnout %</span>
                <h4 className="text-xl font-extrabold text-emerald-600 mt-1">
                  {resultsData.overall_turnout_percentage}%
                </h4>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] text-slate-500 uppercase font-bold">Publication Status</span>
                <div className="mt-1">
                  {resultsData.election.is_results_published ? (
                    <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      PUBLISHED TO ELECTORS
                    </span>
                  ) : (
                    <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      RESTRICTED TO ADMIN
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Position Breakdowns */}
            {resultsData.positions.map((pos) => (
              <div key={pos.position_id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-800 text-white p-4 flex flex-wrap items-center justify-between gap-2 border-b-2 border-amber-500">
                  <div>
                    <h4 className="text-base font-bold tracking-tight">
                      {pos.position_name}
                    </h4>
                    <p className="text-xs text-slate-300">
                      Total Valid Votes: <strong>{pos.total_votes}</strong> • Turnout: <strong>{pos.turnout_percentage}%</strong> • Winners Allowed: <strong>{pos.winners_allowed}</strong>
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-amber-500 text-slate-950 px-2.5 py-1 rounded">
                    Tie Policy: {pos.tie_policy}
                  </span>
                </div>

                {/* Candidate Breakdown Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                        <th className="p-3.5">Candidate Name</th>
                        <th className="p-3.5">Department</th>
                        <th className="p-3.5">Symbol</th>
                        <th className="p-3.5">Total Votes</th>
                        <th className="p-3.5">Vote Share %</th>
                        <th className="p-3.5 text-right">Official Outcome</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {pos.candidates.map((cand, idx) => (
                        <tr key={cand.candidate_application_id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900 text-sm">
                            <span className="text-slate-400 mr-2 font-mono text-xs">#{idx + 1}</span>
                            {cand.candidate_name}
                          </td>
                          <td className="p-3.5 text-slate-600 font-medium">
                            {cand.department_name}
                          </td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center space-x-1 font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Award className="w-3 h-3 text-amber-600" />
                              <span>{cand.symbol_name || 'Torch'}</span>
                            </span>
                          </td>
                          <td className="p-3.5 font-extrabold text-base text-blue-900">
                            {cand.vote_count}
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-blue-900 h-2 rounded-full"
                                  style={{ width: `${cand.vote_percentage}%` }}
                                ></div>
                              </div>
                              <span className="font-bold text-slate-800">{cand.vote_percentage}%</span>
                            </div>
                          </td>
                          <td className="p-3.5 text-right">
                            <StatusBadge status={cand.outcome} size="sm" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminResultsPage;

