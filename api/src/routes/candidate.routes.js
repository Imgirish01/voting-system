const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidate.controller');
const electionController = require('../controllers/election.controller');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

// Protect all candidate routes
router.use(authenticate, authorizeRole('CANDIDATE'));

// Nomination Applications (Form 2-B)
router.post('/applications', candidateController.applyForElection);
router.get('/applications/me', candidateController.getMyApplications);
router.post('/applications/:id/withdraw', candidateController.withdrawApplication);

// Elections listing (to see what is available to apply for)
router.get('/elections', electionController.getElections);
router.get('/elections/:id', electionController.getElectionById);

// Results & Declarations
router.get('/results', candidateController.getCandidateResults);

module.exports = router;

