// AdminReservationDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  FileText,
  Download,
  Printer,
  Mail,
  ArrowLeft,
  Calendar,
  Building,
  User,
  Phone,
  MapPin,
  Globe,
  Bed,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Send,
  Eye,
  AlertCircle,
  Home,
  Shield,
  PhoneCall,
  MessageSquare,
  Copy,
  ExternalLink,
  Star,
  Image as ImageIcon,
  CreditCard as CreditCardIcon,
  FileText as FileTextIcon,
  RefreshCw,
  Plus,
  Minus,
  Tag
} from 'lucide-react';
import { bookingService } from '../../services/booking.service';
import type { PaymentData, Invoice } from '../../types/booking';
import Loader from '../../components/Loader';

interface HotelImage {
  id: number;
  image: string;
  caption: string;
  is_cover: boolean;
}

interface HotelDetails {
  id: number;
  name: string;
  address: string;
  description: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  website: string;
  latitude: number;
  longitude: number;
  manager: number;
  is_active: boolean;
  images: HotelImage[];
  rooms: any[];
  created_at: string;
  updated_at: string;
}

interface ReservationDetails {
  id: number;
  user: number;
  room: number;
  check_in: string;
  check_out: string;
  status: string;
  total_price: string;
  created_at: string;
  updated_at: string;
  hotel_name: string;
  hotel_details?: HotelDetails;
  room_type?: string;
  room_number?: string;
  room_floor?: string;
  room_capacity?: number;
  room_amenities?: string[];
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  user_address?: string;
  payment?: any;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const AdminReservationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<ReservationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    payment_method: 'CREDIT_CARD',
    amount: '',
    notes: ''
  });

  const paymentMethods: PaymentMethod[] = [
    { id: 'CREDIT_CARD', name: 'Carte de crédit', icon: <CreditCardIcon className="w-5 h-5" /> },
    { id: 'PAYPAL', name: 'PayPal', icon: <CreditCardIcon className="w-5 h-5" /> },
    { id: 'BANK_TRANSFER', name: 'Virement bancaire', icon: <CreditCardIcon className="w-5 h-5" /> },
    { id: 'MOBILE_MONEY', name: 'Mobile Money', icon: <CreditCardIcon className="w-5 h-5" /> },
    { id: 'CASH', name: 'Espèces', icon: <CreditCardIcon className="w-5 h-5" /> }
  ];

  useEffect(() => {
    if (id) {
      fetchReservationDetail();
    }
  }, [id]);

  const fetchReservationDetail = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getReservation(Number(id));
      setReservation(response);
      
      // Si le paiement a une facture, la charger
      if (response.payment?.id && response.payment?.invoice) {
        const invoice = await bookingService.getInvoice(response.payment.id);
        setCurrentInvoice(invoice);
      }
    } catch (error) {
      console.error('Error fetching reservation:', error);
      alert('Erreur lors du chargement de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = () => {
    if (!reservation) return;
    
    setPaymentForm({
      payment_method: 'CREDIT_CARD',
      amount: reservation.total_price,
      notes: ''
    });
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!reservation || !paymentForm.amount) return;
    
    setProcessingPayment(true);
    try {
      const paymentData: PaymentData = {
        reservation: reservation.id,
        amount: parseFloat(paymentForm.amount),
        payment_method: 'MOBILE_MONEY',
        status: 'COMPLETED'
      };
      
      const payment = await bookingService.createPayment(paymentData);
      
      // Générer automatiquement une facture
      const invoice = await bookingService.generateInvoice(payment.id);
      
      // Mettre à jour la réservation
      await fetchReservationDetail();
      
      setShowPaymentModal(false);
      setCurrentInvoice(invoice);
      setShowInvoiceModal(true);
      
      alert('Paiement traité et facture générée avec succès!');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Erreur lors du traitement du paiement');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!reservation?.payment?.id) return;
    
    setGeneratingInvoice(true);
    try {
      const invoice = await bookingService.generateInvoice(reservation.payment.id);
      setCurrentInvoice(invoice);
      await fetchReservationDetail();
      alert('Facture générée avec succès!');
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Erreur lors de la génération de la facture');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!currentInvoice) return;
    
    setDownloadingInvoice(true);
    try {
    //   const pdfData = await bookingService.downloadInvoicePDF(currentInvoice.payment);
      
    //   const blob = new Blob([pdfData], { type: 'application/pdf' });
    //   const url = URL.createObjectURL(blob);
    //   const a = document.createElement('a');
    //   a.href = url;
    //   a.download = `facture-${currentInvoice.invoice_number}.pdf`;
    //   document.body.appendChild(a);
    //   a.click();
    //   document.body.removeChild(a);
    //   URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Erreur lors du téléchargement de la facture');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const handlePrintInvoice = () => {
    // Implémentation de l'impression
    window.print();
  };

  const handleSendInvoice = async () => {
    if (!currentInvoice || !reservation?.user_email) return;
    
    try {
      const recipientEmail = prompt('Entrez l\'adresse email du destinataire:', reservation.user_email);
      if (!recipientEmail) return;
      
      // Note: La fonction sendInvoiceByEmail n'existe plus, on pourrait utiliser une autre méthode
      alert('Envoi de facture par email à implémenter');
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Erreur lors de l\'envoi de la facture');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!reservation) return;
    
    if (window.confirm(`Êtes-vous sûr de vouloir ${newStatus === 'CANCELLED' ? 'annuler' : 'modifier'} cette réservation ?`)) {
      try {
        await bookingService.updateReservationStatus(reservation.id, newStatus);
        await fetchReservationDetail();
        alert(`Statut mis à jour: ${newStatus}`);
      } catch (error) {
        console.error('Error updating status:', error);
        alert('Erreur lors de la mise à jour du statut');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
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

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(num);
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; color: string; bgColor: string; icon: React.ReactNode }> = {
      PENDING: {
        text: 'En attente',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        icon: <Clock className="w-4 h-4" />
      },
      CONFIRMED: {
        text: 'Confirmée',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: <CheckCircle className="w-4 h-4" />
      },
      CANCELLED: {
        text: 'Annulée',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: <XCircle className="w-4 h-4" />
      },
      COMPLETED: {
        text: 'Terminée',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        icon: <CheckCircle className="w-4 h-4" />
      }
    };

    const statusInfo = statusMap[status] || { text: status, color: 'text-gray-700', bgColor: 'bg-gray-100', icon: null };
    
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${statusInfo.bgColor} max-w-fit`}>
        {statusInfo.icon}
        <span className={`font-medium ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
      </div>
    );
  };

  const getPaymentStatusBadge = (payment: any) => {
    if (!payment) return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 max-w-fit">
        <Clock className="w-4 h-4 text-gray-600" />
        <span className="font-medium text-gray-700">Non payé</span>
      </div>
    );
    
    const statusMap: Record<string, { text: string; color: string; bgColor: string; icon: React.ReactNode }> = {
      PENDING: {
        text: 'En attente',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        icon: <Clock className="w-4 h-4" />
      },
      COMPLETED: {
        text: 'Payé',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: <CheckCircle className="w-4 h-4" />
      },
      FAILED: {
        text: 'Échoué',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: <XCircle className="w-4 h-4" />
      }
    };

    const statusInfo = statusMap[payment.status] || { text: payment.status, color: 'text-gray-700', bgColor: 'bg-gray-100', icon: null };
    
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${statusInfo.bgColor} max-w-fit`}>
        {statusInfo.icon}
        <span className={`font-medium ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
      </div>
    );
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copié dans le presse-papier!');
  };

  if (loading) {
    return <Loader fullScreen text="Chargement des détails de la réservation..." />;
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Réservation non trouvée</h2>
          <button
            onClick={() => navigate('/admin/reservations')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retour aux réservations
          </button>
        </div>
      </div>
    );
  }

  const hotel = reservation.hotel_details;
  const nights = calculateNights(reservation.check_in, reservation.check_out);
  const pricePerNight = parseFloat(reservation.total_price) / nights;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modals */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Traiter le paiement</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant à payer
                  </label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Méthode de paiement
                  </label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm({...paymentForm, payment_method: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {paymentMethods.map(method => (
                      <option key={method.id} value={method.id}>{method.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Notes internes concernant ce paiement..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitPayment}
                  disabled={processingPayment || !paymentForm.amount}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {processingPayment ? 'Traitement...' : 'Confirmer le paiement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInvoiceModal && currentInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Facture générée</h3>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Facture #{currentInvoice.invoice_number} générée avec succès!</p>
                    <p className="text-sm text-green-600">
                      Émise le {new Date(currentInvoice.issued_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadInvoice}
                  disabled={downloadingInvoice}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {downloadingInvoice ? 'Téléchargement...' : 'Télécharger PDF'}
                </button>
                <button
                  onClick={handlePrintInvoice}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/reservations')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Retour
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Réservation #{reservation.id}</h1>
                <p className="text-gray-600">
                  Créée le {formatDateTime(reservation.created_at)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {getStatusBadge(reservation.status)}
              
              {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                <button
                  onClick={() => handleStatusChange('CANCELLED')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Annuler
                </button>
              )}
              
              <button
                onClick={fetchReservationDetail}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Actualiser"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Carte Hôtel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {hotel?.name || reservation.hotel_name}
                    </h2>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{hotel?.address || 'Adresse non disponible'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(reservation.total_price)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {nights} nuit{nights > 1 ? 's' : ''} • {formatCurrency(pricePerNight)}/nuit
                    </div>
                  </div>
                </div>
                
                {hotel?.images?.[0] && (
                  <div className="mb-6">
                    <img
                      src={hotel.images[0].image}
                      alt={hotel.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Dates du séjour</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="font-medium">Arrivée</p>
                            <p className="text-gray-600">{formatDate(reservation.check_in)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="font-medium">Départ</p>
                            <p className="text-gray-600">{formatDate(reservation.check_out)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Chambre</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Bed className="w-5 h-5 text-indigo-500" />
                          <div>
                            <p className="font-medium">Type de chambre</p>
                            <p className="text-gray-600">{reservation.room_type || 'Standard'}</p>
                          </div>
                        </div>
                        {reservation.room_number && (
                          <div className="flex items-center gap-3">
                            <Home className="w-5 h-5 text-purple-500" />
                            <div>
                              <p className="font-medium">Numéro de chambre</p>
                              <p className="text-gray-600">{reservation.room_number}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Coordonnées de l'hôtel</h3>
                      <div className="space-y-2">
                        {hotel?.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-gray-500" />
                            <button
                              onClick={() => window.open(`tel:${hotel.phone}`)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              {hotel.phone}
                            </button>
                          </div>
                        )}
                        {hotel?.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-500" />
                            <button
                              onClick={() => window.open(`mailto:${hotel.email}`)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              {hotel.email}
                            </button>
                          </div>
                        )}
                        {hotel?.website && (
                          <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-gray-500" />
                            <button
                              onClick={() => window.open(hotel.website, '_blank')}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              {hotel.website}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Description</h3>
                      <p className="text-gray-600">
                        {hotel?.description || 'Aucune description disponible'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte Client */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informations client
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Détails personnels</h3>
                      <button
                        onClick={() => handleCopyToClipboard(`${reservation.user_name}\n${reservation.user_email}\n${reservation.user_phone || ''}`)}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Nom complet</p>
                        <p className="font-medium">{reservation.user_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <button
                          onClick={() => window.open(`mailto:${reservation.user_email}`)}
                          className="font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          {reservation.user_email}
                        </button>
                      </div>
                      {reservation.user_phone && (
                        <div>
                          <p className="text-sm text-gray-500">Téléphone</p>
                          <button
                            onClick={() => window.open(`tel:${reservation.user_phone}`)}
                            className="font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            {reservation.user_phone}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => window.open(`mailto:${reservation.user_email}?subject=Réservation #${reservation.id}`)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        Envoyer un email
                      </button>
                      
                      {reservation.user_phone && (
                        <button
                          onClick={() => window.open(`tel:${reservation.user_phone}`)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <PhoneCall className="w-4 h-4" />
                          Appeler le client
                        </button>
                      )}
                      
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        Envoyer un SMS
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-8">
            {/* Carte Paiement */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Paiement
                  </h2>
                  {getPaymentStatusBadge(reservation.payment)}
                </div>
                
                {!reservation.payment ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-4">Aucun paiement n'a été effectué</p>
                    <button
                      onClick={handleProcessPayment}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors"
                    >
                      Traiter le paiement
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Montant payé:</span>
                          <span className="font-bold text-xl">{formatCurrency(reservation.payment.amount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Méthode:</span>
                          <span className="capitalize font-medium">
                            {reservation.payment.payment_method.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Date:</span>
                          <span>{formatDateTime(reservation.payment.payment_date)}</span>
                        </div>
                        {reservation.payment.notes && (
                          <div>
                            <span className="text-gray-600 block mb-1">Notes:</span>
                            <p className="text-gray-700 bg-white p-2 rounded border border-gray-200">
                              {reservation.payment.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Facture */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Facture
                        </h3>
                        {!reservation.payment.invoice && (
                          <button
                            onClick={handleGenerateInvoice}
                            disabled={generatingInvoice}
                            className="text-sm px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 disabled:opacity-50"
                          >
                            {generatingInvoice ? 'Génération...' : 'Générer'}
                          </button>
                        )}
                      </div>
                      
                      {reservation.payment.invoice ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium text-green-800">
                                #{reservation.payment.invoice.invoice_number}
                              </p>
                              <p className="text-sm text-green-600">
                                Émise le {formatDateTime(reservation.payment.invoice.issued_date)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleDownloadInvoice}
                                disabled={downloadingInvoice}
                                className="p-2 text-green-600 hover:text-green-800"
                                title="Télécharger"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handlePrintInvoice}
                                className="p-2 text-green-600 hover:text-green-800"
                                title="Imprimer"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleDownloadInvoice}
                              disabled={downloadingInvoice}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              <Download className="w-4 h-4" />
                              {downloadingInvoice ? 'Téléchargement...' : 'PDF'}
                            </button>
                            <button className="px-3 py-2 border border-gray-300 text-sm rounded hover:bg-gray-50">
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                          <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                          <p className="text-yellow-700">Aucune facture générée</p>
                          <p className="text-sm text-yellow-600 mt-1">Générez une facture pour ce paiement</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Carte Actions rapides */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Actions rapides</h2>
                
                <div className="space-y-3">
                  {reservation.status !== 'CANCELLED' && reservation.status !== 'COMPLETED' && (
                    <>
                      <button
                        onClick={handleProcessPayment}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5" />
                          <span>Traiter un paiement</span>
                        </div>
                        <Plus className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleStatusChange('COMPLETED')}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5" />
                          <span>Marquer comme terminée</span>
                        </div>
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => navigate(`/admin/hotels/${hotel?.id}`)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 text-purple-700 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5" />
                      <span>Voir l'hôtel</span>
                    </div>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => navigate(`/admin/reservations/${reservation.id}/edit`)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 text-yellow-700 rounded-lg hover:from-yellow-100 hover:to-orange-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Edit className="w-5 h-5" />
                      <span>Modifier la réservation</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Carte Informations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Informations</h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">ID Réservation</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="font-mono bg-gray-100 px-2 py-1 rounded">
                        #{reservation.id}
                      </code>
                      <button
                        onClick={() => handleCopyToClipboard(reservation.id.toString())}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">ID Client</p>
                    <p className="font-medium">{reservation.user}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">ID Chambre</p>
                    <p className="font-medium">{reservation.room}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Créée le</p>
                    <p className="font-medium">{formatDateTime(reservation.created_at)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Dernière modification</p>
                    <p className="font-medium">{formatDateTime(reservation.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReservationDetail;