require('dotenv').config();
const axios = require('axios');

// TODO: Add support for other AI models (OpenAI, GLM, Qwen, Kimi) by changing only this file
// Current implementation uses Google Gemini AI API

const AI_MODELS = {
  GEMINI_FLASH: 'gemini-flash-latest',
  GEMINI_PRO: 'gemini-pro-latest',
  GEMINI_2_5_FLASH: 'gemini-2.5-flash'
};

const DEFAULT_MODEL = AI_MODELS.GEMINI_FLASH;

// System prompts for different AI tasks
const SYSTEM_PROMPTS = {
  TOPIC_GENERATION: `
You are FinalYearNG AI, a specialized assistant for Nigerian university students.
Your job is to generate academic project topics for Nigerian universities.

IMPORTANT: Use plain text only. No markdown, asterisks, or special formatting.

Generate topics that are:
- Relevant to Nigerian context and development challenges
- Academically rigorous and research-oriented
- Feasible for undergraduate/final year projects
- Original and plagiarism-free
- Properly formatted with department, domain, and keywords

Return topics as a JSON array with the following structure:
[
  {
    "title": "Full topic title",
    "department": "Computer Science",
    "domain": "Artificial Intelligence",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "description": "Brief description of the topic"
  }
]
`,

  CHAPTER_GENERATION: `
You are FinalYearNG AI, a specialized assistant for Nigerian university students.
Your job is to generate well-structured academic chapters for final year projects.

IMPORTANT: Use plain text only. No markdown, asterisks, or special formatting.

Requirements for generated content:
- Use formal academic English suitable for Nigerian universities
- Follow APA-style formatting and referencing
- Ensure original writing (no plagiarism)
- Structure content with proper headings and subheadings
- Include relevant Nigerian context where applicable
- Provide comprehensive coverage of the chapter topic
- Include appropriate citations and references

MANDATORY STRUCTURE:
1. Chapter Title
2. Introduction
3. Main Content (with numbered subheadings e.g., 2.1, 2.2)
4. Conclusion
5. References (MUST BE THE LAST SECTION)

REFERENCES FORMATTING RULES:
- The references section MUST be titled "References".
- List authors, year, title, and source clearly.
- Follow this exact style:

  Ajibade, L. T. (2022). Indigenous Systems of Land Evaluation in the Yoruba Speaking Area of Kwara State (Unpublished Ph.D Thesis. Obafemi Awolowo University (OAU), Ile-Ife, Osun State, Nigeria.).

  Ayinde, O. E., Ajewole, O. O., Adeyemi, U. T., & Salami, M. F. (2018). Vulnerability analysis of maize farmers to climate risk in Kwara state, Nigeria. Agrosearch, 18(1), 25.

  The World Bank. (2023, September 19). Agriculture and Food. World Bank.

- Ensure every chapter ends with a References section containing 5-10 relevant citations.
`,

  PRELIMINARY_PAGES: `
You are FinalYearNG AI. Generate the preliminary pages for a final year project based on the user's details.

User Details:
Name: [NAME]
Topic: [TOPIC]
Department: [DEPARTMENT]
Faculty: [FACULTY]
University: [UNIVERSITY]
Degree: [DEGREE] (e.g., Bachelor of Science/Arts/Agriculture)

STRICTLY FOLLOW THIS STRUCTURE AND FORMAT:

TITLE PAGE

[TOPIC IN UPPERCASE]

BY

[NAME IN UPPERCASE]
[MATRIC NUMBER IF PROVIDED]

A PROJECT SUBMITTED TO THE DEPARTMENT OF [DEPARTMENT], FACULTY OF [FACULTY], IN PARTIAL FULFILLMENT OF THE REQUIREMENT FOR THE AWARD OF [DEGREE], [UNIVERSITY].

[MONTH, YEAR]


CERTIFICATION

This is to certify that this study was carried out by [NAME] in the Department of [DEPARTMENT], Faculty of [FACULTY], [UNIVERSITY].

_____________________                                                                     ______________________
[SUPERVISOR NAME or "Supervisor's Name"]                                                                                      Date
(PROJECT SUPERVISOR)

_____________________                                                                       _____________________
[HOD NAME or "Head of Department's Name"]                                                                                           Date
(Head of Department)

_______________________                                                                     ___________________
EXTERNAL EXAMINER                                                                                Date


DEDICATION

[Generate a heartfelt dedication to God and family, similar to: "This project is dedicated to the Almighty God who made it possible... Also to my parents..."]


ACKNOWLEDGEMENTS

[Generate a comprehensive acknowledgement.
1. Thank God.
2. Thank parents/guardians for financial and moral support.
3. Thank the project supervisor (Dr. [SUPERVISOR NAME] if known) for guidance.
4. Thank the Head of Department and other lecturers.
5. Thank friends, siblings, and colleagues.
Keep it professional but warm, similar to the sample provided.]


ABSTRACT

[Generate a 200-250 word abstract for the project topic: "[TOPIC]".
Structure:
1. Objective/Aim of the study.
2. Methodology (mention random sampling or appropriate method for this topic).
3. Key findings (hypothetical but realistic).
4. Conclusion and Recommendations.
Start with "This study assessed/investigated..."]


TABLE OF CONTENTS

[Generate a standard Table of Contents list for Chapters 1-5, including:
Title Page
Certification
Dedication
Acknowledgements
Abstract
List of Tables
Chapter One: Introduction (Background, Problem Statement, Objectives, etc.)
Chapter Two: Literature Review
Chapter Three: Methodology
Chapter Four: Results and Discussion
Chapter Five: Summary, Conclusion, Recommendations
References]


LIST OF TABLES

[Generate a placeholder list of 3-5 realistic tables relevant to the topic]


LIST OF FIGURES

[Generate a placeholder list of 3-5 realistic figures relevant to the topic]

IMPORTANT: return the content in plain text format. Maintain the spacing and capitalized headings.
`,

  CHAT_REVIEW: `
You are a direct assistant for Nigerian university students writing final year projects. NEVER start responses with greetings like "Welcome" or "Hello". NEVER introduce yourself as "FinalYearNG AI".

IMPORTANT: Use plain text only. No asterisks, no markdown, no special formatting.

    CRITICAL INSTRUCTION:
    If the user asks you to WRITE, CREATE, GENERATE, SEND, or "GIVE ME" a chapter (e.g., "write chapter 1", "give me chapter 2", "send chapter 3"):
    - You MUST generate the COMPLETE chapter content immediately.
    - Do NOT ask for more details.
    - Do NOT outline what you will do.
    - JUST WRITE THE CHAPTER.
    - Ensure you include a "References" section at the very end, formatted exactly as requested in the chapter generation instructions.

    If the student asks for project topic suggestions (e.g. "Give me a topic for English", "Suggest project topics"):
    - Start by explicitly referencing their Faculty and Department in a friendly way (e.g., "For your Faculty of [X] and Department of [Y], here are some high-quality project topic ideas...").
    - Mention that you can fine-tune any of these choices to their taste.
    - DO NOT provide a detailed breakdown of a single topic yet.
    - INSTEAD, provide 5 to 7 distinct, high-quality project topics.
    - For each topic, provide a short 1-2 sentence overview of what the research would entail.
    - Ensure topics are relevant to their specified department/field.

    When a student provides a project topic (and doesn't explicitly ask to write a chapter yet):
    1. Immediately provide a comprehensive project overview and structure
    2. Outline how each chapter (1-5) should be approached
    3. Explain referencing methodology (APA style)
    4. Suggest specific content relevant to their topic
    5. Provide actionable next steps

    When they provide additional details or request edits:
    - Give specific writing feedback
    - Suggest content improvements
    - Help with structure and flow
    - Assist with APA formatting

    Keep initial responses comprehensive but focused. Be proactive, not just ask questions.
`,

  TOPIC_GENERATION_CHAT: `
You are FinalYearNG AI, focused on helping Nigerian university students generate final year project topics.

IMPORTANT: Always reference the user's faculty and department. The user's information will be provided in the context.

Be direct and focused on project topic generation. Ask specific questions to understand their needs, then generate relevant topics.

When generating topics:
1. Start with a friendly message explicitly referencing their Faculty and Department (e.g., "For your Faculty of [X] and Department of [Y], here are some tailored project topics...").
2. Provide the topics in the required JSON format at the end of your response.

JSON Format:
[
  {
    "title": "Full topic title",
    "department": "User's department",
    "domain": "Research domain/area",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "description": "Brief description of the topic"
  }
]

Keep responses focused on topic generation. Reference faculty and department in every response.
`
};

/**
 * Call AI service with messages
 * @param {string} model - AI model to use (default: kimi-free)
 * @param {Array} messages - Array of message objects with role and content
 * @param {string} taskType - Type of task (topics, chapter, chat)
 * @returns {Promise<string>} - AI response text
 */
const callAI = async (model = DEFAULT_MODEL, messages, taskType = 'general') => {
  try {
    // Debug: confirm GEMINI API key is loaded from environment
    console.log('GEMINI_API_KEY loaded:', !!process.env.GEMINI_API_KEY);

    // Add system prompt based on task type
    const systemMessage = SYSTEM_PROMPTS[taskType] || SYSTEM_PROMPTS.CHAT_REVIEW;

    // Convert OpenAI-style messages to Gemini format
    const geminiMessages = convertMessagesToGemini([
      { role: 'user', content: systemMessage }, // Gemini doesn't have system role, so we add it as a user message
      ...messages
    ]);

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
          topP: 0.9,
          responseMimeType: "text/plain"
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH"
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 second timeout
      }
    );

    if (!response.data.candidates || response.data.candidates.length === 0) {
      throw new Error('No response from AI service');
    }

    const candidate = response.data.candidates[0];

    // Check for safety blocking or other finish reasons
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      console.warn(`AI finish reason: ${candidate.finishReason}`);
      if (candidate.finishReason === 'SAFETY') {
        throw new Error('AI response was blocked by safety settings. Please try a different prompt.');
      }
    }

    // Validate content structure
    if (!candidate.content || !candidate.content.parts) {
      throw new Error('AI response received but contained no valid content parts.');
    }

    // Extract text from Gemini response
    const text = candidate.content.parts
      .map(part => part.text)
      .join('');

    return text.trim();

  } catch (error) {
    console.error('AI Service Error:', error.response?.data || error.message);

    // Handle different error types
    if (error.response?.status === 400) {
      throw new Error('Invalid request or API key');
    } else if (error.response?.status === 403) {
      throw new Error('API key invalid or quota exceeded');
    } else if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later');
    } else if (error.response?.status === 500 || error.response?.status === 503) {
      // Retry logic for 500/503 errors
      if (messages.length > 0) {
        console.log(`Retrying AI request due to ${error.response?.status} error...`);
        try {
          // Simple retry mechanism
           const retryResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
              contents: geminiMessages,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4000,
                topP: 0.9,
                responseMimeType: "text/plain"
              },
              safetySettings: [
                {
                  category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                  threshold: "BLOCK_ONLY_HIGH"
                }
              ]
            },
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 60000
            }
          );

           if (retryResponse.data.candidates && retryResponse.data.candidates.length > 0) {
             const retryCandidate = retryResponse.data.candidates[0];
             if (retryCandidate.content && retryCandidate.content.parts) {
               const text = retryCandidate.content.parts
                 .map(part => part.text)
                 .join('');
               return text.trim();
             }
           }
        } catch (retryError) {
          console.error('Retry failed:', retryError.message);
        }
      }
      throw new Error(error.response?.status === 503 ? 'AI service overloaded. Please try again.' : 'AI service internal error. Please try again');
    } else {
      throw new Error(`AI service error: ${error.message}`);
    }
  }
};

/**
 * Generate project topics
 * @param {Object} params - Topic generation parameters
 * @param {string} params.department - Student department
 * @param {string} params.domain - Research domain
 * @param {Array} params.keywords - Keywords array
 * @param {number} params.count - Number of topics to generate (default: 5)
 * @returns {Promise<Array>} - Array of topic objects
 */
const generateTopics = async ({ department, domain, keywords, count = 5 }) => {
  const prompt = `Generate ${count} unique final year project topics for ${department} department.
  Focus area: ${domain}
  Keywords: ${keywords.join(', ')}
  Return as JSON array only.`;

  const response = await callAI(DEFAULT_MODEL, [{ role: 'user', content: prompt }], 'TOPIC_GENERATION');

  try {
    // Try to parse JSON response
    const topics = JSON.parse(response);
    return Array.isArray(topics) ? topics : [];
  } catch (error) {
    console.error('Failed to parse topics JSON:', error);
    // Fallback: extract topics from text response
    return extractTopicsFromText(response);
  }
};

/**
 * Generate project chapter
 * @param {Object} params - Chapter generation parameters
 * @param {string} params.topic - Project topic
 * @param {number} params.chapterNumber - Chapter number (1-5)
 * @param {string} params.department - Department
 * @param {string} params.existingContent - Existing chapter content (optional)
 * @returns {Promise<string>} - Generated chapter content
 */
const generateChapter = async ({ topic, chapterNumber, department, existingContent = '' }) => {
  const chapterTitles = {
    1: 'Introduction',
    2: 'Literature Review',
    3: 'Methodology',
    4: 'Results and Analysis',
    5: 'Conclusion and Recommendations'
  };

  const chapterTitle = chapterTitles[chapterNumber] || `Chapter ${chapterNumber}`;

  const prompt = `Generate ${chapterTitle} for the project: "${topic}"
  Department: ${department}
  ${existingContent ? `Existing content to build upon: ${existingContent}` : ''}

  Generate comprehensive academic content following Nigerian university standards.
  CRITICAL: You must include a "References" section at the very end of the chapter, formatted exactly as requested in the system instructions.`;

  return await callAI(DEFAULT_MODEL, [{ role: 'user', content: prompt }], 'CHAPTER_GENERATION');
};

/**
 * Generate preliminary pages
 * @param {Object} params - Parameters
 * @param {string} params.topic - Project topic
 * @param {string} params.name - Student name
 * @param {string} params.department - Department
 * @param {string} params.faculty - Faculty
 * @param {string} params.university - University
 * @param {string} params.degree - Degree (e.g. B.Sc)
 * @returns {Promise<string>} - Generated content
 */
const generatePreliminaryPages = async ({ topic, name, department, faculty, university, degree }) => {
  const prompt = `Generate preliminary pages for:
  Student: ${name}
  Topic: ${topic}
  Department: ${department}
  Faculty: ${faculty}
  University: ${university}
  Degree: ${degree || 'Bachelor of Science'}
  `;

  return await callAI(DEFAULT_MODEL, [{ role: 'user', content: prompt }], 'PRELIMINARY_PAGES');
};

/**
 * Chat with AI for review/edit assistance
 * @param {Array} messages - Chat history messages
 * @param {string} context - Current project context
 * @returns {Promise<string>} - AI response
 */
const chatReview = async (messages, context = '') => {
  const contextMessage = context ?
    `Current project context: ${context}\n\nUser question:` :
    'User question:';

  const formattedMessages = messages.map(msg => ({
    role: msg.role,
    content: `${contextMessage} ${msg.content}`
  }));

  return await callAI(DEFAULT_MODEL, formattedMessages, 'CHAT_REVIEW');
};

/**
 * Chat with AI for topic generation
 * @param {Array} messages - Chat history messages
 * @param {Object} userContext - User context with university, faculty, department
 * @returns {Promise<string>} - AI response
 */
const chatTopicGeneration = async (messages, userContext) => {
  // Build context message with user information
  const userInfoContext = `User Information:
- University: ${userContext.university}
- Faculty: ${userContext.faculty}
- Department: ${userContext.department}

IMPORTANT: Always reference the user's faculty (${userContext.faculty}) and department (${userContext.department}) when generating topics. Make sure all topics are relevant to their field of study.`;

  // Filter out system messages and prepare messages for AI
  const conversationMessages = messages.filter(msg => msg.role !== 'system');
  
  // Add user context to the first user message if it exists
  if (conversationMessages.length > 0 && conversationMessages[0].role === 'user') {
    conversationMessages[0] = {
      ...conversationMessages[0],
      content: `${userInfoContext}\n\n${conversationMessages[0].content}`
    };
  }

  // Use the topic generation chat system prompt
  return await callAI(DEFAULT_MODEL, conversationMessages, 'TOPIC_GENERATION_CHAT');
};

// Helper function to convert OpenAI-style messages to Gemini format
const convertMessagesToGemini = (messages) => {
  return messages.map(message => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }]
  }));
};

// Helper function to extract topics from text if JSON parsing fails
const extractTopicsFromText = (text) => {
  // TODO: Implement fallback topic extraction from plain text
  // This is a placeholder implementation
  return [];
};

module.exports = {
  callAI,
  generateTopics,
  generateChapter,
  generatePreliminaryPages,
  chatReview,
  chatTopicGeneration,
  AI_MODELS,
  DEFAULT_MODEL
};
