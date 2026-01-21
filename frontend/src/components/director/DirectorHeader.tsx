import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Menu,
  ChevronLeft,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DirectorHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onMenuClick: () => void;
}

const DirectorHeader: React.FC<DirectorHeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  onMenuClick
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = [
    { id: 1, title: 'Nouvelle réservation', message: 'Chambre 101 réservée', time: '5 min', read: false },
    { id: 2, title: 'Avis client', message: 'Nouvel avis sur Hôtel Paris', time: '1h', read: false },
    { id: 3, title: 'Maintenance', message: 'Piscine en maintenance', time: '2h', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Rediriger vers la page de recherche
      navigate(`/director/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop sidebar toggle */}
            <button
              onClick={onToggleSidebar}
              className="hidden lg:block p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              aria-label={sidebarOpen ? "Réduire le menu" : "Étendre le menu"}
            >
              <ChevronLeft className={`w-5 h-5 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
            </button>

            {/* Logo / Brand */}
            <div className="ml-4 flex items-center">
              <Link to="/director" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DM</span>
                </div>
                {sidebarOpen && (
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Director Panel
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Center section - Search */}
          <div className="flex-1 max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une réservation, un hôtel, un client..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </form>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              aria-label={darkMode ? "Mode clair" : "Mode sombre"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Help */}
            <Link
              to="/director/help"
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Aide"
            >
              <HelpCircle className="w-5 h-5" />
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      <p className="text-sm text-gray-500">{unreadCount} non lues</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            </div>
                            <span className="text-xs text-gray-500">{notification.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-100">
                      <Link
                        to="/director/notifications"
                        className="block text-center text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Voir toutes les notifications
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                aria-label="Menu utilisateur"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.username || 'Director'}
                  </p>
                  <p className="text-xs text-gray-500">Director</p>
                </div>
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                      <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/director/profile"
                        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        Mon profil
                      </Link>
                      <Link
                        to="/director/settings"
                        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Paramètres
                      </Link>
                    </div>
                    <div className="p-2 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
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

export default DirectorHeader;