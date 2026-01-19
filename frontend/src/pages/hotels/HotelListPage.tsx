import React, { useState } from 'react';
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
  Hotel as HotelIcon
} from 'lucide-react';

const HotelListPage: React.FC = () => {
  const { hotels, loading, error, metadata, loadNearbyHotels } = useHotels();
  const { location, error: geoError, isLoading: geoLoading, getCurrentPosition } = useGeolocation();
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'rating'>('distance');
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
      default:
        return 0;
    }
  });

  if (loading && !hotels.length) {
    return <Loader fullScreen text="Chargement des hôtels..." />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section Admin */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Gestion des Hôtels
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Vue d'ensemble
                </span>
              </h1>
              
              {/* Barre de recherche et filtres */}
              <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                <div className="space-y-3">
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
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
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
            
            {/* Stats Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <HotelIcon className="w-8 h-8" />
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {hotels.length} hôtels
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">Statistiques</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm opacity-90">Actifs</p>
                  <p className="text-2xl font-bold">{hotels.filter(h => h.is_active).length}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Chambres</p>
                  <p className="text-2xl font-bold">
                    {hotels.reduce((acc, hotel) => acc + (hotel.rooms?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contrôles d'affichage */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {filteredHotels.length} Hôtel{filteredHotels.length !== 1 ? 's' : ''} trouvé{filteredHotels.length !== 1 ? 's' : ''}
            </h2>
            {metadata && (
              <p className="text-sm text-gray-600 mt-1">
                {metadata.type === 'nearby' 
                  ? 'À proximité de votre position'
                  : 'Tous les hôtels'
                }
              </p>
            )}
          </div>
          
          <div className="flex gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 sm:px-4 py-2 rounded-md transition-all flex items-center gap-2 text-sm ${
                  viewMode === 'list'
                    ? 'bg-white text-indigo-600 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Liste</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 sm:px-4 py-2 rounded-md transition-all flex items-center gap-2 text-sm ${
                  viewMode === 'map'
                    ? 'bg-white text-indigo-600 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">Carte</span>
              </button>
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2 text-sm"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtres</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtres mobiles dépliables */}
      {showFilters && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 gap-3">
            <select className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg">
              <option>Ville</option>
            </select>
            <select className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg">
              <option>Statut</option>
            </select>
            <button className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 col-span-2">
              Appliquer les filtres
            </button>
          </div>
        </div>
      )}

      {/* Messages d'erreur */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-800 text-sm sm:text-base">Erreur de chargement</h3>
            <p className="text-red-600 text-xs sm:text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Affichage des hôtels */}
      {viewMode === 'list' ? (
        <div className="max-w-7xl mx-auto">
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
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <HotelMap
              hotels={filteredHotels}
              userLocation={metadata?.type === 'nearby' ? metadata.userLocation : undefined}
              className="h-[350px] sm:h-[400px] md:h-[500px]"
            />
          </div>
          
          {filteredHotels.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Hôtels sur la carte ({filteredHotels.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="max-w-7xl mx-auto mt-8 flex justify-center">
          <Loader size="md" text="Chargement des hôtels supplémentaires..." />
        </div>
      )}
    </div>
  );
};

export default HotelListPage;