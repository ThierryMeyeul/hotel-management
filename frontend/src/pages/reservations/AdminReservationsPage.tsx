import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Download,
  Printer,
  Mail,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Building,
  Bed,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  ArrowUpDown,
  Plus,
  RefreshCw,
  FileText,
  User,
  Home,
  MapPin
} from 'lucide-react';
import Loader from '../../components/Loader';
import { bookingService } from '../../services/booking.service';
import type { Reservation, Payment } from '../../types/booking';

interface ReservationWithDetails extends Reservation {
  hotel_name?: string;
  room_type?: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  payment?: Payment;
  room_number?: string;
  hotel_city?: string;
  hotel_country?: string;
  hotel_image?: string;
}

const AdminReservationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<ReservationWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedReservations, setSelectedReservations] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    revenue: 0
  });

  useEffect(() => {
    fetchMyReservations();
  }, []);

  useEffect(() => {
    filterReservations();
    calculateStats();
  }, [reservations, searchTerm, statusFilter, dateRange]);

  const fetchMyReservations = async () => {
    setLoading(true);
    try {
      // L'admin récupère ses propres réservations
      const response = await bookingService.getMyReservations();
      
      // S'adapter à différents formats de réponse
      let reservationsData: ReservationWithDetails[] = [];
      
      if (Array.isArray(response)) {
        reservationsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        reservationsData = response.data;
      } else if (Array.isArray(response?.reservations)) {
        reservationsData = response.reservations;
      }
      
      setReservations(reservationsData);
    } catch (error: any) {
      console.error('Erreur lors du chargement de mes réservations:', error);
      alert('Erreur lors du chargement de vos réservations');
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = [...reservations];

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(res => 
        res.hotel_name?.toLowerCase().includes(term) ||
        res.room_type?.toLowerCase().includes(term) ||
        res.hotel_city?.toLowerCase().includes(term) ||
        res.id.toString().includes(term)
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(res => res.status === statusFilter);
    }

    // Filtre par date
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(res => new Date(res.check_in) >= startDate);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      filtered = filtered.filter(res => new Date(res.check_out) <= endDate);
    }

    // Tri
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof ReservationWithDetails];
        let bValue: any = b[sortConfig.key as keyof ReservationWithDetails];

        if (sortConfig.key === 'total_price') {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        } else if (sortConfig.key === 'check_in' || sortConfig.key === 'created_at') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredReservations(filtered);
  };

  const calculateStats = () => {
    const total = reservations.length;
    const pending = reservations.filter(r => r.status === 'PENDING').length;
    const confirmed = reservations.filter(r => r.status === 'CONFIRMED').length;
    const cancelled = reservations.filter(r => r.status === 'CANCELLED').length;
    const completed = reservations.filter(r => r.status === 'COMPLETED').length;
    
    const revenue = reservations
      .filter(r => r.status !== 'CANCELLED')
      .reduce((sum, res) => sum + parseFloat(res.total_price), 0);

    setStats({ total, pending, confirmed, cancelled, completed, revenue });
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectReservation = (id: number) => {
    setSelectedReservations(prev =>
      prev.includes(id)
        ? prev.filter(resId => resId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedReservations.length === currentReservations.length) {
      setSelectedReservations([]);
    } else {
      setSelectedReservations(currentReservations.map(r => r.id));
    }
  };

  const handleStatusChange = async (reservationId: number, newStatus: string) => {
    try {
      await bookingService.updateReservationStatus(reservationId, newStatus);
      fetchMyReservations(); // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleCancelReservations = async () => {
    if (!selectedReservations.length || !window.confirm('Êtes-vous sûr de vouloir annuler ces réservations ?')) {
      return;
    }

    try {
      // Annuler chaque réservation sélectionnée
      await Promise.all(
        selectedReservations.map(id => bookingService.cancelReservation(id))
      );
      fetchMyReservations();
      setSelectedReservations([]);
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      alert('Erreur lors de l\'annulation des réservations');
    }
  };

  const handleExport = () => {
    const dataToExport = filteredReservations.map(res => ({
      ID: res.id,
      Hôtel: res.hotel_name,
      Ville: res.hotel_city,
      Chambre: res.room_type,
      'Numéro chambre': res.room_number || 'N/A',
      'Date arrivée': new Date(res.check_in).toLocaleDateString('fr-FR'),
      'Date départ': new Date(res.check_out).toLocaleDateString('fr-FR'),
      Statut: getStatusText(res.status).text,
      'Prix total': `${parseFloat(res.total_price).toFixed(2)} €`,
      'Date réservation': new Date(res.created_at).toLocaleDateString('fr-FR'),
      'Méthode paiement': res.payment?.payment_method?.replace('_', ' ') || 'N/A',
      'Statut paiement': res.payment?.status || 'N/A'
    }));

    const csvContent = [
      Object.keys(dataToExport[0] || {}).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mes_reservations_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, { text: string; color: string; bgColor: string; icon: React.ReactNode }> = {
      PENDING: {
        text: 'En attente',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        icon: <Clock className="w-3 h-3" />
      },
      CONFIRMED: {
        text: 'Confirmée',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: <CheckCircle className="w-3 h-3" />
      },
      CANCELLED: {
        text: 'Annulée',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: <XCircle className="w-3 h-3" />
      },
      COMPLETED: {
        text: 'Terminée',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        icon: <CheckCircle className="w-3 h-3" />
      }
    };

    return statusMap[status] || { text: status, color: 'text-gray-700', bgColor: 'bg-gray-100', icon: null };
  };

  const getPaymentStatusText = (payment?: Payment) => {
    if (!payment) return { text: 'Non payé', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    
    const statusMap: Record<string, { text: string; color: string; bgColor: string }> = {
      PENDING: { text: 'En attente', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
      COMPLETED: { text: 'Payé', color: 'text-green-600', bgColor: 'bg-green-50' },
      FAILED: { text: 'Échoué', color: 'text-red-600', bgColor: 'bg-red-50' }
    };

    return statusMap[payment.status] || { text: payment.status, color: 'text-gray-600', bgColor: 'bg-gray-100' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReservations = filteredReservations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  if (loading) {
    return <Loader fullScreen text="Chargement de vos réservations..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes réservations</h1>
              <p className="text-gray-600">
                {reservations.length} réservation{reservations.length > 1 ? 's' : ''} personnelle{reservations.length > 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exporter
              </button>
              
              <button
                onClick={fetchMyReservations}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
              
              <button
                onClick={() => navigate('/admin/hotels')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-lg hover:from-indigo-700 hover:to-pink-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nouvelle réservation
              </button>
            </div>
          </div>

          {/* Statistiques personnelles */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Confirmées</p>
                  <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Annulées</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Terminées</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dépensé</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.revenue.toFixed(2)} €</p>
                </div>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par hôtel, ville, type de chambre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtre statut */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="CONFIRMED">Confirmée</option>
                <option value="CANCELLED">Annulée</option>
                <option value="COMPLETED">Terminée</option>
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Date début"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Date fin"
              />
            </div>

            {/* Bouton effacer filtres */}
            {(searchTerm || statusFilter !== 'all' || dateRange.start || dateRange.end) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateRange({ start: '', end: '' });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Effacer filtres
              </button>
            )}
          </div>
        </div>

        {/* Actions en masse */}
        {selectedReservations.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedReservations.length} réservation{selectedReservations.length > 1 ? 's' : ''} sélectionnée{selectedReservations.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-gray-600">
                    Actions disponibles
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelReservations}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  Annuler
                </button>
                
                <button
                  onClick={handleExport}
                  className="px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg hover:bg-black transition-colors"
                >
                  Exporter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tableau des réservations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedReservations.length === currentReservations.length && currentReservations.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  </th>
                  <th 
                    className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center gap-1">
                      ID
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Hôtel
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Chambre
                  </th>
                  <th 
                    className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('check_in')}
                  >
                    <div className="flex items-center gap-1">
                      Dates
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Paiement
                  </th>
                  <th 
                    className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('total_price')}
                  >
                    <div className="flex items-center gap-1">
                      Montant
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentReservations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-lg">Aucune réservation trouvée</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {searchTerm || statusFilter !== 'all' || dateRange.start || dateRange.end
                            ? 'Aucune réservation ne correspond à vos filtres'
                            : 'Réservez votre premier séjour !'}
                        </p>
                        <button
                          onClick={() => navigate('/admin/hotels')}
                          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Voir les hôtels disponibles
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentReservations.map((reservation) => {
                    const status = getStatusText(reservation.status);
                    const paymentStatus = getPaymentStatusText(reservation.payment);
                    const nights = calculateNights(reservation.check_in, reservation.check_out);
                    
                    return (
                      <tr 
                        key={reservation.id} 
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedReservations.includes(reservation.id)}
                            onChange={() => handleSelectReservation(reservation.id)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="font-mono font-medium text-gray-900">
                            #{reservation.id}
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {reservation.hotel_image ? (
                              <img 
                                src={reservation.hotel_image} 
                                alt={reservation.hotel_name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-pink-50 rounded-lg flex items-center justify-center">
                                <Building className="w-5 h-5 text-indigo-600" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{reservation.hotel_name}</div>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <MapPin className="w-3 h-3" />
                                <span>{reservation.hotel_city}, {reservation.hotel_country}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{reservation.room_type}</div>
                            {reservation.room_number && (
                              <div className="text-sm text-gray-600">Chambre {reservation.room_number}</div>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium">{formatDate(reservation.check_in)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-green-500" />
                              <span className="text-sm">{formatDate(reservation.check_out)}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {nights} nuit{nights > 1 ? 's' : ''}
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <CreditCard className="w-4 h-4 text-gray-400" />
                              <span className="text-sm capitalize">
                                {reservation.payment?.payment_method?.replace('_', ' ') || 'N/A'}
                              </span>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full inline-block ${paymentStatus.bgColor}`}>
                              <span className={`font-medium ${paymentStatus.color}`}>
                                {paymentStatus.text}
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900">
                            {parseFloat(reservation.total_price).toFixed(2)} €
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bgColor} max-w-fit`}>
                            {status.icon}
                            <span className={`text-sm font-medium ${status.color}`}>
                              {status.text}
                            </span>
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/admin/reservations/${reservation.id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Voir détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {reservation.status === 'PENDING' || reservation.status === 'CONFIRMED' ? (
                              <button
                                onClick={() => handleStatusChange(reservation.id, 'CANCELLED')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Annuler"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            ) : null}
                            
                            <div className="relative">
                              <button
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Plus d'options"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredReservations.length)}
                  </span>{' '}
                  sur <span className="font-medium">{filteredReservations.length}</span> résultats
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium ${
                          currentPage === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section d'aide */}
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-pink-50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Besoin d'aide avec vos réservations ?</h3>
              <p className="text-gray-700 mb-3">
                Vous avez une question concernant une de vos réservations ? Notre équipe de support est là pour vous aider.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/admin/help')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Centre d'aide
                </button>
                <button
                  onClick={() => window.open('mailto:support@hotelsphere.com')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
                >
                  Contacter le support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReservationsPage;