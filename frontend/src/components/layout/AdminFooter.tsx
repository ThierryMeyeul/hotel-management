import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Code, 
  Coffee, 
  Shield, 
  Zap,
  Globe,
  Twitter,
  Github,
  Linkedin
} from 'lucide-react';

const AdminFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Informations principales */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900">HotelSphere Admin</div>
              <div className="text-xs text-gray-500">Panel d'administration</div>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="font-bold text-gray-900">42</div>
              <div className="text-gray-500">Hôtels</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900">1.2K</div>
              <div className="text-gray-500">Utilisateurs</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900">356</div>
              <div className="text-gray-500">Réservations</div>
            </div>
          </div>

          {/* Liens rapides */}
          <div className="flex items-center gap-4">
            <a href="#" className="p-2 text-gray-400 hover:text-gray-600 transition">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 text-gray-400 hover:text-gray-600 transition">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 text-gray-400 hover:text-gray-600 transition">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-100 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Liens de navigation */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Link to="/admin/dashboard" className="text-gray-600 hover:text-gray-900 transition">
                Dashboard
              </Link>
              <Link to="/admin/hotels" className="text-gray-600 hover:text-gray-900 transition">
                Hôtels
              </Link>
              <Link to="/admin/users" className="text-gray-600 hover:text-gray-900 transition">
                Utilisateurs
              </Link>
              <Link to="/admin/bookings" className="text-gray-600 hover:text-gray-900 transition">
                Réservations
              </Link>
              <Link to="/admin/settings" className="text-gray-600 hover:text-gray-900 transition">
                Paramètres
              </Link>
              <Link to="/admin/help" className="text-gray-600 hover:text-gray-900 transition">
                Aide
              </Link>
            </div>

            {/* Copyright et informations */}
            <div className="text-sm text-gray-500 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Performance</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Sécurisé</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>Global</span>
              </div>
            </div>
          </div>

          {/* Copyright et notes */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-gray-500">
              <div>
                © {currentYear} HotelSphere Admin Panel. Tous droits réservés.
              </div>
              <div className="flex items-center gap-1">
                <span>Développé avec</span>
                <Heart className="w-3 h-3 text-red-500" />
                <span>et</span>
                <Coffee className="w-3 h-3 text-amber-600" />
                <span>par l'équipe technique</span>
              </div>
              <div className="flex items-center gap-1">
                <Code className="w-3 h-3" />
                <span>v2.1.0 • Build #421</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;