import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home,
  Building,
  Calendar,
  CreditCard,
  User,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Heart,
  Bell,
} from 'lucide-react';

interface ClientSidebarProps {
  sidebarOpen: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

const ClientSidebar: React.FC<ClientSidebarProps> = ({
  sidebarOpen,
  onToggle,
  onClose,
  isMobile = false
}) => {
  const navItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/client/dashboard',
      badge: null
    },
    {
      title: 'Hôtels',
      icon: Building,
      path: '/client/hotels'
    },
    {
      title: 'Mes Réservations',
      icon: Calendar,
      path: '/client/bookings',
      badge: '3'
    },
    {
      title: 'Favoris',
      icon: Heart,
      path: '/client/favorites'
    },
    {
      title: 'Paiements',
      icon: CreditCard,
      path: '/client/payments'
    },
    {
      title: 'Notifications',
      icon: Bell,
      path: '/client/notifications',
      badge: '2'
    }
  ];

  const settingsItems = [
    {
      title: 'Mon Profil',
      icon: User,
      path: '/client/profile'
    },
    {
      title: 'Paramètres',
      icon: Settings,
      path: '/client/settings'
    },
    {
      title: 'Aide & Support',
      icon: HelpCircle,
      path: '/client/help'
    }
  ];

  const NavItem = ({ item }: { item: any }) => (
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
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Espace Client</div>
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
            {sidebarOpen ? 'Navigation' : '•••'}
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
            {sidebarOpen ? 'Compte' : '••'}
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

        {/* Section rapide */}
        {/* {sidebarOpen && (
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
            <h4 className="font-semibold text-gray-900 mb-2">Voyage prochain</h4>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>15-20 Oct</span>
              <span className="mx-1">•</span>
              <MapPin className="w-4 h-4" />
              <span>Paris</span>
            </div>
            <button className="mt-3 w-full py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition">
              Voir détails
            </button>
          </div>
        )} */}
      </nav>

      {/* Footer sidebar */}
      <div className={`p-4 border-t border-gray-100 ${sidebarOpen ? '' : 'text-center'}`}>
        {sidebarOpen && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
              C
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Client</div>
              <div className="text-xs text-gray-500">Niveau Argent</div>
            </div>
          </div>
        )}
        <div className="text-xs text-gray-400">
          {sidebarOpen ? '© 2024 HotelSphere • Client' : '© HS'}
        </div>
      </div>
    </aside>
  );
};

export default ClientSidebar;