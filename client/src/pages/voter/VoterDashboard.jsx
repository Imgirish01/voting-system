import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Vote,
  UserCheck,
  Award,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  CreditCard,
  Bell,
  Shield,
} from 'lucide-react';

const VoterDashboard = () => {
  const { user, voterApplication } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        setLoading(true);
        const res = await api.get('/elections');
        if (res.success) {
          setElections(res.elections || []);
        }
      } catch (err) {
        console.error('Failed to load elections:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, []);

  const isApproved = user?.account_status === 'APPROVED';
  const isPending = user?.account_status === 'PENDING';
  const isRejected = user?.account_status === 'REJECTED';
  const isSuspended = user?.account_status === 'SUSPENDED';

  const activeElections = elections.filter((e) => e.status === 'ACTIVE');
  const upcomingElections = elections.filter((e) => e.status === 'UPCOMING' || e.status === 'APPLICATION_OPEN');
  const publishedElections = elections.filter((e) => e.is_results_published);

  return (
    <DashboardLayout
      title="Elector Dashboard (मतदाता पोर्टल)"
      subtitle="Statutory Student Elector Portal • Exercise Your Sovereign Right to Vote"
    >
      <div className="space-y-6">
        {/* Verification Status Banner */}
        {isPending && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm sm:text-base">
                  Voter Verification Application Pending Scrutiny (Form 6-C)
                </h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  "Your voter verification application has been submitted. You can participate in eligible elections after the administrator approves your application."
                </p>
              </div>
            </div>
            <Link
              to="/voter/verification"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow flex-shrink-0 text-center"
            >
              Track Form 6-C Status →
            </Link>
          </div>
        )}

        {isRejected && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 shadow-sm text-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm sm:text-base">
                  Voter Verification Application Rejected
                </h4>
                <p className="text-xs text-red-800 mt-1">
                  The Chief Election Officer could not verify your student credentials. You may rectify your details and resubmit Form 6-C.
                </p>
              </div>
            </div>
            <Link
              to="/voter/verification"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow flex-shrink-0 text-center"
            >
              Rectify & Resubmit →
            </Link>
          </div>
        )}

        {isApproved && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 shadow-sm text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm sm:text-base">
                  Franchise Status: Certified & Verified Elector
                </h4>
                <p className="text-xs text-emerald-800 mt-1">
                  Your voter registration (Form 6-C) is approved. You are qualified to vote in all active campus ballots.
                </p>
              </div>
            </div>
            <Link
              to="/voter/digital-epic"
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg text-xs shadow flex-shrink-0 flex items-center space-x-1.5"
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Download E-EPIC Card</span>
            </Link>
          </div>
        )}

        {/* Quick Elector Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/voter/elections"
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-amber-500 shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <Vote className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                {activeElections.length} Active Polls
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
              Enter Voting Booth (EVM)
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Cast your secret ballot for Student Council positions using the official EVM unit.
            </p>
          </Link>

          <Link
            to="/voter/results"
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-amber-500 shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                {publishedElections.length} Certified
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
              Election Results & Trends
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              View official certified declarations, candidate vote shares, and winning margins.
            </p>
          </Link>

          <Link
            to="/voter/digital-epic"
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-amber-500 shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                ECI E-EPIC
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
              Digital E-EPIC Voter Card
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Inspect and print your institutional digital voter credential with security hologram.
            </p>
          </Link>
        </div>

        {/* Active Polls Roster */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <h3 className="font-bold text-slate-900 text-base">
                Active Campus Elections Ready for Balloting
              </h3>
            </div>
            <Link to="/voter/elections" className="text-xs font-bold text-blue-900 hover:text-amber-600 flex items-center">
              <span>View All Elections</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {loading ? (
              <LoadingSpinner text="Checking Active Ballot Units..." />
            ) : activeElections.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                No active elections are currently open for voting. Check the schedule below.
              </div>
            ) : (
              activeElections.map((election) => (
                <div
                  key={election.id}
                  className="p-4 sm:p-5 rounded-xl border-2 border-emerald-300 bg-emerald-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={election.status} size="sm" />
                      <span className="text-xs font-mono text-slate-500">{election.academic_year}</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">{election.title}</h4>
                    <p className="text-xs text-slate-600 max-w-xl">{election.description}</p>
                    <div className="pt-1 text-[11px] text-slate-500 flex items-center space-x-4">
                      <span>Closes: <strong>{new Date(election.end_at).toLocaleString()}</strong></span>
                      <span>Candidates: <strong>{election.approved_candidates_count || 0}</strong></span>
                    </div>
                  </div>

                  <div>
                    {isApproved ? (
                      <Link
                        to={`/voter/elections/${election.id}`}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md flex items-center space-x-1.5 transition-colors"
                      >
                        <Vote className="w-4 h-4" />
                        <span>OPEN EVM BALLOT UNIT</span>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 bg-slate-300 text-slate-600 rounded-lg text-xs font-bold cursor-not-allowed"
                        title="Voter verification approval required before voting"
                      >
                        Verification Required
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VoterDashboard;

