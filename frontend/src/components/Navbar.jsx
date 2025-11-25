import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
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
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FY</span>
            </div>
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
    </nav>
  );
};

export default Navbar;
