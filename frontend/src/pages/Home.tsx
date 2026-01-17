import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Logo - HS sur mobile, Logo complet sur desktop */}
              <div className="lg:hidden">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
                  HS
                </span>
              </div>
              <div className="hidden lg:block">
                <Logo />
              </div>
            </div>

            {/* Menu mobile burger */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-gray-700 hover:text-indigo-600"
              aria-label="Menu"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <nav className="hidden lg:flex items-center gap-8">
              <Link to="/" className="text-gray-700 hover:text-indigo-600 font-medium transition">
                Accueil
              </Link>
              <Link to="/hotels" className="text-gray-700 hover:text-indigo-600 font-medium transition">
                Hôtels
              </Link>
              <Link to="/offers" className="text-gray-700 hover:text-indigo-600 font-medium transition">
                Offres
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-indigo-600 font-medium transition">
                À propos
              </Link>
            </nav>
            <div className="hidden lg:flex items-center gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium transition"
              >
                Connexion
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition shadow-sm"
              >
                Inscription
              </Link>
            </div>
          </div>

          {/* Menu mobile */}
          {showMobileMenu && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
              <nav className="flex flex-col space-y-4">
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-indigo-600 font-medium py-2"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Accueil
                </Link>
                <Link 
                  to="/hotels" 
                  className="text-gray-700 hover:text-indigo-600 font-medium py-2"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Hôtels
                </Link>
                <Link 
                  to="/offers" 
                  className="text-gray-700 hover:text-indigo-600 font-medium py-2"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Offres
                </Link>
                <Link 
                  to="/about" 
                  className="text-gray-700 hover:text-indigo-600 font-medium py-2"
                  onClick={() => setShowMobileMenu(false)}
                >
                  À propos
                </Link>
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium transition"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition text-center"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Inscription
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Découvrez des{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">
                  expériences uniques
                </span>{" "}
                dans le monde entier
              </h1>
              
              {/* Description - Cachée sur mobile */}
              <p className="hidden md:block mt-4 md:mt-6 text-lg text-gray-600">
                HotelSphere vous connecte avec les meilleurs établissements hôteliers. Réservez en toute confiance, profitez
                d'offres exclusives et vivez des séjours mémorables.
              </p>
              
              <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/hotels"
                  className="px-6 py-3 sm:px-8 sm:py-3 bg-indigo-600 text-white text-base sm:text-lg font-medium rounded-lg hover:bg-indigo-700 transition shadow-lg hover:shadow-xl text-center"
                >
                  Explorer les hôtels
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-3 sm:px-8 sm:py-3 border-2 border-indigo-600 text-indigo-600 text-base sm:text-lg font-medium rounded-lg hover:bg-indigo-50 transition text-center"
                >
                  Créer un compte gratuit
                </Link>
              </div>
            </div>
            
            <div className="relative mt-8 md:mt-0">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/src/assets/hotel-illustration.webp"
                  alt="Luxury hotel"
                  className="w-full h-[250px] sm:h-[350px] md:h-[400px] lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-40 h-40 sm:w-56 sm:h-56 lg:w-64 lg:h-64 bg-gradient-to-r from-pink-400 to-indigo-400 rounded-2xl opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Réorganisée pour mobile */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Pourquoi choisir HotelSphere ?
            </h2>
            {/* Sous-titre caché sur mobile */}
            <p className="hidden md:block mt-2 md:mt-4 text-gray-600 text-sm md:text-lg max-w-2xl mx-auto">
              Une plateforme conçue pour simplifier votre expérience de réservation
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="p-4 sm:p-6 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition group">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition mb-4 sm:mb-6">
                <span className="text-xl sm:text-2xl">📍</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Géolocalisation intelligente
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Trouvez les hôtels disponibles autour de vous en temps réel.
              </p>
            </div>
            <div className="p-4 sm:p-6 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition group">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition mb-4 sm:mb-6">
                <span className="text-xl sm:text-2xl">📅</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Réservation simplifiée
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Réservez un hôtel en quelques clics avec confirmation instantanée.
              </p>
            </div>
            <div className="p-4 sm:p-6 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition group">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition mb-4 sm:mb-6">
                <span className="text-xl sm:text-2xl">🔐</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Sécurité & fiabilité
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Paiements sécurisés et gestion des comptes protégée.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Réorganisée pour mobile */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-indigo-500 to-pink-500">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            Prêt à commencer votre voyage ?
          </h2>
          <p className="text-base sm:text-xl text-indigo-100 max-w-2xl mx-auto mb-6 sm:mb-10">
            Rejoignez plus de 500 000 voyageurs satisfaits qui font confiance à HotelSphere
          </p>
          <div className="flex justify-center">
            <Link
              to="/signup"
              className="px-6 py-3 sm:px-8 sm:py-3 bg-white text-indigo-600 text-base sm:text-lg font-medium rounded-lg hover:bg-gray-100 transition shadow-lg"
            >
              S'inscrire gratuitement
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Réorganisé pour mobile */}
      <footer className="bg-gray-900 text-white py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div>
              {/* Logo - Sur mobile: "HS", sur desktop: Logo complet */}
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <div className="lg:hidden">
                  <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                    HS
                  </span>
                </div>
                <div className="hidden lg:block">
                  <Logo />
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Votre partenaire de confiance pour des séjours inoubliables.
              </p>
            </div>
            <div>
              <h4 className="text-base md:text-lg font-semibold mb-3">Navigation</h4>
              <ul className="space-y-1 md:space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white transition text-sm md:text-base">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link to="/hotels" className="text-gray-400 hover:text-white transition text-sm md:text-base">
                    Hôtels
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white transition text-sm md:text-base">
                    À propos
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-base md:text-lg font-semibold mb-3">Légal</h4>
              <ul className="space-y-1 md:space-y-2">
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-white transition text-sm md:text-base">
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-white transition text-sm md:text-base">
                    Conditions d'utilisation
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-gray-400 hover:text-white transition text-sm md:text-base">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-base md:text-lg font-semibold mb-3">Contact</h4>
              <p className="text-gray-400 text-sm">
                📞 01 23 45 67 89
                <br />
                ✉️ contact@hotelsphere.com
                <br />
                🏢 123 Avenue des Champs, Paris
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} HotelSphere. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}