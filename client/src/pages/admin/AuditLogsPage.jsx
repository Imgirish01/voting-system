import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { History, Search, ShieldCheck, Download } from 'lucide-react';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/audit-logs');
        if (res.success) {
          setLogs(res.logs || []);
        }
      } catch (err) {
        console.error('Failed to fetch audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    return (
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.entity_type && log.entity_type.toLowerCase().includes(q)) ||
      (log.details && log.details.toLowerCase().includes(q)) ||
      (log.actor_name && log.actor_name.toLowerCase().includes(q))
    );
  });

  return (
    <DashboardLayout
      title="System Audit & Electoral Integrity Trail"
      subtitle="Cryptographically Recorded Administrative & Polling Operations"
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-slate-600 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Immutable Append-Only Audit Records</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Action, Actor, Entity..."
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none w-64"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <LoadingSpinner text="Reading System Audit Ledger..." />
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No audit logs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Action Code</th>
                    <th className="p-3.5">Actor Identity</th>
                    <th className="p-3.5">Target Entity</th>
                    <th className="p-3.5">Transaction Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-blue-950 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-800 font-medium">
                        {log.actor_name || 'System / Secret Voter'}
                        {log.actor_role && (
                          <span className="block text-[10px] text-slate-400 uppercase font-mono">
                            {log.actor_role}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 text-[11px]">
                        {log.entity_type} #{log.entity_id || '0'}
                      </td>
                      <td className="p-3.5 text-slate-700 max-w-md font-sans">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogsPage;

