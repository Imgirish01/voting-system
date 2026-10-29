const express = require('express');
const router = express.Router();
const electionController = require('../controllers/election.controller');
const db = require('../config/database');

// Public departments list
router.get('/departments', async (req, res, next) => {
  try {
    const [departments] = await db.query('SELECT * FROM departments ORDER BY name ASC');
    res.json({ success: true, departments });
  } catch (err) {
    next(err);
  }
});

// Public / shared elections list
router.get('/', electionController.getElections);
router.get('/:id', electionController.getElectionById);
router.get('/:id/results', electionController.getElectionResults);

module.exports = router;

