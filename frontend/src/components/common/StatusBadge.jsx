import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle, Play, Pause, FileText, Ban } from 'lucide-react';

const StatusBadge = ({ status, size = 'md' }) => {
  if (!status) return null;

  const s = String(status).toUpperCase();

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 space-x-1',
    md: 'text-xs px-2.5 py-1 space-x-1.5',
    lg: 'text-sm px-3 py-1.5 space-x-2',
  }[size] || 'text-xs px-2.5 py-1 space-x-1.5';

  // Config mapping
  const configs = {
    // Voter / Candidate Application Statuses
    APPROVED: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      icon: CheckCircle2,
      label: 'APPROVED (सत्यापित)',
    },
    PENDING: {
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: Clock,
      label: 'PENDING SCRUTINY (लंबित)',
    },
    REJECTED: {
      bg: 'bg-red-50 text-red-800 border-red-300',
      icon: XCircle,
      label: 'REJECTED (अस्वीकृत)',
    },
    SUSPENDED: {
      bg: 'bg-rose-100 text-rose-900 border-rose-400',
      icon: Ban,
      label: 'SUSPENDED (निलंबित)',
    },
    WITHDRAWN: {
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: FileText,
      label: 'WITHDRAWN (वापस लिया)',
    },

    // Election Lifecycle Statuses
    ACTIVE: {
      bg: 'bg-emerald-100 text-emerald-900 border-emerald-400 animate-pulse',
      icon: Play,
      label: 'POLLS ACTIVE (मतदान जारी)',
    },
    PAUSED: {
      bg: 'bg-yellow-100 text-yellow-900 border-yellow-400',
      icon: Pause,
      label: 'POLLS PAUSED (स्थगित)',
    },
    APPLICATION_OPEN: {
      bg: 'bg-sky-50 text-sky-800 border-sky-300',
      icon: FileText,
      label: 'NOMINATIONS OPEN (नामांकन जारी)',
    },
    APPLICATION_CLOSED: {
      bg: 'bg-indigo-50 text-indigo-800 border-indigo-300',
      icon: Clock,
      label: 'NOMINATIONS CLOSED (नामांकन बंद)',
    },
    UPCOMING: {
      bg: 'bg-blue-50 text-blue-800 border-blue-300',
      icon: Clock,
      label: 'UPCOMING (आगामी)',
    },
    COMPLETED: {
      bg: 'bg-slate-100 text-slate-800 border-slate-300',
      icon: CheckCircle2,
      label: 'COMPLETED (संपन्न)',
    },
    DRAFT: {
      bg: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: FileText,
      label: 'DRAFT (प्रारूप)',
    },
    CANCELLED: {
      bg: 'bg-red-50 text-red-700 border-red-300',
      icon: AlertTriangle,
      label: 'CANCELLED (रद्द)',
    },

    // Outcome statuses
    WON: {
      bg: 'bg-emerald-500 text-white border-emerald-600 font-bold',
      icon: CheckCircle2,
      label: 'DECLARED WINNER (विजेता)',
    },
    LOST: {
      bg: 'bg-slate-100 text-slate-600 border-slate-300',
      icon: XCircle,
      label: 'LOST (पराजित)',
    },
    TIED: {
      bg: 'bg-amber-500 text-white border-amber-600 font-bold',
      icon: AlertTriangle,
      label: 'TIED (समान मत)',
    },
  };

  const current = configs[s] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: Clock,
    label: s,
  };

  const IconComponent = current.icon;

  return (
    <span
      className={`inline-flex items-center rounded-md font-semibold border shadow-sm ${sizeClasses} ${current.bg}`}
    >
      <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{current.label}</span>
    </span>
  );
};

export default StatusBadge;

