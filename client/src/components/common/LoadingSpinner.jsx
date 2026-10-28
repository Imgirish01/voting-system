import React from 'react';

const LoadingSpinner = ({ text = 'Loading Election Data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative w-14 h-14">
        {/* Outer Ring */}
        <div className="w-14 h-14 rounded-full border-4 border-slate-200 border-t-amber-500 border-r-blue-900 border-b-emerald-600 animate-spin"></div>
        {/* Ashoka Chakra Motif inside */}
        <div className="absolute inset-0 m-auto w-6 h-6 rounded-full border-2 border-blue-900 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
        </div>
      </div>
      <p className="text-sm font-semibold text-slate-700 tracking-wide uppercase">{text}</p>
    </div>
  );
};

export default LoadingSpinner;

