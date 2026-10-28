import React, { useState, useEffect } from 'react';
import { Phone, ShieldCheck, Globe, Volume2 } from 'lucide-react';

const TopRibbon = () => {
  const [fontSizeLevel, setFontSizeLevel] = useState(0); // -1, 0, 1
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const adjustFontSize = (level) => {
    setFontSizeLevel(level);
    const root = document.documentElement;
    if (level === -1) root.style.fontSize = '90%';
    else if (level === 1) root.style.fontSize = '110%';
    else root.style.fontSize = '100%';
  };

  return (
    <div className="w-full bg-[#04162B] text-slate-200 text-xs border-b border-slate-700/60 selection:bg-amber-500 selection:text-white">
      {/* Tricolor Ribbon on top */}
      <div className="eci-tricolor-bar w-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2">
        {/* Left Side: Official Statutory Notice */}
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center font-medium text-amber-400">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            भारत सरकार | GOVERNMENT OF CAMPUS
          </span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-slate-300">
            Autonomous Statutory Authority for College Student Elections
          </span>
        </div>

        {/* Right Side: Accessibility & Helpline */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center text-slate-300 space-x-1">
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>ECI Voter Helpline: <strong className="text-white">1800-CAMPUS-VOTE</strong> (Toll Free)</span>
          </div>

          <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            <span className="text-[11px] text-slate-400 mr-1">Font:</span>
            <button
              onClick={() => adjustFontSize(-1)}
              className={`px-1 rounded hover:bg-slate-700 ${fontSizeLevel === -1 ? 'text-amber-400 font-bold' : 'text-slate-300'}`}
              title="Decrease Font Size"
            >
              A-
            </button>
            <button
              onClick={() => adjustFontSize(0)}
              className={`px-1 rounded hover:bg-slate-700 ${fontSizeLevel === 0 ? 'text-amber-400 font-bold' : 'text-slate-300'}`}
              title="Default Font Size"
            >
              A
            </button>
            <button
              onClick={() => adjustFontSize(1)}
              className={`px-1 rounded hover:bg-slate-700 ${fontSizeLevel === 1 ? 'text-amber-400 font-bold' : 'text-slate-300'}`}
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          <div className="hidden sm:inline text-slate-300 font-mono text-[11px]">
            {currentTime}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopRibbon;

