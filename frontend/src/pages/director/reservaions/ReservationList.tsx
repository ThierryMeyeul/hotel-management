// src/components/director/reservations/ReservationList.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search,
  Filter,
  Calendar,
  DollarSign,
  User,
  Building,
  Bed,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Eye,
  Edit,
  Download,
  ArrowUpDown,
  RefreshCw,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { bookingService } from '../../../services/booking.service';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-toastify';

// Types pour les réservations
interface Reservation {
  id: number;
  user: number;
  room: number;
  check_in: string;
  check_out: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'NO_SHOW' | 'COMPLETED';
  total_price: string;
  created_at: string;
  updated_at: string;
  hotel_name: string | null;
  guest_name?: string;
  guest_email?: string;
  room_number?: string;
  room_type?: string;
}

// Types pour les filtres
interface Filters {
  status: string;
  dateRange: {
    start: string;
    end: string;
  };
  search: string;
}

const ReservationList: React.FC = () => {
  const navigate = useNavigate();
  
  // États pour les données
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // États pour les filtres
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    dateRange: {
      start: '',
      end: ''
    },
    search: ''
  });
  
  // États pour le tri
  const [sortField, setSortField] = useState<'created_at' | 'check_in' | 'total_price'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // États pour les actions
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Charger les réservations
  useEffect(() => {
    fetchReservations();
  }, [currentPage, filters, sortField, sortDirection]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construire les paramètres de requête
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        sort_by: sortField,
        sort_order: sortDirection
      };
      
      if (filters.status !== 'all') {
        params.status = filters.status;
      }
      
      if (filters.dateRange.start) {
        params.check_in_start = filters.dateRange.start;
      }
      
      if (filters.dateRange.end) {
        params.check_in_end = filters.dateRange.end;
      }
      
      if (filters.search) {
        params.search = filters.search;
      }
      
      const response = await bookingService.getDirectorBookings();
      setReservations(response.reservations || response || []);
      setTotalPages(Math.ceil((response.total || (response.reservations || response).length || 0) / itemsPerPage));
      
    } catch (err: any) {
      console.error('Erreur lors du chargement des réservations:', err);
      setError(err.response?.data?.message || 'Erreur de connexion au serveur');
      toast.error('Impossible de charger les réservations');
    } finally {
      setLoading(false);
    }
  };

  // Gérer les changements de filtre
  const handleFilterChange = (field: keyof Filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1); // Retour à la première page
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
    setCurrentPage(1);
  };

  // Gérer le tri
  const handleSort = (field: 'created_at' | 'check_in' | 'total_price') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Gérer les actions sur une réservation
  const handleStatusChange = async (reservationId: number, newStatus: Reservation['status']) => {
    try {
      setActionLoading(true);
      await bookingService.updateReservationStatus(reservationId, newStatus);
      toast.success(`Statut mis à jour: ${getStatusLabel(newStatus)}`);
      fetchReservations();
      setSelectedReservation(null);
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (reservation: Reservation) => {
    navigate(`/director/reservations/${reservation.id}`);
  };

  const handleEditReservation = (reservation: Reservation) => {
    navigate(`/director/reservations/${reservation.id}/edit`);
  };

  // Formater les dates
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMM yyyy', { locale: fr });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM yyyy 'à' HH:mm", { locale: fr });
    } catch {
      return dateString;
    }
  };

  // Obtenir la couleur selon le statut
  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'CHECKED_IN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CHECKED_OUT': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'NO_SHOW': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Reservation['status']) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      case 'CHECKED_IN': return <CheckCircle className="w-4 h-4" />;
      case 'CHECKED_OUT': return <CheckCircle className="w-4 h-4" />;
      case 'NO_SHOW': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: Reservation['status']) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmée';
      case 'PENDING': return 'En attente';
      case 'CANCELLED': return 'Annulée';
      case 'CHECKED_IN': return 'Check-in';
      case 'CHECKED_OUT': return 'Check-out';
      case 'NO_SHOW': return 'No-show';
      default: return status;
    }
  };

  // Exporter les réservations
  const handleExport = () => {
    // Simuler l'export
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Client,Hotel,Chambre,Check-in,Check-out,Statut,Prix,Date de création"]
        .concat(reservations.map(r => 
          `${r.id},${r.guest_name || 'Client'},${r.hotel_name || '-'},${r.room_number || r.room},${r.check_in},${r.check_out},${getStatusLabel(r.status)},${r.total_price}€,${r.created_at}`
        ))
        .join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reservations_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Export CSV démarré');
  };

  // Nettoyer les filtres
  const clearFilters = () => {
    setFilters({
      status: 'all',
      dateRange: { start: '', end: '' },
      search: ''
    });
    setCurrentPage(1);
  };

  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestion des Réservations
            </h1>
            <p className="text-gray-600">
              Gérez et suivez toutes les réservations de vos hôtels
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
            <button
              onClick={fetchReservations}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Statistiques - SECTION SUPPRIMÉE */}
        
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Rechercher par client, chambre, hôtel..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="all">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="CONFIRMED">Confirmées</option>
              <option value="CHECKED_IN">Check-in</option>
              <option value="CHECKED_OUT">Check-out</option>
              <option value="CANCELLED">Annulées</option>
              <option value="NO_SHOW">No-show</option>
            </select>
            
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Date range */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de check-in (début)
            </label>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de check-in (fin)
            </label>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trier par
            </label>
            <select
              value={`${sortField}_${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('_');
                setSortField(field as any);
                setSortDirection(direction as any);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="created_at_desc">Plus récentes</option>
              <option value="created_at_asc">Plus anciennes</option>
              <option value="check_in_asc">Check-in (croissant)</option>
              <option value="check_in_desc">Check-in (décroissant)</option>
              <option value="total_price_desc">Prix (décroissant)</option>
              <option value="total_price_asc">Prix (croissant)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des réservations */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {error}
            </h3>
            <button
              onClick={fetchReservations}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Réessayer
            </button>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune réservation trouvée
            </h3>
            <p className="text-gray-600 mb-6">
              {filters.status !== 'all' || filters.search || filters.dateRange.start || filters.dateRange.end
                ? 'Aucune réservation ne correspond à vos critères de recherche'
                : 'Vous n\'avez pas encore de réservations'}
            </p>
            {filters.status !== 'all' || filters.search || filters.dateRange.start || filters.dateRange.end ? (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Afficher toutes les réservations
              </button>
            ) : null}
          </div>
        ) : (
          <>
            {/* En-tête du tableau */}
            <div className="grid grid-cols-12 gap-4 p-6 border-b border-gray-200 bg-gray-50 font-medium text-gray-700">
              <div className="col-span-1">
                <button
                  onClick={() => handleSort('created_at')}
                  className="flex items-center gap-1 hover:text-gray-900"
                >
                  ID
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>
              <div className="col-span-2">Client / Hôtel</div>
              <div className="col-span-2">Dates</div>
              <div className="col-span-1">Chambre</div>
              <div className="col-span-2">Statut</div>
              <div className="col-span-2">
                <button
                  onClick={() => handleSort('total_price')}
                  className="flex items-center gap-1 hover:text-gray-900"
                >
                  Montant
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>
              <div className="col-span-2">Actions</div>
            </div>

            {/* Liste des réservations */}
            <div className="divide-y divide-gray-200">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="grid grid-cols-12 gap-4 p-6 hover:bg-gray-50 transition"
                >
                  {/* ID */}
                  <div className="col-span-1 flex items-center">
                    <span className="font-mono text-gray-900">#{reservation.id}</span>
                  </div>
                  
                  {/* Client / Hôtel */}
                  <div className="col-span-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Client #{reservation.user}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="w-4 h-4" />
                        <span className="truncate">{reservation.hotel_name || 'Non spécifié'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Dates */}
                  <div className="col-span-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium">Check-in</div>
                          <div className="text-sm text-gray-600">{formatDate(reservation.check_in)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium">Check-out</div>
                          <div className="text-sm text-gray-600">{formatDate(reservation.check_out)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chambre */}
                  <div className="col-span-1 flex items-center">
                    <div className="flex items-center gap-2">
                      <Bed className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">#{reservation.room}</span>
                    </div>
                  </div>
                  
                  {/* Statut */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(reservation.status)}`}>
                        {getStatusIcon(reservation.status)}
                        {getStatusLabel(reservation.status)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDateTime(reservation.created_at)}
                    </div>
                  </div>
                  
                  {/* Montant */}
                  <div className="col-span-2 flex items-center">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-lg font-bold text-gray-900">{parseFloat(reservation.total_price).toFixed(2)}€</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(reservation)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Voir les détails"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => setSelectedReservation(selectedReservation?.id === reservation.id ? null : reservation)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                        title="Plus d'options"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Menu d'actions déroulant */}
                    {selectedReservation?.id === reservation.id && (
                      <div className="absolute mt-2 right-6 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                        <button
                          onClick={() => handleViewDetails(reservation)}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Voir les détails
                        </button>
                        
                        <button
                          onClick={() => handleEditReservation(reservation)}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Modifier
                        </button>
                        
                        <div className="border-t border-gray-200 my-2"></div>
                        
                        {reservation.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(reservation.id, 'CONFIRMED')}
                              disabled={actionLoading}
                              className="w-full px-4 py-2 text-left text-green-700 hover:bg-green-50 flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Confirmer
                            </button>
                            
                            <button
                              onClick={() => handleStatusChange(reservation.id, 'CANCELLED')}
                              disabled={actionLoading}
                              className="w-full px-4 py-2 text-left text-red-700 hover:bg-red-50 flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Annuler
                            </button>
                          </>
                        )}
                        
                        {reservation.status === 'CONFIRMED' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(reservation.id, 'CHECKED_IN')}
                              disabled={actionLoading}
                              className="w-full px-4 py-2 text-left text-blue-700 hover:bg-blue-50 flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Check-in
                            </button>
                            
                            <button
                              onClick={() => handleStatusChange(reservation.id, 'CANCELLED')}
                              disabled={actionLoading}
                              className="w-full px-4 py-2 text-left text-red-700 hover:bg-red-50 flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Annuler
                            </button>
                          </>
                        )}
                        
                        {reservation.status === 'CHECKED_IN' && (
                          <button
                            onClick={() => handleStatusChange(reservation.id, 'CHECKED_OUT')}
                            disabled={actionLoading}
                            className="w-full px-4 py-2 text-left text-purple-700 hover:bg-purple-50 flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Check-out
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, reservations.length + (currentPage - 1) * itemsPerPage)}
                  </span>{' '}
                  sur <span className="font-medium">{reservations.length + (currentPage - 1) * itemsPerPage}</span> résultats
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-1">
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
                          className={`w-10 h-10 rounded-lg font-medium transition ${
                            currentPage === pageNum
                              ? 'bg-blue-500 text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Overlay pour fermer le menu */}
      {selectedReservation && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setSelectedReservation(null)}
        />
      )}
    </div>
  );
};

export default ReservationList;