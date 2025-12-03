import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AuthenticatedLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden">
      {/* Sidebar stays fixed while main content scrolls */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main content area scrolls independently */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Top navbar for authenticated pages (branding moved here) */}
        <div className="shrink-0 bg-white border-b border-neutral-200">
          <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        </div>

        {/* Main content - full height for chat pages */}
        <div className="flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthenticatedLayout;


