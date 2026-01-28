import { useDispatch, useSelector } from 'react-redux';
import { Menu, Bell, LogOut } from 'lucide-react';
import { logout, selectUser } from '@features/auth/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { getInitials } from '@utils/helpers';

/**
 * Header Component - Top navigation bar
 */
const Header = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="sticky top-0 z-30 bg-surface-card border-b border-border">
      <div className="flex items-center justify-between px-4 py-4 lg:px-6">
        {/* Left: Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-surface-alt transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Right: User Actions */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-surface-alt transition-colors relative">
            <Bell className="w-5 h-5 text-text-secondary" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-status-error rounded-full" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-semibold">
              {getInitials(user?.name || 'User')}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-text-primary">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-text-muted">{user?.email || ''}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-surface-alt transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;