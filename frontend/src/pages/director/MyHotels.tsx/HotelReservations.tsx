// src/components/director/reservations/HotelReservations.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft,
  Calendar,
  Filter,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Users,
  Bed,
  Building,
  Mail,
  Phone,
  Download,
  RefreshCw,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText
} from 'lucide-react';

import { bookingService } from '../../../services/booking.service';
import { hotelService } from '../../../services/hotel.service';
import type { ReservationHotel } from '../../../types/booking';
import { toast } from 'react-toastify';

interface ReservationFilters {
  hotel_name?: string;
  status?: string;
  payment_status?: string;
  check_in_date?: string;
  check_out_date?: string;
  customer_name?: string;
  room_number?: string;
}

const HotelReservations: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // États principaux
  const [hotel, setHotel] = useState<any>(null);
  const [reservations, setReservations] = useState<ReservationHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les filtres
  const [filters, setFilters] = useState<ReservationFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  
  // États pour l'UI
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationHotel | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ReservationHotel;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Charger les données initiales
  useEffect(() => {
    if (id) {
      fetchHotelDetails();
    }
  }, [id]);

  // Appliquer les filtres
  useEffect(() => {
    if (hotel) {
      fetchReservations();
    }
  }, [filters, hotel]);

  const fetchHotelDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const hotelData = await hotelService.getHotelDetails(parseInt(id!));
      setHotel(hotelData);
      
      // Initialiser les filtres avec le nom de l'hôtel
      setFilters({ hotel_name: hotelData.name });
      
    } catch (err: any) {
      console.error('Erreur API:', err);
      setError(err.response?.data?.message || 'Erreur de connexion au serveur');
      toast.error('Impossible de charger les détails de l\'hôtel');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      if (!hotel) return;
      
      const response = await bookingService.getReservationsByHotel(hotel.name); 
      setReservations(response);
      
    } catch (err: any) {
      console.error('Erreur API:', err);
      toast.error('Impossible de charger les réservations');
    }
  };

  // Appliquer les filtres
  const applyFilters = () => {
    const newFilters: ReservationFilters = { hotel_name: hotel?.name };
    
    if (statusFilter !== 'all') {
      newFilters.status = statusFilter;
    }
    
    if (paymentStatusFilter !== 'all') {
      newFilters.payment_status = paymentStatusFilter;
    }
    
    if (dateRange.start) {
      newFilters.check_in_date = dateRange.start;
    }
    
    if (dateRange.end) {
      newFilters.check_out_date = dateRange.end;
    }
    
    if (searchTerm) {
      newFilters.customer_name = searchTerm;
    }
    
    setFilters(newFilters);
    setShowFilters(false);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setStatusFilter('all');
    setPaymentStatusFilter('all');
    setDateRange({ start: '', end: '' });
    setSearchTerm('');
    setFilters({ hotel_name: hotel?.name });
    setShowFilters(false);
  };

  // Trier les réservations
  const handleSort = (key: keyof ReservationHotel) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
    
    const sortedReservations = [...reservations].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

  // Si l'une des deux valeurs est null ou undefined, on les considère égales
      if (aValue == null || bValue == null) return 0;

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
      });


    
    setReservations(sortedReservations);
  };

  // Mettre à jour le statut d'une réservation
  const handleStatusUpdate = async (reservationId: number, newStatus: ReservationHotel['status']) => {
    try {
      await bookingService.updateReservationStatus(reservationId, newStatus);
      toast.success('Statut mis à jour avec succès');
      fetchReservations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  // Mettre à jour le statut de paiement
  const handlePaymentStatusUpdate = async (reservationId: number, newPaymentStatus: ReservationHotel['payment_status']) => {
    try {
    //   await bookingService.updatePaymentStatus(reservationId, newPaymentStatus);
      toast.success('Statut de paiement mis à jour');
      fetchReservations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'CHECKED_IN':
        return 'bg-green-100 text-green-800';
      case 'CHECKED_OUT':
        return 'bg-purple-100 text-purple-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir la couleur du statut de paiement
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PARTIALLY_PAID':
        return 'bg-orange-100 text-orange-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CHECKED_IN':
        return <TrendingUp className="w-4 h-4" />;
      case 'CHECKED_OUT':
        return <TrendingDown className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculer le nombre de nuits
  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  // Exporter les réservations en CSV
  const exportToCSV = () => {
    const csvContent = [
      ['ID', 'Client', 'Email', 'Téléphone', 'Chambre', 'Arrivée', 'Départ', 'Nuits', 'Montant', 'Statut', 'Paiement', 'Date création'],
      ...reservations.map(r => [
        r.id,
        r.customer_name,
        r.customer_email,
        r.customer_phone,
        r.room_number,
        formatDate(r.check_in),
        formatDate(r.check_out),
        calculateNights(r.check_in, r.check_out),
        r.total_price + ' €',
        r.status,
        r.payment_status,
        formatDate(r.created_at)
      ])
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations_${hotel?.name}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Rendu des états de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Chargement des réservations...</p>
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
          <button
            onClick={() => navigate('/director/hotels')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Retour à la liste
          </button>
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
            onClick={() => navigate(`/director/hotels/${id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Réservations - {hotel.name}
            </h1>
            <p className="text-gray-600">
              {hotel.city}, {hotel.country} • Gestion des réservations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
          <button
            onClick={fetchReservations}
            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Barre de recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom de client, email ou numéro de chambre..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
          </div>

          {/* Bouton filtres */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtres
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Appliquer
            </button>
          </div>
        </div>

        {/* Panel de filtres avancés */}
        {showFilters && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtre par statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut de réservation
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="PENDING">En attente</option>
                  <option value="CONFIRMED">Confirmée</option>
                  <option value="CHECKED_IN">En cours</option>
                  <option value="CHECKED_OUT">Terminée</option>
                  <option value="CANCELLED">Annulée</option>
                </select>
              </div>

              {/* Filtre par statut de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut de paiement
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="PENDING">En attente</option>
                  <option value="PARTIALLY_PAID">Partiellement payé</option>
                  <option value="PAID">Payé</option>
                  <option value="REFUNDED">Remboursé</option>
                </select>
              </div>

              {/* Filtre par date d'arrivée */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'arrivée
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>

              {/* Filtre par date de départ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de départ
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>

              {/* Boutons d'action */}
              <div className="md:col-span-3 flex gap-3">
                <button
                  onClick={applyFilters}
                  className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex-1"
                >
                  Appliquer les filtres
                </button>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Liste des réservations */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {(reservations ?? []).length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {Object.keys(filters).length > 1 
                ? 'Aucune réservation correspondant aux filtres'
                : 'Aucune réservation pour cet hôtel'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {Object.keys(filters).length > 1
                ? 'Essayez de modifier vos critères de recherche'
                : 'Les réservations apparaîtront ici lorsqu\'elles seront créées'
              }
            </p>
            {Object.keys(filters).length > 1 && (
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th 
                    className="py-3 px-6 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center gap-1">
                      ID
                      {sortConfig?.key === 'id' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-6 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('customer_name')}
                  >
                    <div className="flex items-center gap-1">
                      Client
                      {sortConfig?.key === 'customer_name' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                    Chambre
                  </th>
                  <th 
                    className="py-3 px-6 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('check_in')}
                  >
                    <div className="flex items-center gap-1">
                      Dates
                      {sortConfig?.key === 'check_in' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-6 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('total_price')}
                  >
                    <div className="flex items-center gap-1">
                      Montant
                      {sortConfig?.key === 'total_price' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                    Statut
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                    Paiement
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50 transition group">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">#{reservation.id}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(reservation.created_at)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{reservation.customer_name}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          {reservation.customer_email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          {reservation.customer_phone}
                        </div>
                        <div className="text-xs text-gray-500">
                          {reservation.capacity} personne(s)
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Bed className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{reservation.room_number}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {formatDate(reservation.check_in)} → {formatDate(reservation.check_out)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {calculateNights(reservation.check_in, reservation.check_out)} nuit(s)
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-green-600">
                          {parseFloat(reservation.total_price).toLocaleString()} €
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                          {getStatusIcon(reservation.status)}
                          {reservation.status === 'PENDING' ? 'En attente' :
                           reservation.status === 'CONFIRMED' ? 'Confirmée' :
                           reservation.status === 'CHECKED_IN' ? 'En cours' :
                           reservation.status === 'CHECKED_OUT' ? 'Terminée' : 'Annulée'}
                        </span>
                        <div className="flex gap-1">
                          {reservation.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusUpdate(reservation.id, 'CONFIRMED')}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              Confirmer
                            </button>
                          )}
                          {reservation.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleStatusUpdate(reservation.id, 'CHECKED_IN')}
                              className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              Check-in
                            </button>
                          )}
                          {reservation.status === 'CHECKED_IN' && (
                            <button
                              onClick={() => handleStatusUpdate(reservation.id, 'CHECKED_OUT')}
                              className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                            >
                              Check-out
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(reservation.payment_status)}`}>
                          <DollarSign className="w-3 h-3" />
                          {reservation.payment_status === 'PENDING' ? 'En attente' :
                           reservation.payment_status === 'PARTIALLY_PAID' ? 'Partiel' :
                           reservation.payment_status === 'PAID' ? 'Payé' : 'Remboursé'}
                        </span>
                        <div className="flex gap-1">
                          {reservation.payment_status !== 'PAID' && (
                            <button
                              onClick={() => handlePaymentStatusUpdate(reservation.id, 'PAID')}
                              className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              Marquer payé
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedReservation(reservation)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                          title="Autres actions"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {reservations.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Affichage de {reservations.length} réservation(s)
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Précédent
            </button>
            <span className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm">1</span>
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Modal de détails de réservation */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Détails de la réservation</h2>
                  <p className="text-gray-600">ID: #{selectedReservation.id}</p>
                </div>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Informations client */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations client</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom complet
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {selectedReservation.customer_name}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          {selectedReservation.customer_email}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Téléphone
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          {selectedReservation.customer_phone}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de personnes
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {selectedReservation.capacity} personne(s)
                      </div>
                    </div>
                    {selectedReservation.special_requests && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Demandes spéciales
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          {selectedReservation.special_requests}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations réservation */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations réservation</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hôtel
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          {selectedReservation.hotel_name}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Chambre
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                          <Bed className="w-4 h-4" />
                          {selectedReservation.room_number}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date d'arrivée
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(selectedReservation.check_in)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date de départ
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(selectedReservation.check_out)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Durée du séjour
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {calculateNights(selectedReservation.check_in, selectedReservation.check_out)} nuit(s)
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Montant total
                      </label>
                      <div className="p-3 bg-green-50 text-green-700 rounded-lg font-bold flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        {parseFloat(selectedReservation.total_price).toLocaleString()} €
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Statut réservation
                        </label>
                        <div className={`p-3 rounded-lg flex items-center gap-2 ${getStatusColor(selectedReservation.status)}`}>
                          {getStatusIcon(selectedReservation.status)}
                          {selectedReservation.status === 'PENDING' ? 'En attente' :
                           selectedReservation.status === 'CONFIRMED' ? 'Confirmée' :
                           selectedReservation.status === 'CHECKED_IN' ? 'En cours' :
                           selectedReservation.status === 'CHECKED_OUT' ? 'Terminée' : 'Annulée'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Statut paiement
                        </label>
                        <div className={`p-3 rounded-lg flex items-center gap-2 ${getPaymentStatusColor(selectedReservation.payment_status)}`}>
                          <DollarSign className="w-4 h-4" />
                          {selectedReservation.payment_status === 'PENDING' ? 'En attente' :
                           selectedReservation.payment_status === 'PARTIALLY_PAID' ? 'Partiel' :
                           selectedReservation.payment_status === 'PAID' ? 'Payé' : 'Remboursé'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historique */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Date de création</span>
                    <span className="font-medium">{formatDate(selectedReservation.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Dernière mise à jour</span>
                    <span className="font-medium">{formatDate(selectedReservation.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    // Action d'impression ou autre
                    toast.info('Fonctionnalité à implémenter');
                  }}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Imprimer la facture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelReservations;