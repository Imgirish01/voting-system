import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Bell, CheckCircle2, Megaphone, AlertCircle, Award } from 'lucide-react';

const VoterNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/voters/notifications');
      if (res.success) {
        setNotifications(res.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/voters/notifications/read');
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    if (type === 'STATUS_CHANGE') return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    if (type === 'ELECTION_ALERT') return <Megaphone className="w-5 h-5 text-blue-900" />;
    if (type === 'RESULT_PUBLISHED') return <Award className="w-5 h-5 text-amber-600" />;
    return <Bell className="w-5 h-5 text-slate-500" />;
  };

  return (
    <DashboardLayout
      title="Official ECI Notifications & Broadcasts"
      subtitle="Statutory Alerts, Scrutiny Notifications & Result Declarations"
    >
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
            <Bell className="w-4 h-4 text-blue-900" />
            <span>Total Broadcasts: <strong>{notifications.length}</strong></span>
          </div>
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-blue-900 hover:text-amber-600"
          >
            Mark all as read
          </button>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading ECI Notifications..." />
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-slate-500 text-sm border border-slate-200">
            No notifications at this time.
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition-all flex items-start space-x-3.5 ${
                  n.read_at ? 'bg-white border-slate-200' : 'bg-blue-50/40 border-blue-200 shadow-xs'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">{getIcon(n.notification_type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VoterNotificationsPage;

