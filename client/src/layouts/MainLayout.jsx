import React from 'react';
import TopRibbon from '../components/common/TopRibbon';
import Navbar from '../components/common/Navbar';
import Ticker from '../components/common/Ticker';
import Footer from '../components/common/Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <TopRibbon />
      <Navbar />
      <Ticker />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

