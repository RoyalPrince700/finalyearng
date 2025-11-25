const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

// TODO: Add password reset routes
// TODO: Add email verification routes
// TODO: Add profile update routes

module.exports = router;
