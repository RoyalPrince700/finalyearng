const { generateTopics, generateChapter, generatePreliminaryPages, chatReview, callAI } = require('../services/aiService');
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

// @desc    Generate preliminary pages
// @route   POST /api/ai/preliminary
// @access  Private
const generateProjectPreliminaryPages = async (req, res) => {
  try {
    const { topic } = req.body;
    const user = req.user;

    // Validation
    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Project topic is required'
      });
    }

    const content = await generatePreliminaryPages({
      topic,
      name: user.name,
      department: user.department,
      faculty: user.faculty,
      university: user.university,
      degree: 'Bachelor of Science' // TODO: Add degree to user profile or request body
    });

    res.json({
      success: true,
      message: 'Preliminary pages generated successfully',
      data: {
        content
      }
    });
  } catch (error) {
    console.error('Generate preliminary pages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate preliminary pages',
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

    let fullContext = context || '';
    let project = null;

    // If projectId is provided, fetch project to enrich context and save history
    // If not provided (e.g. Dashboard), fetch latest project to ensure AI knows the user's context
    try {
      // Add user's academic details to context
      const userDetails = `User Academic Profile:\nUniversity: "${req.user.university || 'Not specified'}"\nFaculty: "${req.user.faculty || 'Not specified'}"\nDepartment: "${req.user.department || 'Not specified'}"`;
      fullContext = `${userDetails}\n\n${fullContext}`;

      if (projectId) {
        project = await Project.findOne({ _id: projectId, user: req.user.id });
      } else {
        project = await Project.findOne({ user: req.user.id }).sort({ updatedAt: -1 });
      }
      
      if (project) {
        // Append project topic and department to context to ensure AI stays on topic
        const projectInfo = `User's Current Project:\nTopic: "${project.topic}"\nDepartment: "${project.department}"`;
        fullContext = `${projectInfo}\n\n${fullContext}`;
      }
    } catch (dbError) {
      console.error('Error fetching project for chat context:', dbError);
      // Continue without project context if DB fails
    }

    // Check if the user is asking to generate/write/create a specific chapter
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      const content = lastUserMessage.content.toLowerCase();
      // Regex to detect intent: "write/generate/create/send" + "chapter X"
      const chapterMatch = content.match(/(?:write|generate|create|send|give me|make)\s+(?:chapter|section)\s+(\d+)/i);
      
      if (chapterMatch) {
        const requestedChapter = parseInt(chapterMatch[1]);
        if (requestedChapter >= 1 && requestedChapter <= 5) {
          // If we have a project context, we can route this to the specialized chapter generator
          // which guarantees the correct format with references
          if (projectId && project) {
             console.log(`Routing chat request to Chapter Generator for Chapter ${requestedChapter}`);
             
             // Call the specialized generateChapter service instead of generic chat
             const { generateChapter } = require('../services/aiService');
             const chapterContent = await generateChapter({
               topic: project.topic,
               chapterNumber: requestedChapter,
               department: project.department,
               existingContent: '' // Start fresh for this chapter request
             });

             // Return the structured chapter content as the AI response
             const timestamp = new Date();
             
             // Persist history
             try {
                project.chatHistory.push({
                  role: 'user',
                  content: lastUserMessage.content,
                  chapterNumber: requestedChapter,
                  timestamp
                });

                project.chatHistory.push({
                  role: 'assistant',
                  content: chapterContent,
                  chapterNumber: requestedChapter,
                  timestamp
                });
                await project.save();
             } catch (err) {
                console.error('Failed to save chapter generation to history:', err);
             }

             return res.json({
               success: true,
               message: 'Chapter generated successfully via chat',
               data: {
                 response: chapterContent,
                 timestamp
               }
             });
          }
        }
      }
    }

    const response = await chatReview(messages, fullContext);

    const timestamp = new Date();

    // If a projectId is provided and project was found, persist this interaction
    // We only persist to project.chatHistory if the user was explicitly in that project context (projectId provided)
    if (projectId && project) {
      try {
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
  generateProjectPreliminaryPages,
  generateProjectOutline,
  aiChatReview,
  aiChatTopicGeneration,
  getAIModels
};
