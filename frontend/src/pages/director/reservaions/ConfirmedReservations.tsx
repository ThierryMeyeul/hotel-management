// src/components/director/reservations/ConfirmedReservations.tsx
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
  CheckCheck,
  CalendarCheck,
  Bell,
  Send,
  CheckCircle2,
  Clock4,
  MapPinCheck,
  ShieldAlert, 
  XCircle
} from 'lucide-react';
import { bookingService } from '../../../services/booking.service';
import { hotelService } from '../../../services/hotel.service';
import { getUserById } from '../../../services/auth.service';
import { format, differenceInDays, startOfDay, addDays, isAfter, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-toastify';

// Types pour les réservations avec détails (basé sur le modèle AdminReservationsPage)
interface Hotel {
  id: number;
  name: string;
  address: string;
  description: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  website?: string;
  latitude: number;
  longitude: number;
  manager: number;
  manager_id?: number;
  created_at: string;
  updated_at: string;
  images: Array<{
    id: number;
    image: string;
    caption: string;
    is_cover: boolean;
  }>;
  rooms: any[];
  is_active: boolean;
  distance?: number | null;
  is_favorite?: boolean;
  total_favorites?: number;
}

interface Payment {
  id: number;
  reservation: number;
  amount: string;
  payment_date: string;
  payment_method: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  transaction_id?: string;
  invoice?: {
    id: number;
    invoice_number: string;
    issued_date: string;
    payment: number;
  };
}

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
  hotel_name?: string | null;
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
  payment_info?: Payment;
  notes?: string;
  special_requests?: string;
  breakfast_included?: boolean;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
}

interface ReservationWithDetails extends Reservation {
  hotel_details?: Hotel;
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
  upcomingOnly: boolean;
}

const ConfirmedReservations: React.FC = () => {
  const navigate = useNavigate();
  
  // États pour les données
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<ReservationWithDetails[]>([]);
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
    sortBy: 'check_in',
    sortOrder: 'asc',
    upcomingOnly: true
  });
  
  // États pour les actions
  const [selectedReservation, setSelectedReservation] = useState<ReservationWithDetails | null>(null);
  const [expandedReservation, setExpandedReservation] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sendingReminder, setSendingReminder] = useState<number | null>(null);
  const [processingCheckIn, setProcessingCheckIn] = useState<number | null>(null);
  
  // États pour les statistiques locales
  const [stats, setStats] = useState({
    total: 0,
    total_revenue: 0,
    avg_stay_duration: 0,
    upcoming: 0,
    today_arrivals: 0,
    tomorrow_arrivals: 0,
    top_hotel: { name: '', count: 0 }
  });

  // Extraire les hôtels uniques depuis les réservations enrichies
  const hotels = useMemo(() => {
    const hotelMap = new Map<string, { id?: number; name: string }>();
    
    reservations.forEach(reservation => {
      const hotelName = reservation.hotel_details?.name || reservation.hotel_name;
      const hotelId = reservation.hotel_details?.id || reservation.hotel_id;
      
      if (hotelName) {
        const key = hotelId ? `${hotelId}` : hotelName;
        if (!hotelMap.has(key)) {
          hotelMap.set(key, {
            id: hotelId,
            name: hotelName
          });
        }
      }
    });
    
    return Array.from(hotelMap.values());
  }, [reservations]);

  // Charger les réservations confirmées avec détails
  useEffect(() => {
    fetchConfirmedReservations();
  }, []);

  // Filtrer et trier les réservations lorsque les filtres changent
  useEffect(() => {
    if (reservations.length > 0) {
      applyFiltersAndSort();
      calculateLocalStats(reservations);
    }
  }, [filters, reservations]);

  const fetchConfirmedReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer toutes les réservations du directeur
      const response = await bookingService.getDirectorBookings();
      let reservationsData: Reservation[] = [];
      
      if (Array.isArray(response)) {
        reservationsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        reservationsData = response.data;
      } else if (Array.isArray(response?.reservations)) {
        reservationsData = response.reservations;
      }
      
      // Filtrer pour ne garder que les réservations CONFIRMED
      const confirmedReservations = reservationsData.filter(
        (reservation: Reservation) => reservation.status === 'CONFIRMED'
      );
      
      // Enrichir les données avec les détails de l'hôtel (comme dans AdminReservationsPage)
      const enrichedReservations = await Promise.all(
        confirmedReservations.map(async (reservation: Reservation) => {
          try {
            let hotelDetails = null;
            let userDetails = null;
            
            // Récupérer les détails de l'hôtel par nom ou par ID
            if (reservation.hotel_name) {
              try {
                const hotelData = await hotelService.getHotelByName(reservation.hotel_name);
                hotelDetails = Array.isArray(hotelData) ? hotelData[0] : hotelData;
                console
              } catch (error) {
                console.warn(`Impossible de récupérer les détails de l'hôtel: ${reservation.hotel_name}`);
              }
            } else if (reservation.hotel_id) {
              try {
                const hotelData = await hotelService.getHotelById(reservation.hotel_id);
                hotelDetails = hotelData;
              } catch (error) {
                console.warn(`Impossible de récupérer les détails de l'hôtel ID: ${reservation.hotel_id}`);
              }
            }
            if (reservation.user) {
              try {
                const userData = await getUserById(reservation.user);
                userDetails = userData
              } catch (error) {
                console.warn(`Impossible de récupérer les détails de l'utilisateur ID : ${reservation.user}`)
              }
            } 
            return { 
              ...reservation, 
              user_email: userDetails.email,
              user_phone: userDetails.phone_number,
              user_name: userDetails.first_name + ' ' + userDetails.last_name + ' - @' + userDetails.username,
              hotel_details: hotelDetails,
              hotel_image: reservation.hotel_image || hotelDetails?.images?.[0]?.image || '/api/placeholder/400/300'
            };
          } catch (error) {
            console.error('Erreur lors de l\'enrichissement de la réservation:', error);
            return reservation;
          }
        })
      );
      
      setReservations(enrichedReservations);
      
    } catch (err: any) {
      console.error('Erreur lors du chargement des réservations confirmées:', err);
      setError(err.response?.data?.message || err.message || 'Erreur de connexion au serveur');
      toast.error('Impossible de charger les réservations confirmées');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...reservations];

    // Filtre par hôtel
    if (filters.hotel !== 'all') {
      filtered = filtered.filter(r => {
        const hotelId = r.hotel_details?.id || r.hotel_id;
        const hotelName = r.hotel_details?.name || r.hotel_name;
        
        if (hotelId) {
          return hotelId.toString() === filters.hotel;
        }
        return hotelName === filters.hotel;
      });
    }

    // Filtre par date (check_in)
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

    // Filtre pour les arrivées à venir uniquement
    if (filters.upcomingOnly) {
      const today = startOfDay(new Date());
      filtered = filtered.filter(r => {
        try {
          const checkInDate = startOfDay(new Date(r.check_in));
          return checkInDate >= today;
        } catch {
          return false;
        }
      });
    }

    // Filtre par recherche
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(r => {
        const hotelName = r.hotel_details?.name || r.hotel_name || '';
        const hotelCity = r.hotel_details?.city || r.hotel_city || '';
        const guestName = r.guest_name || r.user_name || '';
        const guestEmail = r.guest_email || r.user_email || '';
        const roomNumber = r.room_number || '';
        const roomType = r.room_type || '';
        
        return (
          guestName.toLowerCase().includes(searchTerm) ||
          guestEmail.toLowerCase().includes(searchTerm) ||
          hotelName.toLowerCase().includes(searchTerm) ||
          hotelCity.toLowerCase().includes(searchTerm) ||
          roomNumber.toLowerCase().includes(searchTerm) ||
          roomType.toLowerCase().includes(searchTerm) ||
          r.id.toString().includes(searchTerm)
        );
      });
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

  const calculateLocalStats = (data: ReservationWithDetails[]) => {
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
    
    // Arrivées à venir (à partir d'aujourd'hui)
    const today = startOfDay(new Date());
    const upcoming = data.filter(r => {
      try {
        const checkInDate = startOfDay(new Date(r.check_in));
        return checkInDate >= today;
      } catch {
        return false;
      }
    }).length;
    
    // Arrivées aujourd'hui
    const today_arrivals = data.filter(r => {
      try {
        const checkInDate = startOfDay(new Date(r.check_in));
        return checkInDate.getTime() === today.getTime();
      } catch {
        return false;
      }
    }).length;
    
    // Arrivées demain
    const tomorrow = startOfDay(addDays(today, 1));
    const tomorrow_arrivals = data.filter(r => {
      try {
        const checkInDate = startOfDay(new Date(r.check_in));
        return checkInDate.getTime() === tomorrow.getTime();
      } catch {
        return false;
      }
    }).length;
    
    // Hôtel avec le plus de réservations confirmées
    const hotelCounts = new Map<string, number>();
    data.forEach(r => {
      const hotelName = r.hotel_details?.name || r.hotel_name;
      if (hotelName) {
        const count = hotelCounts.get(hotelName) || 0;
        hotelCounts.set(hotelName, count + 1);
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
      upcoming,
      today_arrivals,
      tomorrow_arrivals,
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
  const handleViewDetails = (reservation: ReservationWithDetails) => {
    navigate(`/director/reservations/${reservation.id}`);
  };

  const handleViewHotel = (hotelId?: number) => {
    if (hotelId) {
      navigate(`/director/hotels/${hotelId}`);
    }
  };

  const handleViewManager = (managerId?: number) => {
    if (managerId) {
      navigate(`/director/users/${managerId}`);
    }
  };

  const handleSendReminder = async (reservation: ReservationWithDetails) => {
    try {
      setSendingReminder(reservation.id);
      
      // Ici vous appelleriez votre service pour envoyer un rappel
      // await bookingService.sendReminder(reservation.id);
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation
      
      const guestName = reservation.guest_name || reservation.user_name || 'le client';
      toast.success(`Rappel envoyé à ${guestName}`);
    } catch (err) {
      console.error('Erreur lors de l\'envoi du rappel:', err);
      toast.error('Erreur lors de l\'envoi du rappel');
    } finally {
      setSendingReminder(null);
    }
  };

  const handleCheckIn = async (reservation: ReservationWithDetails) => {
    try {
      setProcessingCheckIn(reservation.id);
      
      // Mettre à jour le statut de la réservation
      // await bookingService.updateBookingStatus(reservation.id, 'CHECKED_IN');
      
      const guestName = reservation.guest_name || reservation.user_name || 'le client';
      toast.success(`Check-in effectué pour ${guestName}`);
      
      // Recharger les réservations
      await fetchConfirmedReservations();
    } catch (err) {
      console.error('Erreur lors du check-in:', err);
      toast.error('Erreur lors du check-in');
    } finally {
      setProcessingCheckIn(null);
    }
  };

  const handleContactGuest = (reservation: ReservationWithDetails, type: 'email' | 'phone') => {
    const email = reservation.guest_email || reservation.user_email;
    const phone = reservation.guest_phone || reservation.user_phone;
    
    if (type === 'email' && email) {
      window.open(`mailto:${email}`);
    } else if (type === 'phone' && phone) {
      window.open(`tel:${phone}`);
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

  const getDaysUntilArrival = (checkIn: string) => {
    try {
      const today = new Date();
      const arrivalDate = new Date(checkIn);
      const diffTime = arrivalDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  // Obtenir la couleur selon le statut
  const getStatusColor = () => {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const getStatusIcon = () => {
    return <CheckCircle2 className="w-4 h-4" />;
  };

  const getStatusLabel = () => {
    return 'Confirmée';
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

  const getPaymentStatusBadge = (payment?: Payment) => {
    if (!payment) {
      return {
        text: 'Non payé',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        icon: <Clock className="w-3 h-3" />
      };
    }
    
    const statusMap: Record<string, { text: string; color: string; bgColor: string; icon: React.ReactNode }> = {
      PENDING: { 
        text: 'En attente', 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-50',
        icon: <Clock className="w-3 h-3" />
      },
      COMPLETED: { 
        text: 'Payé', 
        color: 'text-green-600', 
        bgColor: 'bg-green-50',
        icon: <CheckCircle className="w-3 h-3" />
      },
      FAILED: { 
        text: 'Échoué', 
        color: 'text-red-600', 
        bgColor: 'bg-red-50',
        icon: <XCircle className="w-3 h-3" />
      }
    };

    return statusMap[payment.status] || { 
      text: payment.status, 
      color: 'text-gray-600', 
      bgColor: 'bg-gray-100', 
      icon: null 
    };
  };

  const getArrivalStatus = (checkIn: string) => {
    const daysUntilArrival = getDaysUntilArrival(checkIn);
    
    if (daysUntilArrival === null) return { label: 'Date invalide', color: 'text-gray-500' };
    if (daysUntilArrival === 0) return { label: 'Arrivée aujourd\'hui', color: 'text-emerald-600' };
    if (daysUntilArrival === 1) return { label: 'Arrivée demain', color: 'text-emerald-500' };
    if (daysUntilArrival < 0) return { label: 'Date passée', color: 'text-amber-600' };
    if (daysUntilArrival <= 3) return { label: `Dans ${daysUntilArrival} jours`, color: 'text-blue-600' };
    return { label: `Dans ${daysUntilArrival} jours`, color: 'text-gray-600' };
  };

  const getArrivalBadgeColor = (checkIn: string) => {
    const daysUntilArrival = getDaysUntilArrival(checkIn);
    
    if (daysUntilArrival === null) return 'bg-gray-100 text-gray-700 border-gray-200';
    if (daysUntilArrival === 0) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (daysUntilArrival === 1) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (daysUntilArrival < 0) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (daysUntilArrival <= 3) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  // Formater le prix
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(num);
  };

  // Exporter les réservations
  const handleExport = async () => {
    try {
      setExporting(true);
      
      const headers = [
        'ID',
        'Hôtel',
        'Ville',
        'Client',
        'Email',
        'Téléphone',
        'Chambre',
        'Type',
        'Check-in',
        'Check-out',
        'Nuits',
        'Jours avant arrivée',
        'Statut',
        'Méthode Paiement',
        'Statut Paiement',
        'Montant',
        'Petit-déjeuner',
        'Demandes spéciales',
        'Date Réservation'
      ];
      
      const rows = filteredReservations.map(r => {
        const daysUntilArrival = getDaysUntilArrival(r.check_in);
        const hotelName = r.hotel_details?.name || r.hotel_name || '-';
        const hotelCity = r.hotel_details?.city || r.hotel_city || '';
        const guestName = r.guest_name || r.user_name || 'Client';
        const guestEmail = r.guest_email || r.user_email || '';
        const guestPhone = r.guest_phone || r.user_phone || '';
        const paymentStatus = getPaymentStatusBadge(r.payment_info);
        
        return [
          r.id,
          `"${hotelName}"`,
          `"${hotelCity}"`,
          `"${guestName}"`,
          `"${guestEmail}"`,
          `"${guestPhone}"`,
          `"${r.room_number || r.room}"`,
          `"${r.room_type || ''}"`,
          r.check_in,
          r.check_out,
          calculateNights(r.check_in, r.check_out),
          daysUntilArrival !== null ? daysUntilArrival : 'N/A',
          getStatusLabel(),
          r.payment_info?.payment_method?.replace('_', ' ') || 'N/A',
          paymentStatus.text,
          `${parseFloat(r.total_price || '0').toFixed(2)} €`,
          r.breakfast_included ? 'Oui' : 'Non',
          `"${(r.special_requests || '').replace(/"/g, '""')}"`,
          r.created_at
        ];
      });
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `reservations_confirmees_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
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
      sortBy: 'check_in',
      sortOrder: 'asc',
      upcomingOnly: true
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
        <p className="text-gray-600 text-lg">Chargement des réservations confirmées...</p>
        <p className="text-gray-500 text-sm mt-2">Récupération des détails des séjours à venir</p>
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
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CalendarCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Réservations Confirmées
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Séjours à venir dans vos {hotels.length} hôtel{hotels.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              {/* Statistiques principales */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total confirmées</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <BadgeCheck className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">À venir</p>
                      <p className="text-2xl font-bold">{stats.upcoming}</p>
                    </div>
                    <CalendarDays className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Aujourd'hui</p>
                      <p className="text-2xl font-bold">{stats.today_arrivals}</p>
                    </div>
                    <Bell className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Demain</p>
                      <p className="text-2xl font-bold">{stats.tomorrow_arrivals}</p>
                    </div>
                    <Clock4 className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl p-4 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Revenu total</p>
                      <p className="text-2xl font-bold">{stats.total_revenue.toFixed(0)} €</p>
                    </div>
                    <TrendingUp className="w-8 h-8 opacity-80" />
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
                onClick={fetchConfirmedReservations}
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
                    placeholder="Client, chambre, hôtel..."
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
                  <option value="check_in_asc">Arrivée (proche)</option>
                  <option value="check_in_desc">Arrivée (lointaine)</option>
                  <option value="check_out_asc">Départ (proche)</option>
                  <option value="check_out_desc">Départ (lointain)</option>
                  <option value="total_price_desc">Prix (haut)</option>
                  <option value="total_price_asc">Prix (bas)</option>
                  <option value="created_at_desc">Création (récente)</option>
                  <option value="created_at_asc">Création (ancienne)</option>
                </select>
              </div>
              
              {/* Arrivées à venir uniquement */}
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={filters.upcomingOnly}
                      onChange={(e) => handleFilterChange('upcomingOnly', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${filters.upcomingOnly ? 'bg-blue-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${filters.upcomingOnly ? 'translate-x-4' : ''}`} />
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Arrivées à venir uniquement</span>
                    <p className="text-xs text-gray-500">Masquer les dates passées</p>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Date range */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'arrivée (début)
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
                  Date d'arrivée (fin)
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
                  Séjours confirmés
                </h2>
                <p className="text-gray-600 text-sm">
                  {filters.hotel !== 'all' || filters.search || filters.dateRange.start || filters.dateRange.end
                    ? 'Résultats filtrés'
                    : 'Tous les séjours confirmés'}
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
                onClick={fetchConfirmedReservations}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                <RefreshCw className="w-5 h-5 inline mr-2" />
                Réessayer
              </button>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <CalendarCheck className="w-16 h-16 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Aucune réservation confirmée
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                {filters.hotel !== 'all' || filters.search || filters.dateRange.start || filters.dateRange.end
                  ? 'Aucune réservation confirmée ne correspond à vos critères.'
                  : 'Toutes vos réservations sont encore en attente ou ont déjà été traitées.'}
              </p>
              {filters.hotel !== 'all' || filters.search || filters.dateRange.start || filters.dateRange.end ? (
                <button
                  onClick={clearFilters}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                >
                  Afficher toutes les réservations confirmées
                </button>
              ) : (
                <button
                  onClick={() => navigate('/director/reservations/pending')}
                  className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-medium"
                >
                  Voir les réservations en attente
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
                  const daysUntilArrival = getDaysUntilArrival(reservation.check_in);
                  const arrivalStatus = getArrivalStatus(reservation.check_in);
                  const isTodayArrival = daysUntilArrival === 0;
                  const isTomorrowArrival = daysUntilArrival === 1;
                  const isUrgentArrival = daysUntilArrival !== null && daysUntilArrival <= 3 && daysUntilArrival >= 0;
                  
                  const hotel = reservation.hotel_details;
                  const hotelName = hotel?.name || reservation.hotel_name || 'Hôtel non spécifié';
                  const hotelCity = hotel?.city || reservation.hotel_city || '';
                  const hotelCountry = hotel?.country || reservation.hotel_country || '';
                  const hotelAddress = hotel?.address || reservation.hotel_address || '';
                  const hotelPhone = hotel?.phone || reservation.hotel_phone || '';
                  const hotelEmail = hotel?.email || reservation.hotel_email || '';
                  const hotelImage = reservation.hotel_image || hotel?.images?.[0]?.image || '';
                  
                  const guestName = reservation.guest_name || reservation.user_name || `Client #${reservation.user}`;
                  const guestEmail = reservation.guest_email || reservation.user_email;
                  const guestPhone = reservation.guest_phone || reservation.user_phone;
                  
                  const paymentStatus = getPaymentStatusBadge(reservation.payment_info);
                  
                  return (
                    <div
                      key={reservation.id}
                      className={`p-6 transition-all duration-300 ${
                        isExpanded 
                          ? 'bg-gradient-to-r from-blue-50/50 to-cyan-50/50' 
                          : isTodayArrival
                            ? 'bg-gradient-to-r from-emerald-50/50 to-green-50/50'
                            : isTomorrowArrival
                              ? 'bg-gradient-to-r from-emerald-50/30 to-green-50/30'
                              : isUrgentArrival
                                ? 'bg-gradient-to-r from-blue-50/30 to-cyan-50/30'
                                : 'hover:bg-gray-50/50'
                      }`}
                    >
                      {/* Badge d'urgence pour arrivées imminentes */}
                      {isUrgentArrival && (
                        <div className={`mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${getArrivalBadgeColor(reservation.check_in)}`}>
                          {isTodayArrival ? (
                            <>
                              <Bell className="w-3.5 h-3.5" />
                              <span className="text-sm font-medium">ARRIVÉE AUJOURD'HUI</span>
                            </>
                          ) : isTomorrowArrival ? (
                            <>
                              <Clock4 className="w-3.5 h-3.5" />
                              <span className="text-sm font-medium">ARRIVÉE DEMAIN</span>
                            </>
                          ) : (
                            <>
                              <Calendar className="w-3.5 h-3.5" />
                              <span className="text-sm font-medium">ARRIVÉE DANS {daysUntilArrival} JOURS</span>
                            </>
                          )}
                        </div>
                      )}
                      
                      {/* Ligne principale */}
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
                        {/* Informations hôtel */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            {hotelImage ? (
                              <img
                                src={hotelImage}
                                alt={hotelName}
                                className="w-16 h-16 rounded-xl object-cover shadow-sm"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center shadow-sm">
                                <Building className="w-8 h-8 text-blue-600" />
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <button
                                  onClick={() => handleViewHotel(hotel?.id || reservation.hotel_id)}
                                  className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors text-left"
                                >
                                  {hotelName}
                                </button>
                                <div className="flex flex-wrap gap-2">
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor()}`}>
                                    {getStatusIcon()}
                                    {getStatusLabel()}
                                  </span>
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${getArrivalBadgeColor(reservation.check_in)}`}>
                                    <Calendar className="w-3.5 h-3.5" />
                                    {arrivalStatus.label}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                {hotelCity && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{hotelCity}{hotelCountry ? `, ${hotelCountry}` : ''}</span>
                                  </div>
                                )}
                                
                                {reservation.hotel_rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="font-medium">{reservation.hotel_rating.toFixed(1)}</span>
                                  </div>
                                )}
                                
                                {hotelPhone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    <a href={`tel:${hotelPhone}`} className="hover:text-blue-600">
                                      {hotelPhone}
                                    </a>
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
                          
                          {isTodayArrival && (
                            <button
                              onClick={() => handleCheckIn(reservation)}
                              disabled={processingCheckIn === reservation.id}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                            >
                              {processingCheckIn === reservation.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              {processingCheckIn === reservation.id ? 'Check-in...' : 'Check-in'}
                            </button>
                          )}
                          
                          {daysUntilArrival !== null && daysUntilArrival > 0 && daysUntilArrival <= 7 && (
                            <button
                              onClick={() => handleSendReminder(reservation)}
                              disabled={sendingReminder === reservation.id}
                              className="px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                              <Send className={`w-4 h-4 ${sendingReminder === reservation.id ? 'animate-pulse' : ''}`} />
                              {sendingReminder === reservation.id ? 'Envoi...' : 'Rappel'}
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
                                {guestName}
                              </p>
                            </div>
                            {guestEmail && (
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Email</p>
                                <div className="flex items-center gap-2">
                                  <a 
                                    href={`mailto:${guestEmail}`}
                                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                  >
                                    {guestEmail}
                                  </a>
                                  <button
                                    onClick={() => copyToClipboard(guestEmail!)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                            {guestPhone && (
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Téléphone</p>
                                <div className="flex items-center gap-2">
                                  <a 
                                    href={`tel:${guestPhone}`}
                                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                  >
                                    {guestPhone}
                                  </a>
                                  <button
                                    onClick={() => copyToClipboard(guestPhone!)}
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
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900">{formatDate(reservation.check_in)}</p>
                                  {isTodayArrival && (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                      AUJOURD'HUI
                                    </span>
                                  )}
                                </div>
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
                                {reservation.breakfast_included && (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                    PETIT-DÉJ
                                  </span>
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
                                {formatCurrency(reservation.total_price || '0')}
                              </p>
                              <p className="text-sm text-gray-600">
                                {nights > 0 ? formatCurrency(parseFloat(reservation.total_price || '0') / nights) + '/nuit' : ''}
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
                                  <span className="text-gray-600">Statut:</span>
                                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${paymentStatus.bgColor}`}>
                                    {paymentStatus.icon}
                                    <span className={`font-medium ${paymentStatus.color}`}>
                                      {paymentStatus.text}
                                    </span>
                                  </div>
                                </div>
                                
                                {reservation.payment_info.payment_date && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Date paiement:</span>
                                    <span className="font-medium">
                                      {formatDate(reservation.payment_info.payment_date)}
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
                                {hotelAddress && (
                                  <div>
                                    <p className="text-sm text-gray-600 mb-1">Adresse complète</p>
                                    <p className="font-medium">{hotelAddress}</p>
                                    <p className="text-sm text-gray-600">{hotelCity}, {hotelCountry}</p>
                                  </div>
                                )}
                                
                                {hotelEmail && (
                                  <div>
                                    <p className="text-sm text-gray-600 mb-1">Email de contact</p>
                                    <a 
                                      href={`mailto:${hotelEmail}`}
                                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                      {hotelEmail}
                                    </a>
                                  </div>
                                )}
                                
                                {hotel?.website && (
                                  <div>
                                    <p className="text-sm text-gray-600 mb-1">Site web</p>
                                    <a 
                                      href={hotel.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                    >
                                      {hotel.website}
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                )}
                                
                                {hotel?.manager && (
                                  <div>
                                    <p className="text-sm text-gray-600 mb-1">Manager</p>
                                    <button
                                      onClick={() => handleViewManager(hotel.manager)}
                                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                    >
                                      <User className="w-3 h-3" />
                                      Voir le manager
                                    </button>
                                  </div>
                                )}
                                
                                {reservation.hotel_amenities && reservation.hotel_amenities.length > 0 && (
                                  <div>
                                    <p className="text-sm text-gray-600 mb-2">Équipements inclus</p>
                                    <div className="flex flex-wrap gap-2">
                                      {reservation.hotel_amenities.slice(0, 8).map((amenity, index) => (
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
                            
                            {/* Actions et demandes spéciales */}
                            <div className="space-y-6">
                              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-xl">
                                <h6 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                  <Zap className="w-5 h-5" />
                                  Actions rapides
                                </h6>
                                <div className="grid grid-cols-2 gap-3">
                                  <button
                                    onClick={() => handleViewDetails(reservation)}
                                    className="p-3 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-all flex flex-col items-center justify-center"
                                  >
                                    <Eye className="w-5 h-5 mb-2" />
                                    <span className="text-sm font-medium">Détails</span>
                                  </button>
                                  
                                  {isTodayArrival && (
                                    <button
                                      onClick={() => handleCheckIn(reservation)}
                                      disabled={processingCheckIn === reservation.id}
                                      className="p-3 bg-white border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-all flex flex-col items-center justify-center disabled:opacity-50"
                                    >
                                      {processingCheckIn === reservation.id ? (
                                        <Loader2 className="w-5 h-5 mb-2 animate-spin" />
                                      ) : (
                                        <CheckCircle className="w-5 h-5 mb-2" />
                                      )}
                                      <span className="text-sm font-medium">Check-in</span>
                                    </button>
                                  )}
                                  
                                  {guestEmail && (
                                    <button
                                      onClick={() => handleContactGuest(reservation, 'email')}
                                      className="p-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex flex-col items-center justify-center"
                                    >
                                      <Mail className="w-5 h-5 mb-2" />
                                      <span className="text-sm font-medium">Email</span>
                                    </button>
                                  )}
                                  
                                  {guestPhone && (
                                    <button
                                      onClick={() => handleContactGuest(reservation, 'phone')}
                                      className="p-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex flex-col items-center justify-center"
                                    >
                                      <PhoneCall className="w-5 h-5 mb-2" />
                                      <span className="text-sm font-medium">Appeler</span>
                                    </button>
                                  )}
                                  
                                  {daysUntilArrival !== null && daysUntilArrival > 0 && daysUntilArrival <= 7 && (
                                    <button
                                      onClick={() => handleSendReminder(reservation)}
                                      disabled={sendingReminder === reservation.id}
                                      className="p-3 bg-white border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-50 transition-all flex flex-col items-center justify-center disabled:opacity-50"
                                    >
                                      <Send className={`w-5 h-5 mb-2 ${sendingReminder === reservation.id ? 'animate-pulse' : ''}`} />
                                      <span className="text-sm font-medium">Rappel</span>
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => copyToClipboard(`Réservation #${reservation.id} - ${hotelName} - ${formatDate(reservation.check_in)} au ${formatDate(reservation.check_out)}`)}
                                    className="p-3 bg-white border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-all flex flex-col items-center justify-center"
                                  >
                                    <Copy className="w-5 h-5 mb-2" />
                                    <span className="text-sm font-medium">Copier info</span>
                                  </button>
                                </div>
                              </div>
                              
                              {reservation.special_requests && (
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl">
                                  <h6 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" />
                                    Demandes spéciales
                                  </h6>
                                  <p className="text-amber-800 text-sm whitespace-pre-wrap">
                                    {reservation.special_requests}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {reservation.notes && (
                            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                                <h6 className="font-semibold text-amber-800">Notes internes</h6>
                              </div>
                              <p className="text-amber-700 whitespace-pre-wrap">{reservation.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Pied de carte */}
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>ID Réservation: <span className="font-mono font-bold">#{reservation.id}</span></span>
                          {reservation.breakfast_included && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              Petit-déjeuner inclus
                            </span>
                          )}
                          {reservation.payment_info?.invoice && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                              Facture #{reservation.payment_info.invoice.invoice_number}
                            </span>
                          )}
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
                      sur <span className="font-medium">{filteredReservations.length}</span> séjour{filteredReservations.length !== 1 ? 's' : ''} confirmé{filteredReservations.length !== 1 ? 's' : ''}
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

        {/* Message de retour - À décommenter si nécessaire */}
        {/* <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/director/reservations/active')}
            className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-medium inline-flex items-center gap-2"
          >
            <ArrowUpDown className="w-4 h-4" />
            Voir les réservations en cours (check-in)
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default ConfirmedReservations;