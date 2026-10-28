import React, { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { HelpCircle, ChevronDown, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';

const HelpFaqPage = () => {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'How do I become an eligible voter (elector) on this portal?',
      a: 'First, register your account via the "Register as Voter (Form 6-C)" page using your official college email and registration number. After submission, your details will be verified against college registrar ERP records by the Chief Election Officer. Once marked APPROVED, you can cast your vote in all active elections.',
    },
    {
      q: 'Why does my voter status show "PENDING"?',
      a: 'All new voter registrations undergo administrative scrutiny to prevent non-students and duplicate accounts. Scrutiny is typically completed within 24 hours. While pending, you can browse upcoming elections and guidelines but cannot cast a ballot.',
    },
    {
      q: 'Can anyone know which candidate I voted for?',
      a: 'No. The portal strictly implements secret ballot standards. Your vote is recorded with a cryptographic token (HMAC-SHA256) that separates your identity from the ballot choice. Not even the Chief Election Officer or database administrators can see who you voted for.',
    },
    {
      q: 'Can I vote more than once in an election?',
      a: 'No. The system enforces strict database constraints ("One Person, One Vote"). Once you press the blue EVM button and confirm, your participation is recorded and the ballot unit is permanently locked for that position.',
    },
    {
      q: 'How can a student contest an election as a candidate?',
      a: 'Students can register as a CANDIDATE and file official nomination papers (Form 2-B) when an election is in APPLICATION_OPEN status. You must submit your academic details, campaign manifesto, and select an official election symbol. Nominations are approved upon scrutiny by the Election Commission.',
    },
    {
      q: 'When are election results published?',
      a: 'Results remain mathematically sealed during and after voting. Once voting concludes and the Chief Election Officer conducts the formal certification, the official results are published directly on the portal with vote counts, percentages, and declared winners.',
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8 my-4">
        <div className="bg-[#082545] text-white rounded-2xl p-8 border-b-4 border-amber-500 shadow-md">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>ELECTOR ASSISTANCE DESK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Frequently Asked Questions & ECI Help Desk
          </h1>
          <p className="text-sm text-slate-300 mt-2">
            Find answers regarding voter verification, candidate nomination, ballot security, and poll schedules.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Common Elector Queries</h2>
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-sm text-slate-800 transition-colors"
                >
                  <span className="flex items-center">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-xs flex items-center justify-center font-bold mr-2.5 flex-shrink-0">
                      ?
                    </span>
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${
                      isOpen ? 'rotate-180 text-blue-900' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="p-4 bg-white text-xs sm:text-sm text-slate-600 border-t border-slate-200 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Desk */}
        <div className="bg-slate-100 rounded-2xl p-6 border border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Need Immediate Scrutiny Support?</h3>
            <p className="text-xs text-slate-600">
              Visit Room 104, Administrative Block during working hours (9:00 AM - 5:00 PM).
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="px-4 py-2 bg-blue-900 text-white font-bold rounded-lg flex items-center shadow">
              <Phone className="w-3.5 h-3.5 mr-1 text-amber-400" /> Helpline: 1800-CAMPUS-VOTE
            </span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HelpFaqPage;

