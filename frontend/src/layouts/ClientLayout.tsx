import React from 'react';
import { Outlet } from 'react-router-dom';
import ClientFooter from '../components/layout/ClientFooter';
import ClientHeader from '../components/client/ClientHeader';
import ClientSidebar from '../components/client/ClientSidebar';

const ClientLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar pour mobile */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="fixed inset-0 bg-black bg-opacity-30"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <ClientSidebar 
              sidebarOpen={true} 
              onClose={() => setMobileSidebarOpen(false)}
              isMobile={true}
            />
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar desktop */}
        <div className={`hidden lg:block ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 fixed left-0 top-0 h-screen z-30`}>
          <ClientSidebar 
            sidebarOpen={sidebarOpen} 
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {/* Contenu principal */}
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
          <ClientHeader 
            onMenuClick={() => setMobileSidebarOpen(true)}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
          />
          
          <main className="flex-1 p-4 sm:p-6">
            {/* <div className="max-w-7xl mx-auto"> */}
              <Outlet />
            {/* </div> */}
          </main>

          <ClientFooter />
        </div>
      </div>
    </div>
  );
};

export default ClientLayout;