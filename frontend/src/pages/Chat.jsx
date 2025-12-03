import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ChatUI from '../components/ChatUI';
import { conversationAPI } from '../api/api';

const Chat = () => {
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Listen for conversation selection events from ConversationSidebar
    const handleConversationSelected = (event) => {
      loadConversation(event.detail.conversationId);
    };

    const handleNewConversation = (event) => {
      loadConversation(event.detail.conversationId);
    };

    window.addEventListener('conversationSelected', handleConversationSelected);
    window.addEventListener('newConversation', handleNewConversation);

    return () => {
      window.removeEventListener('conversationSelected', handleConversationSelected);
      window.removeEventListener('newConversation', handleNewConversation);
    };
  }, []);

  // Load a specific conversation when navigated to with state
  useEffect(() => {
    const conversationId = location.state?.conversationId;
    if (conversationId) {
      loadConversation(conversationId);
      // Clear state so we don't reload on every render
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const loadConversation = async (conversationId) => {
    if (!conversationId) {
      setCurrentConversation(null);
      setMessages([]);
      return;
    }

    try {
      setLoading(true);
      const response = await conversationAPI.getConversation(conversationId);
      const conversation = response.data.data;

      setCurrentConversation(conversation);
      setMessages(
        (conversation.messages || []).map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          isError: msg.isError,
        }))
      );
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setCurrentConversation(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (message) => {
    if (!message || !message.trim()) return;

    if (!currentConversation) {
      // Create a new conversation if none exists yet
      try {
        const response = await conversationAPI.createConversation({
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          type: 'general',
          initialMessage: {
            role: 'user',
            content: message,
          },
        });

        const newConversation = response.data.data;
        const normalizedConversation = {
          ...newConversation,
          _id: newConversation._id || newConversation.id,
        };
        setCurrentConversation(normalizedConversation);
        window.dispatchEvent(new CustomEvent('conversationListRefresh'));

        // Seed local messages with the first user message
        const initialMessages = [
          {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
          },
        ];
        setMessages(initialMessages);

        // Get AI response and append to conversation, preserving history
        await getAIResponse(newConversation.id, message, initialMessages);
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
    } else {
      // Add message to existing conversation
      try {
        const userMessage = {
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        };

        const conversationId = currentConversation._id || currentConversation.id;

        await conversationAPI.addMessage(conversationId, {
          role: 'user',
          content: message,
        });

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        // Get AI response and append, preserving history
        await getAIResponse(conversationId, message, updatedMessages);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const getAIResponse = async (conversationId, userMessage, historyMessages = []) => {
    try {
      const baseMessages =
        historyMessages && historyMessages.length
          ? historyMessages
          : [
              {
                role: 'user',
                content: userMessage,
              },
            ];

      // Build a compact context window to avoid sending extremely long histories.
      // We approximate token usage using character length and keep the last few
      // messages plus the very first user message (which often contains the topic).
      const maxChars = 6000;
      let runningChars = 0;
      const windowMessages = [];

      for (let i = baseMessages.length - 1; i >= 0; i -= 1) {
        const m = baseMessages[i];
        const text = m?.content || '';
        if (runningChars + text.length > maxChars && windowMessages.length > 0) {
          break;
        }
        windowMessages.unshift(m);
        runningChars += text.length;
      }

      // Ensure earliest user message (often where topic is stated) is present.
      const firstUserMessage = baseMessages.find((m) => m.role === 'user');
      if (
        firstUserMessage &&
        !windowMessages.some((m) => m === firstUserMessage)
      ) {
        windowMessages.unshift(firstUserMessage);
      }

      const payloadMessages = windowMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Use existing AI chat endpoint to generate a reply
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          messages: payloadMessages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = data.data.response;

        // Persist AI response on the conversation
        await conversationAPI.addMessage(conversationId, {
          role: 'assistant',
          content: aiMessage,
        });

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: aiMessage,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    }
  };

  const handleMessagesChange = (updatedMessages) => {
    setMessages(updatedMessages || []);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ChatUI
        initialMessages={messages}
        onMessagesChange={handleMessagesChange}
        onSendMessage={handleSendMessage}
        placeholder="Ask me anything about your final year project..."
        headerTitle="AI Assistant"
        headerSubtitle="FinalYearNG AI - Your project writing companion"
        showHeader={true}
      />
    </div>
  );
};

export default Chat;
