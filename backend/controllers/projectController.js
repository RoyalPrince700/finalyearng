const Project = require('../models/Project');

// @desc    Get all projects for logged in user
// @route   GET /api/project
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id })
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get projects',
      error: error.message
    });
  }
};

// @desc    Get single project
// @route   GET /api/project/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns the project
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this project'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get project',
      error: error.message
    });
  }
};

// @desc    Create new project
// @route   POST /api/project
// @access  Private
const createProject = async (req, res) => {
  try {
    const { title, topic, department, domain, keywords } = req.body;

    // Validation
    if (!title || !topic || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, topic, and department'
      });
    }

    const project = await Project.create({
      user: req.user.id,
      title,
      topic,
      department,
      domain,
      keywords: keywords || [],
      chapters: [],
      chatHistory: [],
      status: 'draft'
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
};

// @desc    Update project
// @route   PUT /api/project/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns the project
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    // Update fields
    const updateFields = {};
    const allowedFields = ['title', 'topic', 'department', 'domain', 'keywords', 'chapters', 'chatHistory', 'status'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    project = await Project.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    // Recalculate word count if chapters were updated
    if (updateFields.chapters) {
      project.calculateTotalWordCount();
      await project.save();
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/project/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns the project
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
};

// @desc    Save project draft
// @route   POST /api/project/:id/save
// @access  Private
const saveDraft = async (req, res) => {
  try {
    const { chapters, chatHistory } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns the project
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this project'
      });
    }

    // Update chapters and chat history
    if (chapters !== undefined) {
      project.chapters = chapters;
    }

    if (chatHistory !== undefined) {
      project.chatHistory = chatHistory;
    }

    project.calculateTotalWordCount();
    await project.save();

    res.json({
      success: true,
      message: 'Draft saved successfully',
      data: project
    });
  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save draft',
      error: error.message
    });
  }
};

// TODO: Add export to DOCX functionality
// TODO: Add export to PDF functionality
// TODO: Add project sharing functionality
// TODO: Add project versioning/history

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  saveDraft
};
