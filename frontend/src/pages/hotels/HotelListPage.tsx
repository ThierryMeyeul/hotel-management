import React, { useState, useEffect } from 'react';
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
  Hotel as HotelIcon,
  Globe,
  Navigation
} from 'lucide-react';

// Mapping des noms de pays en différentes langues vers le français
const countryTranslations: Record<string, string> = {
  // Anglais -> Français
  'France': 'France',
  'Spain': 'Espagne',
  'Italy': 'Italie',
  'Germany': 'Allemagne',
  'Portugal': 'Portugal',
  'United Kingdom': 'Royaume-Uni',
  'United States': 'États-Unis',
  'USA': 'États-Unis',
  'US': 'États-Unis',
  'America': 'États-Unis',
  'United States of America': 'États-Unis',
  'UK': 'Royaume-Uni',
  'Great Britain': 'Royaume-Uni',
  'England': 'Royaume-Uni',
  'Switzerland': 'Suisse',
  'Swiss Confederation': 'Suisse',
  'Belgium': 'Belgique',
  'Netherlands': 'Pays-Bas',
  'Holland': 'Pays-Bas',
  'Luxembourg': 'Luxembourg',
  'Austria': 'Autriche',
  'Czech Republic': 'République Tchèque',
  'Slovakia': 'Slovaquie',
  'Poland': 'Pologne',
  'Hungary': 'Hongrie',
  'Romania': 'Roumanie',
  'Bulgaria': 'Bulgarie',
  'Greece': 'Grèce',
  'Turkey': 'Turquie',
  'Russia': 'Russie',
  'Ukraine': 'Ukraine',
  'Sweden': 'Suède',
  'Norway': 'Norvège',
  'Denmark': 'Danemark',
  'Finland': 'Finlande',
  'Iceland': 'Islande',
  'Ireland': 'Irlande',
  'Canada': 'Canada',
  'Australia': 'Australie',
  'New Zealand': 'Nouvelle-Zélande',
  'Japan': 'Japon',
  'China': 'Chine',
  'India': 'Inde',
  'Brazil': 'Brésil',
  'Mexico': 'Mexique',
  'Argentina': 'Argentine',
  
  // Allemand -> Français
  'Frankreich': 'France',
  'Spanien': 'Espagne',
  'Italien': 'Italie',
  'Deutschland': 'Allemagne',

  'Vereinigtes Königreich': 'Royaume-Uni',
  'Vereinigte Staaten': 'États-Unis',
  'Schweiz': 'Suisse',
  
  // Espagnol -> Français
  'Francia': 'France',
  'España': 'Espagne',
  'Italia': 'Italie',
  'Alemania': 'Allemagne',
  'Reino Unido': 'Royaume-Uni',
  'Estados Unidos': 'États-Unis',
  
  // Italien -> Français
  'Spagna': 'Espagne',
  'Germania': 'Allemagne',
  'Portogallo': 'Portugal',
  'Regno Unito': 'Royaume-Uni',
  'Stati Uniti': 'États-Unis',
};

// Fonction pour traduire un nom de pays en français
const translateCountryToFrench = (countryName: string): string => {
  const normalized = countryName.trim();
  
  // Vérifier d'abord si c'est déjà en français
  const frenchCountries = ['Cameroun', 'France', 'Espagne', 'Italie', 'Allemagne', 'Portugal', 'Royaume-Uni', 'États-Unis'];
  if (frenchCountries.includes(normalized)) {
    return normalized;
  }
  
  // Chercher dans les traductions
  for (const [key, frenchName] of Object.entries(countryTranslations)) {
    if (key.toLowerCase() === normalized.toLowerCase()) {
      return frenchName;
    }
  }
  
  // Si non trouvé, retourner le nom original
  return normalized;
};

// Fonction pour obtenir le pays à partir des coordonnées GPS (en français)
const getCountryFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // Utiliser l'API Nominatim avec la langue française
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=3&addressdetails=1&accept-language=fr`
    );
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du pays');
    }
    
    const data = await response.json();
    
    // Récupérer le pays depuis l'adresse (en français)
    const country = data.address?.country;
    
    if (!country) {
      // Essayer en anglais si pas trouvé en français
      const responseEn = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=3&addressdetails=1&accept-language=en`
      );
      
      if (!responseEn.ok) {
        throw new Error('Pays non trouvé pour ces coordonnées');
      }
      
      const dataEn = await responseEn.json();
      const countryEn = dataEn.address?.country;
      
      if (!countryEn) {
        throw new Error('Pays non trouvé pour ces coordonnées');
      }
      
      // Traduire le nom du pays en français
      return translateCountryToFrench(countryEn);
    }
    
    // Vérifier si le pays est déjà en français, sinon le traduire
    return translateCountryToFrench(country);
  } catch (error) {
    console.error('Erreur lors de la détermination du pays:', error);
    throw error;
  }
};

const HotelListPage: React.FC = () => {
  const { 
    hotels, 
    loading, 
    error, 
    metadata, 
    loadNearbyHotels, 
    loadHotelsByCountry
  } = useHotels();
  const { location, error: geoError, isLoading: geoLoading, getCurrentPosition } = useGeolocation();
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'rating'>('distance');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('Cameroun');
  const [countryInput, setCountryInput] = useState<string>('');
  const [isDetectingCountry, setIsDetectingCountry] = useState<boolean>(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

  // Liste des pays disponibles EN FRANÇAIS
  const availableCountries = ['Cameroun', 'France', 'Espagne', 'Italie', 'Allemagne', 'Portugal', 'Royaume-Uni', 'États-Unis', 'Suisse', 'Belgique', 'Canada'];

  // Charger les hôtels par pays au chargement de la page
  useEffect(() => {
    loadHotelsByCountry(selectedCountry);
  }, [loadHotelsByCountry, selectedCountry]);

  // Détecter automatiquement le pays de l'utilisateur au chargement
  useEffect(() => {
    const detectUserCountry = async () => {
      // Vérifier si nous avons déjà essayé ou si la détection est en cours
      if (isDetectingCountry || localStorage.getItem('countryDetectionTried') === 'true') {
        return;
      }

      try {
        setIsDetectingCountry(true);
        setDetectionError(null);
        
        console.log('Tentative de détection automatique du pays...');
        
        const userLocation = await getCurrentPosition();
        console.log('Position obtenue:', userLocation);
        
        const country = await getCountryFromCoordinates(userLocation.latitude, userLocation.longitude);
        console.log('Pays détecté (en français):', country);
        
        setDetectedCountry(country);
        
        // Vérifier si le pays détecté est dans notre liste
        const foundCountry = availableCountries.find(c => 
          c.toLowerCase() === country.toLowerCase()
        );

        if (foundCountry) {
          setSelectedCountry(foundCountry);
          console.log(`Pays sélectionné: ${foundCountry}`);
        } else {
          // Si le pays n'est pas dans la liste, on l'ajoute
          setSelectedCountry(country);
          if (!availableCountries.includes(country)) {
            availableCountries.unshift(country);
          }
        }

        localStorage.setItem('countryDetectionTried', 'true');
        localStorage.setItem('detectedCountry', country);
      } catch (error) {
        console.error('Erreur lors de la détection du pays:', error);
        setDetectionError('Impossible de détecter automatiquement votre pays. Veuillez le sélectionner manuellement.');
        localStorage.setItem('countryDetectionTried', 'true');
      } finally {
        setIsDetectingCountry(false);
      }
    };

    // Vérifier si on a déjà un pays détecté en localStorage
    const savedCountry = localStorage.getItem('detectedCountry');
    if (savedCountry && availableCountries.includes(savedCountry)) {
      setSelectedCountry(savedCountry);
      setDetectedCountry(savedCountry);
      localStorage.setItem('countryDetectionTried', 'true');
      return;
    }

    // Détecter uniquement si l'utilisateur n'a pas déjà un pays sélectionné différent de France
    if (selectedCountry === 'Cameroun' && !isDetectingCountry) {
      detectUserCountry();
    }
  }, []);

  const handleLocationClick = async () => {
    try {
      setIsDetectingCountry(true);
      setDetectionError(null);
      
      const userLocation = await getCurrentPosition();
      console.log('Position obtenue:', userLocation);
      
      // Option 1: Charger les hôtels proches
      await loadNearbyHotels({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radius: 50,
      });
      
      // Option 2: Détecter le pays et charger les hôtels
      try {
        const country = await getCountryFromCoordinates(userLocation.latitude, userLocation.longitude);
        console.log('Pays détecté depuis la position (en français):', country);
        
        setDetectedCountry(country);
        
        if (country !== selectedCountry) {
          setSelectedCountry(country);
          loadHotelsByCountry(country);
        }
        
        localStorage.setItem('detectedCountry', country);
      } catch (countryError) {
        console.warn('Impossible de détecter le pays, utilisation de la position géographique');
      }
      
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
      setDetectionError('Erreur lors de la détection de votre position. Veuillez vérifier les permissions de géolocalisation.');
    } finally {
      setIsDetectingCountry(false);
    }
  };

  const handleDetectCountry = async () => {
    try {
      setIsDetectingCountry(true);
      setDetectionError(null);
      
      const userLocation = await getCurrentPosition();
      const country = await getCountryFromCoordinates(userLocation.latitude, userLocation.longitude);
      
      console.log('Pays détecté (en français):', country);
      setDetectedCountry(country);
      
      const foundCountry = availableCountries.find(c => 
        c.toLowerCase() === country.toLowerCase()
      );

      if (foundCountry) {
        setSelectedCountry(foundCountry);
        loadHotelsByCountry(foundCountry);
      } else {
        setSelectedCountry(country);
        loadHotelsByCountry(country);
        if (!availableCountries.includes(country)) {
          availableCountries.unshift(country);
        }
      }
      
      localStorage.setItem('detectedCountry', country);
      
    } catch (error) {
      console.error('Erreur lors de la détection du pays:', error);
      setDetectionError('Impossible de détecter votre pays. Veuillez le sélectionner manuellement.');
    } finally {
      setIsDetectingCountry(false);
    }
  };

  const handleViewDetails = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    console.log('Voir détails de:', hotel.name);
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setDetectionError(null);
  };

  const handleCountrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (countryInput.trim()) {
      const country = countryInput.trim();
      const frenchCountry = translateCountryToFrench(country);
      
      handleCountryChange(frenchCountry);
      if (!availableCountries.includes(frenchCountry)) {
        availableCountries.unshift(frenchCountry);
      }
      setCountryInput('');
    }
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

  if ((loading && !hotels.length) || isDetectingCountry) {
    return <Loader fullScreen text={isDetectingCountry ? "Détection de votre pays..." : `Chargement des hôtels en ${selectedCountry}...`} />;
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
              
              {/* Messages d'information et d'erreur */}
              {detectionError && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-700">{detectionError}</p>
                </div>
              )}
              
              {/* Barre de recherche et filtres */}
              <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                <div className="space-y-3">
                  {/* Sélection de pays avec bouton de détection */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={selectedCountry}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {availableCountries.map(country => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      onClick={handleDetectCountry}
                      disabled={isDetectingCountry}
                      className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Détecter mon pays automatiquement"
                    >
                      <Navigation className="w-4 h-4" />
                      {isDetectingCountry ? '...' : 'Pays'}
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <form onSubmit={handleCountrySubmit} className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={countryInput}
                        onChange={(e) => setCountryInput(e.target.value)}
                        placeholder="Entrer un pays (ex: Spain, Deutschland, Italia)..."
                        className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
                      >
                        OK
                      </button>
                    </form>
                  </div>
                  
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
                      isLoading={geoLoading || isDetectingCountry}
                      hasLocation={!!location}
                      error={geoError}
                      size="md"
                      variant="primary"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Indicateur de pays détecté */}
              {detectedCountry && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="text-sm text-blue-800 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>
                      Pays détecté : <strong>{detectedCountry}</strong>
                      {detectedCountry !== selectedCountry && (
                        <button
                          onClick={() => handleCountryChange(detectedCountry)}
                          className="ml-2 text-blue-600 hover:text-blue-800 underline text-xs"
                        >
                          (Sélectionner)
                        </button>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Stats Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <HotelIcon className="w-8 h-8" />
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {hotels.length} hôtels
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">Statistiques - {selectedCountry}</h3>
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

      {/* Reste du code (identique à précédemment mais en français) */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {filteredHotels.length} Hôtel{filteredHotels.length !== 1 ? 's' : ''} en {selectedCountry}
            </h2>
            {metadata && (
              <p className="text-sm text-gray-600 mt-1">
                {metadata.type === 'nearby' 
                  ? 'À proximité de votre position'
                  : metadata.type === 'by_country'
                  ? `Tous les hôtels en ${selectedCountry}`
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

      {error && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-800 text-sm sm:text-base">Erreur de chargement</h3>
            <p className="text-red-600 text-xs sm:text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {viewMode === 'list' ? (
        <div className="max-w-7xl mx-auto">
          {filteredHotels.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
              <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {searchQuery 
                  ? `Aucun résultat pour "${searchQuery}" en ${selectedCountry}`
                  : `Aucun hôtel trouvé en ${selectedCountry}`
                }
              </h3>
              <p className="text-gray-600 mb-6">
                Essayez de modifier votre recherche, changez de pays ou utilisez la géolocalisation
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => handleCountryChange('France')}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Voir les hôtels en France
                </button>
                <button
                  onClick={handleDetectCountry}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Détecter mon pays
                </button>
              </div>
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

      {loading && hotels.length > 0 && (
        <div className="max-w-7xl mx-auto mt-8 flex justify-center">
          <Loader size="md" text="Chargement des hôtels supplémentaires..." />
        </div>
      )}
    </div>
  );
};

export default HotelListPage;