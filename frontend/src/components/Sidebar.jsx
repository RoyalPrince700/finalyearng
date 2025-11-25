import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LuSparkles,
  LuSettings,
  LuLogOut,
  LuChevronLeft,
  LuChevronRight,
  LuPlus,
} from 'react-icons/lu';
import { conversationAPI } from '../api/api';

const Sidebar = ({ collapsed = false, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [activeConversationMenuId, setActiveConversationMenuId] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      const response = await conversationAPI.getConversations({ limit: 50 });
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Failed to load conversations in sidebar:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    loadConversations();

    const handleRefresh = () => {
      loadConversations();
    };

    window.addEventListener('conversationListRefresh', handleRefresh);

    return () => {
      window.removeEventListener('conversationListRefresh', handleRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConversationClick = (conversationId) => {
    navigate('/conversations', { state: { conversationId } });
  };

  const handleMenuToggle = (event, conversationId) => {
    event.stopPropagation();
    setActiveConversationMenuId((prev) =>
      prev === conversationId ? null : conversationId
    );
  };

  const handleRenameConversation = async (event, conversation) => {
    event.stopPropagation();

    const currentTitle = conversation.title || '';
    const newTitle = window.prompt('Rename conversation', currentTitle);
    if (!newTitle || newTitle.trim() === '' || newTitle === currentTitle) {
      setActiveConversationMenuId(null);
      return;
    }

    try {
      await conversationAPI.updateConversation(conversation._id, { title: newTitle.trim() });
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversation._id ? { ...conv, title: newTitle.trim() } : conv
        )
      );
    } catch (error) {
      console.error('Failed to rename conversation:', error);
    } finally {
      setActiveConversationMenuId(null);
    }
  };

  const handleDeleteConversation = async (event, conversationId) => {
    event.stopPropagation();

    const confirmed = window.confirm('Are you sure you want to delete this conversation?');
    if (!confirmed) return;

    try {
      await conversationAPI.deleteConversation(conversationId);
      setConversations((prev) => prev.filter((conv) => conv._id !== conversationId));
      setActiveConversationMenuId(null);

      // If user is currently viewing this conversation, send them back to dashboard
      if (window.location.pathname.startsWith('/conversations')) {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const baseNavItemClasses =
    'flex items-center rounded-lg px-3 py-2 text-sm transition-colors';
  const navLayoutClasses = collapsed ? 'justify-center' : 'gap-3';

  return (
    <aside
      className={`flex h-full flex-col bg-neutral-100 text-neutral-900 border-r border-neutral-200 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse toggle */}
      <div className="flex items-center justify-end h-12 px-2 border-b border-neutral-200">
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <LuChevronRight className="w-4 h-4" />
          ) : (
            <LuChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="px-2 py-4 flex-1 overflow-y-auto space-y-1 text-sm">
        <NavLink
          to="/"
          state={{ resetChat: true }}
          className={({ isActive }) =>
            `${baseNavItemClasses} ${navLayoutClasses} ${
              isActive
                ? 'bg-neutral-100 text-neutral-900'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`
          }
        >
          <LuPlus className="w-4 h-4" />
          {!collapsed && <span>New Project</span>}
        </NavLink>

        <NavLink
          to="/topics"
          state={{ resetChat: true }}
          className={({ isActive }) =>
            `${baseNavItemClasses} ${navLayoutClasses} ${
              isActive
                ? 'bg-neutral-100 text-neutral-900'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`
          }
        >
          <LuSparkles className="w-4 h-4" />
          {!collapsed && <span>New Project Topic</span>}
        </NavLink>

        {/* Conversations list directly in main sidebar */}
        {!collapsed && (
          <div className="mt-4">
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              Conversations
            </div>
            {loadingConversations ? (
              <div className="px-3 text-xs text-neutral-400">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="px-3 text-xs text-neutral-400">No conversations yet</div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    className="relative flex items-center gap-1 px-1"
                  >
                    <button
                      type="button"
                      onClick={() => handleConversationClick(conversation._id)}
                      className="flex-1 text-left px-2 py-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 transition-colors truncate"
                      title={conversation.title}
                    >
                      {conversation.title}
                    </button>
                    <button
                      type="button"
                      onClick={(event) => handleMenuToggle(event, conversation._id)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                      title="Conversation menu"
                    >
                      <span className="inline-flex items-center justify-center w-4 h-4 text-lg leading-none">
                        ···
                      </span>
                    </button>

                    {activeConversationMenuId === conversation._id && (
                      <div className="absolute right-2 top-8 z-20 w-40 rounded-lg border border-neutral-200 bg-white shadow-lg text-xs">
                        <button
                          type="button"
                          onClick={(event) => handleRenameConversation(event, conversation)}
                          className="block w-full px-3 py-2 text-left text-neutral-700 hover:bg-neutral-100"
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          onClick={(event) => handleDeleteConversation(event, conversation._id)}
                          className="block w-full px-3 py-2 text-left text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          className={`${baseNavItemClasses} ${navLayoutClasses} text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 w-full text-left`}
        >
          <LuSettings className="w-4 h-4" />
          {!collapsed && <span className="flex-1">Settings (coming soon)</span>}
        </button>
      </nav>

      {/* User section / Logout */}
      <div className="border-t border-neutral-200 px-3 py-3">
        <div
          className={`flex items-center ${
            collapsed ? 'justify-center gap-2' : 'justify-between'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-900">
              {userInitials}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-neutral-500 truncate">
                  {user?.department || 'Student'}
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <LuLogOut className="w-4 h-4" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

