const express = require('express');
const router = express.Router();
const voterController = require('../controllers/voter.controller');
const electionController = require('../controllers/election.controller');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

// Protect all voter routes
router.use(authenticate, authorizeRole('VOTER'));

// Verification Application (Form 6-C)
router.post('/application', voterController.submitVoterApplication);
router.get('/application/me', voterController.getMyApplication);

// Elections & Voting
router.get('/elections', electionController.getElections);
router.get('/elections/:id', electionController.getElectionById);
router.post('/elections/:id/votes', voterController.castVoteHandler);

// Results & Notifications
router.get('/results', voterController.getPublishedResults);
router.get('/notifications', voterController.getNotifications);
router.patch('/notifications/read', voterController.markNotificationsRead);

module.exports = router;

