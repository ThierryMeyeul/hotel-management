import { Link } from "react-router-dom";
import Logo from "../components/Logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo />
              
            </div>
            <nav className="hidden md:flex items-center gap-8">
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
            <div className="flex items-center gap-4">
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
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Découvrez des{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">
                  expériences uniques
                </span>{" "}
                dans le monde entier
              </h1>
              <p className="mt-6 text-lg text-gray-600">
                HotelSphere vous connecte avec les meilleurs établissements hôteliers. Réservez en toute confiance, profitez
                d'offres exclusives et vivez des séjours mémorables.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/hotels"
                  className="px-8 py-3 bg-indigo-600 text-white text-lg font-medium rounded-lg hover:bg-indigo-700 transition shadow-lg hover:shadow-xl"
                >
                  Explorer les hôtels
                </Link>
                <Link
                  to="/signup"
                  className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 text-lg font-medium rounded-lg hover:bg-indigo-50 transition"
                >
                  Créer un compte gratuit
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/src/assets/hotel-illustration.webp"
                  alt="Luxury hotel"
                  className="w-full h-[400px] md:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-gradient-to-r from-pink-400 to-indigo-400 rounded-2xl opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Pourquoi choisir HotelSphere ?
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Une plateforme conçue pour simplifier votre expérience de réservation
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition group">
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition mb-6">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Géolocalisation intelligente
              </h3>
              <p className="text-gray-600">
                Trouvez les hôtels disponibles autour de vous en temps réel.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition group">
              <div className="w-14 h-14 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition mb-6">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Réservation simplifiée
              </h3>
              <p className="text-gray-600">
                Réservez un hôtel en quelques clics avec confirmation instantanée.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition group">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition mb-6">
                <span className="text-2xl">🔐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Sécurité & fiabilité
              </h3>
              <p className="text-gray-600">
                Paiements sécurisés et gestion des comptes protégée.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-500 to-pink-500">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à commencer votre voyage ?
          </h2>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
            Rejoignez plus de 500 000 voyageurs satisfaits qui font confiance à HotelSphere
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-3 bg-white text-indigo-600 text-lg font-medium rounded-lg hover:bg-gray-100 transition shadow-lg"
            >
              S'inscrire gratuitement
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Logo />
              </div>
              <p className="text-gray-400">
                Votre partenaire de confiance pour des séjours inoubliables.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white transition">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link to="/hotels" className="text-gray-400 hover:text-white transition">
                    Hôtels
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white transition">
                    À propos
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Légal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-white transition">
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-white transition">
                    Conditions d'utilisation
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-gray-400 hover:text-white transition">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-gray-400">
                📞 01 23 45 67 89
                <br />
                ✉️ contact@hotelsphere.com
                <br />
                🏢 123 Avenue des Champs, Paris
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} HotelSphere. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}