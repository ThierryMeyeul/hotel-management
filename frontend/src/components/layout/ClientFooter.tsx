import React from 'react';
import { 
  Heart, 
  Shield, 
  CreditCard, 
  Phone, 
  Mail, 
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';

const ClientFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Section principale */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* À propos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">HotelSphere</h3>
            <p className="text-gray-600 text-sm mb-4">
              Votre plateforme de réservation d'hôtels préférée. 
              Trouvez les meilleurs établissements aux prix les plus compétitifs.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-600 transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-700 transition">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition">Trouver un hôtel</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition">Destinations populaires</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition">Offres spéciales</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition">Guide du voyageur</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition">Centre d'aide</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition">FAQ</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition">Contactez-nous</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition">Politique de confidentialité</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Phone className="w-4 h-4" />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Mail className="w-4 h-4" />
                <span>support@hotelsphere.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Globe className="w-4 h-4" />
                <span>www.hotelsphere.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section sécurité */}
        <div className="flex flex-wrap items-center justify-center gap-6 py-6 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Paiement 100% sécurisé</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CreditCard className="w-4 h-4 text-blue-500" />
            <span>CB, PayPal, Apple Pay</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Heart className="w-4 h-4 text-red-500" />
            <span>Garantie satisfait ou remboursé</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            © {currentYear} HotelSphere. Tous droits réservés.
            <span className="mx-2">•</span>
            <a href="#" className="hover:text-blue-600 transition">Mentions légales</a>
            <span className="mx-2">•</span>
            <a href="#" className="hover:text-blue-600 transition">CGU</a>
            <span className="mx-2">•</span>
            <a href="#" className="hover:text-blue-600 transition">Cookies</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ClientFooter;