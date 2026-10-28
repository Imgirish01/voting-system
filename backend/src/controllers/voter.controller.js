const db = require('../config/database');
const { castVote } = require('../services/voting.service');
const { calculateResults } = require('../services/results.service');
const logger = require('../utils/logger');

/**
 * Submit or Resubmit Voter Verification Application (Form 6-C)
 */
const submitVoterApplication = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { student_id_number, id_proof_type = 'College Identity Card', college_id_card_url, remarks } = req.body;

    if (!student_id_number) {
      return res.status(400).json({
        success: false,
        message: 'Student Registration / Identity Card Number is mandatory.',
      });
    }

    // Check existing application
    const [existing] = await db.query('SELECT * FROM voter_applications WHERE user_id = ?', [userId]);

    if (existing && existing.length > 0) {
      const app = existing[0];
      if (app.application_status === 'APPROVED') {
        return res.status(400).json({
          success: false,
          message: 'Your voter verification is already APPROVED. No further action needed.',
        });
      }

      // Resubmission (e.g., if REJECTED or PENDING update)
      const now = new Date().toISOString();
      await db.query(
        `UPDATE voter_applications 
         SET application_status = 'PENDING', student_id_number = ?, id_proof_type = ?, 
             college_id_card_url = ?, submitted_at = ?, rejection_reason = NULL, remarks = ?
         WHERE id = ?`,
        [student_id_number.trim(), id_proof_type, college_id_card_url || null, now, remarks || null, app.id]
      );

      // Update user status to PENDING
      await db.query("UPDATE users SET account_status = 'PENDING' WHERE id = ?", [userId]);

      return res.json({
        success: true,
        message: 'Your voter verification application has been re-submitted for scrutiny.',
      });
    }

    // New submission
    await db.query(
      `INSERT INTO voter_applications 
       (user_id, application_status, college_id_card_url, student_id_number, id_proof_type, remarks)
       VALUES (?, 'PENDING', ?, ?, ?, ?)`,
      [userId, college_id_card_url || null, student_id_number.trim(), id_proof_type, remarks || null]
    );

    await db.query("UPDATE users SET account_status = 'PENDING' WHERE id = ?", [userId]);

    return res.status(201).json({
      success: true,
      message: 'Your voter verification application has been submitted. You can participate in eligible elections after the administrator approves your application.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current Voter's Application Status
 */
const getMyApplication = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [apps] = await db.query(
      `SELECT va.*, reviewer.full_name as reviewer_name
       FROM voter_applications va
       LEFT JOIN users reviewer ON va.reviewed_by = reviewer.id
       WHERE va.user_id = ?`,
      [userId]
    );

    return res.json({
      success: true,
      application: apps[0] || null,
      account_status: req.user.account_status,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cast Ballot Handler
 */
const castVoteHandler = async (req, res, next) => {
  try {
    const electionId = Number(req.params.id);
    const { position_id, candidate_application_id } = req.body;
    const userId = req.user.id;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!position_id || !candidate_application_id) {
      return res.status(400).json({
        success: false,
        message: 'Position ID and Candidate ID are required to cast a vote.',
      });
    }

    const result = await castVote({
      userId,
      electionId,
      positionId: Number(position_id),
      candidateApplicationId: Number(candidate_application_id),
      ipAddress,
    });

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Published Results for Voter
 */
const getPublishedResults = async (req, res, next) => {
  try {
    const [elections] = await db.query(
      'SELECT * FROM elections WHERE is_results_published = 1 ORDER BY results_published_at DESC'
    );

    const publishedWithDetails = await Promise.all(
      elections.map(async el => {
        const results = await calculateResults(el.id);
        return results;
      })
    );

    return res.json({
      success: true,
      count: publishedWithDetails.length,
      elections: publishedWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Voter Notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const [notifications] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    return res.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark Notifications as Read
 */
const markNotificationsRead = async (req, res, next) => {
  try {
    await db.query('UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE user_id = ?', [req.user.id]);
    return res.json({ success: true, message: 'Notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitVoterApplication,
  getMyApplication,
  castVoteHandler,
  getPublishedResults,
  getNotifications,
  markNotificationsRead,
};

