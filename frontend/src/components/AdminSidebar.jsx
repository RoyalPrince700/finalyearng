import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LuLayoutDashboard,
  LuUsers,
  LuBookOpen,
  LuLogOut,
  LuChevronLeft,
  LuChevronRight,
  LuGraduationCap,
  LuBuilding
} from 'react-icons/lu';

const AdminSidebar = ({ collapsed = false, onToggle, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    : 'A';

  const baseNavItemClasses =
    'flex items-center rounded-lg px-3 py-2 text-sm transition-colors w-full text-left';
  const navLayoutClasses = collapsed ? 'justify-center' : 'gap-3';
  
  const getActiveClasses = (tabName) => 
    activeTab === tabName
      ? 'bg-neutral-100 text-neutral-900'
      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900';

  return (
    <aside
      className={`fixed md:relative z-50 h-full flex flex-col bg-neutral-100 text-neutral-900 border-r border-neutral-200 transition-all duration-300 
      ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Collapse toggle */}
      <div className={`flex items-center h-12 px-2 border-b border-neutral-200 ${collapsed ? 'justify-center' : 'justify-end'}`}>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
        >
          {collapsed ? (
            <LuChevronRight className="w-4 h-4" />
          ) : (
            <LuChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="p-4 border-b border-neutral-200">
        {!collapsed ? (
          <h2 className="text-lg font-bold text-neutral-800">Admin Panel</h2>
        ) : (
          <div className="flex justify-center">
             <span className="font-bold text-lg">AP</span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="px-2 py-4 flex-1 overflow-y-auto space-y-1 text-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className={`${baseNavItemClasses} ${navLayoutClasses} ${getActiveClasses('overview')}`}
        >
          <LuLayoutDashboard className="w-4 h-4" />
          {!collapsed && <span>Overview</span>}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`${baseNavItemClasses} ${navLayoutClasses} ${getActiveClasses('users')}`}
        >
          <LuUsers className="w-4 h-4" />
          {!collapsed && <span>Users Management</span>}
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`${baseNavItemClasses} ${navLayoutClasses} ${getActiveClasses('projects')}`}
        >
          <LuBookOpen className="w-4 h-4" />
          {!collapsed && <span>Project Topics</span>}
        </button>

        <button
          onClick={() => setActiveTab('faculties')}
          className={`${baseNavItemClasses} ${navLayoutClasses} ${getActiveClasses('faculties')}`}
        >
          <LuGraduationCap className="w-4 h-4" />
          {!collapsed && <span>Faculties & Depts</span>}
        </button>
      </nav>

      <div className="px-2 py-2 border-t border-neutral-200">
        <NavLink
          to="/"
          className={`${baseNavItemClasses} ${navLayoutClasses} text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900`}
        >
          <LuChevronLeft className="w-4 h-4" />
          {!collapsed && <span>Back to App</span>}
        </NavLink>
      </div>

      {/* User section / Logout */}
      <div className="border-t border-neutral-200 px-3 py-3">
        <div
          className={`flex items-center ${
            collapsed ? 'flex-col-reverse justify-center gap-4' : 'flex-row justify-between'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-semibold text-red-900">
              {userInitials}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-neutral-500 truncate">Administrator</p>
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

export default AdminSidebar;

