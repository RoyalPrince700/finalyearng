import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AuthenticatedLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fix for mobile keyboard resizing
  useEffect(() => {
    const handleResize = () => {
      // On mobile, we want to ensure the layout fits the visual viewport
      // to prevent the keyboard from pushing the navbar off-screen.
      // We set the height of the root element or body to visualViewport height.
      if (window.visualViewport) {
        const height = window.visualViewport.height;
        document.body.style.height = `${height}px`;
        window.scrollTo(0, 0);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
      handleResize(); // Initial call
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
        document.body.style.height = '100%'; // Reset on unmount
      }
    };
  }, []);

  return (
    <div className="flex h-full w-full bg-neutral-100 overflow-hidden fixed inset-0">
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


