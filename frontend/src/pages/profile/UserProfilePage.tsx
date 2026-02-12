import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building,
  Shield,
  Edit,
  Save,
  X,
  Key,
  CheckCircle,
  AlertCircle,
  LogOut,
  ChevronLeft,
  Camera,
  Star,
  Clock,
  MapPin,
  Hotel,
  CreditCard,
  MessageSquare,
  Award,
  Briefcase,
  Users,
  TrendingUp,
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  Globe,
  Home,
  Bell,
  Lock,
  Heart
} from 'lucide-react';
import Loader from '../../components/Loader';
import { profileService, type UserProfile } from '../../services/profile.service';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/booking.service';
import { reviewService } from '../../services/review.service';
import { hotelService } from '../../services/hotel.service';
import { directorReviewService } from '../../services/director-review.service';

type TabType = 'profile' | 'statistics' | 'security' | 'activity' | 'hotels' | 'reviews';

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Statistiques selon le rôle
  const [clientStats, setClientStats] = useState({
    total_bookings: 0,
    completed_bookings: 0,
    pending_bookings: 0,
    cancelled_bookings: 0,
    total_reviews: 0,
    average_rating: 0,
    total_spent: 0,
    favorite_hotels: 0
  });

  const [directorStats, setDirectorStats] = useState({
    total_hotels: 0,
    total_reviews: 0,
    average_rating: 0,
    total_bookings: 0,
    revenue: 0,
    pending_tasks: 0,
    rating_distribution: {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    }
  });

  const [adminStats, setAdminStats] = useState({
    total_users: 0,
    total_hotels: 0,
    total_bookings: 0,
    total_reviews: 0,
    total_revenue: 0,
    pending_approvals: 0,
    active_directors: 0,
    active_managers: 0
  });

  // Données supplémentaires
  const [recentHotels, setRecentHotels] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  // Formulaire d'édition
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    username: ''
  });

  // Formulaire de changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const profileData = await profileService.getProfile();
      setProfile(profileData);
      setFormData({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        email: profileData.email || '',
        phone_number: profileData.phone_number || '',
        username: profileData.username || ''
      });

      // Charger les statistiques selon le rôle
      await loadRoleSpecificData(profileData.role);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setErrorMessage('Impossible de charger le profil');
    } finally {
      setLoading(false);
    }
  };

  const loadRoleSpecificData = async (role: string) => {
    try {
      switch (role) {
        case 'CLIENT':
          await loadClientData();
          break;
        case 'DIRECTOR':
          await loadDirectorData();
          break;
        case 'ADMIN':
          await loadAdminData();
          break;
        case 'MANAGER':
          await loadManagerData();
          break;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const loadClientData = async () => {
    try {
      // Réservations
      const bookings = await bookingService.getMyReservations();
      const bookingsData = Array.isArray(bookings) ? bookings : bookings?.data || [];
      
      // Avis
      const reviews = await reviewService.getMyReviews();
      const reviewsData = Array.isArray(reviews) ? reviews : reviews || [];
      
      // Calculer les statistiques
      const completed = bookingsData.filter((b: any) => b.status === 'COMPLETED').length;
      const pending = bookingsData.filter((b: any) => b.status === 'PENDING').length;
      const cancelled = bookingsData.filter((b: any) => b.status === 'CANCELLED').length;
      
      const total_spent = bookingsData
        .filter((b: any) => b.status !== 'CANCELLED')
        .reduce((sum: number, b: any) => sum + parseFloat(b.total_price || '0'), 0);
      
      const avg_rating = reviewsData.length > 0
        ? reviewsData.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewsData.length
        : 0;

      setClientStats({
        total_bookings: bookingsData.length,
        completed_bookings: completed,
        pending_bookings: pending,
        cancelled_bookings: cancelled,
        total_reviews: reviewsData.length,
        average_rating: parseFloat(avg_rating.toFixed(1)),
        total_spent: total_spent,
        favorite_hotels: 0
      });

      // Dernières réservations
      setRecentBookings(bookingsData.slice(0, 3));
      
    } catch (error) {
      console.error('Erreur chargement données client:', error);
    }
  };

  const loadDirectorData = async () => {
    try {
      // Hôtels du directeur
      const hotels = await hotelService.getDirectorHotels();
      const hotelsData = Array.isArray(hotels) ? hotels : hotels?.data || [];
      
      // Statistiques des avis
      const stats = await directorReviewService.getStatistics();
      
      // Réservations totales (à adapter selon votre API)
      let totalBookings = 0;
      let totalRevenue = 0;
      
      for (const hotel of hotelsData) {
        // Ici vous devrez peut-être faire un appel API pour les réservations de chaque hôtel
        totalBookings += hotel.bookings_count || 0;
        totalRevenue += hotel.revenue || 0;
      }

      setDirectorStats({
        total_hotels: hotelsData.length,
        total_reviews: stats.total_reviews || 0,
        average_rating: stats.average_rating || 0,
        total_bookings: totalBookings,
        revenue: totalRevenue,
        pending_tasks: 0,
        rating_distribution: stats.rating_distribution || {1:0,2:0,3:0,4:0,5:0}
      });

      // Derniers avis
      setRecentReviews(stats.latest_reviews || []);
      setRecentHotels(hotelsData.slice(0, 3));
      
    } catch (error) {
      console.error('Erreur chargement données directeur:', error);
    }
  };

  const loadAdminData = async () => {
    try {
      // Ces appels sont à adapter selon votre API
      // const users = await adminService.getUsers();
      // const hotels = await adminService.getAllHotels();
      // const bookings = await adminService.getAllBookings();
      
      // Pour l'exemple, je mets des données fictives
      setAdminStats({
        total_users: 1250,
        total_hotels: 42,
        total_bookings: 356,
        total_reviews: 189,
        total_revenue: 157890,
        pending_approvals: 3,
        active_directors: 8,
        active_managers: 15
      });
      
    } catch (error) {
      console.error('Erreur chargement données admin:', error);
    }
  };

  const loadManagerData = async () => {
    // Similaire au directeur mais avec un périmètre réduit
    await loadDirectorData();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordErrors([]);
  };

  const validatePassword = () => {
    const errors: string[] = [];
    
    if (passwordData.new_password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    if (!/[A-Z]/.test(passwordData.new_password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    if (!/[0-9]/.test(passwordData.new_password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.push('Les mots de passe ne correspondent pas');
    }
    
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setErrorMessage('');
    try {
      const updatedProfile = await profileService.updateProfile(formData);
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccessMessage('Profil mis à jour avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      setErrorMessage(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    
    setSaving(true);
    setErrorMessage('');
    try {
      await profileService.changePassword(passwordData);
      setIsChangingPassword(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setSuccessMessage('Mot de passe modifié avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Erreur lors du changement de mot de passe:', error);
      setErrorMessage(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
      ADMIN: {
        color: 'text-purple-700',
        bg: 'bg-purple-100',
        icon: <Shield className="w-4 h-4" />,
        label: 'Administrateur'
      },
      DIRECTOR: {
        color: 'text-blue-700',
        bg: 'bg-blue-100',
        icon: <Briefcase className="w-4 h-4" />,
        label: 'Directeur'
      },
      MANAGER: {
        color: 'text-green-700',
        bg: 'bg-green-100',
        icon: <Building className="w-4 h-4" />,
        label: 'Manager'
      },
      CLIENT: {
        color: 'text-orange-700',
        bg: 'bg-orange-100',
        icon: <User className="w-4 h-4" />,
        label: 'Client'
      }
    };
    
    return badges[role] || badges['CLIENT'];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getTabs = () => {
    const role = profile?.role;
    const tabs = [];
    
    // Onglet profil - TOUJOURS présent
    tabs.push({ id: 'profile', label: 'Profil', icon: User });
    
    // Onglet statistiques selon le rôle
    if (role === 'CLIENT') {
      tabs.push({ id: 'statistics', label: 'Mes séjours', icon: Hotel });
      tabs.push({ id: 'reviews', label: 'Mes avis', icon: MessageSquare });
    } else if (role === 'DIRECTOR' || role === 'MANAGER') {
      tabs.push({ id: 'statistics', label: 'Statistiques', icon: TrendingUp });
      tabs.push({ id: 'hotels', label: 'Mes hôtels', icon: Building });
      tabs.push({ id: 'reviews', label: 'Avis clients', icon: Star });
    } else if (role === 'ADMIN') {
      tabs.push({ id: 'statistics', label: 'Dashboard', icon: BarChart3 });
      tabs.push({ id: 'activity', label: 'Activité', icon: Clock });
    }
    
    // Onglet sécurité - TOUJOURS présent
    tabs.push({ id: 'security', label: 'Sécurité', icon: Lock });
    
    return tabs;
  };

  if (loading) {
    return <Loader fullScreen text="Chargement du profil..." />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profil non trouvé</h2>
          <p className="text-gray-600 mb-6">Une erreur est survenue lors du chargement.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const roleBadge = getRoleBadge(profile.role);
  const tabs = getTabs();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* En-tête du profil - Carte principale */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Bannière de rôle */}
          <div className={`h-32 ${roleBadge.bg} bg-opacity-30 relative`}>
            <div className="absolute -bottom-12 left-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-lg">
                  {profile.first_name?.charAt(0) || profile.username?.charAt(0).toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-16 px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${roleBadge.bg} ${roleBadge.color}`}>
                    {roleBadge.icon}
                    {roleBadge.label}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">@{profile.username}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-5 h-5" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-5 h-5" />
                    <span>{profile.phone_number || 'Non renseigné'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-5 h-5" />
                    <span>Membre depuis {formatDate(profile.date_joined)}</span>
                  </div>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Modifier le profil
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto px-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="space-y-6">
          {/* Onglet PROFIL */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {isEditing ? (
                <>
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Modifier le profil</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom d'utilisateur</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-8">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          first_name: profile.first_name || '',
                          last_name: profile.last_name || '',
                          email: profile.email || '',
                          phone_number: profile.phone_number || '',
                          username: profile.username || ''
                        });
                      }}
                      className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Informations personnelles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Nom complet</p>
                      <p className="font-medium text-gray-900">{profile.first_name} {profile.last_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Nom d'utilisateur</p>
                      <p className="font-medium text-gray-900">@{profile.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="font-medium text-gray-900">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Téléphone</p>
                      <p className="font-medium text-gray-900">{profile.phone_number || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Rôle</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleBadge.bg} ${roleBadge.color}`}>
                          {roleBadge.label}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Membre depuis</p>
                      <p className="font-medium text-gray-900">{formatDate(profile.date_joined)}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Onglet STATISTIQUES - Client */}
          {activeTab === 'statistics' && profile.role === 'CLIENT' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">Réservations</span>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Hotel className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{clientStats.total_bookings}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="text-green-600">{clientStats.completed_bookings} terminées</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-yellow-600">{clientStats.pending_bookings} en attente</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">Avis</span>
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{clientStats.total_reviews}</p>
                  {clientStats.total_reviews > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= clientStats.average_rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-600 ml-1">
                        {clientStats.average_rating}/5
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">Dépenses</span>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CreditCard className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(clientStats.total_spent)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Total dépensé</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">Favoris</span>
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Heart className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{clientStats.favorite_hotels}</p>
                  <p className="text-xs text-gray-500 mt-2">Hôtels favoris</p>
                </div>
              </div>

              {/* Dernières réservations */}
              {recentBookings.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dernières réservations</h3>
                  <div className="space-y-3">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{booking.hotel_name}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatCurrency(booking.total_price)}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/client/reservations')}
                    className="mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-800"
                  >
                    Voir toutes mes réservations →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Onglet STATISTIQUES - Directeur/Manager */}
          {activeTab === 'statistics' && (profile.role === 'DIRECTOR' || profile.role === 'MANAGER') && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">Hôtels</span>
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Building className="w-4 h-4 text-indigo-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{directorStats.total_hotels}</p>
                  <p className="text-xs text-gray-500 mt-2">Établissements gérés</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">Note moyenne</span>
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-600" />
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-bold text-gray-900">{directorStats.average_rating}</p>
                    <span className="text-sm text-gray-600 mb-1">/5</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{directorStats.total_reviews} avis</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">Réservations</span>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{directorStats.total_bookings}</p>
                  <p className="text-xs text-gray-500 mt-2">Toutes réservations</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">Chiffre d'affaires</span>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(directorStats.revenue)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Total</p>
                </div>
              </div>

              {/* Distribution des notes */}
              {directorStats.total_reviews > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution des notes</h3>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = directorStats.rating_distribution[rating as keyof typeof directorStats.rating_distribution] || 0;
                      const percentage = (count / (directorStats.total_reviews || 1)) * 100;
                      
                      return (
                        <div key={rating} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-16">
                            <span className="text-sm font-medium text-gray-700">{rating}</span>
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          </div>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-400 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Onglet STATISTIQUES - Admin */}
          {activeTab === 'statistics' && profile.role === 'ADMIN' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">Utilisateurs</span>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{adminStats.total_users}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="text-blue-600">{adminStats.active_directors} directeurs</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-green-600">{adminStats.active_managers} managers</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">Hôtels</span>
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Building className="w-4 h-4 text-indigo-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{adminStats.total_hotels}</p>
                  <p className="text-xs text-gray-500 mt-2">Établissements partenaires</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">Réservations</span>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{adminStats.total_bookings}</p>
                  <p className="text-xs text-gray-500 mt-2">Toutes réservations</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">CA Total</span>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CreditCard className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(adminStats.total_revenue)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Chiffre d'affaires</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avis aujourd'hui</span>
                      <span className="font-medium text-gray-900">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Nouveaux utilisateurs</span>
                      <span className="font-medium text-gray-900">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Nouvelles réservations</span>
                      <span className="font-medium text-gray-900">24</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">En attente validation</span>
                      <span className="font-medium text-yellow-600">{adminStats.pending_approvals}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/admin/users')}
                      className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span className="font-medium text-gray-900">Gérer les utilisateurs</span>
                      <p className="text-sm text-gray-600">Ajouter, modifier ou bloquer des comptes</p>
                    </button>
                    <button
                      onClick={() => navigate('/admin/hotels')}
                      className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span className="font-medium text-gray-900">Gérer les hôtels</span>
                      <p className="text-sm text-gray-600">Valider et configurer les établissements</p>
                    </button>
                    <button
                      onClick={() => navigate('/admin/reviews')}
                      className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span className="font-medium text-gray-900">Modérer les avis</span>
                      <p className="text-sm text-gray-600">Signaler et gérer les avis inappropriés</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet MES HÔTELS - Directeur/Manager */}
          {activeTab === 'hotels' && (profile.role === 'DIRECTOR' || profile.role === 'MANAGER') && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Mes établissements</h2>
                <button
                  onClick={() => navigate('/director/hotels/add')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  + Ajouter un hôtel
                </button>
              </div>

              {recentHotels.length > 0 ? (
                <div className="space-y-4">
                  {recentHotels.map((hotel) => (
                    <div key={hotel.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-pink-100 rounded-lg flex items-center justify-center">
                          <Building className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{hotel.name}</h3>
                          <p className="text-sm text-gray-600">{hotel.city}, {hotel.country}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium text-gray-900">
                              {hotel.average_rating?.toFixed(1) || '0.0'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{hotel.review_count || 0} avis</p>
                        </div>
                        <button
                          onClick={() => navigate(`/director/hotels/${hotel.id}`)}
                          className="px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          Gérer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Vous n'avez pas encore d'hôtels</p>
                  <p className="text-sm text-gray-400 mt-1">Ajoutez votre premier établissement</p>
                </div>
              )}

              <button
                onClick={() => navigate('/director/hotels')}
                className="mt-6 text-indigo-600 text-sm font-medium hover:text-indigo-800"
              >
                Voir tous mes hôtels →
              </button>
            </div>
          )}

          {/* Onglet AVIS - Client */}
          {activeTab === 'reviews' && profile.role === 'CLIENT' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Mes avis</h2>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  {clientStats.total_reviews} avis publiés
                </span>
              </div>

              {clientStats.total_reviews > 0 ? (
                <div className="space-y-4">
                  {/* Ici vous pouvez lister les avis du client */}
                  <p className="text-gray-500 text-center py-8">
                    Fonctionnalité à venir : Liste de vos avis
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Vous n'avez pas encore publié d'avis</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Après un séjour, vous pouvez laisser votre avis
                  </p>
                </div>
              )}

              <button
                onClick={() => navigate('/client/reservations')}
                className="mt-6 text-indigo-600 text-sm font-medium hover:text-indigo-800"
              >
                Voir mes réservations →
              </button>
            </div>
          )}

          {/* Onglet AVIS - Directeur/Manager */}
          {activeTab === 'reviews' && (profile.role === 'DIRECTOR' || profile.role === 'MANAGER') && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Avis clients</h2>
                <button
                  onClick={() => navigate('/director/reviews')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Voir tous les avis
                </button>
              </div>

              {recentReviews.length > 0 ? (
                <div className="space-y-4">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {review.username?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{review.username}</p>
                            <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucun avis pour le moment</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Les avis apparaîtront après les séjours des clients
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Onglet SÉCURITÉ - Pour tous les rôles */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Sécurité du compte</h2>
              
              {!isChangingPassword ? (
                <div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Mot de passe</p>
                        <p className="text-sm text-gray-600">Dernière modification il y a 30 jours</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      Modifier
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">Authentification à deux facteurs</p>
                        <p className="text-sm text-gray-600">Renforcez la sécurité de votre compte</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                      Activer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {passwordErrors.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-800 mb-2">Le mot de passe doit :</p>
                      <ul className="list-disc list-inside space-y-1">
                        {passwordErrors.map((error, index) => (
                          <li key={index} className="text-xs text-red-700">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={handleChangePassword}
                      disabled={saving}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Modification...' : 'Modifier le mot de passe'}
                    </button>
                    <button
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
                        setPasswordErrors([]);
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;