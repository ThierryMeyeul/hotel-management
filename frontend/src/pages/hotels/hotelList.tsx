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
  Hotel as HotelIcon,
  Menu,
  X
} from 'lucide-react';

const HotelListPage: React.FC = () => {
  const { hotels, loading, error, metadata, loadNearbyHotels } = useHotels();
  const { location, error: geoError, isLoading: geoLoading, getCurrentPosition } = useGeolocation();
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'rating'>('distance');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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
      // case 'price':
      //   return (a.price_per_night || 0) - (b.price_per_night || 0);
      // case 'rating':
      //   return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  if (loading && !hotels.length) {
    return <Loader fullScreen text="Chargement des hôtels..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - Sur mobile: seulement "HS", sur desktop: Logo complet */}
            <div className="flex items-center gap-2">
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

            {/* Navigation desktop */}
            <nav className="hidden lg:flex items-center gap-8">
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

            {/* Boutons d'action */}
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
                  className="text-indigo-600 font-medium py-2"
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
                Trouvez l'hôtel{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">
                  parfait pour vous
                </span>
              </h1>
              
              {/* Description - Cachée sur mobile */}
              <p className="hidden md:block mt-6 text-lg text-gray-600">
                Explorez notre sélection d'hôtels soigneusement choisis. Filtrez par localisation, prix ou note,
                et réservez en toute confiance pour des séjours mémorables.
              </p>
              
              {/* Barre de recherche */}
              <div className="mt-6 md:mt-8 bg-white rounded-xl shadow-lg p-3 md:p-4 border border-gray-200">
                <div className="flex flex-col gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher un hôtel, une ville..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-3 md:pl-12 md:pr-4 py-2 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                      >
                        <option value="distance">Trier par Distance</option>
                        <option value="price">Trier par Prix</option>
                        <option value="rating">Trier par Note</option>
                      </select>
                    </div>
                    
                    <LocationButton
                      onClick={handleLocationClick}
                      isLoading={geoLoading}
                      hasLocation={!!location}
                      error={geoError}
                      size="md"
                      variant="primary"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Image Hero - Modifiée pour mobile */}
            <div className="relative mt-8 md:mt-0">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                {hotels.length > 0 ? (
                  <img
                    src={hotels[0].image_url || "/src/assets/hotel-illustration.webp"}
                    alt="Hôtel de luxe"
                    className="w-full h-[250px] sm:h-[350px] md:h-[400px] lg:h-[500px] object-cover"
                  />
                ) : (
                  <div className="w-full h-[250px] sm:h-[350px] md:h-[400px] lg:h-[500px] bg-gradient-to-br from-indigo-100 to-pink-50 flex items-center justify-center">
                    <div className="text-center p-4">
                      <HotelIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                      <p className="text-gray-600 text-sm sm:text-base">Chargement des hôtels...</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-40 h-40 sm:w-56 sm:h-56 lg:w-64 lg:h-64 bg-gradient-to-r from-pink-400 to-indigo-400 rounded-2xl opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section des hôtels */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          {/* En-tête responsive modifiée */}
          <div className="mb-8 md:mb-12 space-y-4">
            {/* Titre "Nos hôtels disponibles" toujours sur une ligne */}
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                Nos hôtels disponibles
              </h2>
              {metadata && (
                <p className="mt-2 text-gray-600 text-sm md:text-base">
                  {metadata.type === 'nearby' 
                    ? `${metadata.count} hôtels près de vous`
                    : `${hotels.length} hôtels disponibles`
                  }
                </p>
              )}
            </div>
            
            {/* Contrôles d'affichage - Sur mobile: une ligne pour Liste/Carte, une autre pour Filtres */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Première ligne: Boutons Liste et Carte */}
              <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md transition-all flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base ${
                    viewMode === 'list'
                      ? 'bg-white text-indigo-600 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Liste</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md transition-all flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base ${
                    viewMode === 'map'
                      ? 'bg-white text-indigo-600 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Map className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Carte</span>
                </button>
              </div>
              
              {/* Deuxième ligne: Bouton Filtres (sur mobile il passe à la ligne) */}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Filtres</span>
              </button>
            </div>
          </div>

          {/* Filtres mobiles dépliables */}
          {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <select className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg">
                  <option>Ville</option>
                </select>
                <select className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg">
                  <option>Prix max</option>
                </select>
                <select className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg">
                  <option>Note min</option>
                </select>
                <button className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Appliquer
                </button>
              </div>
            </div>
          )}

          {/* Messages d'erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800 text-sm sm:text-base">Erreur de chargement</h3>
                <p className="text-red-600 text-xs sm:text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Affichage des hôtels */}
          {viewMode === 'list' ? (
            <div className="space-y-4 md:space-y-6">
              {filteredHotels.length === 0 ? (
                <div className="text-center py-8 md:py-12 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                  <Info className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                    {searchQuery ? `Aucun résultat pour "${searchQuery}"` : "Aucun hôtel trouvé"}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 px-4">
                    Essayez de modifier votre recherche ou utilisez la géolocalisation
                  </p>
                  <button
                    onClick={handleLocationClick}
                    className="px-4 py-2 sm:px-6 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                  >
                    Utiliser ma position
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
            <div className="space-y-6 md:space-y-8">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <HotelMap
                  hotels={filteredHotels}
                  userLocation={metadata?.type === 'nearby' ? metadata.userLocation : undefined}
                  className="h-[350px] sm:h-[400px] md:h-[500px]"
                />
              </div>
              
              {filteredHotels.length > 0 && (
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 md:mb-6">
                    Hôtels sélectionnés ({filteredHotels.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
            <div className="mt-6 md:mt-8 flex justify-center">
              <Loader size="md" text="Chargement..." />
            </div>
          )}
        </div>
      </section>

      {/* Section Fonctionnalités - Réorganisée pour mobile */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Recherchez en toute confiance
            </h2>
            <p className="mt-2 sm:mt-4 text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
              Des outils puissants pour trouver l'hôtel idéal
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="p-4 sm:p-6 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition group">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition mb-4 sm:mb-6">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Géolocalisation précise
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Trouvez les hôtels les plus proches de vous avec notre système de géolocalisation avancé.
              </p>
            </div>
            <div className="p-4 sm:p-6 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition group">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition mb-4 sm:mb-6">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Avis vérifiés
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Consultez les notes et avis authentiques des précédents voyageurs.
              </p>
            </div>
            <div className="p-4 sm:p-6 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition group">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition mb-4 sm:mb-6">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Réservation sécurisée
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Votre paiement est protégé et vos données sont chiffrées.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Réorganisée pour mobile */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-indigo-500 to-pink-500">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            Prêt à réserver ?
          </h2>
          <p className="text-base sm:text-xl text-indigo-100 max-w-2xl mx-auto mb-6 sm:mb-10">
            Créez un compte gratuit pour sauvegarder vos hôtels favoris et bénéficier d'offres exclusives
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              to="/signup"
              className="px-6 py-2 sm:px-8 sm:py-3 bg-white text-indigo-600 text-base sm:text-lg font-medium rounded-lg hover:bg-gray-100 transition shadow-lg"
            >
              S'inscrire gratuitement
            </Link>
            <Link
              to="/hotels"
              className="px-6 py-2 sm:px-8 sm:py-3 border-2 border-white text-white text-base sm:text-lg font-medium rounded-lg hover:bg-white/10 transition"
            >
              Continuer la recherche
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
};

export default HotelListPage;