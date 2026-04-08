
// ===== src/components/layout/Sidebar/Sidebar.jsx =====
import { href, Link, useLocation } from 'react-router-dom';
import { X, LayoutDashboard, FileText, Target, User, Compass, History, Bot } from 'lucide-react';
import { ROUTES } from '@constants/routes';
import { cn } from '@utils/helpers';

const navigation = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Resume Analysis', href: ROUTES.RESUME_ANALYSIS, icon: FileText },
  { name: 'Skill Gap', href: ROUTES.SKILL_GAP, icon: Target },
  { name: 'Recommendation', href: ROUTES.RECOMMENDATIONS, icon: Compass },
  { name: 'Resume History', href: ROUTES.RESUME_HISTORY, icon: History },
  { name: 'Chat Bot', href: ROUTES.CHAT_BOT, icon: Bot },
  { name: 'Profile', href: ROUTES.PROFILE, icon: User },
];

/**
 * Sidebar Component - Navigation sidebar
 */
const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-surface-card border-r border-border transform transition-transform duration-300 ease-out-expo lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h1 className="text-xl font-bold text-brand-primary">CareerAI</h1>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-alt transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-brand-primary text-white'
                    : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;