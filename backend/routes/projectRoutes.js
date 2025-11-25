const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  saveDraft
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Project CRUD routes
router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

// Special routes
router.post('/:id/save', saveDraft);

// TODO: Add export routes (DOCX, PDF)
// TODO: Add sharing routes
// TODO: Add versioning routes

module.exports = router;
