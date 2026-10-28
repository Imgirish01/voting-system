import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import AboutPage from '../pages/public/AboutPage';
import HelpFaqPage from '../pages/public/HelpFaqPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ElectionManagement from '../pages/admin/ElectionManagement';
import CreateElectionPage from '../pages/admin/CreateElectionPage';
import VoterVerificationPage from '../pages/admin/VoterVerificationPage';
import CandidateReviewPage from '../pages/admin/CandidateReviewPage';
import AdminResultsPage from '../pages/admin/AdminResultsPage';
import AuditLogsPage from '../pages/admin/AuditLogsPage';

// Voter Pages
import VoterDashboard from '../pages/voter/VoterDashboard';
import VoterApplicationPage from '../pages/voter/VoterApplicationPage';
import DigitalVoterIdPage from '../pages/voter/DigitalVoterIdPage';
import VoterBallotPage from '../pages/voter/VoterBallotPage';
import VoterResultsPage from '../pages/voter/VoterResultsPage';
import VoterNotificationsPage from '../pages/voter/VoterNotificationsPage';

// Candidate Pages
import CandidateDashboard from '../pages/candidate/CandidateDashboard';
import ApplyElectionPage from '../pages/candidate/ApplyElectionPage';
import MyApplicationsPage from '../pages/candidate/MyApplicationsPage';
import CandidateResultsPage from '../pages/candidate/CandidateResultsPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/help" element={<HelpFaqPage />} />
      <Route path="/results" element={<VoterResultsPage />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/elections"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ElectionManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/elections/new"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <CreateElectionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/voter-applications"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <VoterVerificationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/candidate-applications"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <CandidateReviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/results"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminResultsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AuditLogsPage />
          </ProtectedRoute>
        }
      />

      {/* Voter Protected Routes */}
      <Route
        path="/voter/dashboard"
        element={
          <ProtectedRoute allowedRoles={['VOTER']}>
            <VoterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/voter/verification"
        element={
          <ProtectedRoute allowedRoles={['VOTER']}>
            <VoterApplicationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/voter/digital-epic"
        element={
          <ProtectedRoute allowedRoles={['VOTER']}>
            <DigitalVoterIdPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/voter/elections"
        element={
          <ProtectedRoute allowedRoles={['VOTER']}>
            <VoterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/voter/elections/:id"
        element={
          <ProtectedRoute allowedRoles={['VOTER']} requireApproved={true}>
            <VoterBallotPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/voter/results"
        element={
          <ProtectedRoute allowedRoles={['VOTER']}>
            <VoterResultsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/voter/notifications"
        element={
          <ProtectedRoute allowedRoles={['VOTER']}>
            <VoterNotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* Candidate Protected Routes */}
      <Route
        path="/candidate/dashboard"
        element={
          <ProtectedRoute allowedRoles={['CANDIDATE']}>
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/apply"
        element={
          <ProtectedRoute allowedRoles={['CANDIDATE']}>
            <ApplyElectionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/my-applications"
        element={
          <ProtectedRoute allowedRoles={['CANDIDATE']}>
            <MyApplicationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/results"
        element={
          <ProtectedRoute allowedRoles={['CANDIDATE']}>
            <CandidateResultsPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

