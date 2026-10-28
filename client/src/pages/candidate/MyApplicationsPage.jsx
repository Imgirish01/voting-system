import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FileText, AlertCircle, CheckCircle2, Award, Trash2 } from 'lucide-react';

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/candidates/applications/me');
      if (res.success) {
        setApplications(res.applications || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw your nomination? Once withdrawn, this action cannot be reversed under ECI regulations.')) {
      return;
    }

    setActionLoading(appId);
    setError('');
    setMessage('');

    try {
      const res = await api.post(`/candidates/applications/${appId}/withdraw`);
      setMessage(res.message || 'Nomination withdrawn successfully.');
      await fetchApplications();
    } catch (err) {
      setError(err.message || 'Failed to withdraw application.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout
      title="My Candidacy Nominations Registry"
      subtitle="Track Status of Filed Form 2-B Applications & Formal Scrutiny Orders"
    >
      <div className="space-y-6">
        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <LoadingSpinner text="Retrieving Nomination Registry..." />
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-slate-500 text-sm border border-slate-200">
            You have not submitted any candidacy nominations yet.
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const canWithdraw =
                app.application_status !== 'WITHDRAWN' &&
                new Date() <= new Date(app.application_deadline);

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={app.application_status} size="sm" />
                        <span className="text-xs font-mono text-slate-400">Dossier #{app.id}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        {app.position_name} • <span className="text-slate-600 font-medium text-xs">{app.election_title}</span>
                      </h4>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center space-x-1 font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-300 text-xs">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>Allotted Symbol: {app.symbol_name || 'Torch'}</span>
                      </span>
                    </div>
                  </div>

                  {app.rejection_reason && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1">
                      <strong>Scrutiny Rejection Reason:</strong>
                      <p>{app.rejection_reason}</p>
                    </div>
                  )}

                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-slate-700 block uppercase">Campaign Manifesto:</span>
                    <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                      {app.manifesto}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-2 border-t border-slate-100">
                    <div className="space-y-0.5">
                      <p>Submitted: {new Date(app.submitted_at).toLocaleString()}</p>
                      {app.reviewer_name && (
                        <p className="text-blue-900 font-medium">Scrutinized by: {app.reviewer_name}</p>
                      )}
                    </div>

                    {canWithdraw && (
                      <button
                        type="button"
                        disabled={actionLoading === app.id}
                        onClick={() => handleWithdraw(app.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold border border-rose-300 transition-colors flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{actionLoading === app.id ? 'Processing...' : 'Withdraw Nomination'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyApplicationsPage;

