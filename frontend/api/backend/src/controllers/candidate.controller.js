const db = require('../config/database');
const { calculateResults } = require('../services/results.service');
const { createNotification } = require('../services/notification.service');
const logger = require('../utils/logger');

/**
 * Apply for an Election (Nomination Form 2-B)
 */
const applyForElection = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      election_id,
      position_id,
      biography,
      manifesto,
      photo_path,
      symbol_name = 'Torch',
      symbol_icon = 'flame',
    } = req.body;

    if (!election_id || !position_id || !manifesto) {
      return res.status(400).json({
        success: false,
        message: 'Election ID, Position ID, and Campaign Manifesto are mandatory.',
      });
    }

    // 1. Verify Election & Deadlines
    const [elections] = await db.query('SELECT * FROM elections WHERE id = ?', [election_id]);
    if (!elections || elections.length === 0) {
      return res.status(404).json({ success: false, message: 'Specified election not found.' });
    }

    const election = elections[0];
    if (election.status !== 'APPLICATION_OPEN') {
      return res.status(400).json({
        success: false,
        message: `Candidate applications are currently not open for this election. Status: ${election.status}.`,
      });
    }

    const now = new Date();
    const deadline = new Date(election.application_deadline);
    if (now > deadline) {
      return res.status(400).json({
        success: false,
        message: `Candidate nomination deadline expired at ${deadline.toLocaleString()}.`,
      });
    }

    // 2. Verify Position
    const [positions] = await db.query(
      'SELECT * FROM election_positions WHERE id = ? AND election_id = ?',
      [position_id, election_id]
    );
    if (!positions || positions.length === 0) {
      return res.status(400).json({ success: false, message: 'Position does not belong to this election.' });
    }

    // 3. Check duplicate application
    const [existing] = await db.query(
      'SELECT id, application_status FROM candidate_applications WHERE user_id = ? AND election_id = ? AND position_id = ?',
      [userId, election_id, position_id]
    );

    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a nomination application for this position.',
      });
    }

    // 4. Insert Candidate Application
    const [result] = await db.query(
      `INSERT INTO candidate_applications 
       (user_id, election_id, position_id, biography, manifesto, photo_path, symbol_name, symbol_icon, application_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [
        userId,
        Number(election_id),
        Number(position_id),
        biography || null,
        manifesto.trim(),
        photo_path || null,
        symbol_name,
        symbol_icon,
      ]
    );

    const applicationId = result.insertId;

    // Audit log
    await db.query(
      'INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [
        userId,
        'CANDIDATE_NOMINATION_SUBMITTED',
        'CANDIDATE_APPLICATIONS',
        applicationId,
        `Submitted candidacy nomination for position ID ${position_id} in election "${election.title}".`,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Your candidacy application has been submitted and is awaiting administrator approval.',
      applicationId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current Candidate's Applications
 */
const getMyApplications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [applications] = await db.query(
      `SELECT ca.*, e.title as election_title, e.status as election_status,
              e.start_at, e.end_at, e.application_deadline,
              ep.position_name, ep.winners_allowed,
              reviewer.full_name as reviewer_name
       FROM candidate_applications ca
       JOIN elections e ON ca.election_id = e.id
       JOIN election_positions ep ON ca.position_id = ep.id
       LEFT JOIN users reviewer ON ca.reviewed_by = reviewer.id
       WHERE ca.user_id = ?
       ORDER BY ca.submitted_at DESC`,
      [userId]
    );

    return res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Withdraw Candidacy Application
 */
const withdrawApplication = async (req, res, next) => {
  try {
    const applicationId = req.params.id;
    const userId = req.user.id;

    const [apps] = await db.query(
      'SELECT ca.*, e.application_deadline, e.status as election_status FROM candidate_applications ca JOIN elections e ON ca.election_id = e.id WHERE ca.id = ? AND ca.user_id = ?',
      [applicationId, userId]
    );

    if (!apps || apps.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found or unauthorized.' });
    }

    const app = apps[0];
    if (app.application_status === 'WITHDRAWN') {
      return res.status(400).json({ success: false, message: 'Application is already withdrawn.' });
    }

    const now = new Date();
    const deadline = new Date(app.application_deadline);
    if (now > deadline) {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal deadline has passed. Candidacy cannot be withdrawn once scrutiny has concluded.',
      });
    }

    await db.query("UPDATE candidate_applications SET application_status = 'WITHDRAWN' WHERE id = ?", [applicationId]);

    // Audit log
    await db.query(
      'INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [userId, 'CANDIDATE_NOMINATION_WITHDRAWN', 'CANDIDATE_APPLICATIONS', applicationId, 'Candidate voluntarily withdrew nomination.']
    );

    return res.json({
      success: true,
      message: 'Your candidacy nomination has been withdrawn successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Candidate Results Breakdown
 */
const getCandidateResults = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find all elections candidate contested
    const [candApps] = await db.query(
      `SELECT ca.*, e.title as election_title, e.is_results_published, e.results_published_at, ep.position_name
       FROM candidate_applications ca
       JOIN elections e ON ca.election_id = e.id
       JOIN election_positions ep ON ca.position_id = ep.id
       WHERE ca.user_id = ?`,
      [userId]
    );

    const resultsList = [];

    for (const app of candApps) {
      if (!app.is_results_published) {
        resultsList.push({
          election_id: app.election_id,
          election_title: app.election_title,
          position_name: app.position_name,
          application_status: app.application_status,
          is_results_published: false,
          message: 'Official results have not been declared yet. The administrator will publish certified results after voting closes.',
        });
      } else {
        const fullElectionResults = await calculateResults(app.election_id);
        const posResult = fullElectionResults.positions.find(p => p.position_id === app.position_id);
        const myRecord = posResult ? posResult.candidates.find(c => c.candidate_application_id === app.id) : null;
        const winner = posResult && posResult.candidates.length > 0 ? posResult.candidates[0] : null;

        resultsList.push({
          election_id: app.election_id,
          election_title: app.election_title,
          position_name: app.position_name,
          is_results_published: true,
          published_at: app.results_published_at,
          my_vote_count: myRecord ? myRecord.vote_count : 0,
          my_vote_percentage: myRecord ? myRecord.vote_percentage : 0,
          outcome: myRecord ? myRecord.outcome : 'N/A',
          winning_candidate_name: winner ? winner.candidate_name : 'N/A',
          winning_vote_count: winner ? winner.vote_count : 0,
          position_turnout: posResult ? posResult.turnout_percentage : 0,
          total_position_votes: posResult ? posResult.total_votes : 0,
        });
      }
    }

    return res.json({
      success: true,
      results: resultsList,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForElection,
  getMyApplications,
  withdrawApplication,
  getCandidateResults,
};

