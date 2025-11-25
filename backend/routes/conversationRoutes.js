const express = require('express');
const router = express.Router();
const {
  createConversation,
  getUserConversations,
  getConversation,
  updateConversation,
  deleteConversation,
  addMessageToConversation,
  getConversationStats
} = require('../controllers/conversationController');

const { protect } = require('../middleware/auth');

// All conversation routes require authentication
router.use(protect);

// Conversation CRUD routes
router.route('/')
  .post(createConversation)     // Create new conversation
  .get(getUserConversations);   // Get all user conversations

router.route('/stats')
  .get(getConversationStats);   // Get conversation statistics

router.route('/:id')
  .get(getConversation)         // Get specific conversation
  .put(updateConversation)      // Update conversation
  .delete(deleteConversation);  // Delete conversation

router.route('/:id/messages')
  .post(addMessageToConversation); // Add message to conversation

module.exports = router;
