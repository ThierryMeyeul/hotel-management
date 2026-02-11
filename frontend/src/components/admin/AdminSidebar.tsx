import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard,
  Building,
  Users,
  Calendar,
  UserCog,
  BarChart3,
  Settings,
  FileText,
  Shield,
  CreditCard,
  MessageSquare,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Home,
  PlusCircle,
  List,
  Sparkles,
  Heart
} from 'lucide-react';

interface AdminSidebarProps {
  sidebarOpen: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  sidebarOpen,
  onToggle,
  onClose,
  isMobile = false
}) => {
  const navItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      badge: null
    },
    {
      title: 'Hôtels',
      icon: Building,
      path: '/admin/hotels',
      subItems: [
        { title: 'Liste des hôtels', path: '/admin/hotels', icon: List },
        { title: 'Ajouter un hôtel', path: '/admin/hotels/create', icon: PlusCircle },
      ]
    },
    {
      title: 'Favoris',
      icon: Heart,
      path: '/admin/favorites'
    },
    {
      title: 'Réservations',
      icon: Calendar,
      path: '/admin/bookings',
      badge: '12'
    },
    {
      title: 'Managers',
      icon: UserCog,
      path: '/admin/managers',
      subItems: [
        { title: 'Assigner manager', path: '/admin/managers/assign', icon: UserCog },
        { title: 'Liste managers', path: '/admin/managers', icon: List },
        { title: 'Ajouter un manager', path: '/admin/managers/create', icon: PlusCircle }
      ]
    },
    // {
    //   title: 'Analytics',
    //   icon: BarChart3,
    //   path: '/admin/analytics'
    // },
    // {
    //   title: 'Transactions',
    //   icon: CreditCard,
    //   path: '/admin/transactions',
    //   badge: '3'
    // },
    // {
    //   title: 'Messages',
    //   icon: MessageSquare,
    //   path: '/admin/messages',
    //   badge: '5'
    // },
    // {
    //   title: 'Rapports',
    //   icon: FileText,
    //   path: '/admin/reports'
    // }
  ];

  const settingsItems = [
    {
      title: 'Paramètres',
      icon: Settings,
      path: '/admin/settings'
    },
    {
      title: 'Aide & Support',
      icon: HelpCircle,
      path: '/admin/help'
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
                ? 'hover:bg-indigo-50 text-gray-700 hover:text-indigo-600' 
                : 'justify-center hover:bg-indigo-50'
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
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-sm'
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
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-sm'
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

  // MODIFICATION PRINCIPALE ICI
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Admin Panel</div>
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
            {sidebarOpen ? 'Administration' : '••'}
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
          Connecté en tant qu'Admin
        </div>
        <div className="text-xs text-gray-400">
          v2.1.0 • {sidebarOpen ? '© 2024 HotelSphere' : '© HS'}
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;