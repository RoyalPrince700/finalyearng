const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  saveDraft,
  saveProjectContent,
  getSavedProjectContent,
  getAllProjects
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Project CRUD routes
router.route('/')
  .get(getProjects)
  .post(createProject);

// Admin routes - specific paths must come before dynamic :id
router.get('/all', authorize('admin'), getAllProjects);

router.route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

// Special routes
router.post('/:id/save', saveDraft);

router.route('/:id/saved-content')
  .get(getSavedProjectContent)
  .post(saveProjectContent);

// TODO: Add export routes (DOCX, PDF)
// TODO: Add sharing routes
// TODO: Add versioning routes

module.exports = router;
