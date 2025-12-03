import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ChatUI from '../components/ChatUI';
import { conversationAPI, aiAPI } from '../api/api';

const Dashboard = () => {
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  // On first load, try to restore the most recent conversation so the
  // dashboard chat remembers previous messages, but without showing any
  // separate conversations panel in the UI. When navigating with
  // `state: { resetChat: true }` (e.g. clicking "New Project"), skip
  // restoring and start with a completely fresh chat.
  useEffect(() => {
    // If navigation requested a reset, clear current state and skip loading
    if (location.state?.resetChat) {
      setCurrentConversation(null);
      setMessages([]);
      // Clear the state so refresh/back doesn't keep resetting
      window.history.replaceState({}, document.title);
      return;
    }

    const initLastConversation = async () => {
      try {
        setLoading(true);
        const response = await conversationAPI.getConversations({ limit: 1 });
        const conversations = response.data.data || [];

        if (conversations.length > 0) {
          const latest = conversations[0];
          const convoResponse = await conversationAPI.getConversation(latest._id);
          const conversation = convoResponse.data.data;

          setCurrentConversation(conversation);
          setMessages(
            (conversation.messages || []).map((msg) => ({
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp,
              isError: msg.isError,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to initialise dashboard conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    initLastConversation();
  }, [location.state]);

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

        // Get AI response and append to conversation
        await getAIResponse(newConversation.id, message);
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
    } else {
      // Add message to existing conversation
      try {
        const conversationId = currentConversation._id || currentConversation.id;

        await conversationAPI.addMessage(conversationId, {
          role: 'user',
          content: message,
        });

        setMessages((prev) => [
          ...prev,
          {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
          },
        ]);

        // Get AI response and append
        await getAIResponse(conversationId, message);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const getAIResponse = async (conversationId, userMessage) => {
    try {
      // Use backend AI chat endpoint via axios client (respects VITE_API_URL)
      const response = await aiAPI.chat({
        messages: [{ role: 'user', content: userMessage }],
      });

      const aiMessage = response.data?.data?.response;
      if (!aiMessage) return;

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
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col min-h-0">
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
    </div>
  );
};

export default Dashboard;
