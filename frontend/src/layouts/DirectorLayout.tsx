import React from 'react';
import { Outlet } from 'react-router-dom';
import DirectorHeader from '../components/director/DirectorHeader';
import DirectorSidebar from '../components/director/DirectorSidebar';
import DirectorFooter from '../components/layout/DirectorFooter';
const DirectorLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Sidebar pour mobile */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform">
            <DirectorSidebar 
              sidebarOpen={true} 
              onClose={() => setMobileSidebarOpen(false)}
              isMobile={true}
            />
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar desktop */}
        <div className={`hidden lg:block transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
          <DirectorSidebar 
            sidebarOpen={sidebarOpen} 
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col min-h-screen">
          <DirectorHeader 
            onMenuClick={() => setMobileSidebarOpen(true)}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
          />
          
          <main className="flex-1 p-4 sm:p-6">
            <Outlet />
          </main>

          <DirectorFooter />
        </div>
      </div>
    </div>
  );
};

export default DirectorLayout;