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
import Loader from '../../components/Loader';
import { hotelService } from '../../services/hotel.service';
import type { Room, Hotel } from '../../types/hotel';
import { useAuth } from '../../context/AuthContext';

const HotelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState(0);

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

  const { user, isAuthenticated } = useAuth();
  const getBookingRoute = () => {
    if (isAuthenticated && user) {
      const userRole = user.role.toLocaleLowerCase()

      switch(userRole) {
        case 'admin':
          return '/admin/booking/create';
        case 'director':
          return '/director/booking/create';
        case 'manager':
          return '/manager/booking/create';
        default:
          return '/client/booking/create';
      }
    }
    return '/login'
  }

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
    if (!selectedRoom || !hotel) return;
  
    // Convertir le prix en nombre AVANT de l'envoyer
    const priceNumber = parseFloat(selectedRoom.price_per_night) || 0;
    
    const bookingData = {
      hotelId: hotel.id,
      hotelName: hotel.name,
      roomId: selectedRoom.id,
      roomType: selectedRoom.room_type,
      roomNumber: selectedRoom.room_number,
      price: priceNumber, // DÉJÀ CONVERTI EN NOMBRE
      checkInDate,
      checkOutDate,
      guests,
      hotelAddress: hotel.address,
      hotelCity: hotel.city,
      hotelCountry: hotel.country,
      hotelImage: hotelImages[0]?.image || defaultImage,
      // Informations pour la réservation selon le modèle
      userId: localStorage.getItem('user_id'), // Récupérer l'ID de l'utilisateur connecté
      userName: localStorage.getItem('user_name') || 'Client'
    };
  
    // Calculer le prix total
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * priceNumber;
  
    const completeBookingData = {
      ...bookingData,
      nights,
      totalPrice
    };
  
    // Naviguer vers la route de réservation selon le rôle
    const bookingRoute = getBookingRoute();
    navigate(bookingRoute, { state: completeBookingData });
  };

  const calculateTotalPrice = () => {
    if (!selectedRoom || !checkInDate || !checkOutDate) return 0;
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    const priceNumber = parseFloat(selectedRoom.price_per_night) || 0;
    return nights * priceNumber;
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
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return <Loader fullScreen text="Chargement des détails de l'hôtel..." />;
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md w-full">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hôtel non trouvé</h2>
          <p className="text-gray-600 mb-6">{error || "L'hôtel demandé n'existe pas."}</p>
          <Link
            to="/hotels"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste des hôtels
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();
  const hotelImages = hotel.images || [];
  const defaultImage = "/src/assets/hotel-illustration.webp";

  // Fonction helper pour formater les prix
  const formatPrice = (price: string | number): string => {
    const priceNumber = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(priceNumber) ? '0.00' : priceNumber.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bouton retour */}
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Retour aux résultats</span>
        </button>
      </div>

      <main className="container mx-auto px-4 sm:px-6 pb-12">
        {/* En-tête de l'hôtel avec distance */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">
                {hotel.name}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-gray-700">
                    {hotel.address}, {hotel.city}, {hotel.country}
                  </span>
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
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-pink-100 text-indigo-700 rounded-full font-medium shadow-sm">
                  <Navigation className="w-4 h-4" />
                  <span>{distance.toFixed(1)} km</span>
                </div>
              )}
              
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isFavorite 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
                aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              
              <button 
                className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 hover:text-gray-900 transition-colors duration-200"
                aria-label="Partager"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Status et info rapide */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="font-medium">
                  {userLocation ? 'Itinéraire' : 'Google Maps'}
                </span>
              </a>
            )}
            
            <div className="text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
              <span className="font-medium">Gérant ID:</span> {hotel.manager_id || 'Non assigné'}
            </div>
            
            <div className="text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
              <span className="font-medium">Membre depuis:</span> {formatDate(hotel.created_at)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Colonne principale - Photos et description */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Galerie d'images */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-br from-indigo-100 to-pink-50">
                {hotelImages.length > 0 ? (
                  <>
                    <img
                      src={hotelImages[activeImage]?.image || defaultImage}
                      alt={`${hotel.name} - Image ${activeImage + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {hotelImages.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {hotelImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveImage(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                              index === activeImage 
                                ? 'bg-white scale-125' 
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                            aria-label={`Voir l'image ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="text-6xl mb-4">🏨</div>
                    <p className="text-gray-600 text-lg">Aucune image disponible</p>
                  </div>
                )}
              </div>
              
              {hotelImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-4">
                  {hotelImages.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`h-24 bg-gray-100 rounded-lg overflow-hidden transition-all ${
                        index === activeImage 
                          ? 'ring-2 ring-indigo-500 ring-offset-2' 
                          : 'opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={image.image || defaultImage} 
                        alt={`Miniature ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">À propos de cet hôtel</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">
                  {hotel.description || "Cet hôtel ne dispose pas encore de description détaillée."}
                </p>
              </div>
              
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Équipements & Services</h3>
                {renderAmenities()}
              </div>
            </div>

            {/* Chambres disponibles */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Chambres disponibles</h2>
              
              <div className="space-y-4">
                {hotel.rooms && hotel.rooms.length > 0 ? (
                  hotel.rooms.map((room) => (
                    <div
                      key={room.id}
                      className={`border-2 rounded-xl p-6 transition-all duration-200 cursor-pointer ${
                        selectedRoom?.id === room.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-gray-900">{room.room_type}</h3>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              room.is_available
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {room.is_available ? 'Disponible' : 'Non disponible'}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-gray-600">
                              <span className="font-medium">Chambre:</span> {room.room_number}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right min-w-[120px]">
                          <div className="text-3xl font-bold text-gray-900 mb-1">
                            {formatPrice(room.price_per_night)} €
                          </div>
                          <p className="text-gray-600 text-sm">par nuit</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                    <div className="text-4xl mb-3">🏨</div>
                    <p className="text-lg">Aucune chambre disponible pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Colonne latérale - Réservation */}
          <div className="space-y-6 lg:space-y-8">
            {/* Formulaire de réservation */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6 lg:top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Réserver maintenant</h2>
              
              <div className="space-y-6">
                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Arrivée
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Départ
                    </label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      min={checkInDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Nombre de personnes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Voyageurs
                  </label>
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <button
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={guests <= 1}
                    >
                      −
                    </button>
                    <div className="text-center">
                      <span className="text-3xl font-bold text-gray-900">{guests}</span>
                      <p className="text-gray-600 text-sm">personne{guests > 1 ? 's' : ''}</p>
                    </div>
                    <button
                      onClick={() => setGuests(guests + 1)}
                      className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Chambre sélectionnée */}
                {selectedRoom && (
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="font-medium text-gray-900 mb-3">Chambre sélectionnée</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{selectedRoom.room_type}</span>
                        <span className="font-bold text-gray-900">
                          {formatPrice(selectedRoom.price_per_night)} €/nuit
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
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Prix par nuit</span>
                        <span className="font-medium">{formatPrice(selectedRoom.price_per_night)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))} nuit(s)
                        </span>
                        <span className="font-medium">{totalPrice.toFixed(2)} €</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between text-lg font-bold text-gray-900">
                          <span>Total</span>
                          <span>{totalPrice.toFixed(2)} €</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">TVA incluse</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bouton de réservation */}
                <button
                  onClick={handleBookNow}
                  disabled={!selectedRoom?.is_available || !checkInDate || !checkOutDate}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                    selectedRoom?.is_available && checkInDate && checkOutDate
                      ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white hover:from-indigo-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {selectedRoom?.is_available ? 'Réserver maintenant' : 'Indisponible'}
                </button>

                {/* Sécurité */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-4">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Paiement 100% sécurisé</span>
                  <CreditCard className="w-4 h-4 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contact</h3>
              <div className="space-y-3">
                {hotel.email && (
                  <a
                    href={`mailto:${hotel.email}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 group"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{hotel.email}</span>
                  </a>
                )}
                
                {hotel.phone && (
                  <a
                    href={`tel:${hotel.phone}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors duration-200 group"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{hotel.phone}</span>
                  </a>
                )}
                
                {hotel.website && (
                  <a
                    href={hotel.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-200 group"
                  >
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <Globe className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Visiter le site web</span>
                  </a>
                )}
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-red-600" />
                  </div>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Localisation</h3>
                  
                  {/* Bouton d'itinéraire */}
                  <a
                    href={getGoogleMapsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-lg hover:from-indigo-700 hover:to-pink-700 transition-all duration-200 shadow-sm hover:shadow"
                  >
                    <Route className="w-4 h-4" />
                    <span className="font-medium">Itinéraire</span>
                  </a>
                </div>
                
                <div className="bg-gradient-to-br from-indigo-50 to-pink-50 rounded-xl p-6 text-center">
                  <MapPin className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Latitude</p>
                      <p className="font-mono font-medium text-gray-800">{hotel.latitude.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Longitude</p>
                      <p className="font-mono font-medium text-gray-800">{hotel.longitude.toFixed(6)}</p>
                    </div>
                    
                    {distance !== null && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-center gap-2">
                          <Navigation className="w-5 h-5 text-indigo-600" />
                          <span className="font-bold text-gray-900">{distance.toFixed(1)} km</span>
                          <span className="text-gray-600 text-sm">de votre position</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HotelDetailPage;