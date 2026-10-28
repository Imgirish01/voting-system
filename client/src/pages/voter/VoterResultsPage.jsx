import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Award,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Lock,
  Printer,
  ChevronRight,
} from 'lucide-react';

const VoterResultsPage = () => {
  const [publishedElections, setPublishedElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublished = async () => {
      try {
        setLoading(true);
        const res = await api.get('/voters/results');
        if (res.success) {
          setPublishedElections(res.elections || []);
        }
      } catch (err) {
        console.error('Failed to load published results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublished();
  }, []);

  return (
    <DashboardLayout
      title="Official Certified Election Results (परिणाम एवं रुझान)"
      subtitle="Statutory Result Declarations Certified by the Chief Election Officer"
    >
      <div className="space-y-6">
        {loading ? (
          <LoadingSpinner text="Retrieving Certified Results..." />
        ) : publishedElections.length === 0 ? (
          /* When results are not yet available */
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-slate-200 shadow-sm space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 mx-auto flex items-center justify-center border-2 border-amber-200 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Official Results Awaiting Certification
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                "Results are not yet available. The administrator will publish the official results after voting closes."
              </p>
            </div>
            <p className="text-xs text-slate-400">
              The Chief Election Officer conducts the formal vote audit in the presence of election observers before publishing the certified tally.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {publishedElections.map((resultObj) => {
              const el = resultObj.election;

              return (
                <div
                  key={el.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  {/* Election Header */}
                  <div className="bg-[#082545] text-white p-5 border-b-2 border-amber-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30">
                          CERTIFIED OFFICIAL RESULT
                        </span>
                        <span className="text-xs text-slate-300 font-mono">{el.academic_year}</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold mt-1">{el.title}</h3>
                      <p className="text-xs text-slate-300 mt-0.5 font-mono">
                        Published on: {new Date(el.results_published_at || Date.now()).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-slate-300 block">Total Ballots Cast</span>
                      <span className="text-xl font-extrabold text-amber-400 font-mono">
                        {resultObj.total_votes_cast}
                      </span>
                    </div>
                  </div>

                  {/* Position Results */}
                  <div className="p-6 space-y-6">
                    {resultObj.positions.map((pos) => (
                      <div
                        key={pos.position_id}
                        className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/50"
                      >
                        <div className="p-4 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            Position: <span className="text-blue-900">{pos.position_name}</span>
                          </h4>
                          <span className="text-xs text-slate-600 font-semibold">
                            Total Valid Votes: <strong>{pos.total_votes}</strong> • Turnout: <strong>{pos.turnout_percentage}%</strong>
                          </span>
                        </div>

                        {/* Candidates Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-200/60 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                                <th className="p-3">Rank & Candidate</th>
                                <th className="p-3">Department</th>
                                <th className="p-3">Symbol</th>
                                <th className="p-3">Votes Cast</th>
                                <th className="p-3">Percentage Share</th>
                                <th className="p-3 text-right">Electoral Outcome</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {pos.candidates.map((cand, idx) => (
                                <tr
                                  key={cand.candidate_application_id}
                                  className={`transition-colors ${
                                    cand.outcome === 'WON' ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-white'
                                  }`}
                                >
                                  <td className="p-3 font-bold text-slate-900">
                                    <span className="text-slate-400 mr-2 font-mono">#{idx + 1}</span>
                                    {cand.candidate_name}
                                  </td>
                                  <td className="p-3 text-slate-600">{cand.department_name}</td>
                                  <td className="p-3">
                                    <span className="inline-flex items-center space-x-1 font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                                      <Award className="w-3 h-3 text-amber-600" />
                                      <span>{cand.symbol_name || 'Torch'}</span>
                                    </span>
                                  </td>
                                  <td className="p-3 font-extrabold text-sm text-blue-900 font-mono">
                                    {cand.vote_count}
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
                                        <div
                                          className={`h-2 rounded-full ${
                                            cand.outcome === 'WON' ? 'bg-emerald-600' : 'bg-blue-900'
                                          }`}
                                          style={{ width: `${cand.vote_percentage}%` }}
                                        ></div>
                                      </div>
                                      <span className="font-bold text-slate-800">{cand.vote_percentage}%</span>
                                    </div>
                                  </td>
                                  <td className="p-3 text-right">
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VoterResultsPage;

