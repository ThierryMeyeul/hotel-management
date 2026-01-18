import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  Star, 
  Settings, 
  Bell, 
  LogOut,
  Home,
  MapPin,
  CreditCard,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  Package,
  Heart,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  ChevronRight,
  Edit,
  Eye,
  Download,
  Share2,
  Phone,
  Mail,
  Globe,
  CreditCard as CardIcon,
  Shield,
  Key,
  Lock
} from 'lucide-react';
import Logo from '../../components/Logo';
import Loader from '../../components/Loader';
import { getUserInfo, logout } from '../../services/auth.service';
// import { bookingService } from '../../services/booking.service';

// Types
interface Booking {
  id: number;
  hotelName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  totalPrice: number;
  guests: number;
  bookingDate: string;
}

interface FavoriteHotel {
  id: number;
  name: string;
  location: string;
  rating: number;
  price: number;
  image: string;
}

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  memberSince: string;
  loyaltyPoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 1,
      hotelName: "Hôtel Plaza Athénée",
      roomType: "Suite Deluxe",
      checkInDate: "2024-06-15",
      checkOutDate: "2024-06-20",
      status: "confirmed",
      totalPrice: 2500,
      guests: 2,
      bookingDate: "2024-05-10"
    },
    {
      id: 2,
      hotelName: "Le Bristol Paris",
      roomType: "Chambre Supérieure",
      checkInDate: "2024-07-05",
      checkOutDate: "2024-07-10",
      status: "pending",
      totalPrice: 1800,
      guests: 2,
      bookingDate: "2024-05-12"
    },
    {
      id: 3,
      hotelName: "Four Seasons George V",
      roomType: "Suite Royale",
      checkInDate: "2024-04-20",
      checkOutDate: "2024-04-25",
      status: "completed",
      totalPrice: 3500,
      guests: 4,
      bookingDate: "2024-03-15"
    },
    {
      id: 4,
      hotelName: "Shangri-La Hotel",
      roomType: "Chambre Vue Tour Eiffel",
      checkInDate: "2024-08-01",
      checkOutDate: "2024-08-07",
      status: "cancelled",
      totalPrice: 2200,
      guests: 2,
      bookingDate: "2024-05-01"
    }
  ]);

  const [favorites, setFavorites] = useState<FavoriteHotel[]>([
    {
      id: 1,
      name: "Hôtel de Crillon",
      location: "Paris, France",
      rating: 4.8,
      price: 450,
      image: "/src/assets/hotel-illustration.webp"
    },
    {
      id: 2,
      name: "The Ritz Paris",
      location: "Paris, France",
      rating: 4.9,
      price: 600,
      image: "/src/assets/hotel-illustration.webp"
    },
    {
      id: 3,
      name: "Mandarin Oriental",
      location: "Bangkok, Thailand",
      rating: 4.7,
      price: 380,
      image: "/src/assets/hotel-illustration.webp"
    }
  ]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Simuler un chargement
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const currentUser = getUserInfo();
        if (!currentUser) {
          navigate('/login');
          return;
        }

        // Mock user data
        setUser({
          id: currentUser.id || 1,
          firstName: currentUser.first_name || "Jean",
          lastName: currentUser.last_name || "Dupont",
          email: currentUser.email || "jean.dupont@email.com",
          phone: currentUser.phone || "+33 6 12 34 56 78",
          avatar: currentUser.avatar || "/src/assets/avatar-placeholder.webp",
          memberSince: "2023-01-15",
          loyaltyPoints: 1250,
          tier: currentUser.tier || "silver"
        });

        // Ici, vous pourriez appeler des APIs réelles :
        // const bookingsData = await bookingService.getUserBookings();
        // const favoritesData = await hotelService.getUserFavorites();

      } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-800';
      case 'silver': return 'bg-gray-400';
      case 'gold': return 'bg-yellow-500';
      case 'platinum': return 'bg-gradient-to-r from-gray-200 to-blue-200';
      default: return 'bg-gray-200';
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'Bronze';
      case 'silver': return 'Argent';
      case 'gold': return 'Or';
      case 'platinum': return 'Platine';
      default: return 'Standard';
    }
  };

  const stats = {
    totalBookings: bookings.length,
    upcomingBookings: bookings.filter(b => b.status === 'confirmed').length,
    totalSpent: bookings.reduce((sum, b) => sum + b.totalPrice, 0),
    favoriteHotels: favorites.length,
    loyaltyPoints: user?.loyaltyPoints || 0,
    tier: user?.tier || 'silver'
  };

  if (loading) {
    return <Loader fullScreen text="Chargement de votre espace personnel..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès non autorisé</h2>
          <p className="text-gray-600 mb-6">Vous devez être connecté pour accéder à cette page.</p>
          <Link
            to="/login"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo />
              <span className="text-xl font-bold text-gray-800 hidden md:block">HotelSphere</span>
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
              <button className="relative p-2 text-gray-600 hover:text-indigo-600">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 font-medium transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              {/* Profil utilisateur */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-200 to-pink-200 flex items-center justify-center mb-4 relative">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-indigo-600" />
                  )}
                  <div className={`absolute -bottom-2 w-8 h-8 rounded-full ${getTierColor(user.tier)} border-2 border-white flex items-center justify-center`}>
                    <Star className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
                <p className="text-gray-600">{user.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor('confirmed')}`}>
                    {getTierName(user.tier)}
                  </div>
                  <span className="text-sm text-gray-500">• {user.loyaltyPoints} points</span>
                </div>
              </div>

              {/* Menu de navigation */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'overview' 
                      ? 'bg-indigo-50 text-indigo-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span>Vue d'ensemble</span>
                </button>

                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'bookings' 
                      ? 'bg-indigo-50 text-indigo-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  <span>Mes réservations</span>
                  <span className="ml-auto bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-1 rounded-full">
                    {stats.totalBookings}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'favorites' 
                      ? 'bg-indigo-50 text-indigo-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span>Mes favoris</span>
                  <span className="ml-auto bg-pink-100 text-pink-600 text-xs font-bold px-2 py-1 rounded-full">
                    {stats.favoriteHotels}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'profile' 
                      ? 'bg-indigo-50 text-indigo-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Mon profil</span>
                </button>

                <button
                  onClick={() => setActiveTab('payment')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'payment' 
                      ? 'bg-indigo-50 text-indigo-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Moyens de paiement</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'settings' 
                      ? 'bg-indigo-50 text-indigo-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Paramètres</span>
                </button>
              </nav>

              {/* CTA Recherche */}
              <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-pink-50 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-2">Trouver un hôtel</h4>
                <p className="text-sm text-gray-600 mb-3">Réservez votre prochain séjour</p>
                <Link
                  to="/hotels"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  <MapPin className="w-4 h-4" />
                  Explorer les hôtels
                </Link>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:w-3/4">
            {/* Vue d'ensemble */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* En-tête */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Bonjour, {user.firstName} 👋</h1>
                      <p className="text-gray-600">Bienvenue dans votre espace personnel</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Membre depuis</p>
                        <p className="font-medium text-gray-900">{new Date(user.memberSince).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalBookings}</h3>
                    <p className="text-gray-600">Réservations totales</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-green-600" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.upcomingBookings}</h3>
                    <p className="text-gray-600">Réservations à venir</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-purple-600" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalSpent.toLocaleString()} €</h3>
                    <p className="text-gray-600">Dépenses totales</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                        <Heart className="w-6 h-6 text-pink-600" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.favoriteHotels}</h3>
                    <p className="text-gray-600">Hôtels favoris</p>
                  </div>
                </div>

                {/* Réservations récentes */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Réservations récentes</h2>
                    <Link
                      to="/client/bookings"
                      className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2"
                    >
                      Voir tout
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {bookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-gray-900">{booking.hotelName}</h3>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                                {getStatusIcon(booking.status)}
                                {booking.status === 'confirmed' ? 'Confirmée' : 
                                 booking.status === 'pending' ? 'En attente' :
                                 booking.status === 'cancelled' ? 'Annulée' : 'Terminée'}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Dates</p>
                                <p className="font-medium text-gray-900">
                                  {new Date(booking.checkInDate).toLocaleDateString('fr-FR')} - {new Date(booking.checkOutDate).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Chambre</p>
                                <p className="font-medium text-gray-900">{booking.roomType}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Voyageurs</p>
                                <p className="font-medium text-gray-900">{booking.guests} personne{booking.guests > 1 ? 's' : ''}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Prix total</p>
                                <p className="font-bold text-gray-900">{booking.totalPrice.toLocaleString()} €</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                              <Eye className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hôtels favoris */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Hôtels favoris</h2>
                    <Link
                      to="/client/favorites"
                      className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2"
                    >
                      Voir tout
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {favorites.map((hotel) => (
                      <div key={hotel.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-40 bg-gradient-to-br from-indigo-100 to-pink-50 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🏨</div>
                            <p className="font-medium text-gray-900">{hotel.name}</p>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="font-medium text-gray-900">{hotel.rating}</span>
                            </div>
                            <div className="text-lg font-bold text-gray-900">{hotel.price} €/nuit</div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 mb-4">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{hotel.location}</span>
                          </div>
                          <div className="flex gap-2">
                            <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                              Réserver
                            </button>
                            <button className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                              <Heart className="w-5 h-5 fill-current" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Mes réservations */}
            {activeTab === 'bookings' && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Mes réservations</h1>
                      <p className="text-gray-600">Gérez toutes vos réservations passées et à venir</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Rechercher une réservation..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filtrer
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Hôtel</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Dates</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Statut</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Prix</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium text-gray-900">{booking.hotelName}</p>
                                <p className="text-sm text-gray-600">{booking.roomType}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="text-gray-900">{new Date(booking.checkInDate).toLocaleDateString('fr-FR')}</p>
                                <p className="text-sm text-gray-600">au {new Date(booking.checkOutDate).toLocaleDateString('fr-FR')}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                {getStatusIcon(booking.status)}
                                {booking.status === 'confirmed' ? 'Confirmée' : 
                                 booking.status === 'pending' ? 'En attente' :
                                 booking.status === 'cancelled' ? 'Annulée' : 'Terminée'}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-bold text-gray-900">{booking.totalPrice.toLocaleString()} €</p>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex gap-2">
                                <button className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                  <Download className="w-4 h-4" />
                                </button>
                                {booking.status === 'pending' && (
                                  <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Mon profil */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
                      <p className="text-gray-600">Gérez vos informations personnelles</p>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900">{user.firstName} {user.lastName}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <p className="text-gray-900">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <p className="text-gray-900">{user.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Statut fidélité */}
                      <div className="p-4 bg-gradient-to-r from-indigo-50 to-pink-50 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-gray-900">Programme de fidélité</h3>
                            <p className="text-sm text-gray-600">{getTierName(user.tier)} Tier</p>
                          </div>
                          <div className={`w-12 h-12 rounded-full ${getTierColor(user.tier)} flex items-center justify-center`}>
                            <Star className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Points de fidélité</span>
                            <span>{user.loyaltyPoints} / 2000</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 to-pink-500 h-2 rounded-full" 
                              style={{ width: `${(user.loyaltyPoints / 2000) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {user.loyaltyPoints < 500 ? 'Bronze : 0-499 points' :
                           user.loyaltyPoints < 1000 ? 'Argent : 500-999 points' :
                           user.loyaltyPoints < 2000 ? 'Or : 1000-1999 points' :
                           'Platine : 2000+ points'}
                        </p>
                      </div>

                      {/* Date d'inscription */}
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-sm text-gray-600">Membre depuis</p>
                            <p className="font-medium text-gray-900">{new Date(user.memberSince).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Paramètres */}
            {activeTab === 'settings' && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Paramètres</h1>
                  
                  <div className="space-y-6">
                    {/* Notifications */}
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notifications
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Emails promotionnels</p>
                            <p className="text-sm text-gray-600">Recevoir des offres spéciales</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Rappels de réservation</p>
                            <p className="text-sm text-gray-600">Notifications avant votre séjour</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Confidentialité */}
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Confidentialité
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Profil public</p>
                            <p className="text-sm text-gray-600">Rendre votre profil visible</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Changement de mot de passe */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        Sécurité
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                          <input
                            type="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                            <input
                              type="password"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="••••••••"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                            <input
                              type="password"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                          Changer le mot de passe
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <Logo />
                <span className="text-lg font-bold">HotelSphere</span>
              </div>
              <p className="text-gray-400">
                © {new Date().getFullYear()} Votre partenaire de voyage
              </p>
            </div>
            <div className="text-sm text-gray-400 text-center md:text-right">
              <p>Besoin d'aide ? <Link to="/contact" className="text-indigo-400 hover:text-indigo-300">Contactez-nous</Link></p>
              <p className="mt-1">
                <Link to="/privacy" className="hover:text-white">Confidentialité</Link> • 
                <Link to="/terms" className="hover:text-white ml-2">Conditions</Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientDashboard;