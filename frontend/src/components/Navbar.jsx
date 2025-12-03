import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LuMenu } from 'react-icons/lu';

const Navbar = ({ onMenuClick }) => {
  const { logout } = useAuth();
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
      </div>
    </div>
  </nav>
  );
};

export default Navbar;
