import React, { useState } from 'react';
import { Shield, CheckCircle2, AlertCircle, Volume2, User, Award } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

// Web Audio API pure synthesizer for authentic EVM BEEP sound
const playEVMBeeper = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime); // 1.2 kHz crisp EVM tone
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  } catch (e) {
    // Audio context not allowed or failed
  }
};

const EVMUnit = ({
  election,
  position,
  candidates,
  hasVoted,
  onVoteSubmit,
  submitting,
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeLedCandidateId, setActiveLedCandidateId] = useState(null);
  const [vvpatSlip, setVvpatSlip] = useState(null);

  const handlePressBlueButton = (candidate) => {
    if (hasVoted || submitting) return;
    setSelectedCandidate(candidate);
    setActiveLedCandidateId(candidate.id);
    setShowConfirmModal(true);
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate) return;

    try {
      // Play authentic EVM Beeper Tone
      playEVMBeeper();

      // Show VVPAT animation slip
      setVvpatSlip({
        symbolName: selectedCandidate.symbol_name || 'Torch',
        positionName: position.position_name,
        timestamp: new Date().toLocaleTimeString(),
      });

      // Execute backend API call
      await onVoteSubmit({
        position_id: position.id,
        candidate_application_id: selectedCandidate.id,
      });

      setShowConfirmModal(false);
    } catch (err) {
      setActiveLedCandidateId(null);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border-2 border-slate-300 overflow-hidden mb-8">
      {/* EVM Top Housing */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white px-5 py-3 border-b-2 border-amber-500 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs tracking-widest shadow">
            BU
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-wide uppercase flex items-center">
              ELECTRONIC BALLOT UNIT • BU-01
            </h3>
            <p className="text-xs text-amber-300 font-medium">
              Position: <strong className="text-white">{position.position_name}</strong>
              {position.winners_allowed > 1 && ` (${position.winners_allowed} Seats)`}
            </p>
          </div>
        </div>

        {/* Status Lamp */}
        <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700">
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            READY STATUS:
          </span>
          {hasVoted ? (
            <div className="flex items-center text-emerald-400 font-bold text-xs space-x-1">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-md"></span>
              <span>BALLOT CAST</span>
            </div>
          ) : (
            <div className="flex items-center text-emerald-400 font-bold text-xs space-x-1">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
              <span>PRESS BUTTON</span>
            </div>
          )}
        </div>
      </div>

      {/* Position Description Notice */}
      <div className="bg-amber-50/70 border-b border-amber-200 px-5 py-2.5 text-xs text-slate-700 flex items-center justify-between">
        <span className="font-medium">
          {position.description || 'Cast 1 secret vote for your chosen candidate from the official roster below.'}
        </span>
        <span className="text-[11px] text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
          Secret Ballot Protected
        </span>
      </div>

      {/* Candidates EVM Sheet */}
      {candidates.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          <AlertCircle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
          <p className="text-sm font-semibold">No approved candidates contesting for this position yet.</p>
        </div>
      ) : (
        <div className="divide-y-2 divide-slate-200">
          {candidates.map((cand, idx) => {
            const isSelected = activeLedCandidateId === cand.id;
            const serialNo = String(idx + 1).padStart(2, '0');

            return (
              <div
                key={cand.id}
                className={`p-3 sm:p-4 flex items-center justify-between transition-colors ${
                  isSelected ? 'bg-amber-50/60' : 'hover:bg-slate-50'
                }`}
              >
                {/* 1. Serial Number */}
                <div className="w-10 sm:w-12 text-center flex-shrink-0">
                  <span className="inline-block text-base sm:text-lg font-black font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-300">
                    {serialNo}
                  </span>
                </div>

                {/* 2. Candidate Photo & Details */}
                <div className="flex-1 px-3 sm:px-4 min-w-0 flex items-center space-x-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-slate-100 border-2 border-slate-300 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
                    {cand.photo_path ? (
                      <img src={cand.photo_path} alt={cand.candidate_name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 h-7 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                      {cand.candidate_name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {cand.department_name} • {cand.course || 'Undergraduate'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Reg: {cand.college_registration_number}
                    </p>
                  </div>
                </div>

                {/* 3. Electoral Symbol Box */}
                <div className="w-16 sm:w-24 text-center px-2 flex flex-col items-center justify-center flex-shrink-0 border-x border-slate-200">
                  <div className="w-10 h-10 rounded border border-slate-300 bg-white shadow-inner flex items-center justify-center p-1">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase mt-1 tracking-tight truncate max-w-[80px]">
                    {cand.symbol_name || 'Torch'}
                  </span>
                </div>

                {/* 4. EVM Lamp & Blue Button */}
                <div className="flex items-center space-x-3 sm:space-x-4 pl-3 sm:pl-6 flex-shrink-0">
                  {/* Red LED Lamp */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-4 h-4 rounded-full border border-slate-600 transition-all ${
                        isSelected
                          ? 'bg-red-600 led-red-glow'
                          : 'bg-red-950/60'
                      }`}
                      title={isSelected ? 'Lamp Active' : 'Lamp Ready'}
                    ></div>
                    <span className="text-[9px] text-slate-400 mt-0.5 font-mono">LAMP</span>
                  </div>

                  {/* Classic Blue EVM Button */}
                  {hasVoted ? (
                    <div className="px-3 py-2 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                      VOTED
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handlePressBlueButton(cand)}
                      className="evm-button-blue w-16 sm:w-24 h-10 sm:h-12 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-bold tracking-wider cursor-pointer active:scale-95 transition-transform"
                      title={`Cast Vote for ${cand.candidate_name}`}
                    >
                      VOTE
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation & Secret Ballot Modal */}
      {showConfirmModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-4 border-amber-500 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#082545] text-white p-4 flex items-center justify-between border-b border-amber-500">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm tracking-wide uppercase">
                  CONFIRM VOTE SELECTION (मतदान पुष्टि)
                </h3>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 leading-relaxed">
                <strong>ECI Ballot Rule:</strong> Once confirmed, your ballot is permanently encrypted and cast into the secure tally. You cannot modify or re-cast your vote.
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex items-center space-x-4">
                <div className="w-14 h-14 rounded-lg bg-white border border-slate-300 flex items-center justify-center shadow-sm">
                  <Award className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Candidate Selected</p>
                  <h4 className="text-base font-bold text-slate-900">{selectedCandidate.candidate_name}</h4>
                  <p className="text-xs text-slate-600">
                    Contesting: <strong>{position.position_name}</strong>
                  </p>
                  <p className="text-xs text-amber-700 font-medium">
                    Symbol: <strong>{selectedCandidate.symbol_name || 'Torch'}</strong>
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-500 flex items-center space-x-1.5 pt-2">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <span>Audible EVM confirmation tone will chime upon registration.</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setShowConfirmModal(false);
                  setActiveLedCandidateId(null);
                }}
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel / Re-select
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmVote}
                className="px-5 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5"
              >
                {submitting ? (
                  <span>Recording Ballot...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CONFIRM & CAST VOTE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EVMUnit;

