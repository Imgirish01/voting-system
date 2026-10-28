import React from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Shield, Award, CheckCircle2, Lock, Scale, BookOpen, AlertTriangle } from 'lucide-react';

const AboutPage = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8 my-4">
        {/* Banner */}
        <div className="bg-[#082545] text-white rounded-2xl p-8 border-b-4 border-amber-500 shadow-md">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30">
              STATUTORY CHARTER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            About the Campus Election Commission
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Autonomous election authority empowered under the University Charter to conduct institutional student council elections in accordance with the Lyngdoh Committee recommendations and Election Commission of India (ECI) constitutional principles.
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Strict Ballot Secrecy</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every vote cast is detached from voter credentials using HMAC-SHA256 tokens. No system administrator, database observer, or candidate can trace a ballot to an elector.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Lyngdoh Committee Compliance</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enforcing maximum age limits, minimum 75% academic attendance, zero disciplinary arrears, and spending caps for all contesting nominees.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Certified Publication</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Official tallying is executed inside controlled administrative workflows. Results remain mathematically sealed until the Chief Election Officer authorizes formal release.
            </p>
          </div>
        </div>

        {/* Model Code of Conduct */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-amber-600" />
            Model Code of Conduct (आदर्श आचार संहिता)
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              1. <strong>Peaceful Canvassing:</strong> No candidate or campaign team shall indulge in activities that create mutual hatred or cause tension between different faculties, departments, or communities.
            </p>
            <p>
              2. <strong>Academic Non-Disruption:</strong> Campaigning is strictly prohibited inside lecture halls, laboratories, examination venues, and central libraries.
            </p>
            <p>
              3. <strong>Defacement of Campus Property:</strong> Sticking posters on campus walls, notice boards without prior permission, or defacing monuments will lead to immediate cancellation of nomination.
            </p>
            <p>
              4. <strong>Scrutiny & Withdrawal:</strong> All candidates must abide by the Chief Election Officer's formal scrutiny timetable. Withdrawn nominations cannot be reinstated.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutPage;

