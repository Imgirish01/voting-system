import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Award, CheckCircle2, XCircle, Lock, Percent, Users } from 'lucide-react';

const CandidateResultsPage = () => {
  const [resultsList, setResultsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await api.get('/candidates/results');
        if (res.success) {
          setResultsList(res.results || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <DashboardLayout
      title="Candidate Election Results & Declarations"
      subtitle="Official Certified Tally & Electoral Outcome for Contested Posts"
    >
      <div className="space-y-6">
        {loading ? (
          <LoadingSpinner text="Retrieving Candidate Results..." />
        ) : resultsList.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-slate-500 text-sm border border-slate-200">
            No election results found for your nominations.
          </div>
        ) : (
          <div className="space-y-6">
            {resultsList.map((res, idx) => {
              if (!res.is_results_published) {
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-8 text-center border-2 border-slate-200 shadow-sm space-y-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 mx-auto flex items-center justify-center border border-amber-200">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-base text-slate-900">{res.election_title}</h4>
                    <p className="text-xs text-slate-500">Contested Post: {res.position_name}</p>
                    <p className="text-xs text-amber-900 bg-amber-50 p-3 rounded-lg border border-amber-200 max-w-lg mx-auto">
                      "Official results have not been declared yet. The administrator will publish certified results after voting closes."
                    </p>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  <div className="bg-[#082545] text-white p-5 border-b-2 border-amber-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30">
                        OFFICIAL CERTIFIED TALLY
                      </span>
                      <h3 className="text-lg font-bold mt-1">{res.election_title}</h3>
                      <p className="text-xs text-slate-300">Contested Office: <strong>{res.position_name}</strong></p>
                    </div>

                    <div className="text-right">
                      <StatusBadge status={res.outcome} size="lg" />
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50/50">
                    <div className="p-4 bg-white rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 uppercase font-bold">Your Vote Total</span>
                      <h4 className="text-2xl font-black text-blue-900 mt-1 font-mono">{res.my_vote_count}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Out of {res.total_position_votes} valid votes</p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 uppercase font-bold">Your Vote Share %</span>
                      <h4 className="text-2xl font-black text-emerald-600 mt-1 font-mono">{res.my_vote_percentage}%</h4>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full"
                          style={{ width: `${res.my_vote_percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 uppercase font-bold">Declared Winner</span>
                      <h4 className="text-base font-bold text-slate-900 mt-1">{res.winning_candidate_name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">Secured {res.winning_vote_count} votes</p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 uppercase font-bold">Declaration Date</span>
                      <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                        {new Date(res.published_at).toLocaleDateString()}
                      </p>
                      <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                        Turnout: {res.position_turnout}%
                      </span>
                    </div>
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

export default CandidateResultsPage;

