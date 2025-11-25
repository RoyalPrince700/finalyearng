const { generateTopics, generateChapter, chatReview, callAI } = require('../services/aiService');
const Project = require('../models/Project');

// @desc    Generate project topics
// @route   POST /api/ai/topics
// @access  Private
const generateProjectTopics = async (req, res) => {
  try {
    const { department, domain, keywords, count = 5 } = req.body;

    // Validation
    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Department is required'
      });
    }

    const topics = await generateTopics({
      department,
      domain: domain || 'General',
      keywords: Array.isArray(keywords) ? keywords : [],
      count: parseInt(count) || 5
    });

    res.json({
      success: true,
      message: 'Topics generated successfully',
      data: topics
    });
  } catch (error) {
    console.error('Generate topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate topics',
      error: error.message
    });
  }
};

// @desc    Generate project chapter
// @route   POST /api/ai/generate
// @access  Private
const generateProjectChapter = async (req, res) => {
  try {
    const { topic, chapterNumber, department, existingContent } = req.body;

    // Validation
    if (!topic || !chapterNumber || !department) {
      return res.status(400).json({
        success: false,
        message: 'Topic, chapter number, and department are required'
      });
    }

    const chapterNum = parseInt(chapterNumber);
    if (chapterNum < 1 || chapterNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Chapter number must be between 1 and 5'
      });
    }

    const chapterContent = await generateChapter({
      topic,
      chapterNumber: chapterNum,
      department,
      existingContent: existingContent || ''
    });

    res.json({
      success: true,
      message: 'Chapter generated successfully',
      data: {
        chapterNumber: chapterNum,
        content: chapterContent,
        wordCount: chapterContent.split(' ').length
      }
    });
  } catch (error) {
    console.error('Generate chapter error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate chapter',
      error: error.message
    });
  }
};

// @desc    Generate high-level project outline (overview + chapters 1–5)
// @route   POST /api/ai/outline
// @access  Private
const generateProjectOutline = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const project = await Project.findOne({ _id: projectId, user: req.user.id });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const prompt = `
You are FinalYearNG AI, helping a Nigerian university student plan their full final year project.

Given this project information:
- Topic: "${project.topic}"
- Department: "${project.department}"

Create a clear plan of how the project will go from Chapter 1 to Chapter 5.

Return STRICT JSON with this exact shape (no extra text):
{
  "overview": "High-level description of the full project.",
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Chapter 1: ...",
      "summary": "2-5 paragraphs describing what goes into this chapter."
    },
    {
      "chapterNumber": 2,
      "title": "Chapter 2: ...",
      "summary": "..."
    },
    {
      "chapterNumber": 3,
      "title": "Chapter 3: ...",
      "summary": "..."
    },
    {
      "chapterNumber": 4,
      "title": "Chapter 4: ...",
      "summary": "..."
    },
    {
      "chapterNumber": 5,
      "title": "Chapter 5: ...",
      "summary": "..."
    }
  ]
}
`;

    const raw = await callAI(undefined, [{ role: 'user', content: prompt }], 'chapter');

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error('Failed to parse outline JSON:', err);
      return res.status(500).json({
        success: false,
        message: 'AI did not return valid outline JSON'
      });
    }

    const outline = {
      generatedAt: new Date(),
      overview: parsed.overview || '',
      chapters: Array.isArray(parsed.chapters)
        ? parsed.chapters.map((c) => ({
            chapterNumber: c.chapterNumber,
            title: c.title,
            summary: c.summary,
            status: 'not-started'
          }))
        : []
    };

    project.outline = outline;
    await project.save();

    res.json({
      success: true,
      message: 'Outline generated successfully',
      data: outline
    });
  } catch (error) {
    console.error('Generate outline error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate outline',
      error: error.message
    });
  }
};

// @desc    AI chat for review/edit assistance
// @route   POST /api/ai/chat
// @access  Private
const aiChatReview = async (req, res) => {
  try {
    const { messages, context, projectId, chapterNumber } = req.body;

    // Validation
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: 'Messages array is required'
      });
    }

    const response = await chatReview(messages, context || '');

    const timestamp = new Date();

    // If a projectId is provided, persist this interaction into the project's chatHistory
    if (projectId) {
      try {
        const project = await Project.findOne({ _id: projectId, user: req.user.id });

        if (project) {
          // Use the last user message in the array as the one that triggered this response
          const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');

          if (lastUserMessage) {
            project.chatHistory.push({
              role: 'user',
              content: lastUserMessage.content,
              chapterNumber: Number.isInteger(chapterNumber) ? chapterNumber : 0,
              timestamp
            });

            project.chatHistory.push({
              role: 'assistant',
              content: response,
              chapterNumber: Number.isInteger(chapterNumber) ? chapterNumber : 0,
              timestamp
            });

            await project.save();
          }
        }
      } catch (persistError) {
        console.error('Failed to persist chat history to project:', persistError);
        // Do not fail the chat response just because persistence failed
      }
    }

    res.json({
      success: true,
      message: 'AI response generated',
      data: {
        response,
        timestamp
      }
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI response',
      error: error.message
    });
  }
};

// @desc    AI chat for topic generation
// @route   POST /api/ai/chat/topic-generation
// @access  Private
const aiChatTopicGeneration = async (req, res) => {
  try {
    const { messages } = req.body;

    // Validation
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: 'Messages array is required'
      });
    }

    // Get user information for context
    const user = req.user;
    const userContext = {
      university: user.university || 'Not specified',
      faculty: user.faculty || 'Not specified',
      department: user.department || 'Not specified'
    };

    // Use specialized topic generation chat service
    const { chatTopicGeneration } = require('../services/aiService');
    const response = await chatTopicGeneration(messages, userContext);

    const timestamp = new Date();

    res.json({
      success: true,
      message: 'AI response generated',
      data: {
        response,
        timestamp
      }
    });
  } catch (error) {
    console.error('AI topic generation chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI response',
      error: error.message
    });
  }
};

// @desc    Get available AI models
// @route   GET /api/ai/models
// @access  Private
const getAIModels = async (req, res) => {
  try {
    // Return available Gemini models
    const models = [
      { id: 'gemini-flash-latest', name: 'Gemini Flash Latest', description: 'Google Gemini Flash - Fast and efficient' },
      { id: 'gemini-pro-latest', name: 'Gemini Pro Latest', description: 'Google Gemini Pro - Most capable model' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Google Gemini 2.5 Flash - Advanced model' }
    ];

    res.json({
      success: true,
      data: models
    });
  } catch (error) {
    console.error('Get AI models error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI models',
      error: error.message
    });
  }
};

// TODO: Add streaming responses for real-time chat
// TODO: Add conversation history management
// TODO: Add AI model switching functionality
// TODO: Add usage tracking and limits
// TODO: Add content moderation

module.exports = {
  generateProjectTopics,
  generateProjectChapter,
  generateProjectOutline,
  aiChatReview,
  aiChatTopicGeneration,
  getAIModels
};
