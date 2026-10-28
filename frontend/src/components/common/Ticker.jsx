import React from 'react';
import { Megaphone, AlertCircle } from 'lucide-react';

const Ticker = () => {
  return (
    <div className="w-full bg-[#FFFDF0] border-b border-amber-200 text-slate-800 text-xs py-1.5 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center space-x-3 overflow-hidden">
        {/* Label Badge */}
        <div className="flex-shrink-0 flex items-center bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[11px] shadow-sm uppercase tracking-wider">
          <Megaphone className="w-3.5 h-3.5 mr-1" />
          ECI NOTICE BOARD
        </div>

        {/* Marquee Content */}
        <div className="flex-1 overflow-hidden relative">
          <div className="whitespace-nowrap animate-pulse flex items-center space-x-6 text-slate-700 font-medium">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 inline-block"></span>
              <strong>POLL ACTIVE:</strong> Campus General Council Election 2026-27 is now LIVE. Verified electors can cast votes in ballot booth.
            </span>
            <span>•</span>
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-2 inline-block"></span>
              <strong>VOTER REGISTRATION:</strong> Form 6-C scrutiny underway. Ensure your college ID is legible.
            </span>
            <span>•</span>
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 inline-block"></span>
              <strong>BALLOT SECRECY:</strong> All votes are cryptographically anonymized in accordance with ECI guidelines.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ticker;

