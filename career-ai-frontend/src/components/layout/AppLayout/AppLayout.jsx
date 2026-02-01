
// ===== src/components/layout/AppLayout/AppLayout.jsx =====
import { useState } from 'react';
import Sidebar from '../Sidebar';
import Header from '../Header';
import AIChatPanel from '@features/chat/components/AIChatPanel';
import ChatFAB from '@features/chat/components/ChatFAB';

/**
 * AppLayout - Main application layout with sidebar and header
 * Used for all authenticated pages
 */
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-background">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="py-6">
          <div className="container-app">
            {children}
          </div>
        </main>
      </div>

      {/* AI Chat Assistant */}
      <AIChatPanel />
      <ChatFAB />
    </div>
  );
};

export default AppLayout;
