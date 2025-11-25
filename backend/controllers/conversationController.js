const Conversation = require('../models/Conversation');
const Project = require('../models/Project');

// @desc    Create a new conversation
// @route   POST /api/conversations
// @access  Private
const createConversation = async (req, res) => {
  try {
    const { title, type = 'general', projectId, initialMessage } = req.body;

    // Validate project if provided
    if (projectId) {
      const project = await Project.findOne({ _id: projectId, user: req.user.id });
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied'
        });
      }
    }

    // Create conversation
    const conversation = new Conversation({
      user: req.user.id,
      title: title || 'New Conversation',
      type,
      project: projectId || null,
      messages: []
    });

    // If initial message provided, add it (this method saves the doc)
    if (initialMessage) {
      await conversation.addMessage({
        role: 'user',
        content: initialMessage.content,
        metadata: initialMessage.metadata || {}
      });
    } else {
      // No initial message – just persist the empty conversation once
      await conversation.save();
    }

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: {
        id: conversation._id,
        title: conversation.title,
        type: conversation.type,
        project: conversation.project,
        messageCount: conversation.messageCount,
        createdAt: conversation.createdAt
      }
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation',
      error: error.message
    });
  }
};

// @desc    Get all user conversations
// @route   GET /api/conversations
// @access  Private
const getUserConversations = async (req, res) => {
  try {
    const { limit = 50, skip = 0, type, status = 'active' } = req.query;

    const conversations = await Conversation.getUserConversations(req.user.id, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      type,
      status
    });

    res.json({
      success: true,
      message: 'Conversations retrieved successfully',
      data: conversations,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: conversations.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversations',
      error: error.message
    });
  }
};

// @desc    Get specific conversation with messages
// @route   GET /api/conversations/:id
// @access  Private
const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user.id,
      status: { $ne: 'deleted' }
    }).populate('project', 'title topic department');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      message: 'Conversation retrieved successfully',
      data: conversation
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversation',
      error: error.message
    });
  }
};

// @desc    Update conversation
// @route   PUT /api/conversations/:id
// @access  Private
const updateConversation = async (req, res) => {
  try {
    const { title, tags, status } = req.body;

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Update allowed fields
    if (title) conversation.title = title;
    if (tags) conversation.tags = tags;
    if (status && ['active', 'archived'].includes(status)) {
      conversation.status = status;
    }

    await conversation.save();

    res.json({
      success: true,
      message: 'Conversation updated successfully',
      data: {
        id: conversation._id,
        title: conversation.title,
        tags: conversation.tags,
        status: conversation.status,
        updatedAt: conversation.updatedAt
      }
    });
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update conversation',
      error: error.message
    });
  }
};

// @desc    Delete conversation (soft delete)
// @route   DELETE /api/conversations/:id
// @access  Private
const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    conversation.status = 'deleted';
    await conversation.save();

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete conversation',
      error: error.message
    });
  }
};

// @desc    Add message to conversation
// @route   POST /api/conversations/:id/messages
// @access  Private
const addMessageToConversation = async (req, res) => {
  try {
    const { role, content, metadata } = req.body;

    if (!role || !content) {
      return res.status(400).json({
        success: false,
        message: 'Role and content are required'
      });
    }

    if (!['user', 'assistant', 'system'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user, assistant, or system'
      });
    }

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user.id,
      status: 'active'
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or not active'
      });
    }

    await conversation.addMessage({ role, content, metadata });

    res.json({
      success: true,
      message: 'Message added successfully',
      data: {
        conversationId: conversation._id,
        messageCount: conversation.messageCount,
        lastMessageAt: conversation.lastMessageAt
      }
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add message',
      error: error.message
    });
  }
};

// @desc    Get conversation statistics
// @route   GET /api/conversations/stats
// @access  Private
const getConversationStats = async (req, res) => {
  try {
    const stats = await Conversation.aggregate([
      { $match: { user: req.user.id, status: { $ne: 'deleted' } } },
      {
        $group: {
          _id: null,
          totalConversations: { $sum: 1 },
          activeConversations: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          archivedConversations: {
            $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
          },
          totalMessages: { $sum: '$messageCount' },
          conversationsByType: {
            $push: '$type'
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalConversations: 0,
      activeConversations: 0,
      archivedConversations: 0,
      totalMessages: 0,
      conversationsByType: []
    };

    // Count conversations by type
    const typeCount = {};
    result.conversationsByType.forEach(type => {
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    result.conversationsByType = typeCount;

    res.json({
      success: true,
      message: 'Conversation statistics retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Get conversation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversation statistics',
      error: error.message
    });
  }
};

module.exports = {
  createConversation,
  getUserConversations,
  getConversation,
  updateConversation,
  deleteConversation,
  addMessageToConversation,
  getConversationStats
};
