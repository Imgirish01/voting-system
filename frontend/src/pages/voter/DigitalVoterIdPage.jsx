import React, { useRef } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Printer, Download, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

const DigitalVoterIdPage = () => {
  const { user } = useAuth();
  const cardRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  const isApproved = user?.account_status === 'APPROVED';
  const epicNumber = `ECI-${user?.academic_year?.replace(/[^0-9]/g, '') || '2026'}-${user?.college_registration_number || '0000'}`;

  return (
    <DashboardLayout
      title="Electronic Electoral Photo Identity Card (e-EPIC)"
      subtitle="Official ECI Digital Voter Credential for Campus Elections"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Verification Alert */}
        {!isApproved ? (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 text-amber-900 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">E-EPIC Card Pending Verification</h4>
              <p className="text-xs mt-1 text-amber-800">
                Your voter registration (Form 6-C) is currently under review by the Chief Election Officer. Your official digital e-EPIC card will be activated once your credentials are fully verified.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 text-emerald-900 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Certified Active Elector</h4>
                <p className="text-xs text-emerald-800">
                  Your identity is verified. You are authorized to cast votes in all eligible campus elections.
                </p>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download</span>
            </button>
          </div>
        )}

        {/* E-EPIC Digital Card */}
        <div
          ref={cardRef}
          className="bg-white rounded-2xl shadow-xl border-4 border-slate-700 overflow-hidden relative"
        >
          {/* Top Indian Tricolor */}
          <div className="eci-tricolor-bar w-full"></div>

          {/* Card Header */}
          <div className="bg-[#082545] text-white p-4 flex items-center justify-between border-b-2 border-amber-500">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow">
                EVC
              </div>
              <div>
                <p className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                  ई-वोटर्स आयोग
                </p>
                <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
                  E-VOTERS COMMISSION
                </h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-slate-300 block">CARD TYPE</span>
              <span className="text-xs font-black text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/40">
                E-EPIC
              </span>
            </div>
          </div>

          {/* Subheader */}
          <div className="bg-slate-100 px-5 py-2 border-b border-slate-200 flex items-center justify-between text-xs font-mono font-bold text-slate-700">
            <span>EPIC NO: <strong className="text-blue-900">{epicNumber}</strong></span>
            <span className="text-[11px] text-slate-500 uppercase">ACADEMIC SESSION: {user?.academic_year || '2026-27'}</span>
          </div>

          {/* Card Body */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            {/* Voter Photo & Security Hologram */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-36 rounded-xl bg-slate-100 border-2 border-slate-300 overflow-hidden shadow-inner relative flex items-center justify-center">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-900 text-white font-black text-2xl flex items-center justify-center">
                    {user?.full_name ? user.full_name.charAt(0) : 'E'}
                  </div>
                )}
                {/* Security Hologram Stamp */}
                <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500 border border-amber-600 flex items-center justify-center shadow">
                  <ShieldCheck className="w-5 h-5 text-blue-950" />
                </div>
              </div>
              <span className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                VERIFIED ELECTOR
              </span>
            </div>

            {/* Voter Details */}
            <div className="sm:col-span-2 space-y-2 text-xs text-slate-700">
              <div className="border-b border-slate-100 pb-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Elector Name / निर्वाचक का नाम</span>
                <span className="text-base font-bold text-slate-900">{user?.full_name}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-1.5">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">College Reg. No.</span>
                  <span className="font-bold text-slate-800 font-mono">{user?.college_registration_number}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Department</span>
                  <span className="font-bold text-slate-800">{user?.department_name || 'General'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-1.5">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Course & Year</span>
                  <span className="font-medium text-slate-800">{user?.course || 'Undergraduate'} ({user?.academic_year || '3rd Year'})</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Elector Status</span>
                  <StatusBadge status={user?.account_status} size="sm" />
                </div>
              </div>

              {/* QR / Barcode Seal */}
              <div className="pt-2 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 font-mono block">DIGITAL DIGITAL SEAL:</span>
                  <div className="h-6 w-36 bg-slate-800 flex items-center justify-around px-1 rounded text-[8px] text-amber-400 font-mono tracking-widest">
                    ||||| | |||| ||| |||| |
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 block">CHIEF ELECTION OFFICER</span>
                  <span className="text-[10px] font-serif italic text-blue-900 font-bold">Prof. S. K. Sharma</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Band */}
          <div className="bg-slate-900 text-slate-300 text-[10px] py-1.5 px-6 flex items-center justify-between font-mono">
            <span>SECURE E-EPIC • ENCRYPTED TOKEN</span>
            <span>UNIVERSITY SENATE ACT 2026</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DigitalVoterIdPage;

