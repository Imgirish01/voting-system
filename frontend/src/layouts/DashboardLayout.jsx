import React from 'react';
import TopRibbon from '../components/common/TopRibbon';
import Navbar from '../components/common/Navbar';
import Ticker from '../components/common/Ticker';
import Footer from '../components/common/Footer';
import Sidebar from '../components/layout/Sidebar';

const DashboardLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <TopRibbon />
      <Navbar />
      <Ticker />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header Banner */}
        {title && (
          <div className="mb-6 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-l-4 border-l-blue-900">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center">
                {title}
              </h2>
              {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <Sidebar />
          <div className="flex-1 w-full min-w-0">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardLayout;

