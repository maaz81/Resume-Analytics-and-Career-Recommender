import { useState } from 'react';
import { cn } from '@utils/helpers';

/**
 * Tabs Component
 * Accessible tab navigation with keyboard support
 * 
 * @param {Array} tabs - Array of tab objects [{id, label, content}]
 * @param {string} defaultTab - Default active tab id
 * @param {function} onChange - Tab change handler
 * @param {string} variant - 'default' | 'pills' | 'underline'
 */
const Tabs = ({
  tabs = [],
  defaultTab,
  onChange,
  variant = 'underline',
  className,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  const handleKeyDown = (e, tabId) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    let nextIndex;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabs.length;
      handleTabChange(tabs[nextIndex].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
      handleTabChange(tabs[nextIndex].id);
    }
  };

  // Variant styles
  const variantStyles = {
    default: {
      container: 'border-b border-border',
      tab: 'px-4 py-2 border-b-2 border-transparent transition-colors',
      activeTab: 'border-brand-primary text-brand-primary',
      inactiveTab: 'text-text-secondary hover:text-text-primary hover:border-text-muted',
    },
    pills: {
      container: 'bg-surface-alt p-1 rounded-lg',
      tab: 'px-4 py-2 rounded-md transition-all',
      activeTab: 'bg-surface-card shadow-sm text-text-primary',
      inactiveTab: 'text-text-secondary hover:text-text-primary',
    },
    underline: {
      container: 'border-b-2 border-border',
      tab: 'px-6 py-3 relative transition-colors',
      activeTab: 'text-brand-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-primary',
      inactiveTab: 'text-text-secondary hover:text-text-primary',
    },
  };

  const styles = variantStyles[variant];

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={cn('w-full', className)}>
      {/* Tab List */}
      <div
        role="tablist"
        className={cn('flex items-center gap-1', styles.container)}
        aria-label="Tabs"
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              className={cn(
                'font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 rounded-md',
                styles.tab,
                isActive ? styles.activeTab : styles.inactiveTab
              )}
            >
              {tab.icon && (
                <span className="inline-flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </span>
              )}
              {!tab.icon && tab.label}
              {tab.badge && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-brand-primary/10 text-brand-primary">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <div
              key={tab.id}
              id={`panel-${tab.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${tab.id}`}
              hidden={!isActive}
              className={cn(
                'focus:outline-none',
                isActive ? 'animate-fadeIn' : ''
              )}
              tabIndex={0}
            >
              {isActive && tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;