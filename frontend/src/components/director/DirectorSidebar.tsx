// src/components/director/layout/DirectorSidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard,
  Building,
  Calendar,
  Bed,
  Image as ImageIcon,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  List,
  Users,
  Sparkles,
  Home,
  FileText,
  BarChart3,
  Heart
} from 'lucide-react';
// import path from 'path';

interface DirectorSidebarProps {
  sidebarOpen: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

const DirectorSidebar: React.FC<DirectorSidebarProps> = ({
  sidebarOpen,
  onToggle,
  onClose,
  isMobile = false
}) => {
  const navItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/director/dashboard',
      badge: null
    },
    {
      title: 'Hôtels',
      icon: Building,
      path: '/director/hotels',
      subItems: [
        { title: 'Mes hôtels',path: '/director/hotels', icon: Home },
        { title: 'Hotels list',path: '/director/hotels/list',icon: List},
      ],
      badge: '3'
    },
    {
      title: 'Favoris',
      icon: Heart,
      path: '/director/favorites'
    },
    {
      title: 'Réservations',
      icon: Calendar,
      path: '/director/bookings',
      subItems: [
        { title: 'Toutes les réservations', path: '/director/bookings', icon: List },
        { title: 'Réservations en cours', path: '/director/bookings/active', icon: Calendar },
        { title: 'Historique', path: '/director/bookings/history', icon: FileText },
        { title: 'Mes réservations', path: '/director/bookings/mine', icon: Calendar }
      ],
      badge: '12'
    },
    // {
    //   title: 'Chambres',
    //   icon: Bed,
    //   path: '/director/rooms',
    //   subItems: [
    //     { title: 'Gestion des chambres', path: '/director/rooms', icon: List },
    //     { title: 'Types de chambres', path: '/director/rooms/types', icon: Bed },
    //     { title: 'Disponibilités', path: '/director/rooms/availability', icon: Calendar }
    //   ]
    // },
    {
      title: 'Clients',
      icon: Users,
      path: '/director/customers',
      badge: '8'
    }
  ];

  const settingsItems = [
    {
      title: 'Paramètres',
      icon: Settings,
      path: '/director/settings'
    },
    {
      title: 'Aide & Support',
      icon: HelpCircle,
      path: '/director/help'
    }
  ];

  const NavItem = ({ item }: { item: any }) => {
    const [subMenuOpen, setSubMenuOpen] = React.useState(false);

    if (item.subItems) {
      return (
        <div className="mb-1">
          <button
            onClick={() => setSubMenuOpen(!subMenuOpen)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
              sidebarOpen 
                ? 'hover:bg-blue-50 text-gray-700 hover:text-blue-600' 
                : 'justify-center hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">{item.title}</span>}
            </div>
            {sidebarOpen && (
              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${subMenuOpen ? 'rotate-90' : ''}`} />
            )}
          </button>
          
          {sidebarOpen && subMenuOpen && (
            <div className="ml-8 mt-1 space-y-1 animate-in fade-in slide-in-from-top-5">
              {item.subItems.map((subItem: any) => (
                <NavLink
                  key={subItem.path}
                  to={subItem.path}
                  end
                  onClick={isMobile ? onClose : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`
                  }
                >
                  <subItem.icon className="w-4 h-4" />
                  {subItem.title}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        to={item.path}
        onClick={isMobile ? onClose : undefined}
        className={({ isActive }) =>
          `flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 mb-1 ${
            isActive
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-sm'
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
          }`
        }
      >
        <div className="flex items-center gap-3">
          <item.icon className="w-5 h-5" />
          {sidebarOpen && <span className="font-medium">{item.title}</span>}
        </div>
        {sidebarOpen && item.badge && (
          <span className="px-2 py-1 text-xs bg-white/20 text-white rounded-full">
            {item.badge}
          </span>
        )}
      </NavLink>
    );
  };

  // Classes conditionnelles pour le sidebar
  const sidebarClasses = isMobile 
    ? 'fixed inset-0 z-50 w-full h-screen bg-white overflow-y-auto' 
    : `fixed left-0 top-0 h-screen z-30 bg-white border-r border-gray-100 flex flex-col shadow-sm ${sidebarOpen ? 'w-64' : 'w-20'}`;

  return (
    <aside className={sidebarClasses}>
      {/* Logo et bouton toggle */}
      <div className={`p-4 border-b border-gray-100 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
        {sidebarOpen ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Directeur Panel</div>
                <div className="text-xs text-gray-500">HotelSphere</div>
              </div>
            </div>
            {!isMobile && onToggle && (
              <button
                onClick={onToggle}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                aria-label="Réduire le menu"
              >
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </>
        ) : (
          !isMobile && onToggle && (
            <button
              onClick={onToggle}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              aria-label="Étendre le menu"
            >
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          )
        )}
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
          <div className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ${sidebarOpen ? '' : 'text-center'}`}>
            {sidebarOpen ? 'Gestion' : '•••'}
          </div>
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        </div>

        {/* Section paramètres */}
        <div>
          <div className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ${sidebarOpen ? '' : 'text-center'}`}>
            {sidebarOpen ? 'Préférences' : '••'}
          </div>
          <div className="space-y-1">
            {settingsItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={isMobile ? onClose : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 font-medium border border-gray-200'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {sidebarOpen && <span className="font-medium">{item.title}</span>}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer sidebar */}
      <div className={`p-4 border-t border-gray-100 ${sidebarOpen ? '' : 'text-center'}`}>
        <div className={`text-xs text-gray-500 mb-2 ${sidebarOpen ? '' : 'hidden'}`}>
          Connecté en tant que Directeur
        </div>
        <div className="text-xs text-gray-400">
          v2.1.0 • {sidebarOpen ? '© 2024 HotelSphere' : '© HS'}
        </div>
      </div>
    </aside>
  );
};

export default DirectorSidebar;