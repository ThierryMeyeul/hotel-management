// AdminReservationsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Calendar,
  Eye,
  Trash2,
  Download,
  Printer,
  Mail,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Building,
  MapPin,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  ArrowUpDown,
  Plus,
  RefreshCw,
  FileText,
  User,
  Phone,
  Globe,
  Star,
  Home,
  Users,
  Bed,
  CalendarDays,
  CreditCard as CreditCardIcon,
  FileText as FileTextIcon,
  AlertCircle,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import Loader from '../../components/Loader';
import { bookingService } from '../../services/booking.service';
import { hotelService } from '../../services/hotel.service';
import type { Hotel } from '../../types/hotel';
import type { Reservation, Payment, Invoice } from '../../types/booking';
import { useAuth } from '../../context/AuthContext';
import type { PaymentData } from '../../types/booking';

interface HotelImage {
  id: number;
  image: string;
  caption: string;
  is_cover: boolean;
}

// interface HotelDetails {
//   id: number;
//   name: string;
//   address: string;
//   description: string;
//   city: string;
//   country: string;
//   email: string;
//   phone: string;
//   website: string;
//   latitude: number;
//   longitude: number;
//   manager: number;
//   is_active: boolean;
//   images: HotelImage[];
//   rooms: any[];
//   created_at: string;
//   updated_at: string;
// }

interface ReservationWithDetails extends Reservation {
  hotel_details?: Hotel;
  hotel_name?: string;
  hotel_address?: string;
  hotel_city?: string;
  hotel_country?: string;
  hotel_email?: string;
  hotel_phone?: string;
  hotel_website?: string;
  hotel_image?: string;
  room_type?: string;
  room_number?: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  payment?: Payment & {
    invoice?: Invoice;
  };
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const AdminReservationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // États principaux
  const [loading, setLoading] = useState(true);
  const [loadingPayment, setLoadingPayment] = useState<number | null>(null);
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<ReservationWithDetails[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<ReservationWithDetails | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  
  // États de filtrage
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedReservations, setSelectedReservations] = useState<number[]>([]);
  
  // États de pagination et tri
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  // États pour le formulaire de paiement
  const [paymentForm, setPaymentForm] = useState({
    payment_method: 'CREDIT_CARD',
    card_number: '',
    card_holder: '',
    expiry_date: '',
    cvv: '',
    notes: ''
  });
  
  // États des statistiques
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    revenue: 0,
    total_paid: 0,
    total_pending: 0,
    total_failed: 0
  });
  
  // Méthodes de paiement disponibles
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'CREDIT_CARD',
      name: 'Carte de crédit',
      icon: <CreditCardIcon className="w-5 h-5" />,
      description: 'Visa, Mastercard, American Express'
    },
    {
      id: 'PAYPAL',
      name: 'PayPal',
      icon: <CreditCardIcon className="w-5 h-5" />,
      description: 'Paiement sécurisé via PayPal'
    },
    {
      id: 'BANK_TRANSFER',
      name: 'Virement bancaire',
      icon: <CreditCardIcon className="w-5 h-5" />,
      description: 'Transfert direct vers notre compte'
    },
    {
      id: 'MOBILE_MONEY',
      name: 'Mobile Money',
      icon: <CreditCardIcon className="w-5 h-5" />,
      description: 'Orange Money, MTN Mobile Money'
    }
  ];

  // Déterminer les routes selon le rôle
  const getHotelsRoute = () => {
    if (!user) return '/login';
    
    const userRole = user.role.toLowerCase();
    
    switch(userRole) {
      case 'admin':
        return '/admin/hotels';
      case 'director':
        return '/director/hotels';
      case 'manager':
        return '/manager/hotels';
      case 'client':
        return '/client/hotels';
      default:
        return '/hotels';
    }
  };

  useEffect(() => {
    fetchMyReservations();
  }, []);

  useEffect(() => {
    filterReservations();
    calculateStats();
  }, [reservations, searchTerm, statusFilter, paymentFilter, dateRange]);

  // Fonctions principales
  const fetchMyReservations = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getMyReservations();
      
      let reservationsData: ReservationWithDetails[] = [];
      
      if (Array.isArray(response)) {
        reservationsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        reservationsData = response.data;
      } else if (Array.isArray(response?.reservations)) {
        reservationsData = response.reservations;
      }
      
      // Enrichir les données avec les détails de l'hôtel
      const enrichedReservations = await Promise.all(
        reservationsData.map(async (reservation) => {
          try {
            // Si on a déjà les informations de l'hôtel dans la réservation
            if (reservation.hotel_name) {
              const hotelDetails = await hotelService.getHotelByName(reservation.hotel_name);
              // const hotelData: HotelDetails = {
              //   id: 0,
              //   name: reservation.hotel_name || 'Hôtel inconnu',
              //   address: reservation.hotel_address || 'Adresse non spécifiée',
              //   description: '',
              //   city: reservation.hotel_city || '',
              //   country: reservation.hotel_country || '',
              //   email: reservation.hotel_email || '',
              //   phone: reservation.hotel_phone || '',
              //   website: reservation.hotel_website || '',
              //   latitude: 0,
              //   longitude: 0,
              //   manager: 0,
              //   is_active: true,
              //   images: reservation.hotel_image ? [{
              //     id: 0,
              //     image: reservation.hotel_image,
              //     caption: reservation.hotel_name || '',
              //     is_cover: true
              //   }] : [],
              //   rooms: [],
              //   created_at: '',
              //   updated_at: ''
              // };
              
              return { 
                ...reservation, 
                hotel_details: hotelDetails[0],
                hotel_image: reservation.hotel_image || '/api/placeholder/400/300'
              };
            }
            
            return reservation;
          } catch (error) {
            console.error('Error processing reservation:', error);
            return reservation;
          }
        })
      );
      
      setReservations(enrichedReservations);
    } catch (error: any) {
      console.error('Erreur lors du chargement des réservations:', error);
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
        res.hotel_details?.name.toLowerCase().includes(term) ||
        res.hotel_city?.toLowerCase().includes(term) ||
        res.room_type?.toLowerCase().includes(term) ||
        res.user_name?.toLowerCase().includes(term) ||
        res.user_email?.toLowerCase().includes(term) ||
        res.id.toString().includes(term)
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(res => res.status === statusFilter);
    }

    // Filtre par statut de paiement
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(res => {
        if (!res.payment) return paymentFilter === 'none';
        return res.payment.status === paymentFilter;
      });
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
          aValue = parseFloat(aValue || '0');
          bValue = parseFloat(bValue || '0');
        } else if (sortConfig.key === 'check_in' || sortConfig.key === 'created_at') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        } else if (sortConfig.key === 'hotel_name') {
          aValue = a.hotel_name?.toLowerCase() || a.hotel_details?.name.toLowerCase() || '';
          bValue = b.hotel_name?.toLowerCase() || b.hotel_details?.name.toLowerCase() || '';
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
      .reduce((sum, res) => sum + parseFloat(res.total_price || '0'), 0);
    
    const total_paid = reservations
      .filter(r => r.payment?.status === 'COMPLETED')
      .reduce((sum, res) => sum + parseFloat(res.payment?.amount || '0'), 0);
    
    const total_pending = reservations
      .filter(r => r.payment?.status === 'PENDING')
      .reduce((sum, res) => sum + parseFloat(res.payment?.amount || '0'), 0);
    
    const total_failed = reservations
      .filter(r => r.payment?.status === 'FAILED')
      .reduce((sum, res) => sum + parseFloat(res.payment?.amount || '0'), 0);

    setStats({ 
      total, 
      pending, 
      confirmed, 
      cancelled, 
      completed, 
      revenue,
      total_paid,
      total_pending,
      total_failed
    });
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
      await fetchMyReservations();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleProcessPayment = async (reservationId: number) => {
    setLoadingPayment(reservationId);
    try {
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation) throw new Error('Réservation non trouvée');
      
      setSelectedReservation(reservation);
      setShowPaymentModal(true);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Erreur lors du traitement du paiement');
    } finally {
      setLoadingPayment(null);
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedReservation) return;
    
    try {
      const paymentData: PaymentData = {
        reservation: selectedReservation.id,
        amount: parseFloat(selectedReservation.total_price || '0'),
        payment_method: 'MOBILE_MONEY',
      };
      
      const payment = await bookingService.createPayment(paymentData);
      
      // Générer la facture automatiquement
      const invoice = await bookingService.generateInvoice(payment.id);
      
      // Mettre à jour la liste
      await fetchMyReservations();
      
      // Fermer le modal et réinitialiser le formulaire
      setShowPaymentModal(false);
      setPaymentForm({
        payment_method: 'CREDIT_CARD',
        card_number: '',
        card_holder: '',
        expiry_date: '',
        cvv: '',
        notes: ''
      });
      
      // Afficher la facture générée
      setCurrentInvoice(invoice);
      setShowInvoiceModal(true);
      
      alert('Paiement traité avec succès!');
    } catch (error) {
      console.error('Error submitting payment:', error);
      alert('Erreur lors du traitement du paiement');
    }
  };

  const handleViewInvoice = async (paymentId: number) => {
    try {
      const invoice = await bookingService.getInvoice(paymentId);
      setCurrentInvoice(invoice);
      setShowInvoiceModal(true);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      alert('Erreur lors du chargement de la facture');
    }
  };

  const handleDownloadInvoice = async (paymentId: number, invoiceNumber: string) => {
    // try {
    //   const pdfData = await bookingService.downloadInvoicePDF(paymentId);
      
    //   // Créer un blob et télécharger
    //   const blob = new Blob([pdfData], { type: 'application/pdf' });
    //   const url = URL.createObjectURL(blob);
    //   const a = document.createElement('a');
    //   a.href = url;
    //   a.download = `facture-${invoiceNumber}.pdf`;
    //   document.body.appendChild(a);
    //   a.click();
    //   document.body.removeChild(a);
    //   URL.revokeObjectURL(url);
    // } catch (error) {
    //   console.error('Error downloading invoice:', error);
    //   alert('Erreur lors du téléchargement de la facture');
    // }
  };

  const handleCancelReservations = async () => {
    if (!selectedReservations.length || !window.confirm('Êtes-vous sûr de vouloir annuler ces réservations ?')) {
      return;
    }

    try {
      await Promise.all(
        selectedReservations.map(id => bookingService.cancelReservation(id))
      );
      await fetchMyReservations();
      setSelectedReservations([]);
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      alert('Erreur lors de l\'annulation des réservations');
    }
  };

  const handleExport = () => {
    const dataToExport = filteredReservations.map(res => ({
      ID: res.id,
      Hôtel: res.hotel_name || res.hotel_details?.name,
      Ville: res.hotel_city || res.hotel_details?.city,
      Pays: res.hotel_country || res.hotel_details?.country,
      Type_Chambre: res.room_type || 'N/A',
      Numéro_Chambre: res.room_number || 'N/A',
      Date_Arrivée: new Date(res.check_in).toLocaleDateString('fr-FR'),
      Date_Départ: new Date(res.check_out).toLocaleDateString('fr-FR'),
      Nuits: calculateNights(res.check_in, res.check_out),
      Statut_Réservation: getStatusText(res.status).text,
      Client: res.user_name || 'N/A',
      Email_Client: res.user_email || 'N/A',
      Méthode_Paiement: res.payment?.payment_method?.replace('_', ' ') || 'N/A',
      Statut_Paiement: res.payment?.status || 'N/A',
      Montant_Paiement: res.payment?.amount || '0',
      Numéro_Facture: res.payment?.invoice?.invoice_number || 'N/A',
      Prix_Total: `${parseFloat(res.total_price || '0').toFixed(2)} €`,
      Date_Réservation: new Date(res.created_at).toLocaleDateString('fr-FR')
    }));

    const csvContent = [
      Object.keys(dataToExport[0] || {}).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations_${new Date().toISOString().split('T')[0]}.csv`;
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
    if (!payment) return { text: 'Non payé', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: <Clock className="w-3 h-3" /> };
    
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

    return statusMap[payment.status] || { text: payment.status, color: 'text-gray-600', bgColor: 'bg-gray-100', icon: null };
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

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(num);
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
      {/* Modal de paiement */}
      {showPaymentModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Traiter le paiement</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Détails de la réservation */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Réservation #</p>
                    <p className="font-bold">#{selectedReservation.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Hôtel</p>
                    <p className="font-bold">{selectedReservation.hotel_name || selectedReservation.hotel_details?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Montant dû</p>
                    <p className="font-bold text-xl text-green-600">
                      {formatCurrency(selectedReservation.total_price || '0')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="font-bold">{user?.username}</p>
                  </div>
                </div>
              </div>

              {/* Sélection de la méthode de paiement */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Méthode de paiement</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentForm({...paymentForm, payment_method: method.id})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentForm.payment_method === method.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`p-2 rounded-full ${
                          paymentForm.payment_method === method.id ? 'bg-indigo-100' : 'bg-gray-100'
                        }`}>
                          {method.icon}
                        </div>
                        <span className="text-sm font-medium">{method.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulaire de carte de crédit */}
              {paymentForm.payment_method === 'CREDIT_CARD' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de carte
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={paymentForm.card_number}
                      onChange={(e) => setPaymentForm({...paymentForm, card_number: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titulaire
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={paymentForm.card_holder}
                        onChange={(e) => setPaymentForm({...paymentForm, card_holder: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date d'expiration
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={paymentForm.expiry_date}
                        onChange={(e) => setPaymentForm({...paymentForm, expiry_date: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      value={paymentForm.cvv}
                      onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                      className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  placeholder="Ajoutez des notes ou des références pour ce paiement..."
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-24"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitPayment}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors"
                >
                  Traiter le paiement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de facture */}
      {showInvoiceModal && currentInvoice && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* En-tête de la facture */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">FACTURE</h2>
                  <p className="text-gray-600">Numéro: {currentInvoice.invoice_number}</p>
                  <p className="text-gray-600">
                    Date: {new Date(currentInvoice.issued_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                    HS
                  </div>
                  <p className="text-sm text-gray-600 mt-2">HotelSphere Pro</p>
                </div>
              </div>

              {/* Informations client et hôtel */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Facturé à</h3>
                  <p className="font-medium">{user?.username}</p>
                  <p>{user?.email}</p>
                  <p>{selectedReservation.user_phone || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Hôtel</h3>
                  <p className="font-medium">{selectedReservation.hotel_name || selectedReservation.hotel_details?.name}</p>
                  <p>{selectedReservation.hotel_address || selectedReservation.hotel_details?.address}</p>
                  <p>{selectedReservation.hotel_phone || selectedReservation.hotel_details?.phone}</p>
                  <p>{selectedReservation.hotel_email || selectedReservation.hotel_details?.email}</p>
                </div>
              </div>

              {/* Détails de la réservation */}
              <div className="bg-blue-50 p-4 rounded-lg mb-8">
                <h3 className="font-bold text-gray-900 mb-4">Détails du séjour</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Arrivée</p>
                    <p className="font-medium">{formatDate(selectedReservation.check_in)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Départ</p>
                    <p className="font-medium">{formatDate(selectedReservation.check_out)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nuits</p>
                    <p className="font-medium">
                      {calculateNights(selectedReservation.check_in, selectedReservation.check_out)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Chambre</p>
                    <p className="font-medium">{selectedReservation.room_type || 'Standard'}</p>
                  </div>
                </div>
              </div>

              {/* Tableau des articles */}
              <div className="mb-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-3 px-4 text-left font-semibold text-gray-700">Description</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700">Quantité</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700">Prix unitaire</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">Séjour {selectedReservation.room_type || 'Standard'}</p>
                          <p className="text-sm text-gray-600">
                            {selectedReservation.hotel_name || selectedReservation.hotel_details?.name}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {calculateNights(selectedReservation.check_in, selectedReservation.check_out)} nuits
                      </td>
                      <td className="py-3 px-4">
                        {formatCurrency(
                          parseFloat(selectedReservation.total_price || '0') / 
                          calculateNights(selectedReservation.check_in, selectedReservation.check_out)
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {formatCurrency(selectedReservation.total_price || '0')}
                      </td>
                    </tr>
                    
                    {/* Total */}
                    <tr className="bg-gray-50">
                      <td className="py-4 px-4" colSpan={3}>
                        <p className="font-bold text-lg">Total</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-xl text-green-600">
                          {formatCurrency(selectedReservation.total_price || '0')}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              <div className="text-sm text-gray-600 mb-8">
                <p className="mb-2">• Paiement dû dans les 30 jours suivant la réception</p>
                <p>• Pour toute question, contactez-nous à {selectedReservation.hotel_email || selectedReservation.hotel_details?.email}</p>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDownloadInvoice(currentInvoice.payment, currentInvoice.invoice_number)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger PDF
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Printer className="w-4 h-4" />
                    Imprimer
                  </button>
                </div>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes réservations</h1>
              <p className="text-gray-600">
                {reservations.length} réservation{reservations.length > 1 ? 's' : ''} personnelle{reservations.length > 1 ? 's' : ''}
              </p>
              {user && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    Connecté en tant que: {user.role}
                  </div>
                  <div className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                    ID: {user.id}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exporter CSV
              </button>
              
              <button
                onClick={fetchMyReservations}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
              
              <button
                onClick={() => navigate(getHotelsRoute())}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-lg hover:from-indigo-700 hover:to-pink-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nouvelle réservation
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-10 gap-4 mb-6">
            <div className="md:col-span-2 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
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
            
            <div className="md:col-span-2 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
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
            
            <div className="md:col-span-2 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
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
            
            <div className="md:col-span-2 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
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
            
            <div className="md:col-span-2 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Chiffre d'aff.</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.revenue.toFixed(2)} €</p>
                </div>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par hôtel, ville, client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtre statut réservation */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="CONFIRMED">Confirmée</option>
                <option value="COMPLETED">Terminée</option>
                <option value="CANCELLED">Annulée</option>
              </select>
            </div>

            {/* Filtre statut paiement */}
            <div>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tous les paiements</option>
                <option value="none">Non payé</option>
                <option value="PENDING">Paiement en attente</option>
                <option value="COMPLETED">Paiement complet</option>
                <option value="FAILED">Paiement échoué</option>
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
            {(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || dateRange.start || dateRange.end) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPaymentFilter('all');
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
                    Montant total: {formatCurrency(
                      selectedReservations.reduce((sum, id) => {
                        const reservation = reservations.find(r => r.id === id);
                        return sum + parseFloat(reservation?.total_price || '0');
                      }, 0)
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {selectedReservations.every(id => {
                  const reservation = reservations.find(r => r.id === id);
                  return !reservation?.payment || reservation.payment.status !== 'COMPLETED';
                }) && (
                  <button
                    onClick={() => {
                      // Traiter les paiements en masse
                      alert('Fonctionnalité de paiement en masse à implémenter');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    Traiter les paiements
                  </button>
                )}
                
                {selectedReservations.every(id => {
                  const reservation = reservations.find(r => r.id === id);
                  return reservation?.status === 'PENDING' || reservation?.status === 'CONFIRMED';
                }) && (
                  <button
                    onClick={handleCancelReservations}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Annuler
                  </button>
                )}
                
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition-colors"
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
                    Client
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
                          {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || dateRange.start || dateRange.end
                            ? 'Aucune réservation ne correspond à vos filtres'
                            : 'Réservez votre premier séjour !'}
                        </p>
                        <button
                          onClick={() => navigate(getHotelsRoute())}
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
                    const hotel = reservation.hotel_details;
                    
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
                          <div className="text-xs text-gray-500">
                            {formatDate(reservation.created_at)}
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {/* {hotel?.images?.[0]?.image ? (
                              <img 
                                src={hotel.images[0].image} 
                                alt={hotel.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-pink-50 rounded-lg flex items-center justify-center">
                                <Building className="w-6 h-6 text-indigo-600" />
                              </div>
                            )} */}
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 line-clamp-1">
                                {hotel?.name || reservation.hotel_name}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <MapPin className="w-3 h-3" />
                                <span className="line-clamp-1">{hotel?.city || reservation.hotel_city}</span>
                              </div>
                              {hotel?.phone && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{hotel.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{user?.username}</div>
                            <div className="text-sm text-gray-600">{user?.email}</div>
                            {reservation.user_phone && (
                              <div className="text-xs text-gray-500">{reservation.user_phone}</div>
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
                                {reservation.payment?.payment_method?.replace('_', ' ') || 'Non payé'}
                              </span>
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${paymentStatus.bgColor} max-w-fit mb-1`}>
                              {paymentStatus.icon}
                              <span className={`font-medium ${paymentStatus.color}`}>
                                {paymentStatus.text}
                              </span>
                            </div>
                            {reservation.payment?.invoice && (
                              <button
                                onClick={() => handleViewInvoice(reservation.payment!.id)}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                              >
                                <FileTextIcon className="w-3 h-3" />
                                Facture #{reservation.payment.invoice.invoice_number}
                              </button>
                            )}
                            {!reservation.payment && (
                              <button
                                onClick={() => handleProcessPayment(reservation.id)}
                                disabled={loadingPayment === reservation.id}
                                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                              >
                                {loadingPayment === reservation.id ? 'Traitement...' : 'Payer'}
                              </button>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900 text-lg">
                            {formatCurrency(reservation.total_price || '0')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {nights > 0 ? formatCurrency(parseFloat(reservation.total_price || '0') / nights) + '/nuit' : ''}
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
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => navigate(`/admin/reservations/${reservation.id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Voir détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                              <button
                                onClick={() => handleStatusChange(reservation.id, 'CANCELLED')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Annuler"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            
                            {!reservation.payment && (
                              <button
                                onClick={() => handleProcessPayment(reservation.id)}
                                disabled={loadingPayment === reservation.id}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Traiter paiement"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}
                            
                            {/* {reservation.payment?.invoice && (
                              <button
                                onClick={() => handleDownloadInvoice(reservation.payment!.id, reservation.payment.invoice.invoice_number)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Télécharger facture"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )} */}
                            
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