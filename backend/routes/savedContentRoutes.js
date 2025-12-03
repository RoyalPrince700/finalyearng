const express = require('express');
const {
  saveContent,
  getSavedContents,
  deleteSavedContent
} = require('../controllers/savedContentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(saveContent)
  .get(getSavedContents);

router.route('/:id')
  .delete(deleteSavedContent);

module.exports = router;

