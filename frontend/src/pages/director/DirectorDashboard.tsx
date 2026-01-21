import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Home,
  Building,
  Image,
  Settings,
  Eye,
  Plus,
  ArrowRight,
  Activity,
  Hotel,
  Star,
  CheckCircle,
  AlertCircle,
  Loader as LoaderIcon,
  BarChart3,
  CreditCard,
  MessageSquare,
  Clock
} from 'lucide-react';
import Loader from '../../components/Loader';
import { hotelService } from '../../services/hotel.service';
import { bookingService } from '../../services/booking.service';
// import type { Hotel, Room } from '../../types/hotel';
import type { Hotel as HotelType } from '../../types/hotel'
import type { Booking } from '../../types/booking';
import { MapPin } from 'lucide-react';

const DirectorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalRooms: 0,
    activeBookings: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    occupancyRate: 0,
    revenue: 0,
    pendingReviews: 0
  });
  
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les données en parallèle
      const [hotelsData, bookingsData] = await Promise.all([
        hotelService.getDirectorHotels(),
        bookingService.getDirectorBookings()
      ]);

      setHotels(hotelsData);

      // Calculer les statistiques
      const totalRooms = hotelsData.reduce((sum: number, hotel: HotelType) => sum + (hotel.rooms?.length || 0), 0);
      const activeBookings = bookingsData.filter((b: Booking) => b.status === 'CONFIRMED').length;
      const today = new Date().toISOString().split('T')[0];
      const todayCheckIns = bookingsData.filter((b: Booking) => b.check_in_date === today).length;
      const todayCheckOuts = bookingsData.filter((b: Booking) => b.check_out_date === today).length;
      
      // Calcul taux d'occupation (simplifié)
      const occupancyRate = totalRooms > 0 ? Math.min(100, Math.round((activeBookings / totalRooms) * 100)) : 0;
      
      // Calcul revenu (somme des réservations confirmées)
      const revenue = bookingsData
        .filter((b: Booking) => b.status === 'CONFIRMED')
        .reduce((sum: number, booking: Booking) => sum + (parseFloat(booking.total_price) || 0), 0);

      setStats({
        totalHotels: hotelsData.length,
        totalRooms,
        activeBookings,
        todayCheckIns,
        todayCheckOuts,
        occupancyRate,
        revenue,
        pendingReviews: 5 // À remplacer par appel API réel
      });

      // Réservations récentes (5 dernières)
      setRecentBookings(bookingsData.slice(0, 5));

    } catch (err: any) {
      console.error('Erreur chargement dashboard:', err);
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Chargement du dashboard..." />;
  }

  const statCards = [
    {
      title: 'Hôtels',
      value: stats.totalHotels,
      icon: Building,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/director/hotels'
    },
    {
      title: 'Chambres',
      value: stats.totalRooms,
      icon: Home,
      color: 'from-green-500 to-emerald-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/director/rooms'
    },
    {
      title: 'Réservations Actives',
      value: stats.activeBookings,
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/director/bookings'
    },
    {
      title: 'Taux d\'occupation',
      value: `${stats.occupancyRate}%`,
      icon: Activity,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      link: '/director/analytics'
    },
    {
      title: 'Revenu Total',
      value: `${stats.revenue.toFixed(2)} €`,
      icon: DollarSign,
      color: 'from-emerald-500 to-green-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      link: '/director/finances'
    },
    {
      title: 'Avis en attente',
      value: stats.pendingReviews,
      icon: Star,
      color: 'from-pink-500 to-rose-600',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-50',
      link: '/director/reviews'
    }
  ];

  const quickActions = [
    {
      title: 'Ajouter un hôtel',
      description: 'Créez un nouvel hôtel',
      icon: Building,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      link: '/director/hotels/create'
    },
    {
      title: 'Ajouter une chambre',
      description: 'Ajoutez une nouvelle chambre',
      icon: Home,
      color: 'bg-gradient-to-r from-green-500 to-emerald-600',
      link: '/director/rooms/create'
    },
    {
      title: 'Uploader des images',
      description: 'Ajoutez des photos d\'hôtel',
      icon: Image,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      link: '/director/gallery/upload'
    },
    {
      title: 'Voir les réservations',
      description: 'Consultez les nouvelles réservations',
      icon: Calendar,
      color: 'bg-gradient-to-r from-amber-500 to-orange-600',
      link: '/director/bookings/new'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-600 mt-2">
              Bienvenue sur votre espace de gestion hôtelière
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LoaderIcon className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-red-800">Erreur</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600 mt-1">{stat.title}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne gauche - Actions rapides et Aujourd'hui */}
        <div className="lg:col-span-2">
          {/* Actions rapides */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Actions rapides</h2>
              <Link
                to="/director/quick-actions"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Voir plus
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="group relative overflow-hidden rounded-xl p-4 hover:shadow-lg transition-all"
                >
                  <div className={`absolute inset-0 ${action.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                  <div className="relative">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                    <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                      <span>Accéder</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Réservations récentes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Réservations récentes</h2>
              <Link
                to="/director/bookings"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Voir toutes
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Client</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hôtel</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Dates</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Montant</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{booking.guest_name}</div>
                        <div className="text-sm text-gray-600">{booking.guest_email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 truncate max-w-[150px]">
                          {booking.hotel_name}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="font-medium">{booking.check_in_date}</div>
                          <div className="text-gray-600">au {booking.check_out_date}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{booking.total_price} €</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status === 'CONFIRMED' && <CheckCircle className="w-3 h-3" />}
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => navigate(`/director/bookings/${booking.id}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {recentBookings.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Aucune réservation récente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite - Hôtels et Aujourd'hui */}
        <div className="space-y-8">
          {/* Mes hôtels */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Mes hôtels</h2>
              <Link
                to="/director/hotels"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Voir tous
              </Link>
            </div>
            
            <div className="space-y-4">
              {hotels.slice(0, 3).map((hotel) => (
                <Link
                  key={hotel.id}
                  to={`/director/hotels/${hotel.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                    <Hotel className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{hotel.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{hotel.city}, {hotel.country}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="text-gray-500">{hotel.rooms?.length || 0} chambres</span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        hotel.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {hotel.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </Link>
              ))}
              
              {hotels.length === 0 && (
                <div className="text-center py-4">
                  <Building className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Aucun hôtel</p>
                  <Link
                    to="/director/hotels/create"
                    className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Ajouter un hôtel
                  </Link>
                </div>
              )}
              
              {hotels.length > 3 && (
                <div className="pt-4 border-t border-gray-100">
                  <Link
                    to="/director/hotels"
                    className="flex items-center justify-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Voir les {hotels.length - 3} autres hôtels
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Aujourd'hui */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Aujourd'hui</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">Arrivées</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stats.todayCheckIns}</span>
                </div>
                <Link
                  to="/director/bookings/today/checkins"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Voir les détails →
                </Link>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-900">Départs</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stats.todayCheckOuts}</span>
                </div>
                <Link
                  to="/director/bookings/today/checkouts"
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Voir les détails →
                </Link>
              </div>
              
              <div className="pt-6 border-t border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prochain check-in</p>
                    <p className="font-bold text-gray-900">14:30 - Chambre 205</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rappels */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rappels</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-800">Maintenance prévue</p>
                  <p className="text-sm text-yellow-700">Piscine Hôtel Paris demain</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-800">Avis en attente</p>
                  <p className="text-sm text-blue-700">3 avis à modérer</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <CreditCard className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-purple-800">Paiement attendu</p>
                  <p className="text-sm text-purple-700">Réservation #4567</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorDashboard;