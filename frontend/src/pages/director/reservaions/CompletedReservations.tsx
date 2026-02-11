// src/components/director/reservations/CompletedReservations.tsx
import React, { useState, useEffect, useMemo } from 'react';
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
  Clock,
  MoreVertical,
  Eye,
  Download,
  ArrowUpDown,
  RefreshCw,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Home,
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
  Zap,
  Archive,
  Award,
  ThumbsUp,
  TrendingUp,
  History,
  Receipt,
  BadgeCheck,
  ShieldCheck,
  PackageCheck,
  CheckCheck
} from 'lucide-react';
import { bookingService } from '../../../services/booking.service';
import { format, differenceInDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-toastify';

// Types pour les réservations (basé sur votre modèle Django)
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
  payment_info?: {
    id: number;
    amount: string;
    payment_date: string;
    payment_method: string;
    status: string;
    invoice?: {
      id: number;
      invoice_number: string;
      issued_date: string;
    };
  };
  notes?: string;
}

// Types pour les filtres
interface Filters {
  hotel: string;
  dateRange: {
    start: string;
    end: string;
  };
  search: string;
  sortBy: 'check_in' | 'check_out' | 'total_price' | 'created_at';
  sortOrder: 'asc' | 'desc';
}

const CompletedReservations: React.FC = () => {
  const navigate = useNavigate();
  
  // États pour les données
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  
  // États pour les filtres
  const [filters, setFilters] = useState<Filters>({
    hotel: 'all',
    dateRange: {
      start: '',
      end: ''
    },
    search: '',
    sortBy: 'check_out',
    sortOrder: 'desc'
  });
  
  // États pour les actions
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [expandedReservation, setExpandedReservation] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // États pour les statistiques locales
  const [stats, setStats] = useState({
    total: 0,
    total_revenue: 0,
    avg_stay_duration: 0,
    avg_spent_per_guest: 0,
    completed_this_month: 0,
    top_hotel: { name: '', count: 0 }
  });

  // Extraire les hôtels uniques depuis les réservations
  const hotels = useMemo(() => {
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

  // Charger les réservations complétées
  useEffect(() => {
    fetchCompletedReservations();
  }, []);

  // Filtrer et trier les réservations lorsque les filtres changent
  useEffect(() => {
    if (reservations.length > 0) {
      applyFiltersAndSort();
      calculateLocalStats(reservations);
    }
  }, [filters, reservations]);

  const fetchCompletedReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await bookingService.getDirectorBookings();
      const reservationsData = response.reservations || response || [];
      
      // Filtrer pour ne garder que les réservations COMPLETED
      const completedReservations = reservationsData.filter(
        (reservation: Reservation) => reservation.status === 'COMPLETED'
      );
      
      setReservations(completedReservations);
      
    } catch (err: any) {
      console.error('Erreur lors du chargement des réservations terminées:', err);
      setError(err.response?.data?.message || 'Erreur de connexion au serveur');
      toast.error('Impossible de charger les réservations terminées');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...reservations];

    // Filtre par hôtel
    if (filters.hotel !== 'all') {
      filtered = filtered.filter(r => {
        if (r.hotel_id) {
          return r.hotel_id.toString() === filters.hotel;
        }
        return r.hotel_name === filters.hotel;
      });
    }

    // Filtre par date (check_out)
    if (filters.dateRange.start) {
      const startDate = startOfDay(new Date(filters.dateRange.start));
      filtered = filtered.filter(r => {
        try {
          const checkOutDate = startOfDay(new Date(r.check_out));
          return checkOutDate >= startDate;
        } catch {
          return false;
        }
      });
    }
    
    if (filters.dateRange.end) {
      const endDate = startOfDay(new Date(filters.dateRange.end));
      filtered = filtered.filter(r => {
        try {
          const checkOutDate = startOfDay(new Date(r.check_out));
          return checkOutDate <= endDate;
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
        r.id.toString().includes(searchTerm) ||
        (r.payment_info?.invoice?.invoice_number && 
          r.payment_info.invoice.invoice_number.toLowerCase().includes(searchTerm))
      );
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (filters.sortBy) {
        case 'check_in':
          aValue = new Date(a.check_in).getTime();
          bValue = new Date(b.check_in).getTime();
          break;
        case 'check_out':
          aValue = new Date(a.check_out).getTime();
          bValue = new Date(b.check_out).getTime();
          break;
        case 'total_price':
          aValue = parseFloat(a.total_price || '0');
          bValue = parseFloat(b.total_price || '0');
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredReservations(filtered);
    setCurrentPage(1); // Retour à la première page après filtrage
  };

  const calculateLocalStats = (data: Reservation[]) => {
    const total = data.length;
    
    const total_revenue = data.reduce((sum, r) => {
      if (r.total_price) {
        return sum + parseFloat(r.total_price);
      }
      return sum;
    }, 0);
    
    // Calcul de la durée moyenne de séjour
    const totalNights = data.reduce((sum, r) => {
      try {
        const nights = differenceInDays(new Date(r.check_out), new Date(r.check_in));
        return sum + nights;
      } catch {
        return sum;
      }
    }, 0);
    const avg_stay_duration = total > 0 ? totalNights / total : 0;
    
    const avg_spent_per_guest = total > 0 ? total_revenue / total : 0;
    
    // Réservations du mois en cours
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const completed_this_month = data.filter(r => {
      try {
        const checkOutDate = new Date(r.check_out);
        return checkOutDate.getMonth() === currentMonth && 
               checkOutDate.getFullYear() === currentYear;
      } catch {
        return false;
      }
    }).length;
    
    // Hôtel avec le plus de réservations complétées
    const hotelCounts = new Map<string, number>();
    data.forEach(r => {
      if (r.hotel_name) {
        const count = hotelCounts.get(r.hotel_name) || 0;
        hotelCounts.set(r.hotel_name, count + 1);
      }
    });
    
    let topHotel = { name: '', count: 0 };
    hotelCounts.forEach((count, name) => {
      if (count > topHotel.count) {
        topHotel = { name, count };
      }
    });
    
    setStats({ 
      total, 
      total_revenue,
      avg_stay_duration,
      avg_spent_per_guest,
      completed_this_month,
      top_hotel: topHotel
    });
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

  const handleSort = (field: 'check_in' | 'check_out' | 'total_price' | 'created_at') => {
    if (filters.sortBy === field) {
      handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setFilters(prev => ({
        ...prev,
        sortBy: field,
        sortOrder: 'desc'
      }));
    }
  };

  // Gérer les actions
  const handleViewDetails = (reservation: Reservation) => {
    navigate(`/director/reservations/${reservation.id}`);
  };

  const handleViewInvoice = (reservation: Reservation) => {
    if (reservation.payment_info?.invoice) {
      // Naviguer vers la page de facture ou ouvrir dans un nouvel onglet
      window.open(`/director/invoices/${reservation.payment_info.invoice.id}`, '_blank');
    } else {
      toast.info('Aucune facture disponible pour cette réservation');
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
  const getStatusColor = () => {
    return 'bg-teal-50 text-teal-700 border-teal-200';
  };

  const getStatusIcon = () => {
    return <CheckCheck className="w-4 h-4" />;
  };

  const getStatusLabel = () => {
    return 'Terminée';
  };

  const getPaymentMethodIcon = (method?: string) => {
    switch (method?.toUpperCase()) {
      case 'CREDIT_CARD': return <CreditCard className="w-3 h-3" />;
      case 'PAYPAL': return <CreditCard className="w-3 h-3" />;
      case 'BANK_TRANSFER': return <CreditCard className="w-3 h-3" />;
      case 'MOBILE_MONEY': return <CreditCard className="w-3 h-3" />;
      default: return <CreditCard className="w-3 h-3" />;
    }
  };

  // Exporter les réservations
  const handleExport = async () => {
    try {
      setExporting(true);
      const csvContent = "data:text/csv;charset=utf-8," 
        + ["ID,Client,Email,Téléphone,Hôtel,Ville,Chambre,Type,Check-in,Check-out,Nuits,Statut,Méthode Paiement,Montant,Facture,Date Réservation"]
          .concat(filteredReservations.map(r => 
            `${r.id},"${r.guest_name || 'Client'}","${r.guest_email || ''}","${r.guest_phone || ''}","${r.hotel_name || '-'}","${r.hotel_city || ''}","${r.room_number || r.room}","${r.room_type || ''}","${r.check_in}","${r.check_out}",${calculateNights(r.check_in, r.check_out)},"${getStatusLabel()}","${r.payment_info?.payment_method || 'N/A'}","${r.total_price}€","${r.payment_info?.invoice?.invoice_number || 'N/A'}","${r.created_at}"`
          ))
          .join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `reservations_terminees_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Export CSV téléchargé');
    } catch (err) {
      console.error('Erreur lors de l\'export:', err);
      toast.error('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  // Nettoyer les filtres
  const clearFilters = () => {
    setFilters({
      hotel: 'all',
      dateRange: { start: '', end: '' },
      search: '',
      sortBy: 'check_out',
      sortOrder: 'desc'
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center justify-center">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6" />
        <p className="text-gray-600 text-lg">Chargement de l'historique des réservations...</p>
        <p className="text-gray-500 text-sm mt-2">Récupération des séjours terminés</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header avec actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Archive className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Historique des Réservations
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Tous les séjours terminés dans vos {hotels.length} hôtel{hotels.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              {/* Statistiques principales */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total terminées</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <PackageCheck className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Revenue total</p>
                      <p className="text-2xl font-bold">{stats.total_revenue.toFixed(0)} €</p>
                    </div>
                    <TrendingUp className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Séjour moyen</p>
                      <p className="text-2xl font-bold">{stats.avg_stay_duration.toFixed(1)} jrs</p>
                    </div>
                    <CalendarDays className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Ce mois</p>
                      <p className="text-2xl font-bold">{stats.completed_this_month}</p>
                    </div>
                    <Award className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl p-4 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Hôtel top</p>
                      <p className="text-xl font-bold truncate">{stats.top_hotel.name || 'N/A'}</p>
                    </div>
                    <Building className="w-8 h-8 opacity-80" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Masquer filtres' : 'Afficher filtres'}
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              <button
                onClick={handleExport}
                disabled={exporting || filteredReservations.length === 0}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Download className={`w-4 h-4 ${exporting ? 'animate-spin' : ''}`} />
                {exporting ? 'Export...' : 'Exporter'}
              </button>
              
              <button
                onClick={fetchCompletedReservations}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 mb-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filtres avancés</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1 rounded-lg transition-all"
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
                    placeholder="Client, chambre, hôtel, facture..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                  />
                </div>
              </div>
              
              {/* Hôtel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hôtel
                </label>
                <select
                  value={filters.hotel}
                  onChange={(e) => handleFilterChange('hotel', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
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
                  value={`${filters.sortBy}_${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('_');
                    setFilters(prev => ({
                      ...prev,
                      sortBy: sortBy as any,
                      sortOrder: sortOrder as any
                    }));
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                >
                  <option value="check_out_desc">Départ (récent)</option>
                  <option value="check_out_asc">Départ (ancien)</option>
                  <option value="check_in_desc">Arrivée (récente)</option>
                  <option value="check_in_asc">Arrivée (ancienne)</option>
                  <option value="total_price_desc">Prix (haut)</option>
                  <option value="total_price_asc">Prix (bas)</option>
                  <option value="created_at_desc">Création (récente)</option>
                  <option value="created_at_asc">Création (ancienne)</option>
                </select>
              </div>
              
              {/* Actions */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all font-medium shadow-sm"
                >
                  Effacer filtres
                </button>
              </div>
            </div>
            
            {/* Date range */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de départ (début)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de départ (fin)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                  />
                </div>
              </div>
              
              <div className="flex items-end">
                <div className="text-sm text-gray-600 bg-blue-50 px-4 py-2.5 rounded-lg w-full text-center">
                  <span className="font-medium">{filteredReservations.length}</span> résultat{filteredReservations.length !== 1 ? 's' : ''} trouvé{filteredReservations.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Liste des réservations */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
          {/* En-tête avec compteur */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Séjours terminés
                </h2>
                <p className="text-gray-600 text-sm">
                  {filters.hotel !== 'all' || filters.search || filters.dateRange.start || filters.dateRange.end
                    ? 'Résultats filtrés'
                    : 'Tous les séjours terminés'}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                  Page <span className="font-bold">{currentPage}</span> sur <span className="font-bold">{totalPages}</span>
                </div>
              </div>
            </div>
          </div>

          {error ? (
            <div className="text-center py-16">
              <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Erreur de chargement
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {error}
              </p>
              <button
                onClick={fetchCompletedReservations}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                <RefreshCw className="w-5 h-5 inline mr-2" />
                Réessayer
              </button>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Archive className="w-16 h-16 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Aucun séjour terminé
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                {filters.hotel !== 'all' || filters.search || filters.dateRange.start || filters.dateRange.end
                  ? 'Aucun séjour terminé ne correspond à vos critères.'
                  : 'Tous vos séjours sont encore en cours ou à venir.'}
              </p>
              {filters.hotel !== 'all' || filters.search || filters.dateRange.start || filters.dateRange.end ? (
                <button
                  onClick={clearFilters}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                >
                  Afficher tous les séjours terminés
                </button>
              ) : (
                <button
                  onClick={() => navigate('/director/reservations/active')}
                  className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-medium"
                >
                  Voir les séjours en cours
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Liste des réservations */}
              <div className="divide-y divide-gray-100">
                {currentReservations.map((reservation) => {
                  const nights = calculateNights(reservation.check_in, reservation.check_out);
                  const isExpanded = expandedReservation === reservation.id;
                  const hasInvoice = !!reservation.payment_info?.invoice;
                  
                  return (
                    <div
                      key={reservation.id}
                      className={`p-6 transition-all duration-300 ${isExpanded ? 'bg-gradient-to-r from-blue-50/50 to-teal-50/50' : 'hover:bg-gray-50/50'}`}
                    >
                      {/* Ligne principale */}
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
                        {/* Informations hôtel */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            {reservation.hotel_image ? (
                              <img
                                src={reservation.hotel_image}
                                alt={reservation.hotel_name || 'Hôtel'}
                                className="w-16 h-16 rounded-xl object-cover shadow-sm"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-teal-100 rounded-xl flex items-center justify-center shadow-sm">
                                <Building className="w-8 h-8 text-blue-600" />
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-900">
                                  {reservation.hotel_name || 'Hôtel non spécifié'}
                                </h3>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor()}`}>
                                  {getStatusIcon()}
                                  {getStatusLabel()}
                                </span>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                {reservation.hotel_city && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{reservation.hotel_city}{reservation.hotel_country ? `, ${reservation.hotel_country}` : ''}</span>
                                  </div>
                                )}
                                
                                {reservation.hotel_rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="font-medium">{reservation.hotel_rating.toFixed(1)}</span>
                                  </div>
                                )}
                                
                                {reservation.hotel_phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    <span>{reservation.hotel_phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions rapides */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleViewDetails(reservation)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2 shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                            Détails
                          </button>
                          
                          {hasInvoice && (
                            <button
                              onClick={() => handleViewInvoice(reservation)}
                              className="px-4 py-2 border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all flex items-center gap-2"
                            >
                              <Receipt className="w-4 h-4" />
                              Facture
                            </button>
                          )}
                          
                          <button
                            onClick={() => setExpandedReservation(isExpanded ? null : reservation.id)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                Réduire
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                Étendre
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Informations principales */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Client */}
                        <div className="bg-white/50 backdrop-blur-sm p-5 rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold text-gray-900">Client</h4>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Nom complet</p>
                              <p className="font-medium text-gray-900 text-lg">
                                {reservation.guest_name || `Client #${reservation.user}`}
                              </p>
                            </div>
                            {reservation.guest_email && (
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Email</p>
                                <div className="flex items-center gap-2">
                                  <a 
                                    href={`mailto:${reservation.guest_email}`}
                                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                  >
                                    {reservation.guest_email}
                                  </a>
                                  <button
                                    onClick={() => copyToClipboard(reservation.guest_email!)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                            {reservation.guest_phone && (
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Téléphone</p>
                                <div className="flex items-center gap-2">
                                  <a 
                                    href={`tel:${reservation.guest_phone}`}
                                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                  >
                                    {reservation.guest_phone}
                                  </a>
                                  <button
                                    onClick={() => copyToClipboard(reservation.guest_phone!)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Séjour */}
                        <div className="bg-white/50 backdrop-blur-sm p-5 rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-emerald-600" />
                            <h4 className="font-semibold text-gray-900">Séjour</h4>
                          </div>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Arrivée</p>
                                <p className="font-medium text-gray-900">{formatDate(reservation.check_in)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Départ</p>
                                <p className="font-medium text-gray-900">{formatDate(reservation.check_out)}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Durée</p>
                              <p className="font-medium text-gray-900 text-xl">
                                {nights} nuit{nights > 1 ? 's' : ''}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Chambre</p>
                              <div className="flex items-center gap-2">
                                <Bed className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">#{reservation.room_number || reservation.room}</span>
                                {reservation.room_type && (
                                  <span className="text-gray-600">• {reservation.room_type}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Paiement */}
                        <div className="bg-white/50 backdrop-blur-sm p-5 rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="w-5 h-5 text-purple-600" />
                            <h4 className="font-semibold text-gray-900">Paiement</h4>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Montant total</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {parseFloat(reservation.total_price).toFixed(2)} €
                              </p>
                              <p className="text-sm text-gray-600">
                                {nights > 0 ? (parseFloat(reservation.total_price) / nights).toFixed(2) + ' €/nuit' : ''}
                              </p>
                            </div>
                            
                            {reservation.payment_info && (
                              <>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Méthode:</span>
                                  <div className="flex items-center gap-2">
                                    {getPaymentMethodIcon(reservation.payment_info.payment_method)}
                                    <span className="font-medium capitalize">
                                      {reservation.payment_info.payment_method?.replace('_', ' ').toLowerCase()}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Date paiement:</span>
                                  <span className="font-medium">
                                    {formatDate(reservation.payment_info.payment_date)}
                                  </span>
                                </div>
                                
                                {hasInvoice && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Facture:</span>
                                    <span className="font-medium text-emerald-600">
                                      #{reservation.payment_info.invoice!.invoice_number}
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Section étendue */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                            <h5 className="font-semibold text-gray-900 text-lg">Informations complémentaires</h5>
                            <div className="text-sm text-gray-600">
                              Réservation créée le {formatDateTime(reservation.created_at)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Informations hôtel détaillées */}
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl">
                              <h6 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Building className="w-5 h-5" />
                                Détails de l'hôtel
                              </h6>
                              <div className="space-y-3">
                                {reservation.hotel_address && (
                                  <div>
                                    <p className="text-sm text-gray-600 mb-1">Adresse</p>
                                    <p className="font-medium">{reservation.hotel_address}</p>
                                  </div>
                                )}
                                
                                {reservation.hotel_email && (
                                  <div>
                                    <p className="text-sm text-gray-600 mb-1">Email de contact</p>
                                    <a 
                                      href={`mailto:${reservation.hotel_email}`}
                                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                      {reservation.hotel_email}
                                    </a>
                                  </div>
                                )}
                                
                                {reservation.hotel_amenities && reservation.hotel_amenities.length > 0 && (
                                  <div>
                                    <p className="text-sm text-gray-600 mb-2">Équipements</p>
                                    <div className="flex flex-wrap gap-2">
                                      {reservation.hotel_amenities.slice(0, 6).map((amenity, index) => (
                                        <span
                                          key={index}
                                          className="px-3 py-1.5 bg-white text-blue-700 text-sm rounded-lg border border-blue-200"
                                        >
                                          {amenity}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-xl">
                              <h6 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5" />
                                Actions disponibles
                              </h6>
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  onClick={() => handleViewDetails(reservation)}
                                  className="p-3 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-all flex flex-col items-center justify-center"
                                >
                                  <Eye className="w-5 h-5 mb-2" />
                                  <span className="text-sm font-medium">Détails</span>
                                </button>
                                
                                {hasInvoice && (
                                  <button
                                    onClick={() => handleViewInvoice(reservation)}
                                    className="p-3 bg-white border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-all flex flex-col items-center justify-center"
                                  >
                                    <Receipt className="w-5 h-5 mb-2" />
                                    <span className="text-sm font-medium">Facture</span>
                                  </button>
                                )}
                                
                                {reservation.guest_email && (
                                  <button
                                    onClick={() => window.open(`mailto:${reservation.guest_email}`)}
                                    className="p-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex flex-col items-center justify-center"
                                  >
                                    <Mail className="w-5 h-5 mb-2" />
                                    <span className="text-sm font-medium">Email</span>
                                  </button>
                                )}
                                
                                {reservation.guest_phone && (
                                  <button
                                    onClick={() => window.open(`tel:${reservation.guest_phone}`)}
                                    className="p-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex flex-col items-center justify-center"
                                  >
                                    <PhoneCall className="w-5 h-5 mb-2" />
                                    <span className="text-sm font-medium">Appeler</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {reservation.notes && (
                            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                                <h6 className="font-semibold text-amber-800">Notes internes</h6>
                              </div>
                              <p className="text-amber-700">{reservation.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Pied de carte */}
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                          ID Réservation: <span className="font-mono font-bold">#{reservation.id}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Dernière mise à jour: {formatDateTime(reservation.updated_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-700">
                      Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, filteredReservations.length)}
                      </span>{' '}
                      sur <span className="font-medium">{filteredReservations.length}</span> séjour{filteredReservations.length !== 1 ? 's' : ''} terminé{filteredReservations.length !== 1 ? 's' : ''}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2.5 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm bg-white"
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
                                  : 'border border-gray-300 text-gray-700 hover:bg-white bg-white'
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
                        className="p-2.5 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm bg-white"
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

        {/* Message de retour */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/director/bookings/active')}
            className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-medium inline-flex items-center gap-2"
          >
            <ArrowUpDown className="w-4 h-4" />
            Voir les réservations en cours
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletedReservations;