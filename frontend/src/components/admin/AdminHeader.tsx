import React from 'react';
import { 
  Menu, 
  Bell, 
  Search, 
  User, 
  ChevronDown,
  Sun,
  Moon,
  Settings,
  LogOut,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../Logo';

interface AdminHeaderProps {
  onMenuClick: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  onMenuClick,
  onToggleSidebar,
  sidebarOpen
}) => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(3);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  // Données utilisateur simulées
  const user = {
    name: 'Admin Principal',
    email: 'admin@hotelsphere.com',
    role: 'Administrateur',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Gauche : Menu et recherche */}
          <div className="flex items-center gap-3">
            {/* Bouton menu mobile */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Bouton toggle sidebar desktop */}
            <button
              onClick={onToggleSidebar}
              className="hidden lg:flex p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              aria-label="Réduire/étendre le menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">HotelSphere</div>
                  <div className="text-xs text-gray-500">Administration</div>
                </div>
              </div>
              <div className="sm:hidden">
                <div className="text-lg font-bold text-gray-900">HS Admin</div>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="hidden md:block flex-1 max-w-md ml-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Rechercher dans l'admin..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
                />
              </div>
            </div>
          </div>

          {/* Droite : Actions utilisateur */}
          <div className="flex items-center gap-2">
            {/* Bouton recherche mobile */}
            <button className="md:hidden p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
              <Search className="w-5 h-5" />
            </button>

            {/* Mode sombre/clair */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              aria-label={darkMode ? "Passer en mode clair" : "Passer en mode sombre"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition relative">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {notifications}
                  </span>
                )}
              </button>
            </div>

            {/* Menu utilisateur */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 hover:bg-indigo-50 rounded-xl transition group"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-indigo-100 group-hover:border-indigo-200 transition"
                  />
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.role}</div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-5">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500 truncate">{user.email}</div>
                    </div>
                    
                    <Link 
                      to="/admin/profile" 
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition rounded-lg mx-2 my-1"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Mon profil</span>
                    </Link>
                    
                    <Link 
                      to="/admin/settings" 
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition rounded-lg mx-2 my-1"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Paramètres</span>
                    </Link>
                    
                    <Link 
                      to="/admin/help" 
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition rounded-lg mx-2 my-1"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>Aide & Support</span>
                    </Link>
                    
                    <div className="border-t border-gray-100 my-2"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition rounded-lg mx-2 my-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;