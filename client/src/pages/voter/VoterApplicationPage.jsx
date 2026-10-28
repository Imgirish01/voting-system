import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  ShieldCheck,
} from 'lucide-react';

const VoterApplicationPage = () => {
  const { user, refreshUser } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states for submission / resubmission
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [idProofType, setIdProofType] = useState('College Identity Card');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchApplicationData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/voters/application/me');
      if (res.success) {
        setApplication(res.application);
        if (res.application) {
          setStudentIdNumber(res.application.student_id_number || '');
          setIdProofType(res.application.id_proof_type || 'College Identity Card');
          setRemarks(res.application.remarks || '');
        } else {
          setStudentIdNumber(user?.college_registration_number || '');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const res = await api.post('/voters/application', {
        student_id_number: studentIdNumber,
        id_proof_type: idProofType,
        remarks,
      });

      setMessage(res.message || 'Form 6-C voter application submitted successfully.');
      await fetchApplicationData();
      await refreshUser();
    } catch (err) {
      setError(err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const status = application?.application_status || user?.account_status || 'PENDING';

  return (
    <DashboardLayout
      title="Voter Verification Application (Form 6-C)"
      subtitle="Institutional Elector Scrutiny & Franchise Certification Portal"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Status Overview Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                STATUTORY APPLICATION STATUS
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                Elector Verification Dossier #{application?.id || 'NEW'}
              </h3>
            </div>
            <StatusBadge status={status} size="lg" />
          </div>

          {/* Conditional Contextual Messaging */}
          {status === 'PENDING' && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-amber-800 text-sm">
                <Clock className="w-4 h-4" />
                <span>Application Under Scrutiny</span>
              </div>
              <p className="leading-relaxed">
                "Your voter verification application has been submitted. You can participate in eligible elections after the administrator approves your application."
              </p>
              <p className="text-[11px] text-amber-700 italic">
                Submitted on: {application?.submitted_at ? new Date(application.submitted_at).toLocaleString() : 'Recently'}
              </p>
            </div>
          )}

          {status === 'APPROVED' && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-emerald-800 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verification Approved • Full Franchise Granted</span>
              </div>
              <p className="leading-relaxed">
                Your student identity credentials have been verified by the Chief Election Officer. You are an active bona fide elector eligible to participate in electronic voting.
              </p>
              {application?.reviewer_name && (
                <p className="text-[11px] text-emerald-700 font-medium">
                  Verified by: {application.reviewer_name} on {new Date(application.reviewed_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {status === 'REJECTED' && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs space-y-2">
              <div className="flex items-center space-x-1.5 font-bold text-red-800 text-sm">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Application Rejected by Chief Election Officer</span>
              </div>
              <p className="leading-relaxed">
                <strong>Statutory Rejection Reason:</strong> {application?.rejection_reason || 'Unverified student credentials.'}
              </p>
              <p className="text-red-700 font-semibold">
                Please update your ID proof number and remarks below to submit a rectified Form 6-C application.
              </p>
            </div>
          )}

          {/* Elector Personal Profile Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Elector Name</span>
              <span className="font-bold text-slate-900">{user?.full_name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">College Reg No</span>
              <span className="font-mono font-bold text-slate-900">{user?.college_registration_number}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Department</span>
              <span className="font-bold text-slate-900">{user?.department_name || 'General'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Academic Class</span>
              <span className="font-medium text-slate-800">{user?.course} ({user?.academic_year})</span>
            </div>
          </div>
        </div>

        {/* Resubmission / Update Form (Available if PENDING or REJECTED) */}
        {status !== 'APPROVED' && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">
              {status === 'REJECTED' ? 'Rectify & Resubmit Form 6-C' : 'Update Verification Credentials'}
            </h3>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs">
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Student ID Number / Roll No *
                </label>
                <input
                  type="text"
                  required
                  value={studentIdNumber}
                  onChange={(e) => setStudentIdNumber(e.target.value)}
                  placeholder="e.g. 2023CSE0101"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  ID Proof Document Type
                </label>
                <select
                  value={idProofType}
                  onChange={(e) => setIdProofType(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                >
                  <option value="College Identity Card">College Identity Card</option>
                  <option value="Semester Fee Receipt with Photo">Semester Fee Receipt with Photo</option>
                  <option value="Library RFID Card">Library RFID Card</option>
                  <option value="Hostel Admission Card">Hostel Admission Card</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Elector Clarification / Remarks to CEO
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any clarification regarding registration details or semester enrolment..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Transmitting to CEO...' : 'TRANSMIT FORM 6-C TO ECI'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VoterApplicationPage;

