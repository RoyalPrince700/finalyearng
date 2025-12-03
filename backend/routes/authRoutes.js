const express = require('express');
const { register, login, getMe, getAllUsers, updateUserRole } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

// Admin routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);

// TODO: Add password reset routes
// TODO: Add email verification routes
// TODO: Add profile update routes

module.exports = router;
