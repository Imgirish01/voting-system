const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/switch-role', authController.switchRole);

// Authenticated route
router.get('/me', authenticate, authController.getMe);

module.exports = router;

