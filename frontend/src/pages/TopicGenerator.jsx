import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { aiAPI, projectAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import ChatUI from '../components/ChatUI';

const TopicGenerator = () => {
  const [messages, setMessages] = useState([]);
  const [generatedTopics, setGeneratedTopics] = useState([]);
  const [creatingProject, setCreatingProject] = useState(false);
  const [chatResetTrigger, setChatResetTrigger] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const chatInitialized = useRef(false);

  // Initialize chat with welcome message
  const getWelcomeMessage = useCallback(() => {
    if (!user) return [];
    return [{
      role: 'assistant',
      content: `Hello! I'm here to help you generate project topics for your final year project.

I can see you're from:
- **University:** ${user.university || 'Not specified'}
- **Faculty:** ${user.faculty || 'Not specified'}
- **Department:** ${user.department || 'Not specified'}

To help me generate the best project topics for you, I'd like to ask a few questions:

1. **Do you have any reference materials or sample project topics** that inspire you? If yes, please share them.

2. **What should the project topic focus on?** (e.g., specific technologies, research areas, problems to solve, etc.)

3. **Are there any particular keywords or domains** you're interested in exploring?

Feel free to share any ideas, preferences, or constraints you have in mind, and I'll generate relevant project topics tailored to your department and faculty!`,
      timestamp: new Date()
    }];
  }, [user]);

  useEffect(() => {
    if (!chatInitialized.current && user) {
      setMessages(getWelcomeMessage());
      chatInitialized.current = true;
    }
  }, [user, getWelcomeMessage]);

  // Reset chat when navigating from "New Project Topic" button
  useEffect(() => {
    if (location.state?.resetChat && user) {
      const welcomeMsg = getWelcomeMessage();
      setMessages(welcomeMsg);
      setGeneratedTopics([]);
      setChatResetTrigger(prev => prev + 1);
      // Clear the state to prevent resetting on every render
      window.history.replaceState({}, document.title);
    }
  }, [location.state, getWelcomeMessage, user]);

  const handleMessagesChange = (updatedMessages) => {
    setMessages(updatedMessages);
    
    // Check if the latest AI response contains generated topics (JSON format)
    const lastMessage = updatedMessages[updatedMessages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.isError) {
      // Try to parse topics from the last AI message
      try {
        // Look for JSON array in the message
        const jsonMatch = lastMessage.content.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          const topics = JSON.parse(jsonMatch[0]);
          if (Array.isArray(topics) && topics.length > 0) {
            setGeneratedTopics(topics);
          }
        }
      } catch (e) {
        // Not a topics response, continue normally
        console.log('No topics found in response');
      }
    }
  };

  const handleCreateProject = async (topic) => {
    setCreatingProject(true);
    try {
      const projectData = {
        title: topic.title || topic,
        topic: topic.title || topic,
        department: user.department,
        domain: topic.domain || '',
        keywords: topic.keywords || []
      };

      const response = await projectAPI.createProject(projectData);
      navigate(`/project/${response.data.data._id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setCreatingProject(false);
    }
  };

  // Custom chat handler for topic generation
  const handleTopicChat = async (chatMessages) => {
    // Send to topic generation chat endpoint
    const response = await aiAPI.chatTopicGeneration({
      messages: chatMessages
    });

    return response.data.data.response;
  };

  // Get user context for chat
  const getUserContext = () => {
    return `University: ${user?.university || 'Not specified'}, Faculty: ${user?.faculty || 'Not specified'}, Department: ${user?.department || 'Not specified'}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Interface - Full Height */}
      <div className="flex-1 flex flex-col min-h-0">
        <ChatUI
          projectId={null}
          projectContent={getUserContext()}
          initialMessages={messages}
          onMessagesChange={handleMessagesChange}
          customChatHandler={handleTopicChat}
          placeholder="Share your ideas, references, or preferences for your project topic..."
          showHeader={false}
          resetTrigger={chatResetTrigger}
        />
      </div>

      {/* Generated Topics Display - Fixed at bottom, scrollable */}
      {generatedTopics.length > 0 && (
        <div className="shrink-0 border-t border-neutral-200 bg-white max-h-[40vh] overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Generated Topics</h2>
            <div className="grid gap-3">
              {generatedTopics.map((topic, index) => (
                <div key={index} className="card border-l-4 border-l-primary-500 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-2">
                        {topic.title || topic}
                      </h3>
                      {typeof topic === 'object' && (
                        <div className="space-y-1 text-sm text-gray-600">
                          {topic.department && (
                            <p><strong>Department:</strong> {topic.department}</p>
                          )}
                          {topic.domain && (
                            <p><strong>Domain:</strong> {topic.domain}</p>
                          )}
                          {topic.keywords && topic.keywords.length > 0 && (
                            <p><strong>Keywords:</strong> {topic.keywords.join(', ')}</p>
                          )}
                          {topic.description && (
                            <p className="text-gray-700 mt-2 text-xs">{topic.description}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleCreateProject(topic)}
                      className="btn btn-primary shrink-0"
                      disabled={creatingProject}
                    >
                      {creatingProject ? 'Creating...' : 'Create Project'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicGenerator;
