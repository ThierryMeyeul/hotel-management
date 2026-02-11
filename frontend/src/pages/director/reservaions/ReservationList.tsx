// src/components/director/reservations/ReservationList.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
  Home,
  Users,
  Mail,
  Phone,
  FileText,
  CreditCard,
  Shield,
  Star,
  MapPin,
  CheckSquare,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Copy,
  Printer,
  PhoneCall,
  MessageSquare,
  ExternalLink,
  BarChart3,
  Zap
} from 'lucide-react';
import { bookingService } from '../../../services/booking.service';
import { hotelService } from '../../../services/hotel.service';
import { getUserById } from '../../../services/auth.service';
import { format, differenceInDays, startOfDay, isToday, isTomorrow } from 'date-fns';
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
  hotel_id?: number;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  room_number?: string;
  room_type?: string;
  room_view?: string;
  hotel_city?: string;
  hotel_country?: string;
  hotel_address?: string;
  hotel_phone?: string;
  hotel_email?: string;
  hotel_image?: string;
  hotel_rating?: number;
  hotel_amenities?: string[];
  payment_status?: string;
  payment_method?: string;
  payment_amount?: string;
  payment_date?: string;
  invoice_number?: string;
  notes?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  is_active: boolean;
  is_staff: boolean;
}

// Types pour les filtres
interface Filters {
  status: string;
  hotel: string;
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
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // États pour les filtres
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    hotel: 'all',
    dateRange: {
      start: '',
      end: ''
    },
    search: ''
  });
  
  // États pour le tri
  const [sortField, setSortField] = useState<'created_at' | 'check_in' | 'total_price' | 'guest_name' | 'hotel_name'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // États pour les actions
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [expandedReservation, setExpandedReservation] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // États pour les statistiques locales
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    checked_in: 0,
    cancelled: 0,
    revenue: 0,
    today_arrivals: 0,
    today_departures: 0,
    occupancy_rate: 0,
    average_stay: 0
  });

  // Extraire les hôtels uniques depuis les réservations
  const hotels = React.useMemo(() => {
    const hotelMap = new Map<string, { id?: number; name: string }>();
    
    reservations.forEach(reservation => {
      if (reservation.hotel_name) {
        const key = reservation.hotel_id ? `${reservation.hotel_id}` : reservation.hotel_name;
        if (!hotelMap.has(key)) {
          hotelMap.set(key, {
            id: reservation.hotel_id,
            name: reservation.hotel_name
          });
        }
      }
    });
    
    return Array.from(hotelMap.values());
  }, [reservations]);

  // Charger les réservations
  useEffect(() => {
    fetchReservations();
  }, []);

  // Filtrer et trier les réservations lorsque les filtres changent
  useEffect(() => {
    if (reservations.length > 0) {
      applyFiltersAndSort();
    }
  }, [filters, sortField, sortDirection, reservations]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await bookingService.getDirectorBookings();
      const reservationsData = response.reservations || response || [];

      // 🔹 Si chaque réservation contient déjà user (id)
      // On récupère les infos utilisateur pour chaque réservation
      const enrichedReservations = await Promise.all(
        reservationsData.map(async (reservation: Reservation) => {
          try {
            const userResponse: User = await getUserById(reservation.user);
            const roomResponse = await hotelService.getRoomId(reservation.room);
            const hotelResponse = await hotelService.getHotelByName(reservation.hotel_name || '');
            const hotel = hotelResponse[0] || null;
            return {
              ...reservation,
              hotel_name: hotel?.name || reservation.hotel_name,
              hotel_city: hotel?.city || '',
              hotel_country: hotel?.country || '',
              hotel_address: hotel?.address || '',
              hotel_phone: hotel?.phone || '',
              hotel_email: hotel?.email || '',
              hotel_amenities: roomResponse.amenities || [],
              guest_name: `${userResponse.first_name} ${userResponse.last_name}`,
              guest_email: userResponse.email,
              guest_phone: userResponse.phone_number,
              room_number: roomResponse.room_number,
              room_type: roomResponse.room_type,
            };
          } catch (error) {
            console.error("Erreur récupération user et room:", error);
            return reservation; // on retourne la réservation même si user ou room échoue
          }
        })
      );

      setReservations(enrichedReservations);

      calculateLocalStats(enrichedReservations);

    } catch (err: any) {
      console.error('Erreur lors du chargement des réservations:', err);
      setError(err.response?.data?.message || 'Erreur de connexion au serveur');
      toast.error('Impossible de charger les réservations');
    } finally {
      setLoading(false);
    }
  };


  const calculateLocalStats = (data: Reservation[]) => {
    const today = startOfDay(new Date());
    
    const total = data.length;
    const pending = data.filter(r => r.status === 'PENDING').length;
    const confirmed = data.filter(r => r.status === 'CONFIRMED').length;
    const checked_in = data.filter(r => r.status === 'CHECKED_IN').length;
    const cancelled = data.filter(r => r.status === 'CANCELLED').length;
    
    const revenue = data.reduce((sum, r) => {
      if (r.status !== 'CANCELLED' && r.total_price) {
        return sum + parseFloat(r.total_price);
      }
      return sum;
    }, 0);
    
    const today_arrivals = data.filter(r => {
      try {
        const checkInDate = startOfDay(new Date(r.check_in));
        return checkInDate.getTime() === today.getTime();
      } catch {
        return false;
      }
    }).length;
    
    const today_departures = data.filter(r => {
      try {
        const checkOutDate = startOfDay(new Date(r.check_out));
        return checkOutDate.getTime() === today.getTime();
      } catch {
        return false;
      }
    }).length;
    
    // Calcul simplifié du taux d'occupation (basé sur les check-in actuels)
    const totalRooms = 50; // Valeur par défaut, à adapter
    const occupancy_rate = totalRooms > 0 ? (checked_in / totalRooms * 100) : 0;
    
    // Calcul de la durée moyenne de séjour
    const totalNights = data.reduce((sum, r) => {
      try {
        const nights = differenceInDays(new Date(r.check_out), new Date(r.check_in));
        return sum + nights;
      } catch {
        return sum;
      }
    }, 0);
    const average_stay = total > 0 ? totalNights / total : 0;
    
    setStats({ 
      total, 
      pending, 
      confirmed, 
      checked_in, 
      cancelled, 
      revenue,
      today_arrivals,
      today_departures,
      occupancy_rate,
      average_stay
    });
  };

  const applyFiltersAndSort = () => {
    let filtered = [...reservations];

    // Filtre par statut
    if (filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    // Filtre par hôtel
    if (filters.hotel !== 'all') {
      filtered = filtered.filter(r => {
        if (r.hotel_id) {
          return r.hotel_id.toString() === filters.hotel;
        }
        return r.hotel_name === filters.hotel;
      });
    }

    // Filtre par date
    if (filters.dateRange.start) {
      const startDate = startOfDay(new Date(filters.dateRange.start));
      filtered = filtered.filter(r => {
        try {
          const checkInDate = startOfDay(new Date(r.check_in));
          return checkInDate >= startDate;
        } catch {
          return false;
        }
      });
    }
    
    if (filters.dateRange.end) {
      const endDate = startOfDay(new Date(filters.dateRange.end));
      filtered = filtered.filter(r => {
        try {
          const checkInDate = startOfDay(new Date(r.check_in));
          return checkInDate <= endDate;
        } catch {
          return false;
        }
      });
    }

    // Filtre par recherche
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        (r.guest_name && r.guest_name.toLowerCase().includes(searchTerm)) ||
        (r.guest_email && r.guest_email.toLowerCase().includes(searchTerm)) ||
        (r.hotel_name && r.hotel_name.toLowerCase().includes(searchTerm)) ||
        (r.room_number && r.room_number.toLowerCase().includes(searchTerm)) ||
        (r.room_type && r.room_type.toLowerCase().includes(searchTerm)) ||
        r.id.toString().includes(searchTerm)
      );
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortField) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'check_in':
          aValue = new Date(a.check_in).getTime();
          bValue = new Date(b.check_in).getTime();
          break;
        case 'total_price':
          aValue = parseFloat(a.total_price || '0');
          bValue = parseFloat(b.total_price || '0');
          break;
        case 'guest_name':
          aValue = a.guest_name?.toLowerCase() || '';
          bValue = b.guest_name?.toLowerCase() || '';
          break;
        case 'hotel_name':
          aValue = a.hotel_name?.toLowerCase() || '';
          bValue = b.hotel_name?.toLowerCase() || '';
          break;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredReservations(filtered);
    setCurrentPage(1); // Retour à la première page après filtrage
  };

  // Gérer les changements de filtre
  const handleFilterChange = (field: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { ...prev.dateRange, [field]: value }
    }));
  };

  // Gérer le tri
  const handleSort = (field: 'created_at' | 'check_in' | 'total_price' | 'guest_name' | 'hotel_name') => {
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
      setActionLoading(reservationId);
      await bookingService.updateReservationStatus(reservationId, newStatus);
      toast.success(`Statut mis à jour: ${getStatusLabel(newStatus)}`);
      
      // Mettre à jour localement
      setReservations(prev => prev.map(r => 
        r.id === reservationId ? { ...r, status: newStatus } : r
      ));
      
      setSelectedReservation(null);
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (reservation: Reservation) => {
    navigate(`/director/reservations/${reservation.id}`);
  };

  const handleEditReservation = (reservation: Reservation) => {
    navigate(`/director/reservations/${reservation.id}/edit`);
  };

  const handleCheckIn = (reservation: Reservation) => {
    if (window.confirm('Confirmer le check-in du client ?')) {
      handleStatusChange(reservation.id, 'CHECKED_IN');
    }
  };

  const handleCheckOut = (reservation: Reservation) => {
    if (window.confirm('Confirmer le check-out du client ?')) {
      handleStatusChange(reservation.id, 'CHECKED_OUT');
    }
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

  const calculateNights = (checkIn: string, checkOut: string) => {
    try {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      return differenceInDays(end, start);
    } catch {
      return 0;
    }
  };

  // Obtenir la couleur selon le statut
  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-50 text-green-700 border-green-200';
      case 'PENDING': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
      case 'CHECKED_IN': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CHECKED_OUT': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'NO_SHOW': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'COMPLETED': return 'bg-teal-50 text-teal-700 border-teal-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: Reservation['status']) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      case 'CHECKED_IN': return <Home className="w-4 h-4" />;
      case 'CHECKED_OUT': return <CheckCircle className="w-4 h-4" />;
      case 'NO_SHOW': return <XCircle className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: Reservation['status']) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmée';
      case 'PENDING': return 'En attente';
      case 'CANCELLED': return 'Annulée';
      case 'CHECKED_IN': return 'En séjour';
      case 'CHECKED_OUT': return 'Départ effectué';
      case 'NO_SHOW': return 'No-show';
      case 'COMPLETED': return 'Terminée';
      default: return status;
    }
  };

  const getPaymentStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusMap: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      'COMPLETED': { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" />, label: 'Payé' },
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3" />, label: 'En attente' },
      'FAILED': { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3" />, label: 'Échoué' },
      'PARTIAL': { color: 'bg-blue-100 text-blue-800', icon: <Clock className="w-3 h-3" />, label: 'Partiel' },
    };
    
    const info = statusMap[status];
    if (!info) return null;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>
        {info.icon}
        {info.label}
      </span>
    );
  };

  // Exporter les réservations
  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Client,Email,Téléphone,Hôtel,Ville,Chambre,Type,Check-in,Check-out,Nuits,Statut,Paiement,Montant,Date création"]
        .concat(filteredReservations.map(r => 
          `${r.id},"${r.guest_name || 'Client'}","${r.guest_email || ''}","${r.guest_phone || ''}","${r.hotel_name || '-'}","${r.hotel_city || ''}","${r.room_number || r.room}","${r.room_type || ''}","${r.check_in}","${r.check_out}",${calculateNights(r.check_in, r.check_out)},"${getStatusLabel(r.status)}","${r.payment_status || 'N/A'}","${r.total_price}€","${r.created_at}"`
        ))
        .join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reservations_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Export CSV téléchargé');
  };

  // Nettoyer les filtres
  const clearFilters = () => {
    setFilters({
      status: 'all',
      hotel: 'all',
      dateRange: { start: '', end: '' },
      search: ''
    });
  };

  // Copier dans le presse-papier
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papier');
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReservations = filteredReservations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600">Chargement des réservations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header avec actions */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Réservations de vos hôtels
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Gérez et suivez toutes les réservations de vos {hotels.length} hôtel{hotels.length > 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Masquer filtres' : 'Afficher filtres'}
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            <button
              onClick={handleExport}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
            
            <button
              onClick={fetchReservations}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En séjour</p>
                <p className="text-2xl font-bold text-blue-600">{stats.checked_in}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Arrivées</p>
                <p className="text-2xl font-bold text-green-600">{stats.today_arrivals}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Départs</p>
                <p className="text-2xl font-bold text-orange-600">{stats.today_departures}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.revenue.toFixed(2)} €</p>
              </div>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Filtres avancés</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Réinitialiser tout
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Recherche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Client, chambre, hôtel..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="CONFIRMED">Confirmées</option>
                <option value="CHECKED_IN">En séjour</option>
                <option value="CHECKED_OUT">Départ effectué</option>
                <option value="COMPLETED">Terminées</option>
                <option value="CANCELLED">Annulées</option>
                <option value="NO_SHOW">No-show</option>
              </select>
            </div>
            
            {/* Hôtel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hôtel
              </label>
              <select
                value={filters.hotel}
                onChange={(e) => handleFilterChange('hotel', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">Tous les hôtels</option>
                {hotels.map((hotel, index) => (
                  <option key={hotel.id || hotel.name || index} value={hotel.id ? hotel.id.toString() : hotel.name}>
                    {hotel.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Trier par */}
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="created_at_desc">Plus récentes</option>
                <option value="created_at_asc">Plus anciennes</option>
                <option value="check_in_asc">Check-in (croissant)</option>
                <option value="check_in_desc">Check-in (décroissant)</option>
                <option value="total_price_desc">Prix (décroissant)</option>
                <option value="total_price_asc">Prix (croissant)</option>
                <option value="guest_name_asc">Client (A-Z)</option>
                <option value="guest_name_desc">Client (Z-A)</option>
                <option value="hotel_name_asc">Hôtel (A-Z)</option>
                <option value="hotel_name_desc">Hôtel (Z-A)</option>
              </select>
            </div>
          </div>
          
          {/* Date range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de check-in (début)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de check-in (fin)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                Effacer tous les filtres
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des réservations */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* En-tête avec compteur */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredReservations.length} réservation{filteredReservations.length !== 1 ? 's' : ''} trouvée{filteredReservations.length !== 1 ? 's' : ''}
            </h2>
            {filters.status !== 'all' || filters.search || filters.dateRange.start || filters.dateRange.end || filters.hotel !== 'all' ? (
              <p className="text-sm text-gray-600">
                Filtres actifs
              </p>
            ) : null}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages}
            </span>
          </div>
        </div>

        {error ? (
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {error}
            </p>
            <button
              onClick={fetchReservations}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Réessayer
            </button>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-16">
            <Building className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune réservation trouvée
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {filters.status !== 'all' || filters.search || filters.dateRange.start || filters.dateRange.end || filters.hotel !== 'all'
                ? 'Aucune réservation ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                : 'Vous n\'avez pas encore de réservations dans vos hôtels.'}
            </p>
            {filters.status !== 'all' || filters.search || filters.dateRange.start || filters.dateRange.end || filters.hotel !== 'all' ? (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Afficher toutes les réservations
              </button>
            ) : (
              <button
                onClick={() => navigate('/director/dashboard')}
                className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
              >
                Retour au tableau de bord
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Liste des réservations */}
            <div className="divide-y divide-gray-200">
              {currentReservations.map((reservation) => {
                const nights = calculateNights(reservation.check_in, reservation.check_out);
                const isCheckInToday = isToday(new Date(reservation.check_in));
                const isCheckOutToday = isToday(new Date(reservation.check_out));
                const isCheckInTomorrow = isTomorrow(new Date(reservation.check_in));
                const isExpanded = expandedReservation === reservation.id;
                
                return (
                  <div
                    key={reservation.id}
                    className={`p-6 transition-all ${isExpanded ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    {/* Ligne principale */}
                    <div className="flex items-start justify-between mb-4">
                      {/* ID et Hôtel */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">#{reservation.id}</div>
                            <div className="text-xs text-gray-500">ID</div>
                          </div>
                          
                          <div className="h-12 w-px bg-gray-200"></div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Building className="w-4 h-4 text-gray-400" />
                              <h3 className="text-lg font-semibold text-gray-900">
                                {reservation.hotel_name || 'Hôtel non spécifié'}
                              </h3>
                              {reservation.hotel_rating && (
                                <div className="flex items-center gap-1 text-yellow-600">
                                  <Star className="w-4 h-4 fill-current" />
                                  <span className="text-sm font-medium">{reservation.hotel_rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              {reservation.hotel_city && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{reservation.hotel_city}{reservation.hotel_country ? `, ${reservation.hotel_country}` : ''}</span>
                                </div>
                              )}
                              
                              {reservation.hotel_phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  <span>{reservation.hotel_phone}</span>
                                </div>
                              )}
                              
                              {reservation.hotel_email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  <a href={`mailto:${reservation.hotel_email}`} className="hover:text-blue-600">
                                    {reservation.hotel_email}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions rapides */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(reservation)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Détails
                        </button>
                        
                        {reservation.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleCheckIn(reservation)}
                            disabled={actionLoading === reservation.id}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-all flex items-center gap-1 disabled:opacity-50"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Check-in
                          </button>
                        )}
                        
                        {reservation.status === 'CHECKED_IN' && (
                          <button
                            onClick={() => handleCheckOut(reservation)}
                            disabled={actionLoading === reservation.id}
                            className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-all flex items-center gap-1 disabled:opacity-50"
                          >
                            <CheckSquare className="w-3 h-3" />
                            Check-out
                          </button>
                        )}
                        
                        <button
                          onClick={() => setExpandedReservation(isExpanded ? null : reservation.id)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    {/* Informations principales */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      {/* Client */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <User className="w-5 h-5 text-gray-500" />
                          <h4 className="font-semibold text-gray-900">Client</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Nom:</span>
                            <span className="font-medium">{reservation.guest_name || 'Client #' + reservation.user}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Email:</span>
                            <div className="flex items-center gap-2">
                              {reservation.guest_email ? (
                                <>
                                  <a 
                                    href={`mailto:${reservation.guest_email}`}
                                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                                  >
                                    {reservation.guest_email}
                                  </a>
                                  <button
                                    onClick={() => copyToClipboard(reservation.guest_email!)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-gray-400 text-sm">Non renseigné</span>
                              )}
                            </div>
                          </div>
                          {reservation.guest_phone && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Téléphone:</span>
                              <div className="flex items-center gap-2">
                                <a 
                                  href={`tel:${reservation.guest_phone}`}
                                  className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                                >
                                  {reservation.guest_phone}
                                </a>
                                <button
                                  onClick={() => copyToClipboard(reservation.guest_phone!)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Séjour */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <h4 className="font-semibold text-gray-900">Séjour</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Arrivée:</span>
                            <div className="text-right">
                              <span className="font-medium">{formatDate(reservation.check_in)}</span>
                              {isCheckInToday && (
                                <div className="text-xs text-green-600 font-medium">Aujourd'hui</div>
                              )}
                              {isCheckInTomorrow && (
                                <div className="text-xs text-blue-600 font-medium">Demain</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Départ:</span>
                            <div className="text-right">
                              <span className="font-medium">{formatDate(reservation.check_out)}</span>
                              {isCheckOutToday && (
                                <div className="text-xs text-yellow-600 font-medium">Départ aujourd'hui</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Durée:</span>
                            <span className="font-medium">{nights} nuit{nights > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Chambre:</span>
                            <div className="text-right">
                              <div className="font-medium">#{reservation.room_number || reservation.room}</div>
                              {reservation.room_type && (
                                <div className="text-sm text-gray-600">{reservation.room_type}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Paiement et Statut */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <CreditCard className="w-5 h-5 text-gray-500" />
                          <h4 className="font-semibold text-gray-900">Paiement & Statut</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Montant:</span>
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900">
                                {parseFloat(reservation.total_price).toFixed(2)} €
                              </div>
                              <div className="text-sm text-gray-600">
                                {nights > 0 ? (parseFloat(reservation.total_price) / nights).toFixed(2) + ' €/nuit' : ''}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Statut:</span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(reservation.status)}`}>
                              {getStatusIcon(reservation.status)}
                              {getStatusLabel(reservation.status)}
                            </span>
                          </div>
                          {reservation.payment_status && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Paiement:</span>
                              {getPaymentStatusBadge(reservation.payment_status)}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 text-right">
                            Créée le {formatDateTime(reservation.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Section étendue avec actions détaillées */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-semibold text-gray-900">Actions et détails</h5>
                          {reservation.hotel_address && (
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {reservation.hotel_address}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          {/* Actions de contact */}
                          {reservation.guest_email && (
                            <button
                              onClick={() => window.open(`mailto:${reservation.guest_email}`)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
                            >
                              <Mail className="w-4 h-4" />
                              Envoyer email
                            </button>
                          )}
                          
                          {reservation.guest_phone && (
                            <button
                              onClick={() => window.open(`tel:${reservation.guest_phone}`)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
                            >
                              <PhoneCall className="w-4 h-4" />
                              Appeler
                            </button>
                          )}
                          
                          {/* Actions de réservation */}
                          <button
                            onClick={() => handleViewDetails(reservation)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Voir les détails complets
                          </button>
                          
                          <button
                            onClick={() => handleEditReservation(reservation)}
                            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Modifier
                          </button>
                          
                          {/* Actions selon le statut */}
                          {reservation.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(reservation.id, 'CONFIRMED')}
                                disabled={actionLoading === reservation.id}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Confirmer
                              </button>
                              
                              <button
                                onClick={() => handleStatusChange(reservation.id, 'CANCELLED')}
                                disabled={actionLoading === reservation.id}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4" />
                                Annuler
                              </button>
                            </>
                          )}
                          
                          {reservation.status === 'CONFIRMED' && (
                            <>
                              <button
                                onClick={() => handleCheckIn(reservation)}
                                disabled={actionLoading === reservation.id}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50"
                              >
                                <Home className="w-4 h-4" />
                                Check-in
                              </button>
                              
                              <button
                                onClick={() => handleStatusChange(reservation.id, 'CANCELLED')}
                                disabled={actionLoading === reservation.id}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4" />
                                Annuler
                              </button>
                            </>
                          )}
                          
                          {reservation.status === 'CHECKED_IN' && (
                            <button
                              onClick={() => handleCheckOut(reservation)}
                              disabled={actionLoading === reservation.id}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                              <CheckSquare className="w-4 h-4" />
                              Check-out
                            </button>
                          )}
                          
                          {/* Menu supplémentaire */}
                          <div className="relative">
                            <button
                              onClick={() => setSelectedReservation(selectedReservation?.id === reservation.id ? null : reservation)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
                            >
                              <MoreVertical className="w-4 h-4" />
                              Plus d'options
                            </button>
                            
                            {selectedReservation?.id === reservation.id && (
                              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
                                <button
                                  onClick={() => {
                                    copyToClipboard(`Réservation #${reservation.id} - ${reservation.guest_name || 'Client'} - ${reservation.hotel_name || 'Hôtel'}`);
                                    setSelectedReservation(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                                >
                                  <Copy className="w-4 h-4" />
                                  Copier les infos
                                </button>
                                
                                <button
                                  onClick={() => {
                                    window.print();
                                    setSelectedReservation(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                                >
                                  <Printer className="w-4 h-4" />
                                  Imprimer
                                </button>
                                
                                <div className="border-t border-gray-200 my-2"></div>
                                
                                {reservation.notes && (
                                  <div className="px-4 py-2 text-sm text-gray-600">
                                    <div className="font-medium mb-1">Notes:</div>
                                    <div className="text-gray-700">{reservation.notes}</div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Informations supplémentaires sur l'hôtel */}
                        {reservation.hotel_amenities && reservation.hotel_amenities.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h6 className="font-medium text-gray-700 mb-2">Équipements de l'hôtel:</h6>
                            <div className="flex flex-wrap gap-2">
                              {reservation.hotel_amenities.slice(0, 5).map((amenity, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                >
                                  {amenity}
                                </span>
                              ))}
                              {reservation.hotel_amenities.length > 5 && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                                  +{reservation.hotel_amenities.length - 5} autres
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700">
                    Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredReservations.length)}
                    </span>{' '}
                    sur <span className="font-medium">{filteredReservations.length}</span> réservation{filteredReservations.length !== 1 ? 's' : ''}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2.5 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
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
                            className={`w-10 h-10 rounded-lg font-medium transition-all shadow-sm ${
                              currentPage === pageNum
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                : 'border border-gray-300 text-gray-700 hover:bg-white'
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
                      className="p-2.5 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Overlay pour fermer les menus */}
      {(selectedReservation || expandedReservation) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setSelectedReservation(null);
            setExpandedReservation(null);
          }}
        />
      )}
    </div>
  );
};

export default ReservationList;