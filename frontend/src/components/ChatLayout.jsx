import { useState } from 'react';
import ConversationSidebar from './ConversationSidebar';

const ChatLayout = ({ children }) => {
  const [conversationSidebarOpen, setConversationSidebarOpen] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  const handleConversationSelect = (conversationId) => {
    setCurrentConversationId(conversationId);
    // Pass the conversationId to children if needed
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('conversationSelected', {
        detail: { conversationId }
      }));
    }
  };

  const handleNewConversation = (conversationId) => {
    setCurrentConversationId(conversationId);
    // Notify children about new conversation
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('newConversation', {
        detail: { conversationId }
      }));
    }
  };

  return (
    <div className="flex h-full bg-neutral-100 overflow-hidden">
      {/* Conversation Sidebar */}
      <ConversationSidebar
        currentConversationId={currentConversationId}
        onConversationSelect={handleConversationSelect}
        onNewConversation={handleNewConversation}
        isOpen={conversationSidebarOpen}
        onToggle={() => setConversationSidebarOpen((prev) => !prev)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
