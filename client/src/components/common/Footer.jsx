import React from 'react';
import { ShieldCheck, Phone, Mail, MapPin, ExternalLink, Award, CheckCircle2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#051C34] text-slate-300 border-t-4 border-amber-500 mt-auto text-xs">
      {/* Tricolor top strip */}
      <div className="eci-tricolor-bar w-full"></div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Statutory Branding */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-bold">
                ECI
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                CAMPUS ELECTION COMMISSION
              </h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Autonomous statutory authority established under College Senate Charter to conduct free, fair, and transparent student council elections.
            </p>
            <div className="pt-2 text-slate-400 space-y-1">
              <p className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Administrative Block, Room 104</p>
              <p className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Helpline: 1800-CAMPUS-VOTE</p>
              <p className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> election.commission@college.edu</p>
            </div>
          </div>

          {/* Col 2: Elector Services */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 border-b border-slate-700 pb-1">
              ELECTOR SERVICES (मतदाता सेवाएं)
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <a href="/register" className="hover:text-amber-400 transition-colors flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" /> Form 6-C (New Elector Verification)
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-amber-400 transition-colors flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" /> Form 2-B (Candidate Nomination)
                </a>
              </li>
              <li>
                <a href="/voter/digital-epic" className="hover:text-amber-400 transition-colors flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" /> E-EPIC Digital Voter Card
                </a>
              </li>
              <li>
                <a href="/results" className="hover:text-amber-400 transition-colors flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" /> Official Results & EVM Trends
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Statutory Rules & Links */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 border-b border-slate-700 pb-1">
              REGULATORY CODES & LINKS
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <a href="/about" className="hover:text-amber-400 transition-colors flex items-center">
                  <ExternalLink className="w-3 h-3 mr-1 text-sky-400" /> Model Code of Conduct (MCC)
                </a>
              </li>
              <li>
                <a href="/help" className="hover:text-amber-400 transition-colors flex items-center">
                  <ExternalLink className="w-3 h-3 mr-1 text-sky-400" /> Lyngdoh Committee Guidelines
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-amber-400 transition-colors flex items-center">
                  <ExternalLink className="w-3 h-3 mr-1 text-sky-400" /> Secret Ballot & Anonymity Protocol
                </a>
              </li>
              <li>
                <a href="/help" className="hover:text-amber-400 transition-colors flex items-center">
                  <ExternalLink className="w-3 h-3 mr-1 text-sky-400" /> Chief Election Officer Desk
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Voter's Pledge (SVEEP) */}
          <div className="bg-[#031324] p-4 rounded-lg border border-slate-700/60 shadow-inner">
            <div className="flex items-center space-x-1.5 mb-2 text-amber-400 font-bold text-xs uppercase">
              <Award className="w-4 h-4 text-amber-400" />
              <span>VOTER'S PLEDGE (मतदाता प्रतिज्ञा)</span>
            </div>
            <p className="text-[11px] text-slate-400 italic leading-relaxed">
              "We, the student electors of this institution, having abiding faith in democracy, hereby pledge to uphold democratic traditions and the dignity of free, fair, and peaceful elections, casting our votes without fear or prejudice."
            </p>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-semibold flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              SVEEP • Systematic Voters' Education
            </div>
          </div>
        </div>

        {/* Bottom Copyright and Security Stamp */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
          <p>© 2026 Campus Election Commission. All Rights Reserved. Built with ECI Design Standards.</p>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>256-Bit SSL Encrypted</span>
            <span>•</span>
            <span>HMAC Secret Ballot</span>
            <span>•</span>
            <span>Server Version 1.0.4-ECI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

