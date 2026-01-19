import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Calendar,
  Users,
  CreditCard,
  CheckCircle,
  Shield,
  MapPin,
  Star,
  Building,
  Bed,
  Clock,
  ChevronRight,
  AlertCircle,
  Mail,
  Phone,
  User,
  Lock,
  Globe,
  Download,
  Printer,
  Home,
  Smartphone,
  Building2
} from 'lucide-react';
import Loader from '../../components/Loader';
import BookingStepIndicator from '../../components/BookingStepIndicator';
import { bookingService } from '../../services/booking.service';
import type { HotelBookingData, BookingFormData, PaymentData } from '../../types/booking';

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state as HotelBookingData;
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
    paymentMethod: 'CREDIT_CARD',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
    agreeTerms: false
  });
  const [reservationId, setReservationId] = useState<number | null>(null);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!bookingData) {
      const userRole = localStorage.getItem('user_role') || 'client';
      switch(userRole) {
        case 'admin':
          navigate('/admin/hotels');
          break;
        case 'director':
          navigate('/director/hotels');
          break;
        case 'manager':
          navigate('/manager/hotels');
          break;
        default:
          navigate('/client/hotels');
      }
    }
    
    const userEmail = localStorage.getItem('user_email');
    const userName = localStorage.getItem('user_name');
    if (userEmail) {
      setFormData(prev => ({ ...prev, email: userEmail }));
    }
    if (userName) {
      const nameParts = userName.split(' ');
      if (nameParts.length >= 2) {
        setFormData(prev => ({ 
          ...prev, 
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' ')
        }));
      }
    }
  }, [bookingData, navigate]);

  const calculateNights = () => {
    if (!bookingData?.checkInDate || !bookingData?.checkOutDate) return 0;
    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = () => {
    if (!bookingData?.price) return 0;
    const nights = calculateNights();
    return nights * bookingData.price;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
    if (value.length > 16) value = value.substring(0, 16);
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    setFormData(prev => ({ ...prev, cardNumber: value }));
    
    if (errors.cardNumber) {
      setErrors(prev => ({ ...prev, cardNumber: '' }));
    }
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setFormData(prev => ({ ...prev, cardExpiry: value }));
    
    if (errors.cardExpiry) {
      setErrors(prev => ({ ...prev, cardExpiry: '' }));
    }
  };

  const validateForm = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (stepNumber === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
      if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis';
      if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
      if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
      if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
    }
    
    if (stepNumber === 2) {
      if (formData.paymentMethod === 'CREDIT_CARD') {
        if (!formData.cardNumber?.replace(/\s/g, '')) newErrors.cardNumber = 'Le numéro de carte est requis';
        if (!formData.cardExpiry) newErrors.cardExpiry = 'La date d\'expiration est requise';
        if (!formData.cardCvc) newErrors.cardCvc = 'Le CVC est requis';
        if (!formData.cardName?.trim()) newErrors.cardName = 'Le nom sur la carte est requis';
      }
      if (!formData.agreeTerms) newErrors.agreeTerms = 'Vous devez accepter les conditions générales';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (!validateForm(step)) {
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmitBooking();
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmitBooking = async () => {
    setLoading(true);
    
    try {
      // 1. Créer la réservation avec status CONFIRMED
      const userId = parseInt(localStorage.getItem('user_id') || '1');
      const totalPrice = calculateTotalPrice();
      
      const reservationData = {
        user: userId,
        room: bookingData.roomId,
        check_in: bookingData.checkInDate,
        check_out: bookingData.checkOutDate,
        total_price: totalPrice,
        status: 'CONFIRMED' // DIRECTEMENT CONFIRMÉ
      };
      
      const reservationResponse = await bookingService.createReservation(reservationData);
      setReservationId(reservationResponse.id);
      
      // 2. Créer le paiement avec status COMPLETED (paiement réussi)
      const paymentData: PaymentData = {
        reservation: reservationResponse.id,
        amount: totalPrice,
        payment_method: formData.paymentMethod,
        status: 'COMPLETED' // Paiement réussi
      };
      
      const paymentResponse = await bookingService.createPayment(paymentData);
      setPaymentId(paymentResponse.id);
      
      // 3. Simuler le temps de traitement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 4. Générer la facture
      const invoiceResponse = await bookingService.generateInvoice(paymentResponse.id);
      setInvoiceNumber(invoiceResponse.invoice_number);
      
      // 5. Marquer comme confirmé
      setBookingConfirmed(true);
      
      console.log('✅ Réservation créée avec succès', {
        reservation_id: reservationResponse.id,
        reservation_status: 'CONFIRMED',
        payment_id: paymentResponse.id,
        payment_status: 'COMPLETED'
      });
      
    } catch (error: any) {
      console.error('❌ Erreur lors de la réservation:', error);
      alert(`Erreur lors de la réservation: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getRedirectPath = () => {
    const userRole = localStorage.getItem('user_role') || 'client';
    switch(userRole) {
      case 'admin':
        return '/admin/bookings';
      case 'director':
        return '/director/bookings';
      case 'manager':
        return '/manager/bookings';
      default:
        return '/client/my-bookings';
    }
  };

  const downloadConfirmation = () => {
    const content = `
      HOTELSPHERE - CONFIRMATION DE RÉSERVATION
      ============================================
      
      Référence réservation: RES-${reservationId}
      Numéro de facture: ${invoiceNumber}
      Date: ${new Date().toLocaleDateString('fr-FR')}
      
      INFORMATIONS CLIENT
      --------------------
      Nom: ${formData.lastName}
      Prénom: ${formData.firstName}
      Email: ${formData.email}
      Téléphone: ${formData.phone}
      
      DÉTAILS DU SÉJOUR
      ------------------
      Hôtel: ${bookingData.hotelName}
      Adresse: ${bookingData.hotelAddress}, ${bookingData.hotelCity}, ${bookingData.hotelCountry}
      Type de chambre: ${bookingData.roomType}
      Numéro de chambre: ${bookingData.roomNumber}
      
      Dates: Du ${formatDate(bookingData.checkInDate)} au ${formatDate(bookingData.checkOutDate)}
      Nombre de nuits: ${calculateNights()}
      Voyageurs: ${bookingData.guests}
      
      PAIEMENT
      --------
      Montant total: ${calculateTotalPrice().toFixed(2)} €
      Méthode: ${formData.paymentMethod.replace('_', ' ')}
      Statut: Payé
      Date de paiement: ${new Date().toLocaleDateString('fr-FR')}
      
      STATUT DE LA RÉSERVATION: CONFIRMÉ
      
      Merci pour votre réservation !
      
      HotelSphere
      Tél: +33 1 23 45 67 89
      Email: contact@hotelsphere.com
      Site: www.hotelsphere.com
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `confirmation-${invoiceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!bookingData) {
    return <Loader fullScreen text="Chargement des données de réservation..." />;
  }

  const nights = calculateNights();
  const totalPrice = calculateTotalPrice();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Bouton retour */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-3 mb-6 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Retour</span>
        </button>

        <div className="max-w-6xl mx-auto">
          {/* Indicateur d'étape */}
          <BookingStepIndicator currentStep={step} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne gauche - Formulaire */}
            <div className="lg:col-span-2">
              {!bookingConfirmed ? (
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                  {/* Étape 1 : Informations personnelles */}
                  {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-left-5">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Informations personnelles</h2>
                      <p className="text-gray-600 mb-6">Remplissez vos informations pour finaliser la réservation</p>
                      
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Prénom *
                            </label>
                            <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                                errors.firstName ? 'border-red-300' : 'border-gray-300'
                              }`}
                              required
                            />
                            {errors.firstName && (
                              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nom *
                            </label>
                            <input
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                                errors.lastName ? 'border-red-300' : 'border-gray-300'
                              }`}
                              required
                            />
                            {errors.lastName && (
                              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email *
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                                  errors.email ? 'border-red-300' : 'border-gray-300'
                                }`}
                                required
                              />
                            </div>
                            {errors.email && (
                              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Téléphone *
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                                  errors.phone ? 'border-red-300' : 'border-gray-300'
                                }`}
                                required
                              />
                            </div>
                            {errors.phone && (
                              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Demandes spéciales (optionnel)
                          </label>
                          <textarea
                            name="specialRequests"
                            value={formData.specialRequests}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                            placeholder="Préférences de chambre, allergies, anniversaire..."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Étape 2 : Paiement */}
                  {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-left-5">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement sécurisé</h2>
                      <p className="text-gray-600 mb-6">Vos informations de paiement sont cryptées et sécurisées</p>
                      
                      <div className="space-y-6">
                        {/* Méthode de paiement */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Méthode de paiement *
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'CREDIT_CARD' }))}
                              className={`p-4 border-2 rounded-xl transition-all duration-200 flex flex-col items-center ${
                                formData.paymentMethod === 'CREDIT_CARD'
                                  ? 'border-indigo-500 bg-indigo-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <CreditCard className={`w-6 h-6 mb-2 ${
                                formData.paymentMethod === 'CREDIT_CARD' ? 'text-indigo-600' : 'text-gray-500'
                              }`} />
                              <span className="font-medium text-sm">Carte bancaire</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'PAYPAL' }))}
                              className={`p-4 border-2 rounded-xl transition-all duration-200 flex flex-col items-center ${
                                formData.paymentMethod === 'PAYPAL'
                                  ? 'border-indigo-500 bg-indigo-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <Globe className={`w-6 h-6 mb-2 ${
                                formData.paymentMethod === 'PAYPAL' ? 'text-indigo-600' : 'text-gray-500'
                              }`} />
                              <span className="font-medium text-sm">PayPal</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'BANK_TRANSFER' }))}
                              className={`p-4 border-2 rounded-xl transition-all duration-200 flex flex-col items-center ${
                                formData.paymentMethod === 'BANK_TRANSFER'
                                  ? 'border-indigo-500 bg-indigo-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <Building className={`w-6 h-6 mb-2 ${
                                formData.paymentMethod === 'BANK_TRANSFER' ? 'text-indigo-600' : 'text-gray-500'
                              }`} />
                              <span className="font-medium text-sm">Virement</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'MOBILE_MONEY' }))}
                              className={`p-4 border-2 rounded-xl transition-all duration-200 flex flex-col items-center ${
                                formData.paymentMethod === 'MOBILE_MONEY'
                                  ? 'border-indigo-500 bg-indigo-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <Smartphone className={`w-6 h-6 mb-2 ${
                                formData.paymentMethod === 'MOBILE_MONEY' ? 'text-indigo-600' : 'text-gray-500'
                              }`} />
                              <span className="font-medium text-sm">Mobile Money</span>
                            </button>
                          </div>

                          {/* Formulaire carte bancaire */}
                          {formData.paymentMethod === 'CREDIT_CARD' && (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Nom sur la carte *
                                </label>
                                <input
                                  type="text"
                                  name="cardName"
                                  value={formData.cardName}
                                  onChange={handleInputChange}
                                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                                    errors.cardName ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                  placeholder="M. DUPONT Jean"
                                />
                                {errors.cardName && (
                                  <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
                                )}
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Numéro de carte *
                                </label>
                                <div className="relative">
                                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                  <input
                                    type="text"
                                    name="cardNumber"
                                    value={formData.cardNumber}
                                    onChange={handleCardNumberChange}
                                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                                      errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="1234 5678 9012 3456"
                                    maxLength={19}
                                  />
                                </div>
                                {errors.cardNumber && (
                                  <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Expiration *
                                  </label>
                                  <input
                                    type="text"
                                    name="cardExpiry"
                                    value={formData.cardExpiry}
                                    onChange={handleCardExpiryChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                                      errors.cardExpiry ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="MM/AA"
                                    maxLength={5}
                                  />
                                  {errors.cardExpiry && (
                                    <p className="mt-1 text-sm text-red-600">{errors.cardExpiry}</p>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    CVC *
                                  </label>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                      type="text"
                                      name="cardCvc"
                                      value={formData.cardCvc}
                                      onChange={handleInputChange}
                                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                                        errors.cardCvc ? 'border-red-300' : 'border-gray-300'
                                      }`}
                                      placeholder="123"
                                      maxLength={4}
                                    />
                                  </div>
                                  {errors.cardCvc && (
                                    <p className="mt-1 text-sm text-red-600">{errors.cardCvc}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* PayPal */}
                          {formData.paymentMethod === 'PAYPAL' && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                              <div className="text-4xl mb-4">💳</div>
                              <p className="text-gray-700 mb-4">
                                Vous serez redirigé vers PayPal pour finaliser le paiement
                              </p>
                              <button
                                type="button"
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                              >
                                Payer avec PayPal
                              </button>
                            </div>
                          )}

                          {/* Virement bancaire */}
                          {formData.paymentMethod === 'BANK_TRANSFER' && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                              <h4 className="font-bold text-gray-900 mb-3">Coordonnées bancaires</h4>
                              <div className="space-y-2 text-sm">
                                <p><span className="font-medium">Banque:</span> HotelSphere Bank</p>
                                <p><span className="font-medium">IBAN:</span> FR76 3000 4000 0100 1234 5678 900</p>
                                <p><span className="font-medium">BIC:</span> HSBFFRPP</p>
                                <p className="text-gray-600 text-xs mt-3">
                                  La réservation sera confirmée une fois le virement reçu
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Mobile Money */}
                          {formData.paymentMethod === 'MOBILE_MONEY' && (
                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                              <h4 className="font-bold text-gray-900 mb-3">Mobile Money</h4>
                              <div className="space-y-3">
                                <p className="text-sm text-gray-700">
                                  Payer avec votre service Mobile Money préféré
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="p-3 bg-white rounded-lg text-center">
                                    <div className="text-2xl mb-1">📱</div>
                                    <span className="text-xs">Orange Money</span>
                                  </div>
                                  <div className="p-3 bg-white rounded-lg text-center">
                                    <div className="text-2xl mb-1">📱</div>
                                    <span className="text-xs">MTN Mobile</span>
                                  </div>
                                  <div className="p-3 bg-white rounded-lg text-center">
                                    <div className="text-2xl mb-1">📱</div>
                                    <span className="text-xs">Wave</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Conditions générales */}
                        <div className="border-t border-gray-100 pt-6">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id="agreeTerms"
                              name="agreeTerms"
                              checked={formData.agreeTerms}
                              onChange={handleInputChange}
                              className={`mt-1 w-4 h-4 rounded focus:ring-indigo-500 ${
                                errors.agreeTerms ? 'text-red-600 border-red-300' : 'text-indigo-600 border-gray-300'
                              }`}
                            />
                            <div>
                              <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                                Je reconnais avoir lu et j'accepte les{' '}
                                <a href="/terms" className="text-indigo-600 hover:text-indigo-800 underline">
                                  conditions générales de vente
                                </a>{' '}
                                et la{' '}
                                <a href="/privacy" className="text-indigo-600 hover:text-indigo-800 underline">
                                  politique de confidentialité
                                </a>
                              </label>
                              {errors.agreeTerms && (
                                <p className="mt-1 text-sm text-red-600">{errors.agreeTerms}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Étape 3 : Confirmation */}
                  {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-left-5">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmation de réservation</h2>
                      <p className="text-gray-600 mb-6">Vérifiez toutes les informations avant de confirmer</p>
                      
                      <div className="bg-gray-50 rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">Récapitulatif complet</h3>
                            <p className="text-gray-600 text-sm">Toutes les informations sont correctes</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 mb-1">Nom complet</p>
                            <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Email</p>
                            <p className="font-medium">{formData.email}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Téléphone</p>
                            <p className="font-medium">{formData.phone}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Méthode de paiement</p>
                            <p className="font-medium capitalize">{formData.paymentMethod.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-yellow-800">
                              En cliquant sur "Confirmer et payer", vous autorisez le débit du montant total de {totalPrice.toFixed(2)} €.
                              Une confirmation sera envoyée à votre adresse email.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between pt-8 border-t border-gray-100">
                    {step > 1 ? (
                      <button
                        onClick={handlePreviousStep}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Retour
                      </button>
                    ) : (
                      <div></div>
                    )}
                    
                    <button
                      onClick={handleNextStep}
                      disabled={loading}
                      className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                        step === 3
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                          : 'bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Traitement...
                        </div>
                      ) : step === 3 ? (
                        'Confirmer et payer'
                      ) : (
                        'Continuer'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Confirmation de réservation */
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      </div>
                      
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">Réservation confirmée !</h2>
                      <p className="text-gray-600 mb-6">
                        Votre réservation a été confirmée. Un email de confirmation a été envoyé à {formData.email}
                      </p>
                    </div>
                    
                    {/* Détails de la réservation */}
                    <div className="bg-gradient-to-br from-indigo-50 to-pink-50 rounded-xl p-6 mb-6">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-gray-600 text-sm mb-1">Référence réservation</p>
                          <p className="text-xl font-bold text-gray-900">RES-{reservationId}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm mb-1">Numéro de facture</p>
                          <p className="text-xl font-bold text-gray-900">{invoiceNumber}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                          <Building2 className="w-5 h-5 text-indigo-600 mt-0.5" />
                          <div>
                            <p className="font-medium">{bookingData.hotelName}</p>
                            <p className="text-sm text-gray-600">{bookingData.hotelCity}, {bookingData.hotelCountry}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                          <Bed className="w-5 h-5 text-indigo-600 mt-0.5" />
                          <div>
                            <p className="font-medium">{bookingData.roomType}</p>
                            <p className="text-sm text-gray-600">Chambre {bookingData.roomNumber} • {bookingData.guests} personne{bookingData.guests > 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                          <Calendar className="w-5 h-5 text-indigo-600 mt-0.5" />
                          <div>
                            <p className="font-medium">{formatDate(bookingData.checkInDate)} → {formatDate(bookingData.checkOutDate)}</p>
                            <p className="text-sm text-gray-600">{nights} nuit{nights > 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                          <CreditCard className="w-5 h-5 text-indigo-600 mt-0.5" />
                          <div>
                            <p className="font-medium capitalize">{formData.paymentMethod.replace('_', ' ')}</p>
                            <p className="text-sm text-gray-600">Montant: {totalPrice.toFixed(2)} €</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-white/30">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">Total payé</span>
                          <span className="text-2xl font-bold text-gray-900">{totalPrice.toFixed(2)} €</span>
                        </div>
                        <p className="text-xs text-gray-600 text-right mt-1">TVA incluse</p>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={downloadConfirmation}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Télécharger la confirmation
                      </button>
                      
                      <button
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        <Printer className="w-4 h-4" />
                        Imprimer
                      </button>
                      
                      <button
                        onClick={() => navigate(getRedirectPath())}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-900 hover:to-black transition-colors font-medium"
                      >
                        <Home className="w-4 h-4" />
                        Mes réservations
                      </button>
                    </div>
                    
                    {/* Informations supplémentaires */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span>Votre réservation est sécurisée et confirmée</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Un email de confirmation détaillé a été envoyé à votre adresse. 
                        Vous pouvez modifier ou annuler votre réservation jusqu'à 48 heures avant votre arrivée.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Colonne droite - Récapitulatif */}
            <div className="space-y-6">
              {/* Récapitulatif de l'hôtel */}
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6 lg:top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Récapitulatif</h3>
                
                <div className="space-y-4">
                  {/* Hôtel */}
                  <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                    {bookingData.hotelImage ? (
                      <img 
                        src={bookingData.hotelImage} 
                        alt={bookingData.hotelName}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-pink-50 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-indigo-600" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-900">{bookingData.hotelName}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-600">{bookingData.hotelCity}, {bookingData.hotelCountry}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chambre */}
                  <div className="pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Bed className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium">Chambre sélectionnée</span>
                    </div>
                    <p className="text-gray-900">{bookingData.roomType}</p>
                    <p className="text-sm text-gray-600">Chambre {bookingData.roomNumber} • {bookingData.guests} personne{bookingData.guests > 1 ? 's' : ''}</p>
                  </div>
                  
                  {/* Dates */}
                  <div className="pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium">Dates du séjour</span>
                    </div>
                    <p className="text-gray-900">
                      {formatDate(bookingData.checkInDate)} → {formatDate(bookingData.checkOutDate)}
                    </p>
                    <p className="text-sm text-gray-600">{nights} nuit{nights > 1 ? 's' : ''}</p>
                  </div>
                  
                  {/* Détails prix */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prix par nuit</span>
                      <span className="font-medium">{bookingData.price.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{nights} nuit{nights > 1 ? 's' : ''}</span>
                      <span className="font-medium">{(bookingData.price * nights).toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-200">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-gray-900">{totalPrice.toFixed(2)} €</span>
                    </div>
                    <p className="text-xs text-gray-500 text-right">TVA incluse</p>
                  </div>
                </div>
                
                {/* Sécurité */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Paiement 100% sécurisé</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>Annulation gratuite jusqu'à 48h avant</span>
                  </div>
                </div>
              </div>
              
              {/* Assistance */}
              <div className="bg-gradient-to-br from-indigo-50 to-pink-50 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Besoin d'aide ?</h3>
                <p className="text-gray-700 text-sm mb-4">
                  Notre équipe est disponible 24h/24 pour vous assister
                </p>
                <div className="space-y-3">
                  <a
                    href="tel:+33123456789"
                    className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">+33 1 23 45 67 89</p>
                      <p className="text-xs text-gray-600">Assistance téléphonique</p>
                    </div>
                  </a>
                  <a
                    href="mailto:assistance@hotelsphere.com"
                    className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">assistance@hotelsphere.com</p>
                      <p className="text-xs text-gray-600">Email de support</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;