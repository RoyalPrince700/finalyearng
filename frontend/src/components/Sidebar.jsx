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
  LuPenLine,
  LuCheck,
  LuX,
  LuSave
} from 'react-icons/lu';
import { conversationAPI, projectAPI } from '../api/api';

const Sidebar = ({ collapsed = false, onToggle, isMobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [activeConversationMenuId, setActiveConversationMenuId] = useState(null);
  const [projectTopic, setProjectTopic] = useState('');
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [tempTopic, setTempTopic] = useState('');
  const [projectId, setProjectId] = useState(null);
  const [loadingTopic, setLoadingTopic] = useState(false);

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

  const loadProjectTopic = async () => {
    try {
      setLoadingTopic(true);
      const response = await projectAPI.getProjects();
      const projects = response.data.data || [];
      if (projects.length > 0) {
        // Get the most recent project
        const latestProject = projects[0];
        setProjectTopic(latestProject.topic);
        setProjectId(latestProject._id);
      }
    } catch (error) {
      console.error('Failed to load project topic:', error);
    } finally {
      setLoadingTopic(false);
    }
  };

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
    loadProjectTopic();

    const handleRefresh = () => {
      loadConversations();
    };

    const handleTopicRefresh = () => {
      loadProjectTopic();
    };

    window.addEventListener('conversationListRefresh', handleRefresh);
    window.addEventListener('projectTopicRefresh', handleTopicRefresh);

    return () => {
      window.removeEventListener('conversationListRefresh', handleRefresh);
      window.removeEventListener('projectTopicRefresh', handleTopicRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveTopic = async () => {
    if (!tempTopic.trim()) {
      setIsEditingTopic(false);
      return;
    }

    try {
      if (projectId) {
        // Update existing project
        await projectAPI.updateProject(projectId, { topic: tempTopic });
        setProjectTopic(tempTopic);
      } else {
        // Create new project if none exists
        // Note: We need a default department if creating new. 
        // Ideally this flow should be "Create New Project" but for quick edit we can use user's dept
        const response = await projectAPI.createProject({
          title: tempTopic,
          topic: tempTopic,
          department: user.department || 'General'
        });
        setProjectId(response.data.data._id);
        setProjectTopic(tempTopic);
        
        // Trigger refresh to update dashboard if needed
        window.dispatchEvent(new CustomEvent('projectTopicRefresh'));
      }
    } catch (error) {
      console.error('Failed to save topic:', error);
      alert('Failed to save topic. Please try again.');
    } finally {
      setIsEditingTopic(false);
    }
  };

  const startEditingTopic = () => {
    setTempTopic(projectTopic);
    setIsEditingTopic(true);
  };

  const cancelEditingTopic = () => {
    setTempTopic('');
    setIsEditingTopic(false);
  };

  const handleConversationClick = (conversationId) => {
    navigate('/conversations', { state: { conversationId } });
    if (isMobileOpen && onMobileClose) {
      onMobileClose();
    }
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
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed md:relative z-50 h-full flex flex-col bg-neutral-100 text-neutral-900 border-r border-neutral-200 transition-all duration-300 
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${collapsed ? 'md:w-20' : 'md:w-64'} w-[90%]`}
      >
        {/* Collapse toggle */}
      <div className={`hidden md:flex items-center h-12 px-2 border-b border-neutral-200 ${collapsed ? 'justify-center' : 'justify-end'}`}>
        <button
          type="button"
          onClick={isMobileOpen ? onMobileClose : onToggle}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          aria-label={collapsed && !isMobileOpen ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed && !isMobileOpen ? (
            <LuChevronRight className="w-4 h-4" />
          ) : (
            <LuChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Project Topic Section - ONLY VISIBLE WHEN NOT COLLAPSED */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-neutral-200 bg-white">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 mb-2 flex items-center justify-between">
            <span>Current Project Topic</span>
            {!isEditingTopic && (
              <button 
                onClick={startEditingTopic}
                className="text-neutral-400 hover:text-primary-600 transition-colors"
                title="Edit Topic"
              >
                <LuPenLine className="w-3 h-3" />
              </button>
            )}
          </div>
          
          {isEditingTopic ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={tempTopic}
                onChange={(e) => setTempTopic(e.target.value)}
                className="w-full text-xs p-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                rows={3}
                placeholder="Enter your project topic..."
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={cancelEditingTopic}
                  className="p-1 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded"
                  title="Cancel"
                >
                  <LuX className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleSaveTopic}
                  className="p-1 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded font-medium"
                  title="Save"
                >
                  <LuCheck className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div 
              className="text-sm font-medium text-neutral-800 line-clamp-3 cursor-pointer hover:text-primary-700 transition-colors"
              onClick={startEditingTopic}
              title={projectTopic || "Click to add a project topic"}
            >
              {loadingTopic ? (
                <span className="text-neutral-400 italic">Loading...</span>
              ) : (
                projectTopic || <span className="text-neutral-400 italic">No topic set. Click to add one.</span>
              )}
            </div>
          )}
        </div>
      )}

        {/* Navigation Links */}
      <nav className="px-2 py-4 flex-1 overflow-y-auto space-y-1 text-sm">
        <NavLink
          to="/"
          state={{ resetChat: true }}
          onClick={() => isMobileOpen && onMobileClose && onMobileClose()}
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
          to="/saved-content"
          onClick={() => isMobileOpen && onMobileClose && onMobileClose()}
          className={({ isActive }) =>
            `${baseNavItemClasses} ${navLayoutClasses} ${
              isActive
                ? 'bg-neutral-100 text-neutral-900'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`
          }
        >
          <LuSave className="w-4 h-4" />
          {!collapsed && <span>Saved Content</span>}
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
            collapsed ? 'flex-col-reverse justify-center gap-4' : 'flex-row justify-between'
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
    </>
  );
};

export default Sidebar;

