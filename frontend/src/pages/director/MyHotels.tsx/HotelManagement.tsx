// src/components/director/hotels/HotelManagement.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Building,
  Bed,
  Image as ImageIcon,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Mail,
  Phone,
  Globe,
  Edit,
  Eye,
  BarChart3,
  Settings,
  Star,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  AlertCircle,
  Home,
  Clock,
  TrendingUp,
  Wifi,
  Car,
  Coffee,
  Wind,
  Shield,
  ExternalLink
} from 'lucide-react';
import { hotelService } from '../../../services/hotel.service';
import type { Hotel } from '../../../types/hotel';
import { toast } from 'react-toastify';

const HotelManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // États principaux
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // États pour les statistiques
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    occupancyRate: 0,
    totalBookings: 0,
    activeBookings: 0,
    revenueToday: 0,
    rating: 0,
    totalImages: 0
  });

  // États pour les réservations récentes
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  // Charger les données au montage
  useEffect(() => {
    if (id) {
      fetchHotelDetails();
    }
  }, [id]);

  const fetchHotelDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les détails de l'hôtel
      const hotelData = await hotelService.getHotelDetails(parseInt(id!));
      setHotel(hotelData);
      
      // Calculer les statistiques
      const totalRooms = hotelData.rooms?.length ?? 0;
      const availableRooms = hotelData.rooms?.filter(room => room.is_available).length ?? 0;

      const occupancyRate = totalRooms > 0 ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) : 0;
      
      setStats({
        totalRooms,
        availableRooms,
        occupancyRate,
        totalBookings: 24, // À remplacer par un appel API
        activeBookings: 12, // À remplacer par un appel API
        revenueToday: 4500, // À remplacer par un appel API
        rating: 4.5, // À remplacer par un appel API
        totalImages: hotelData.images.length
      });
      
      // Simuler des réservations récentes (à remplacer par un appel API)
      setRecentBookings([
        {
          id: 1,
          room_number: "101",
          customer_name: "Jean Dupont",
          check_in: "2024-01-20",
          check_out: "2024-01-25",
          status: "confirmed",
          amount: 1200
        },
        {
          id: 2,
          room_number: "205",
          customer_name: "Marie Laurent",
          check_in: "2024-01-19",
          check_out: "2024-01-22",
          status: "checked_in",
          amount: 750
        }
      ]);
      
    } catch (err: any) {
      console.error('Erreur API:', err);
      setError(err.response?.data?.message || 'Erreur de connexion au serveur');
      toast.error('Impossible de charger les détails de l\'hôtel');
    } finally {
      setLoading(false);
    }
  };

  // Gérer le changement de statut de l'hôtel
  const handleToggleStatus = async () => {
    if (!hotel) return;
    
    try {
      const updatedHotel = await hotelService.updateHotelStatus(hotel.id, !hotel.is_active);
      setHotel(updatedHotel);
      toast.success(`Hôtel ${updatedHotel.is_active ? 'activé' : 'désactivé'} avec succès`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Rendu des états de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Chargement des détails de l'hôtel...</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {error || 'Hôtel non trouvé'}
          </h3>
          <p className="text-gray-600 mb-4">
            Impossible de charger les détails de cet hôtel.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchHotelDetails}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </button>
            <button
              onClick={() => navigate('/director/hotels')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/director/hotels')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{hotel.name}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${hotel.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {hotel.is_active ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <p className="text-gray-600 mt-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              {hotel.city}, {hotel.country}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleStatus}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              hotel.is_active
                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            {hotel.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            {hotel.is_active ? 'Désactiver' : 'Activer'}
          </button>
          <button
            onClick={() => navigate(`/director/hotels/${hotel.id}/edit`)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </button>
        </div>
      </div>

      {/* Tabs de navigation */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium text-sm transition whitespace-nowrap border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building className="w-4 h-4 inline mr-2" />
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-6 py-3 font-medium text-sm transition whitespace-nowrap border-b-2 ${
                activeTab === 'rooms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Bed className="w-4 h-4 inline mr-2" />
              Chambres ({stats.totalRooms})
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-6 py-3 font-medium text-sm transition whitespace-nowrap border-b-2 ${
                activeTab === 'gallery'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <ImageIcon className="w-4 h-4 inline mr-2" />
              Galerie ({stats.totalImages})
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-3 font-medium text-sm transition whitespace-nowrap border-b-2 ${
                activeTab === 'bookings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Réservations ({stats.totalBookings})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-medium text-sm transition whitespace-nowrap border-b-2 ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Analytique
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 font-medium text-sm transition whitespace-nowrap border-b-2 ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Paramètres
            </button>
          </nav>
        </div>

        {/* Contenu des tabs */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Statistiques */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Chambres totales</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRooms}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <Bed className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/director/hotels/${hotel.id}/rooms`}
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                    >
                      Gérer les chambres
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Taux d'occupation</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.occupancyRate}%</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${stats.occupancyRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Revenu aujourd'hui</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.revenueToday.toLocaleString()} €</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/director/hotels/${hotel.id}/analytics`}
                      className="text-sm text-purple-600 hover:text-purple-700 hover:underline flex items-center gap-1"
                    >
                      Voir les détails
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl border border-yellow-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">Note moyenne</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.rating.toFixed(1)}/5</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(stats.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">({stats.rating.toFixed(1)})</span>
                  </div>
                </div>
              </div>

              {/* Informations de contact */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Informations de l'hôtel
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                      <p className="text-gray-600">{hotel.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2">Adresse</h3>
                        <p className="text-gray-600">{hotel.address}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2">Localisation</h3>
                        <p className="text-gray-600">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          {hotel.city}, {hotel.country}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {hotel.email && (
                        <div>
                          <h3 className="font-medium text-gray-700 mb-2">Email</h3>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <a 
                              href={`mailto:${hotel.email}`}
                              className="text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {hotel.email}
                            </a>
                          </div>
                        </div>
                      )}
                      {hotel.phone && (
                        <div>
                          <h3 className="font-medium text-gray-700 mb-2">Téléphone</h3>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a 
                              href={`tel:${hotel.phone}`}
                              className="text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {hotel.phone}
                            </a>
                          </div>
                        </div>
                      )}
                      {hotel.website && (
                        <div>
                          <h3 className="font-medium text-gray-700 mb-2">Site web</h3>
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <a 
                              href={hotel.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {hotel.website.replace('https://', '')}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-700 mb-1">Date de création</h3>
                          <p className="text-gray-600">{formatDate(hotel.created_at)}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-700 mb-1">Dernière mise à jour</h3>
                          <p className="text-gray-600">{formatDate(hotel.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Actions rapides
                    </h2>
                    <div className="space-y-3">
                      <Link
                        to={`/director/hotels/${hotel.id}/rooms/add`}
                        className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                      >
                        <Bed className="w-5 h-5" />
                        <div>
                          <div className="font-medium">Ajouter une chambre</div>
                          <div className="text-sm">Créer une nouvelle chambre</div>
                        </div>
                      </Link>
                      
                      <Link
                        to={`/director/hotels/${hotel.id}/images`}
                        className="flex items-center gap-3 p-3 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition"
                      >
                        <ImageIcon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">Gérer la galerie</div>
                          <div className="text-sm">Ajouter/modifier des images</div>
                        </div>
                      </Link>
                      
                      <Link
                        to={`/director/hotels/${hotel.id}/bookings`}
                        className="flex items-center gap-3 p-3 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition"
                      >
                        <Calendar className="w-5 h-5" />
                        <div>
                          <div className="font-medium">Voir les réservations</div>
                          <div className="text-sm">Gérer les réservations</div>
                        </div>
                      </Link>
                      
                      <Link
                        to={`/director/hotels/${hotel.id}/edit`}
                        className="flex items-center gap-3 p-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition"
                      >
                        <Edit className="w-5 h-5" />
                        <div>
                          <div className="font-medium">Modifier l'hôtel</div>
                          <div className="text-sm">Éditer les informations</div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Statut de l'hôtel */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Statut de l'hôtel
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Statut actuel</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${hotel.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {hotel.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Chambres disponibles</span>
                        <span className="font-medium text-green-600">{stats.availableRooms}/{stats.totalRooms}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Images uploadées</span>
                        <span className="font-medium text-blue-600">{stats.totalImages}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Réservations actives</span>
                        <span className="font-medium text-purple-600">{stats.activeBookings}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleToggleStatus}
                      className={`w-full mt-4 py-2.5 rounded-lg font-medium transition ${
                        hotel.is_active
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {hotel.is_active ? 'Désactiver l\'hôtel' : 'Activer l\'hôtel'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Réservations récentes */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Réservations récentes</h2>
                    <Link
                      to={`/director/hotels/${hotel.id}/bookings`}
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                    >
                      Voir toutes
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
                
                {recentBookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                            Chambre
                          </th>
                          <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                            Client
                          </th>
                          <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                            Dates
                          </th>
                          <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                            Montant
                          </th>
                          <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                            Statut
                          </th>
                          <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentBookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50 transition">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Bed className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{booking.room_number}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-medium">{booking.customer_name}</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-sm">
                                <div>Arrivée: {booking.check_in}</div>
                                <div>Départ: {booking.check_out}</div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-medium text-green-600">
                                {booking.amount.toLocaleString()} €
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                booking.status === 'checked_in' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {booking.status === 'confirmed' ? 'Confirmée' :
                                 booking.status === 'checked_in' ? 'En cours' : 'Annulée'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                Voir détails
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Aucune réservation récente
                    </h3>
                    <p className="text-gray-600">
                      Aucune réservation n'a été faite pour cet hôtel récemment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'rooms' && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Gestion des chambres ({stats.totalRooms})
                </h2>
                <Link
                  to={`/director/hotels/${hotel.id}/rooms/add`}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
                >
                  <Bed className="w-4 h-4" />
                  Ajouter une chambre
                </Link>
              </div>
              
              {/* Le contenu des chambres sera chargé ici */}
              <p className="text-gray-600">Redirection vers la page de gestion des chambres...</p>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Galerie d'images ({stats.totalImages})
                </h2>
                <Link
                  to={`/director/hotels/${hotel.id}/gallery`}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  Gérer la galerie
                </Link>
              </div>
              
              {/* Le contenu de la galerie sera chargé ici */}
              <p className="text-gray-600">Redirection vers la page de gestion de la galerie...</p>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Gestion des réservations ({stats.totalBookings})
              </h2>
              {/* Le contenu des réservations sera chargé ici */}
              <p className="text-gray-600">Redirection vers la page de gestion des réservations...</p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Analytique de l'hôtel
              </h2>
              {/* Le contenu de l'analytique sera chargé ici */}
              <p className="text-gray-600">Redirection vers la page d'analytique...</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Paramètres de l'hôtel
              </h2>
              {/* Le contenu des paramètres sera chargé ici */}
              <p className="text-gray-600">Redirection vers la page des paramètres...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelManagement;