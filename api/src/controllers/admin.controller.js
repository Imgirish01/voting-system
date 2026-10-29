const db = require('../config/database');
const logger = require('../utils/logger');
const { createNotification } = require('../services/notification.service');

/**
 * Get Comprehensive Admin Dashboard Statistics
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [allUsers] = await db.query('SELECT role, account_status FROM users');
    const [allElections] = await db.query('SELECT status, is_results_published FROM elections');
    const [allCandApps] = await db.query('SELECT application_status FROM candidate_applications');
    const [allVoterApps] = await db.query('SELECT application_status FROM voter_applications');
    const [allVotes] = await db.query('SELECT COUNT(*) as total_votes FROM votes');
    const [recentActivities] = await db.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10');

    // Calculations
    const totalUsers = allUsers.length;
    const verifiedVoters = allUsers.filter(u => u.role === 'VOTER' && u.account_status === 'APPROVED').length;
    const pendingVoterApps = allVoterApps.filter(a => a.application_status === 'PENDING').length;
    const approvedCandidates = allCandApps.filter(c => c.application_status === 'APPROVED').length;
    const pendingCandApps = allCandApps.filter(c => c.application_status === 'PENDING').length;

    const totalElections = allElections.length;
    const upcomingElections = allElections.filter(e => e.status === 'UPCOMING' || e.status === 'APPLICATION_OPEN').length;
    const activeElections = allElections.filter(e => e.status === 'ACTIVE' || e.status === 'PAUSED').length;
    const completedElections = allElections.filter(e => e.status === 'COMPLETED').length;
    const totalVotesCast = allVotes[0]?.total_votes || 0;

    return res.json({
      success: true,
      stats: {
        totalUsers,
        verifiedVoters,
        pendingVoterApps,
        approvedCandidates,
        pendingCandApps,
        totalElections,
        upcomingElections,
        activeElections,
        completedElections,
        totalVotesCast,
      },
      recentActivities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Voter Applications with Search & Filter
 */
const getVoterApplications = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    let [rows] = await db.query(
      `SELECT va.*, u.full_name, u.email, u.college_registration_number, 
              u.course, u.academic_year, u.account_status as user_account_status,
              d.name as department_name, reviewer.full_name as reviewer_name
       FROM voter_applications va
       JOIN users u ON va.user_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN users reviewer ON va.reviewed_by = reviewer.id
       ORDER BY va.submitted_at DESC`
    );

    if (status && status !== 'ALL') {
      rows = rows.filter(r => r.application_status === status);
    }

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        r =>
          (r.full_name && r.full_name.toLowerCase().includes(q)) ||
          (r.college_registration_number && r.college_registration_number.toLowerCase().includes(q)) ||
          (r.email && r.email.toLowerCase().includes(q)) ||
          (r.department_name && r.department_name.toLowerCase().includes(q))
      );
    }

    return res.json({
      success: true,
      count: rows.length,
      applications: rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Review Voter Application (Approve / Reject / Suspend)
 */
const reviewVoterApplication = async (req, res, next) => {
  try {
    const applicationId = req.params.id;
    const { status, rejection_reason, remarks } = req.body;
    const adminId = req.user.id;

    if (!['APPROVED', 'REJECTED', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Permitted: APPROVED, REJECTED, SUSPENDED.',
      });
    }

    if (status === 'REJECTED' && (!rejection_reason || rejection_reason.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'A detailed rejection reason is required when rejecting a voter application.',
      });
    }

    const [apps] = await db.query('SELECT * FROM voter_applications WHERE id = ?', [applicationId]);
    if (!apps || apps.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Voter application record not found.',
      });
    }

    const app = apps[0];
    const now = new Date().toISOString();

    // 1. Update voter_applications
    await db.query(
      `UPDATE voter_applications 
       SET application_status = ?, reviewed_by = ?, reviewed_at = ?, rejection_reason = ? 
       WHERE id = ?`,
      [status, adminId, now, rejection_reason || null, applicationId]
    );

    // 2. Synchronize user's account_status
    await db.query('UPDATE users SET account_status = ? WHERE id = ?', [status, app.user_id]);

    // 3. Log Audit Trail
    await db.query(
      'INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [
        adminId,
        `VOTER_APP_${status}`,
        'VOTER_APPLICATIONS',
        applicationId,
        `Voter application for user ID ${app.user_id} set to ${status}. ${rejection_reason ? 'Reason: ' + rejection_reason : ''}`,
      ]
    );

    // 4. Send Notification to Voter
    let notifTitle = 'Voter Application Status Update';
    let notifMessage = '';
    if (status === 'APPROVED') {
      notifTitle = 'Elector Verification Approved (Form 6-C)';
      notifMessage = 'Congratulations! Your College Elector Verification has been APPROVED by the Chief Election Officer. You are now officially eligible to vote in active elections.';
    } else if (status === 'REJECTED') {
      notifTitle = 'Elector Verification Notice: Application Rejected';
      notifMessage = `Your voter verification was rejected. Reason: ${rejection_reason}. Please rectify and submit a fresh application.`;
    } else if (status === 'SUSPENDED') {
      notifTitle = 'Elector Account Suspended';
      notifMessage = `Your voting account has been suspended under Election Commission scrutiny. Reason: ${rejection_reason || 'Administrative Review'}.`;
    }

    await createNotification(app.user_id, notifTitle, notifMessage, 'STATUS_CHANGE');

    return res.json({
      success: true,
      message: `Voter verification status successfully updated to ${status}.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Candidate Applications with Search & Filter
 */
const getCandidateApplications = async (req, res, next) => {
  try {
    const { status, election_id, search } = req.query;

    let [rows] = await db.query(
      `SELECT ca.*, u.full_name as candidate_name, u.email, u.college_registration_number,
              u.course, u.academic_year, d.name as department_name,
              e.title as election_title, e.status as election_status,
              ep.position_name, ep.winners_allowed,
              reviewer.full_name as reviewer_name
       FROM candidate_applications ca
       JOIN users u ON ca.user_id = u.id
       JOIN elections e ON ca.election_id = e.id
       JOIN election_positions ep ON ca.position_id = ep.id
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN users reviewer ON ca.reviewed_by = reviewer.id
       ORDER BY ca.submitted_at DESC`
    );

    if (status && status !== 'ALL') {
      rows = rows.filter(r => r.application_status === status);
    }

    if (election_id && election_id !== 'ALL') {
      rows = rows.filter(r => r.election_id === Number(election_id));
    }

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        r =>
          (r.candidate_name && r.candidate_name.toLowerCase().includes(q)) ||
          (r.college_registration_number && r.college_registration_number.toLowerCase().includes(q)) ||
          (r.election_title && r.election_title.toLowerCase().includes(q)) ||
          (r.position_name && r.position_name.toLowerCase().includes(q))
      );
    }

    return res.json({
      success: true,
      count: rows.length,
      applications: rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Review Candidate Application (Approve / Reject)
 */
const reviewCandidateApplication = async (req, res, next) => {
  try {
    const applicationId = req.params.id;
    const { status, rejection_reason } = req.body;
    const adminId = req.user.id;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Permitted: APPROVED, REJECTED.',
      });
    }

    if (status === 'REJECTED' && (!rejection_reason || rejection_reason.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for rejecting the candidate nomination.',
      });
    }

    const [apps] = await db.query('SELECT * FROM candidate_applications WHERE id = ?', [applicationId]);
    if (!apps || apps.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Candidate application not found.',
      });
    }

    const app = apps[0];
    const now = new Date().toISOString();

    await db.query(
      `UPDATE candidate_applications 
       SET application_status = ?, reviewed_by = ?, reviewed_at = ?, rejection_reason = ? 
       WHERE id = ?`,
      [status, adminId, now, rejection_reason || null, applicationId]
    );

    // Audit Log
    await db.query(
      'INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [
        adminId,
        `CANDIDATE_APP_${status}`,
        'CANDIDATE_APPLICATIONS',
        applicationId,
        `Candidate nomination ID ${applicationId} for Election ID ${app.election_id} set to ${status}.`,
      ]
    );

    // Send Notification
    const [elections] = await db.query('SELECT title FROM elections WHERE id = ?', [app.election_id]);
    const electionTitle = elections[0]?.title || 'Campus Election';

    if (status === 'APPROVED') {
      await createNotification(
        app.user_id,
        'Nomination Form 2-B Approved',
        `Your nomination for "${electionTitle}" has been APPROVED. You will appear on the official ballot with symbol "${app.symbol_name || 'Assigned'}".`,
        'STATUS_CHANGE'
      );
    } else {
      await createNotification(
        app.user_id,
        'Nomination Form 2-B Rejected',
        `Your nomination for "${electionTitle}" was rejected upon scrutiny. Reason: ${rejection_reason}`,
        'STATUS_CHANGE'
      );
    }

    return res.json({
      success: true,
      message: `Candidate application status updated to ${status}.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Audit Logs
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT al.*, u.full_name as actor_name, u.email as actor_email, u.role as actor_role
       FROM audit_logs al
       LEFT JOIN users u ON al.actor_user_id = u.id
       ORDER BY al.created_at DESC LIMIT 100`
    );

    return res.json({
      success: true,
      count: rows.length,
      logs: rows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getVoterApplications,
  reviewVoterApplication,
  getCandidateApplications,
  reviewCandidateApplication,
  getAuditLogs,
};

