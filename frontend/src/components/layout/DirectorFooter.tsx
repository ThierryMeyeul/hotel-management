import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Coffee, Github, Twitter, MessageSquare } from 'lucide-react';

const DirectorFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Left section */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">DM</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">Director Management</span>
              </div>
              <p className="text-xs text-gray-500">
                Système de gestion hôtelière pour directeurs
              </p>
            </div>

            {/* Center section - Links */}
            <div className="flex items-center gap-6">
              <Link
                to="/director/help"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Aide
              </Link>
              <Link
                to="/director/terms"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Conditions
              </Link>
              <Link
                to="/director/privacy"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Confidentialité
              </Link>
              <Link
                to="/director/contact"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* Right section - Social & Info */}
            <div className="flex items-center gap-4">
              {/* Social links */}
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <Link
                  to="/director/support"
                  className="text-gray-400 hover:text-green-500 transition-colors"
                  aria-label="Support"
                >
                  <MessageSquare className="w-4 h-4" />
                </Link>
              </div>

              {/* Version & Status */}
              <div className="hidden md:flex items-center gap-2 pl-4 border-l border-gray-200">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-500">En ligne</span>
                </div>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">v1.0.0</span>
              </div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <p className="text-xs text-gray-500">
                © {currentYear} Director Management. Tous droits réservés.
              </p>
              <div className="hidden sm:block text-xs text-gray-400">•</div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                Fait avec
                <Heart className="w-3 h-3 text-red-500 fill-current" />
                et
                <Coffee className="w-3 h-3 text-amber-600" />
                pour les directeurs d'hôtels
              </div>
            </div>

            {/* Stats footer (mobile only) */}
            <div className="md:hidden mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">3</div>
                  <div className="text-xs text-gray-500">Hôtels</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">12</div>
                  <div className="text-xs text-gray-500">Réservations</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">78%</div>
                  <div className="text-xs text-gray-500">Occupation</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DirectorFooter;