import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  PlusCircle,
  Award,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
} from 'lucide-react';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appRes, elRes] = await Promise.all([
          api.get('/candidates/applications/me'),
          api.get('/elections'),
        ]);

        if (appRes.success) {
          setApplications(appRes.applications || []);
        }
        if (elRes.success) {
          setElections(elRes.elections || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openElections = elections.filter((e) => e.status === 'APPLICATION_OPEN');
  const approvedNominations = applications.filter((a) => a.application_status === 'APPROVED');
  const pendingNominations = applications.filter((a) => a.application_status === 'PENDING');

  return (
    <DashboardLayout
      title="Candidate Nominee Dashboard (उम्मीदवार पोर्टल)"
      subtitle="Nomination Management, Scrutiny Tracking & Campaign Desk"
    >
      <div className="space-y-6">
        {/* Candidate Profile Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xl shadow">
              {user?.full_name?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  OFFICIAL NOMINEE
                </span>
                <span className="text-xs font-mono text-slate-500">{user?.college_registration_number}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{user?.full_name}</h3>
              <p className="text-xs text-slate-500">{user?.department_name || 'Department of Engineering'} • {user?.course}</p>
            </div>
          </div>

          <Link
            to="/candidate/apply"
            className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>File New Nomination (Form 2-B)</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Approved Candidacies</p>
              <h4 className="text-2xl font-black text-emerald-600 mt-1">{approvedNominations.length}</h4>
              <p className="text-[11px] text-emerald-700">Appearing on Official EVM</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Under Scrutiny</p>
              <h4 className="text-2xl font-black text-amber-600 mt-1">{pendingNominations.length}</h4>
              <p className="text-[11px] text-amber-700">Awaiting CEO Order</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Open Elections</p>
              <h4 className="text-2xl font-black text-blue-900 mt-1">{openElections.length}</h4>
              <p className="text-[11px] text-blue-700">Accepting Form 2-B</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* My Nominations Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              My Contested Elections & Nomination Status
            </h3>
            <Link to="/candidate/my-applications" className="text-xs font-bold text-blue-900 hover:text-amber-600 flex items-center">
              <span>View All Applications</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {loading ? (
              <LoadingSpinner text="Loading Nomination Files..." />
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                You have not filed any candidate nominations yet.
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={app.application_status} size="sm" />
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                        Symbol: {app.symbol_name || 'Torch'}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">
                      {app.position_name} • <span className="text-slate-600 text-sm font-normal">{app.election_title}</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Filed on: {new Date(app.submitted_at).toLocaleDateString()}
                    </p>
                    {app.rejection_reason && (
                      <p className="text-xs text-red-600 font-semibold">
                        Rejection Grounds: {app.rejection_reason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to="/candidate/results"
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Results Window</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CandidateDashboard;

