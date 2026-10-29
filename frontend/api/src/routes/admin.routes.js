const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const electionController = require('../controllers/election.controller');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');
const db = require('../config/database');

// Protect all admin routes
router.use(authenticate, authorizeRole('ADMIN'));

// Dashboard stats
router.get('/dashboard', adminController.getDashboardStats);

// Departments
router.get('/departments', async (req, res, next) => {
  try {
    const [departments] = await db.query('SELECT * FROM departments ORDER BY name ASC');
    res.json({ success: true, departments });
  } catch (err) {
    next(err);
  }
});

// Voter Applications Management
router.get('/voter-applications', adminController.getVoterApplications);
router.patch('/voter-applications/:id/review', adminController.reviewVoterApplication);

// Candidate Applications Management
router.get('/candidate-applications', adminController.getCandidateApplications);
router.patch('/candidate-applications/:id/review', adminController.reviewCandidateApplication);

// Election Management
router.post('/elections', electionController.createElection);
router.get('/elections', electionController.getElections);
router.get('/elections/:id', electionController.getElectionById);
router.post('/elections/:id/open-applications', electionController.openApplications);
router.post('/elections/:id/close-applications', electionController.closeApplications);
router.post('/elections/:id/start', electionController.startElection);
router.post('/elections/:id/pause', electionController.pauseElection);
router.post('/elections/:id/resume', electionController.resumeElection);
router.post('/elections/:id/stop', electionController.stopElection);

// Results publication & preview
router.post('/elections/:id/publish-results', electionController.handlePublishResults);
router.get('/elections/:id/results', electionController.getElectionResults);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;

