import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Vote,
  UserCheck,
  Award,
  Shield,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Users,
  BarChart3,
  Clock,
  Sparkles,
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await api.get('/elections');
        if (res.success) {
          setElections(res.elections || []);
        }
      } catch (err) {
        console.error('Failed to fetch elections:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, []);

  const activeElections = elections.filter((e) => e.status === 'ACTIVE');

  return (
    <MainLayout>
      <div className="space-y-10">
        {/* Hero Section */}
        <div className="relative rounded-2xl bg-gradient-to-r from-[#041830] via-[#082545] to-[#0D3866] text-white p-6 sm:p-10 lg:p-12 shadow-xl border-b-4 border-amber-500 overflow-hidden">
          <div className="absolute right-[-60px] top-[-60px] w-96 h-96 rounded-full border-[16px] border-white/5 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-64 rounded-full border-[8px] border-white/5"></div>
          </div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-400/30">
              <Shield className="w-3.5 h-3.5" />
              <span>OFFICIAL E-VOTERS COMMISSION • 2026-27</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              A Blockchain-Based Framework for Transparent and Tamper-Proof Online Elections
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
              An institutional voting portal engineered with cryptographic integrity, secret ballot anonymization, and immutable audit trails for free, fair, and verifiable campus elections.
            </p>

            {/* Quick Call to Action Buttons */}
            <div className="pt-4 flex flex-wrap gap-3">
              {user ? (
                user.role === 'VOTER' ? (
                  <>
                    <Link
                      to="/voter/elections/1"
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 text-sm"
                    >
                      <Vote className="w-4 h-4" />
                      <span>Open EVM Ballot Booth</span>
                    </Link>
                    <Link
                      to="/voter/digital-epic"
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg border border-white/30 transition-all flex items-center space-x-2 text-sm backdrop-blur-xs"
                    >
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span>My E-EPIC Voter Card</span>
                    </Link>
                  </>
                ) : user.role === 'ADMIN' ? (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 text-sm"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Open Chief Officer Dashboard</span>
                    </Link>
                    <Link
                      to="/admin/voter-applications"
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg border border-white/30 transition-all flex items-center space-x-2 text-sm backdrop-blur-xs"
                    >
                      <UserCheck className="w-4 h-4 text-amber-400" />
                      <span>Scrutinize Voters (Form 6-C)</span>
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/candidate/dashboard"
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 text-sm"
                  >
                    <Award className="w-4 h-4" />
                    <span>Candidate Dashboard</span>
                  </Link>
                )
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 text-sm"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Register as Voter (Form 6-C)</span>
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg border border-white/30 transition-all flex items-center space-x-2 text-sm backdrop-blur-xs"
                  >
                    <Vote className="w-4 h-4 text-amber-400" />
                    <span>Access Ballot Booth</span>
                  </Link>
                </>
              )}

              <Link
                to="/results"
                className="px-5 py-3 bg-emerald-700/80 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all flex items-center space-x-2 text-sm"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View Certified Results</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3 Pillars / Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-slate-200 hover:border-amber-500 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center mb-4 border border-blue-200 group-hover:bg-blue-900 group-hover:text-white transition-colors">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Voter Services (मतदाता सेवाएं)
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Verify your college identity, apply for voter authorization (Form 6-C), download your digital e-EPIC card, and cast your secret ballot.
            </p>
            <div className="space-y-2 text-xs">
              <Link
                to={user?.role === 'VOTER' ? '/voter/verification' : '/register'}
                className="text-blue-900 hover:text-amber-600 font-bold flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-amber-50 transition-colors"
              >
                <span>Online Form 6-C Elector Verification</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to={user?.role === 'VOTER' ? '/voter/digital-epic' : '/login'}
                className="text-blue-900 hover:text-amber-600 font-bold flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-amber-50 transition-colors"
              >
                <span>Download E-EPIC Digital Voter Slip</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-slate-200 hover:border-amber-500 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-4 border border-amber-200 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Candidate Portal (उम्मीदवार पोर्टल)
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              File official nomination papers (Form 2-B), submit your campaign manifesto, choose your electoral symbol, and track scrutiny status.
            </p>
            <div className="space-y-2 text-xs">
              <Link
                to={user?.role === 'CANDIDATE' ? '/candidate/apply' : '/login'}
                className="text-slate-900 hover:text-amber-600 font-bold flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-amber-50 transition-colors"
              >
                <span>Submit Nomination Papers (Form 2-B)</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="text-slate-900 hover:text-amber-600 font-bold flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-amber-50 transition-colors"
              >
                <span>Candidate Eligibility & Code of Conduct</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-slate-200 hover:border-amber-500 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4 border border-emerald-200 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              CEO Desk (प्रशासन प्रकोष्ठ)
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Supervised by the Chief Election Officer. Scrutinize applications, manage voting lifecycle, oversee polling booths, and declare certified results.
            </p>
            <div className="space-y-2 text-xs">
              <Link
                to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/login'}
                className="text-slate-900 hover:text-emerald-700 font-bold flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-emerald-50 transition-colors"
              >
                <span>Chief Election Officer Login</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/results"
                className="text-slate-900 hover:text-emerald-700 font-bold flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-emerald-50 transition-colors"
              >
                <span>EVM Result Sheets & Declarations</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Live Elections Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Active & Scheduled Campus Polls
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory elections currently supervised under the Chief Election Officer
              </p>
            </div>
            <Link
              to="/results"
              className="text-xs font-bold text-blue-900 hover:text-amber-600 flex items-center"
            >
              <span>View All Results & Archive</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                Fetching official polling schedule...
              </div>
            ) : elections.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                No active elections scheduled at present.
              </div>
            ) : (
              elections.map((election) => (
                <div
                  key={election.id}
                  className="p-5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={election.status} />
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
                        {election.academic_year}
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-slate-900">
                      {election.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {election.description}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        Voting Window: {new Date(election.start_at).toLocaleDateString()} to {new Date(election.end_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center text-emerald-700 font-semibold">
                        <Users className="w-3.5 h-3.5 mr-1" />
                        {election.approved_candidates_count || 0} Official Candidates
                      </span>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between gap-2 flex-shrink-0">
                    {election.status === 'ACTIVE' && (
                      <Link
                        to={user?.role === 'VOTER' ? `/voter/elections/${election.id}` : user?.role === 'ADMIN' ? `/admin/elections` : `/voter/elections/${election.id}`}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-md flex items-center space-x-1.5 transition-colors"
                      >
                        <Vote className="w-4 h-4" />
                        <span>{user?.role === 'ADMIN' ? 'Inspect Ballot Unit' : 'Cast Ballot on EVM'}</span>
                      </Link>
                    )}

                    {election.status === 'APPLICATION_OPEN' && (
                      <Link
                        to={user?.role === 'CANDIDATE' ? '/candidate/apply' : '/login'}
                        className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg text-xs shadow-md flex items-center space-x-1.5 transition-colors"
                      >
                        <span>File Nomination (2-B)</span>
                      </Link>
                    )}

                    {election.is_results_published ? (
                      <Link
                        to="/results"
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow-md flex items-center space-x-1.5 transition-colors"
                      >
                        <Award className="w-4 h-4" />
                        <span>Results Declared</span>
                      </Link>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Results unreleased
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LandingPage;
