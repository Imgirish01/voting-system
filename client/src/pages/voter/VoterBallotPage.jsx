import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import EVMUnit from '../../components/voting/EVMUnit';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Vote,
  Shield,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Lock,
  ArrowLeft,
  Volume2,
} from 'lucide-react';

const VoterBallotPage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [election, setElection] = useState(null);
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [userParticipations, setUserParticipations] = useState({});
  const [loading, setLoading] = useState(true);
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [voteReceipt, setVoteReceipt] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchElectionData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/voters/elections/${id}`);
      if (res.success) {
        setElection(res.election);
        setPositions(res.positions || []);
        setCandidates(res.candidates || []);
        setUserParticipations(res.userParticipations || {});
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load ballot data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElectionData();
  }, [id]);

  const handleCastVote = async ({ position_id, candidate_application_id }) => {
    setVotingInProgress(true);
    setErrorMessage('');
    setVoteReceipt(null);

    try {
      const res = await api.post(`/voters/elections/${id}/votes`, {
        position_id,
        candidate_application_id,
      });

      setVoteReceipt({
        message: res.message || 'Your vote has been successfully recorded.',
        timestamp: new Date().toLocaleTimeString(),
      });

      // Mark this position as voted locally
      setUserParticipations((prev) => ({ ...prev, [position_id]: true }));
    } catch (err) {
      setErrorMessage(err.message || 'Failed to record vote ballot.');
      throw err;
    } finally {
      setVotingInProgress(false);
    }
  };

  const isApproved = user?.account_status === 'APPROVED';

  return (
    <DashboardLayout
      title="Electronic Polling Booth (EVM Ballot Unit)"
      subtitle="Cast Your Sovereign Secret Ballot Under Statutory Supervision"
    >
      <div className="space-y-6">
        {/* Back Link */}
        <div>
          <Link
            to="/voter/dashboard"
            className="inline-flex items-center text-xs font-bold text-blue-900 hover:text-amber-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Return to Elector Dashboard</span>
          </Link>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-900 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-sm">Ballot Error</h5>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Success Vote Confirmation Notice */}
        {voteReceipt && (
          <div className="p-5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-emerald-950 shadow-md space-y-2 animate-in fade-in slide-in-from-top-3">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-base">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span>Ballot Cast Confirmation (मतदान रसीद)</span>
            </div>
            <p className="text-sm font-semibold">{voteReceipt.message}</p>
            <div className="text-xs text-emerald-800 pt-2 border-t border-emerald-200 flex flex-wrap items-center justify-between font-mono">
              <span>RECORDED AT: {voteReceipt.timestamp}</span>
              <span>BALLOT PROTOCOL: SECRET HMAC-SHA256</span>
            </div>
            <p className="text-[11px] text-emerald-700 italic">
              Notice: To preserve constitutional ballot secrecy, individual candidate selections are never displayed on elector receipts.
            </p>
          </div>
        )}

        {loading ? (
          <LoadingSpinner text="Connecting to Secure Electronic Ballot Unit..." />
        ) : !election ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            Election record not found.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Election Meta Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={election.status} />
                    <span className="text-xs font-mono text-slate-500">{election.academic_year}</span>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {election.scope}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{election.title}</h3>
                </div>

                <div className="text-right text-xs text-slate-500 font-mono">
                  <p>Poll Opens: {new Date(election.start_at).toLocaleString()}</p>
                  <p className="text-red-600 font-bold">Poll Closes: {new Date(election.end_at).toLocaleString()}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {election.description}
              </p>

              {/* Statutory Secret Ballot Notice */}
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 text-xs text-blue-950 flex items-center space-x-2 font-medium">
                <Lock className="w-4 h-4 text-blue-900 flex-shrink-0" />
                <span>
                  <strong>Ballot Secrecy Guaranteed:</strong> Your vote is cryptographically anonymized. Press the blue button next to your chosen candidate to cast your vote.
                </span>
              </div>
            </div>

            {/* Verification Gate */}
            {!isApproved ? (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                <h4 className="text-base font-bold text-amber-900">
                  Franchise Inactive: Voter Verification Required
                </h4>
                <p className="text-xs text-amber-800 max-w-md mx-auto">
                  Only electors with an APPROVED Form 6-C voter application are permitted to activate the Electronic Voting Machine.
                </p>
                <Link
                  to="/voter/verification"
                  className="inline-block px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Inspect Form 6-C Status
                </Link>
              </div>
            ) : election.status !== 'ACTIVE' ? (
              <div className="bg-slate-100 border-2 border-slate-300 rounded-xl p-8 text-center space-y-2 text-slate-700">
                <Lock className="w-8 h-8 mx-auto text-slate-400" />
                <h4 className="text-base font-bold">Voting Polls are Currently Inactive</h4>
                <p className="text-xs text-slate-500">
                  Current election status is <strong>{election.status}</strong>. Voting is only enabled during active poll windows.
                </p>
              </div>
            ) : (
              /* EVM Units for each position */
              <div className="space-y-6">
                {positions.map((pos) => {
                  const positionCandidates = candidates.filter((c) => c.position_id === pos.id);
                  const hasVotedForPosition = Boolean(userParticipations[pos.id]);

                  return (
                    <EVMUnit
                      key={pos.id}
                      election={election}
                      position={pos}
                      candidates={positionCandidates}
                      hasVoted={hasVotedForPosition}
                      onVoteSubmit={handleCastVote}
                      submitting={votingInProgress}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VoterBallotPage;

