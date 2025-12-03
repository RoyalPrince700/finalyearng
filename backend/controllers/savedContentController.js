const SavedContent = require('../models/SavedContent');

// @desc    Save content (create or update)
// @route   POST /api/saved-content
// @access  Private
const saveContent = async (req, res) => {
  try {
    const { category, content, projectId } = req.body;

    if (!category || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category and content'
      });
    }

    // Check if content with this category already exists for this user (and optionally project)
    // If projectId is provided, we check for user + project + category
    // If no projectId, we could check for user + category where project is null, OR
    // just treat it as a "global" save for that category. 
    // Given the user's request "no need for project", we should probably scope by User + Category.
    // However, if they DO have a project, they might want separate Chapter 1s for separate projects.
    
    let query = { user: req.user.id, category };
    if (projectId) {
      query.project = projectId;
    } else {
      // If no project specified, look for entries without a project
      query.project = { $exists: false };
    }

    let savedContent = await SavedContent.findOne(query);

    if (savedContent) {
      // Update existing
      savedContent.content = content;
      savedContent.lastModified = Date.now();
      await savedContent.save();
    } else {
      // Create new
      savedContent = await SavedContent.create({
        user: req.user.id,
        project: projectId || undefined,
        category,
        content
      });
    }

    res.status(200).json({
      success: true,
      data: savedContent
    });
  } catch (error) {
    console.error('Save content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save content',
      error: error.message
    });
  }
};

// @desc    Get all saved content for user
// @route   GET /api/saved-content
// @access  Private
const getSavedContents = async (req, res) => {
  try {
    const { projectId } = req.query;
    
    let query = { user: req.user.id };
    
    // If projectId is explicitly provided in query, filter by it.
    // If not provided, should we return all? The user wants to see "saved content".
    // Returning all seems safest for "global" view.
    if (projectId) {
      query.project = projectId;
    }

    const contents = await SavedContent.find(query).sort({ category: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contents.length,
      data: contents
    });
  } catch (error) {
    console.error('Get saved contents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get saved contents',
      error: error.message
    });
  }
};

// @desc    Delete saved content
// @route   DELETE /api/saved-content/:id
// @access  Private
const deleteSavedContent = async (req, res) => {
  try {
    const content = await SavedContent.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Check ownership
    if (content.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await content.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Delete saved content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete content',
      error: error.message
    });
  }
};

module.exports = {
  saveContent,
  getSavedContents,
  deleteSavedContent
};

