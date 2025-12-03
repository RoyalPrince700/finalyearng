const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  chapterNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  wordCount: {
    type: Number,
    default: 0
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
});

// High-level plan/outline for each chapter (1–5)
const chapterPlanSchema = new mongoose.Schema({
  chapterNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  }
});

const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  // 0 = whole-project / overview chat, 1–5 = chapter-specific chat
  chapterNumber: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const savedContentSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Preliminary', 'Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5', 'Reference'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
});

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a project title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  topic: {
    type: String,
    required: [true, 'Please add a project topic'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Please add a department'],
    trim: true
  },
  domain: {
    type: String,
    trim: true
  },
  keywords: [{
    type: String,
    trim: true
  }],
  chapters: [chapterSchema],
  // High-level project outline generated from the topic
  outline: {
    generatedAt: {
      type: Date
    },
    overview: {
      type: String
    },
    chapters: [chapterPlanSchema]
  },
  // Full conversation history across overview + chapter-specific chats
  chatHistory: [chatMessageSchema],
  savedContents: [savedContentSchema],
  status: {
    type: String,
    enum: ['draft', 'in-progress', 'completed'],
    default: 'draft'
  },
  totalWordCount: {
    type: Number,
    default: 0
  },
  lastSaved: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastSaved when project is modified
projectSchema.pre('save', function(next) {
  this.lastSaved = new Date();
  next();
});

// Calculate total word count
projectSchema.methods.calculateTotalWordCount = function() {
  this.totalWordCount = this.chapters.reduce((total, chapter) => {
    return total + (chapter.wordCount || 0);
  }, 0);
};

module.exports = mongoose.model('Project', projectSchema);
