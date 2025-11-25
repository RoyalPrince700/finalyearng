import { useState, useEffect } from 'react';
import { conversationAPI } from '../api/api';

const ConversationSidebar = ({
  currentConversationId,
  onConversationSelect,
  onNewConversation,
  isOpen = true,
  onToggle
}) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
      loadStats();
    }
  }, [isOpen]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await conversationAPI.getConversations({ limit: 50 });
      setConversations(response.data.data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await conversationAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load conversation stats:', error);
    }
  };

  const handleNewConversation = async () => {
    try {
      const response = await conversationAPI.createConversation({
        title: 'New Conversation',
        type: 'general'
      });
      const newConversation = response.data.data;
      setConversations(prev => [newConversation, ...prev]);
      onNewConversation(newConversation.id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleDeleteConversation = async (conversationId, event) => {
    event.stopPropagation();

    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      await conversationAPI.deleteConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv._id !== conversationId));
      if (currentConversationId === conversationId) {
        onConversationSelect(null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getConversationTypeIcon = (type) => {
    switch (type) {
      case 'project_specific':
        return '📄';
      case 'topic_generation':
        return '💡';
      default:
        return '💬';
    }
  };

  if (!isOpen) {
    return (
      <div className="w-12 bg-neutral-50 border-r border-neutral-200 flex flex-col items-center py-4">
        <button
          onClick={onToggle}
          className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
          title="Open conversations"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-neutral-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Conversations</h2>
          <button
            onClick={onToggle}
            className="p-1 text-neutral-600 hover:text-neutral-900"
            title="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
            <div className="text-sm text-neutral-600">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-medium">{stats.totalConversations}</span>
              </div>
              <div className="flex justify-between">
                <span>Messages:</span>
                <span className="font-medium">{stats.totalMessages}</span>
              </div>
            </div>
          </div>
        )}

        {/* New Conversation Button */}
        <button
          onClick={handleNewConversation}
          className="w-full btn btn-primary mb-3"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-4 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <svg className="w-4 h-4 absolute left-2.5 top-2.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            {searchTerm ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                className={`group relative p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                  currentConversationId === conversation._id
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-neutral-50'
                }`}
                onClick={() => onConversationSelect(conversation._id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm">{getConversationTypeIcon(conversation.type)}</span>
                      <h3 className="text-sm font-medium text-neutral-900 truncate">
                        {conversation.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>{conversation.messageCount} messages</span>
                      <span>{formatDate(conversation.lastMessageAt)}</span>
                    </div>

                    {conversation.project && (
                      <div className="mt-1 text-xs text-primary-600 truncate">
                        📄 {conversation.project.title}
                      </div>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteConversation(conversation._id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-600 transition-opacity"
                    title="Delete conversation"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationSidebar;
