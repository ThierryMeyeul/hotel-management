import React, { useState } from 'react';
import { Link } from "react-router-dom";
import Logo from "../../components/Logo";
import HotelCard from '../../components/HotelCard';
import LocationButton from '../../components/LocationButton';
import Loader from '../../components/Loader';
import HotelMap from '../../components/HotelMap';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useHotels } from '../../hooks/useHotels';
import type { Hotel } from '../../types/hotel';
import { 
  Map, 
  List, 
  AlertCircle,
  Info,
  Search,
  Filter,
  SortAsc,
  MapPin,
  Star,
  Shield,
  HotelIcon
} from 'lucide-react';

const HotelListPage: React.FC = () => {
  const { hotels, loading, error, metadata, loadNearbyHotels } = useHotels();
  const { location, error: geoError, isLoading: geoLoading, getCurrentPosition } = useGeolocation();
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'rating'>('distance');

  const handleLocationClick = async () => {
    try {
      const userLocation = await getCurrentPosition();
      await loadNearbyHotels({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radius: 50,
      });
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
    }
  };

  const handleViewDetails = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    // Rediriger vers la page de détails
    console.log('Voir détails de:', hotel.name);
  };

  const filteredHotels = hotels.filter(hotel =>
    searchQuery === '' ||
    hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hotel.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hotel.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedHotels = [...filteredHotels].sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return (a.distance || 0) - (b.distance || 0);
    //   case 'price':
    //     return (a.price_per_night || 0) - (b.price_per_night || 0);
    //   case 'rating':
    //     return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  if (loading && !hotels.length) {
    return <Loader fullScreen text="Chargement des hôtels..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      {/* Navigation identique à la Home */}
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
              <Link to="/hotels" className="text-indigo-600 font-medium transition">
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

      {/* Hero Section spécifique aux hôtels */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Trouvez l'hôtel{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">
                  parfait pour vous
                </span>
              </h1>
              <p className="mt-6 text-lg text-gray-600">
                Explorez notre sélection d'hôtels soigneusement choisis. Filtrez par localisation, prix ou note,
                et réservez en toute confiance pour des séjours mémorables.
              </p>
              
              {/* Barre de recherche principale */}
              <div className="mt-8 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher un hôtel, une ville..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="relative">
                      <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                      >
                        <option value="distance">Trier par distance</option>
                        <option value="price">Trier par prix</option>
                        <option value="rating">Trier par note</option>
                      </select>
                    </div>
                    
                    <LocationButton
                      onClick={handleLocationClick}
                      isLoading={geoLoading}
                      hasLocation={!!location}
                      error={geoError}
                      size="md"
                      variant="primary"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                {hotels.length > 0 ? (
                  <img
                    src={hotels[0].image_url || "/src/assets/hotel-illustration.webp"}
                    alt="Hôtel de luxe"
                    className="w-full h-[400px] md:h-[500px] object-cover"
                  />
                ) : (
                  <div className="w-full h-[400px] md:h-[500px] bg-gradient-to-br from-indigo-100 to-pink-50 flex items-center justify-center">
                    <div className="text-center p-8">
                      <HotelIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Chargement des hôtels...</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-gradient-to-r from-pink-400 to-indigo-400 rounded-2xl opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section des hôtels */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Nos hôtels disponibles
              </h2>
              {metadata && (
                <p className="mt-2 text-gray-600">
                  {metadata.type === 'nearby' 
                    ? `${metadata.count} hôtels près de vous`
                    : `${hotels.length} hôtels disponibles`
                  }
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${
                    viewMode === 'list'
                      ? 'bg-white text-indigo-600 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                  Liste
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${
                    viewMode === 'map'
                      ? 'bg-white text-indigo-600 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  Carte
                </button>
              </div>
              
              <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtres
              </button>
            </div>
          </div>

          {/* Messages d'erreur */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800">Erreur de chargement</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Affichage des hôtels */}
          {viewMode === 'list' ? (
            <div className="space-y-6">
              {filteredHotels.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                  <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {searchQuery ? `Aucun résultat pour "${searchQuery}"` : "Aucun hôtel trouvé"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Essayez de modifier votre recherche ou utilisez la géolocalisation
                  </p>
                  <button
                    onClick={handleLocationClick}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Utiliser ma position
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {sortedHotels.map((hotel) => (
                    <HotelCard
                      key={hotel.id}
                      hotel={hotel}
                      onViewDetails={handleViewDetails}
                      showDistance={metadata?.type === 'nearby'}
                      highlight={selectedHotel?.id === hotel.id}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <HotelMap
                  hotels={filteredHotels}
                  userLocation={metadata?.type === 'nearby' ? metadata.userLocation : undefined}
                  className="h-[500px]"
                />
              </div>
              
              {filteredHotels.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Hôtels sélectionnés ({filteredHotels.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedHotels.slice(0, 6).map((hotel) => (
                      <HotelCard
                        key={hotel.id}
                        hotel={hotel}
                        onViewDetails={handleViewDetails}
                        showDistance={metadata?.type === 'nearby'}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chargement supplémentaire */}
          {loading && hotels.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Loader size="md" text="Chargement des hôtels supplémentaires..." />
            </div>
          )}
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Recherchez en toute confiance
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Des outils puissants pour trouver l'hôtel idéal
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition group">
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition mb-6">
                <MapPin className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Géolocalisation précise
              </h3>
              <p className="text-gray-600">
                Trouvez les hôtels les plus proches de vous avec notre système de géolocalisation avancé.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition group">
              <div className="w-14 h-14 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition mb-6">
                <Star className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Avis vérifiés
              </h3>
              <p className="text-gray-600">
                Consultez les notes et avis authentiques des précédents voyageurs.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition group">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition mb-6">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Réservation sécurisée
              </h3>
              <p className="text-gray-600">
                Votre paiement est protégé et vos données sont chiffrées.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-500 to-pink-500">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à réserver ?
          </h2>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
            Créez un compte gratuit pour sauvegarder vos hôtels favoris et bénéficier d'offres exclusives
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-3 bg-white text-indigo-600 text-lg font-medium rounded-lg hover:bg-gray-100 transition shadow-lg"
            >
              S'inscrire gratuitement
            </Link>
            <Link
              to="/hotels"
              className="px-8 py-3 border-2 border-white text-white text-lg font-medium rounded-lg hover:bg-white/10 transition"
            >
              Continuer la recherche
            </Link>
          </div>
        </div>
      </section>

      {/* Footer identique à la Home */}
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
};

export default HotelListPage;