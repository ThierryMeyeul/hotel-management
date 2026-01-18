import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  Calendar, 
  Users, 
  Check, 
  X, 
  ArrowLeft,
  Wifi,
  Car,
  Utensils,
  Snowflake,
  Dumbbell,
  Watch,
  CreditCard,
  Shield,
  Share2,
  Heart,
  Navigation,
  ExternalLink,
  Route
} from 'lucide-react';
import Logo from '../../components/Logo';
import Loader from '../../components/Loader';
import { hotelService } from '../../services/hotel.service';
import type { Room, HotelDetails } from '../../types/hotel';

const HotelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<HotelDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    const fetchHotel = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await hotelService.getHotelDetails(parseInt(id));
        setHotel(data);
        if (data.rooms && data.rooms.length > 0) {
          setSelectedRoom(data.rooms[0]);
        }
        
        // Récupérer la position de l'utilisateur
        getUserLocation();
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement de l\'hôtel');
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(userPos);
          
          // Calculer la distance si l'hôtel a des coordonnées
          if (hotel?.latitude && hotel?.longitude) {
            const dist = calculateDistance(
              userPos.latitude,
              userPos.longitude,
              hotel.latitude,
              hotel.longitude
            );
            setDistance(dist);
          }
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        }
      );
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance en km
  };

  const getGoogleMapsUrl = () => {
    if (!hotel?.latitude || !hotel?.longitude) return '#';
    
    if (userLocation) {
      // Itinéraire depuis la position de l'utilisateur
      return `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${hotel.latitude},${hotel.longitude}`;
    } else {
      // Juste la position de l'hôtel
      return `https://www.google.com/maps?q=${hotel.latitude},${hotel.longitude}`;
    }
  };

  const handleBookNow = () => {
    if (!selectedRoom) return;
    
    const bookingData = {
      hotelId: hotel?.id,
      hotelName: hotel?.name,
      roomId: selectedRoom.id,
      roomType: selectedRoom.room_type,
      price: selectedRoom.price_per_night,
      checkInDate,
      checkOutDate,
      guests
    };
    
    console.log('Réservation:', bookingData);
    // Naviguer vers la page de réservation
    navigate('/client/booking', { state: bookingData });
  };

  const calculateTotalPrice = () => {
    if (!selectedRoom || !checkInDate || !checkOutDate) return 0;
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    return nights * parseFloat(selectedRoom.price_per_night);
  };

  const renderAmenities = () => {
    const amenities = [
      { icon: <Wifi className="w-5 h-5" />, label: 'Wi-Fi gratuit', available: true },
      { icon: <Car className="w-5 h-5" />, label: 'Parking', available: !!hotel?.latitude },
      { icon: <Utensils className="w-5 h-5" />, label: 'Restaurant', available: true },
      { icon: <Snowflake className="w-5 h-5" />, label: 'Climatisation', available: true },
      { icon: <Dumbbell className="w-5 h-5" />, label: 'Salle de sport', available: false },
      { icon: <Watch className="w-5 h-5" />, label: 'Service 24h/24', available: true },
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {amenities.map((amenity, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              amenity.available ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {amenity.icon}
            </div>
            <div>
              <p className="font-medium text-gray-900">{amenity.label}</p>
              <p className={`text-sm ${amenity.available ? 'text-green-600' : 'text-gray-500'}`}>
                {amenity.available ? 'Disponible' : 'Non disponible'}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <Loader fullScreen text="Chargement des détails de l'hôtel..." />;
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center p-8">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hôtel non trouvé</h2>
          <p className="text-gray-600 mb-6">{error || "L'hôtel demandé n'existe pas."}</p>
          <Link
            to="/hotels"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retour à la liste des hôtels
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();

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

      {/* Bouton retour */}
      <div className="container mx-auto px-6 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux résultats
        </button>
      </div>

      <main className="container mx-auto px-6 pb-12">
        {/* En-tête de l'hôtel avec distance */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span className="text-gray-700">{hotel.address}, {hotel.city}, {hotel.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${
                      i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`} />
                  ))}
                  <span className="ml-2 text-gray-600">(4.5/5)</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Distance badge */}
              {distance !== null && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-pink-100 text-indigo-700 rounded-full font-medium">
                  <Navigation className="w-4 h-4" />
                  <span>{distance.toFixed(1)} km</span>
                </div>
              )}
              
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-3 rounded-full ${
                  isFavorite 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Status et info rapide */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
              <Check className="w-4 h-4" />
              <span className="font-medium">Actif</span>
            </div>
            
            {/* Bouton Google Maps */}
            {hotel.latitude && hotel.longitude && (
              <a
                href={getGoogleMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="font-medium">
                  {userLocation ? 'Itinéraire Google Maps' : 'Voir sur Google Maps'}
                </span>
              </a>
            )}
            
            <div className="text-gray-600">
              <span className="font-medium">Gérant ID:</span> {hotel.manager_id}
            </div>
            <div className="text-gray-600">
              <span className="font-medium">Membre depuis:</span> {new Date(hotel.created_at).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale - Photos et description */}
          <div className="lg:col-span-2 space-y-8">
            {/* Galerie d'images */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-96 bg-gradient-to-br from-indigo-100 to-pink-50 flex items-center justify-center">
                {hotel.images && hotel.images.length > 0 ? (
                  <img
                    src={hotel.images[0].image_url || "/src/assets/hotel-illustration.webp"}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-4">🏨</div>
                    <p className="text-gray-600">Aucune image disponible</p>
                  </div>
                )}
              </div>
              {hotel.images && hotel.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-4">
                  {/* {hotel.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="h-24 bg-gray-100 rounded-lg overflow-hidden">
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))} */}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">À propos de cet hôtel</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {hotel.description || "Cet hôtel ne dispose pas encore de description détaillée."}
              </p>
              
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Équipements & Services</h3>
                {renderAmenities()}
              </div>
            </div>

            {/* Chambres disponibles */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Chambres disponibles</h2>
              
              <div className="space-y-4">
                {hotel.rooms && hotel.rooms.length > 0 ? (
                  hotel.rooms.map((room) => (
                    <div
                      key={room.id}
                      className={`border-2 rounded-xl p-6 transition-all cursor-pointer ${
                        selectedRoom?.id === room.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{room.room_type}</h3>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              room.is_available
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {room.is_available ? 'Disponible' : 'Non disponible'}
                            </div>
                          </div>
                          <p className="text-gray-600 mb-3">Chambre {room.room_number}</p>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900 mb-1">
                            {parseFloat(room.price_per_night).toFixed(2)} €
                          </div>
                          <p className="text-gray-600">par nuit</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucune chambre disponible pour le moment
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Colonne latérale - Réservation */}
          <div className="space-y-8">
            {/* Formulaire de réservation */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Réserver maintenant</h2>
              
              <div className="space-y-6">
                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline-block w-4 h-4 mr-2" />
                      Arrivée
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline-block w-4 h-4 mr-2" />
                      Départ
                    </label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      min={checkInDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Nombre de personnes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="inline-block w-4 h-4 mr-2" />
                    Voyageurs
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      −
                    </button>
                    <span className="text-xl font-bold text-gray-900">{guests}</span>
                    <button
                      onClick={() => setGuests(guests + 1)}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      +
                    </button>
                    <span className="text-gray-600 ml-2">personne{guests > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Chambre sélectionnée */}
                {selectedRoom && (
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="font-medium text-gray-900 mb-3">Chambre sélectionnée</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{selectedRoom.room_type}</span>
                        <span className="font-bold text-gray-900">
                          {parseFloat(selectedRoom.price_per_night).toFixed(2)} €/nuit
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Chambre {selectedRoom.room_number}</p>
                    </div>
                  </div>
                )}

                {/* Résumé du prix */}
                {(checkInDate && checkOutDate && selectedRoom) && (
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="font-medium text-gray-900 mb-3">Résumé</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{selectedRoom.price_per_night} € × {Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))} nuits</span>
                        <span className="font-medium">{totalPrice.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                        <span>Total</span>
                        <span>{totalPrice.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bouton de réservation */}
                <button
                  onClick={handleBookNow}
                  disabled={!selectedRoom?.is_available || !checkInDate || !checkOutDate}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    selectedRoom?.is_available && checkInDate && checkOutDate
                      ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white hover:from-indigo-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {selectedRoom?.is_available ? 'Réserver maintenant' : 'Indisponible'}
                </button>

                {/* Sécurité */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4" />
                  <span>Paiement 100% sécurisé</span>
                  <CreditCard className="w-4 h-4 ml-2" />
                </div>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contact</h3>
              <div className="space-y-4">
                {hotel.email && (
                  <a
                    href={`mailto:${hotel.email}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">{hotel.email}</span>
                  </a>
                )}
                
                {hotel.phone && (
                  <a
                    href={`tel:${hotel.phone}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">{hotel.phone}</span>
                  </a>
                )}
                
                {hotel.website && (
                  <a
                    href={hotel.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Globe className="w-5 h-5 text-indigo-600" />
                    <span className="text-gray-700">Visiter le site web</span>
                  </a>
                )}
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-gray-700 font-medium">{hotel.address}</p>
                    <p className="text-gray-600 text-sm">{hotel.city}, {hotel.country}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte de localisation */}
            {hotel.latitude && hotel.longitude && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Localisation</h3>
                  
                  {/* Bouton d'itinéraire */}
                  <a
                    href={getGoogleMapsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-lg hover:from-indigo-700 hover:to-pink-700 transition-all"
                  >
                    <Route className="w-4 h-4" />
                    <span className="font-medium">Itinéraire</span>
                  </a>
                </div>
                
                <div className="h-64 bg-gradient-to-br from-indigo-100 to-pink-50 rounded-lg flex items-center justify-center relative">
                  {/* Indicateur de distance */}
                  {distance !== null && (
                    <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-gray-900">{distance.toFixed(1)} km</span>
                        <span className="text-gray-600 text-sm">de votre position</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <p className="text-gray-700 font-medium">Lat: {hotel.latitude.toFixed(6)}</p>
                    <p className="text-gray-700 font-medium">Lng: {hotel.longitude.toFixed(6)}</p>
                    
                    {userLocation && (
                      <div className="mt-4 text-sm text-gray-600">
                        <p>Votre position: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Infos supplémentaires */}
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-900">Coordonnées GPS</p>
                    <p className="text-gray-600">{hotel.latitude.toFixed(6)}, {hotel.longitude.toFixed(6)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-900">Format</p>
                    <p className="text-gray-600">WGS 84 (SRID: 4326)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-indigo-500 to-pink-500 mt-12">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Questions sur votre réservation ?</h2>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
            Notre équipe de support est disponible 24h/24 pour vous aider
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="px-8 py-3 bg-white text-indigo-600 text-lg font-medium rounded-lg hover:bg-gray-100 transition shadow-lg"
            >
              Contacter le support
            </Link>
            <Link
              to="/hotels"
              className="px-8 py-3 border-2 border-white text-white text-lg font-medium rounded-lg hover:bg-white/10 transition"
            >
              Voir d'autres hôtels
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
};

export default HotelDetailPage;