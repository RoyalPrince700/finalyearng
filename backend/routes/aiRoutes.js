const express = require('express');
const {
  generateProjectTopics,
  generateProjectChapter,
  generateProjectPreliminaryPages,
  generateProjectOutline,
  aiChatReview,
  aiChatTopicGeneration,
  getAIModels
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All AI routes require authentication
router.use(protect);

// AI functionality routes
router.post('/topics', generateProjectTopics);
router.post('/generate', generateProjectChapter);
router.post('/preliminary', generateProjectPreliminaryPages);
router.post('/outline', generateProjectOutline);
router.post('/chat', aiChatReview);
router.post('/chat/topic-generation', aiChatTopicGeneration);
router.get('/models', getAIModels);

// TODO: Add streaming chat routes
// TODO: Add conversation history routes
// TODO: Add model switching routes

module.exports = router;
