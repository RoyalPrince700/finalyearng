import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LuMenu, LuLayoutDashboard } from 'react-icons/lu';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={onMenuClick}
            >
              <LuMenu className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-tight text-neutral-900">
                  FinalYearNG
                </span>
                <span className="text-xs text-neutral-500">
                  AI Project Assistant
                </span>
              </div>
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 transition-colors"
              >
                <LuLayoutDashboard className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
