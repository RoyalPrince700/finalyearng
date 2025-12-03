import { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../api/api';
import SaveContentModal from './SaveContentModal';
import { handleDownloadDocx, handleDownloadPdf } from '../utils/downloadUtils';

const ChatUI = ({
  projectId,
  projectContent,
  chapterNumber = 0,
  initialMessages,
  onContentUpdate,
  onMessagesChange,
  onSendMessage,
  customChatHandler,
  placeholder = "Ask me to review, edit, or improve your content...",
  showHeader = true,
  headerTitle = "AI Assistant",
  headerSubtitle = null,
  resetTrigger = 0
}) => {
  const [messages, setMessages] = useState(initialMessages || []);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [contentToSave, setContentToSave] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Seed messages when a new conversation (e.g., different chapter) is opened.
    // Only run when a real initialMessages array is provided.
    if (!initialMessages || !Array.isArray(initialMessages)) {
      return;
    }

    setMessages(initialMessages);
    setHasError(initialMessages.some((m) => m.isError));
  }, [initialMessages]);

  // Reset chat when resetTrigger changes
  useEffect(() => {
    if (resetTrigger > 0) {
      setMessages(initialMessages || []);
      setHasError(false);
      setInputMessage('');
      if (typeof onMessagesChange === 'function') {
        onMessagesChange(initialMessages || []);
      }
    }
  }, [resetTrigger, initialMessages, onMessagesChange]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setHasError(false);

    try {
      // Use custom onSendMessage handler if provided (for conversation management)
      if (onSendMessage) {
        await onSendMessage(inputMessage);
      } else {
        let aiResponse;

        // Use custom handler if provided, otherwise use default chat API
        if (customChatHandler) {
          aiResponse = await customChatHandler([...messages, userMessage]);
        } else {
          const response = await aiAPI.chat({
            messages: [...messages, userMessage],
            context: projectContent,
            projectId,
            chapterNumber
          });
          aiResponse = response.data.data.response;
        }

        const aiMessage = {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        };

        const updatedMessages = [...messages, userMessage, aiMessage];
        setMessages(updatedMessages);

        if (typeof onMessagesChange === 'function') {
          onMessagesChange(updatedMessages);
        }
      }

      // If the response contains content suggestions, we may want to expose an
      // "Apply to editor" affordance via message metadata.
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      const updatedMessages = [...messages, userMessage, errorMessage];
      setMessages(updatedMessages);
      if (typeof onMessagesChange === 'function') {
        onMessagesChange(updatedMessages);
      }
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setHasError(false);
    if (typeof onMessagesChange === 'function') {
      onMessagesChange([]);
    }
  };

  const isSuggestionMessage = (content) => {
    if (!content) return false;
    const lowered = content.toLowerCase();
    return (
      lowered.includes('revised version') ||
      lowered.includes('suggested content') ||
      lowered.startsWith('revised text:') ||
      lowered.startsWith('here is a revised') ||
      lowered.startsWith('here is the improved') ||
      lowered.startsWith('updated version:')
    );
  };

  const handleApplySuggestion = (messageContent) => {
    if (typeof onContentUpdate === 'function') {
      onContentUpdate(messageContent);
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch {
      return '';
    }
  };

  const handleOpenSaveModal = (content) => {
    setContentToSave(content);
    setIsSaveModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 sm:px-6 lg:px-8 py-6 space-y-6 bg-white">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-neutral-500">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-lg font-medium mb-2">Start a conversation</p>
              <p className="text-sm">Ask me to review, edit, or improve your project content.</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className="w-full max-w-3xl flex">
                <div
                  className={`message-bubble ${
                    message.role === 'user'
                      ? 'message-user'
                      : message.isError
                      ? 'message-error'
                      : 'message-assistant'
                  } flex-1`}
                >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500">
                  <span>{formatTimestamp(message.timestamp)}</span>
                  {message.role === 'assistant' && !message.isError && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleDownloadDocx(message.content, 'finalyearng-response')}
                      >
                        DOCX
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleDownloadPdf(message.content, 'finalyearng-response')}
                      >
                        PDF
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleOpenSaveModal(message.content)}
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
                {message.role === 'assistant' &&
                  !message.isError &&
                  isSuggestionMessage(message.content) &&
                  typeof onContentUpdate === 'function' && (
                    <div className="mt-2">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleApplySuggestion(message.content)}
                      >
                        Apply to editor
                      </button>
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="shrink-0 w-8 h-8 rounded-full bg-primary-900 flex items-center justify-center text-xs font-semibold text-white ml-3 mt-1">
                    U
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="w-full max-w-3xl flex">
              <div className="message-bubble message-assistant flex-1">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
                <span className="text-sm text-neutral-600">AI is thinking...</span>
              </div>
            </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="shrink-0 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={placeholder}
              className="flex-1 input"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!inputMessage.trim() || isLoading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      <SaveContentModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        projectId={projectId}
        contentToSave={contentToSave}
      />
    </div>
  );
};

export default ChatUI;
