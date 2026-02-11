// DirectorDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Shield,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  UserCheck,
  UserX,
  Key,
  Copy,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  MoreVertical,
  Star,
  Bed,
  Users as UsersIcon,
  DollarSign,
  BarChart,
  PhoneCall,
  MessageSquare,
  Settings,
  Lock,
  Unlock,
  Activity,
  TrendingUp,
  Home,
  Image as ImageIcon,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Eye
} from 'lucide-react';
import Loader from '../../../components/Loader';
import { getDirectorById, toggleBlockUser, deleteUser } from '../../../services/auth.service';
import { hotelService } from '../../../services/hotel.service';
import type { Director } from "../../../types/auth";
import type { Hotel } from '../../../types/hotel';

interface HotelWithStats extends Hotel {
  total_reservations?: number;
  total_revenue?: number;
  occupancy_rate?: number;
  average_rating?: number;
}

interface HotelImage {
  id: number;
  image: string;
  caption: string;
  is_cover: boolean;
}

const DirectorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [director, setDirector] = useState<Director | null>(null);
  const [hotels, setHotels] = useState<HotelWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hotelError, setHotelError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'hotels' | 'activity'>('info');
  const [selectedHotel, setSelectedHotel] = useState<HotelWithStats | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    new_password: '',
    confirm_password: ''
  });

  // Charger les données du directeur
  useEffect(() => {
    if (id) {
      fetchDirectorDetails();
      fetchDirectorHotels();
    }
  }, [id]);

  const fetchDirectorDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getDirectorById(Number(id));
      setDirector(data);
    } catch (err: any) {
      console.error('Erreur lors du chargement du directeur:', err);
      setError(err.message || 'Une erreur est survenue lors du chargement du directeur');
    } finally {
      setLoading(false);
    }
  };

  const fetchDirectorHotels = async () => {
    try {
      setLoadingHotels(true);
      setHotelError(null);
      
      const data = await hotelService.getHotelsByManager(Number(id));
      setHotels(data);
    } catch (err: any) {
      console.error('Erreur lors du chargement des hôtels:', err);
      setHotelError(err.message || 'Impossible de charger les hôtels de ce directeur');
    } finally {
      setLoadingHotels(false);
    }
  };

  const toggleBlockStatus = async () => {
    if (!director) return;
    
    try {
      setActionLoading(director.id);
      
      await toggleBlockUser(director.id, !director.is_blocked);
      
      // Mettre à jour l'état local
      setDirector(prev => prev ? { ...prev, is_blocked: !prev.is_blocked } : null);
      
      setShowBlockConfirm(false);
      alert(`Directeur ${director.is_blocked ? 'débloqué' : 'bloqué'} avec succès`);
    } catch (err: any) {
      console.error('Erreur lors du changement de statut:', err);
      alert(err.message || 'Une erreur est survenue lors du changement de statut');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteDirector = async () => {
    if (!director) return;
    
    try {
      setActionLoading(director.id);
      
      await deleteUser(director.id);
      
      setShowDeleteConfirm(false);
      alert('Directeur supprimé avec succès');
      navigate('/admin/managers');
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      alert(err.message || 'Une erreur est survenue lors de la suppression');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async () => {
    if (!director || !passwordForm.new_password) return;
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    
    try {
      setActionLoading(director.id);
      
      // Appel à l'API pour réinitialiser le mot de passe
      // À implémenter selon votre backend
      alert(`Mot de passe réinitialisé pour ${director.first_name}`);
      
      setShowResetPassword(false);
      setPasswordForm({ new_password: '', confirm_password: '' });
    } catch (err: any) {
      console.error('Erreur lors de la réinitialisation:', err);
      alert(err.message || 'Une erreur est survenue lors de la réinitialisation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copié dans le presse-papier');
  };

  const formatPhoneNumber = (phone: string | null | undefined): string => {
    if (!phone) return 'Non renseigné';
    return phone;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'wifi': <Wifi className="w-4 h-4" />,
      'parking': <Car className="w-4 h-4" />,
      'breakfast': <Coffee className="w-4 h-4" />,
      'gym': <Dumbbell className="w-4 h-4" />,
      'pool': <Coffee className="w-4 h-4" />,
      'spa': <Coffee className="w-4 h-4" />
    };
    return iconMap[amenity.toLowerCase()] || <CheckCircle className="w-4 h-4" />;
  };

  if (loading) {
    return <Loader fullScreen text="Chargement des informations du directeur..." />;
  }

  if (!director) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <UserX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Directeur non trouvé</h2>
          <p className="text-gray-600 mb-4">Le directeur que vous recherchez n'existe pas ou a été supprimé.</p>
          <button
            onClick={() => navigate('/admin/managers')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const stats = {
    total_hotels: hotels.length,
    active_hotels: hotels.filter(h => h.is_active).length,
    inactive_hotels: hotels.filter(h => !h.is_active).length,
    total_rooms: hotels.reduce((sum, hotel) => sum + (hotel.rooms?.length || 0), 0),
    avg_rating: hotels.length > 0 
      ? (hotels.reduce((sum, hotel) => sum + (hotel.average_rating || 0), 0) / hotels.length).toFixed(1)
      : '0.0'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modals */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-center mb-2">Supprimer le directeur</h3>
              <p className="text-gray-600 text-center mb-6">
                Êtes-vous sûr de vouloir supprimer définitivement le directeur 
                <span className="font-semibold"> {director.first_name} {director.last_name}</span> ?
                Cette action est irréversible.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteDirector}
                  disabled={actionLoading === director.id}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading === director.id ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBlockConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <Shield className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-center mb-2">
                {director.is_blocked ? 'Débloquer' : 'Bloquer'} le directeur
              </h3>
              <p className="text-gray-600 text-center mb-6">
                {director.is_blocked
                  ? 'Le directeur pourra à nouveau se connecter et gérer ses hôtels.'
                  : 'Le directeur ne pourra plus se connecter ni gérer ses hôtels.'}
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowBlockConfirm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={toggleBlockStatus}
                  disabled={actionLoading === director.id}
                  className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  {actionLoading === director.id ? 'Traitement...' : director.is_blocked ? 'Débloquer' : 'Bloquer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResetPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <Key className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-center mb-2">Réinitialiser le mot de passe</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Entrez le nouveau mot de passe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Confirmez le mot de passe"
                  />
                </div>
              </div>
              
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setShowResetPassword(false);
                    setPasswordForm({ new_password: '', confirm_password: '' });
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={actionLoading === director.id || !passwordForm.new_password}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {actionLoading === director.id ? 'Traitement...' : 'Réinitialiser'}
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
                onClick={() => navigate('/admin/managers')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Retour
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {director.first_name} {director.last_name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">@{director.username}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      director.is_blocked
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {director.is_blocked ? 'Bloqué' : 'Actif'}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {director.role || 'DIRECTOR'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={fetchDirectorDetails}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Actualiser"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowBlockConfirm(true)}
                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                title={director.is_blocked ? 'Débloquer' : 'Bloquer'}
              >
                {director.is_blocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => navigate(`/admin/managers/${director.id}/edit`)}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Modifier"
              >
                <Edit className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              <div className="relative">
                <button
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Onglets */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`flex-1 px-6 py-4 text-sm font-medium text-center transition-colors ${
                      activeTab === 'info'
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Users className="w-4 h-4" />
                      Informations
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('hotels')}
                    className={`flex-1 px-6 py-4 text-sm font-medium text-center transition-colors ${
                      activeTab === 'hotels'
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Building className="w-4 h-4" />
                      Hôtels ({hotels.length})
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`flex-1 px-6 py-4 text-sm font-medium text-center transition-colors ${
                      activeTab === 'activity'
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Activity className="w-4 h-4" />
                      Activité
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Contenu des onglets */}
              <div className="p-6">
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Informations personnelles</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">Nom complet</p>
                            <p className="font-medium text-gray-900">
                              {director.first_name} {director.last_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Nom d'utilisateur</p>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">@{director.username}</p>
                              <button
                                onClick={() => handleCopyToClipboard(director.username)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <div className="flex items-center gap-2">
                              <a
                                href={`mailto:${director.email}`}
                                className="font-medium text-indigo-600 hover:text-indigo-800"
                              >
                                {director.email}
                              </a>
                              <button
                                onClick={() => handleCopyToClipboard(director.email)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Téléphone</p>
                            <div className="flex items-center gap-2">
                              <a
                                href={`tel:${director.phone_number}`}
                                className="font-medium text-gray-900"
                              >
                                {formatPhoneNumber(director.phone_number)}
                              </a>
                              {director.phone_number && (
                                <button
                                  onClick={() => handleCopyToClipboard(director.phone_number!)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Statistiques</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500">Hôtels gérés</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total_hotels}</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4">
                            <p className="text-sm text-green-600">Hôtels actifs</p>
                            <p className="text-2xl font-bold text-green-700">{stats.active_hotels}</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm text-blue-600">Chambres totales</p>
                            <p className="text-2xl font-bold text-blue-700">{stats.total_rooms}</p>
                          </div>
                          <div className="bg-yellow-50 rounded-lg p-4">
                            <p className="text-sm text-yellow-600">Note moyenne</p>
                            <p className="text-2xl font-bold text-yellow-700">{stats.avg_rating}/5</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Actions rapides</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setShowResetPassword(true)}
                          className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Key className="w-4 h-4" />
                          Réinitialiser le mot de passe
                        </button>
                        <button
                          onClick={() => window.open(`mailto:${director.email}`)}
                          className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          Envoyer un email
                        </button>
                        {director.phone_number && (
                          <button
                            onClick={() => window.open(`tel:${director.phone_number}`)}
                            className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <PhoneCall className="w-4 h-4" />
                            Appeler
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/admin/hotels?manager=${director.id}`)}
                          className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Building className="w-4 h-4" />
                          Voir tous les hôtels
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'hotels' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Hôtels assignés</h3>
                        <p className="text-gray-600">Liste des hôtels gérés par ce directeur</p>
                      </div>
                      <button
                        onClick={fetchDirectorHotels}
                        disabled={loadingHotels}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${loadingHotels ? 'animate-spin' : ''}`} />
                        Actualiser
                      </button>
                    </div>

                    {hotelError && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600">{hotelError}</p>
                      </div>
                    )}

                    {loadingHotels ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="text-gray-600 mt-2">Chargement des hôtels...</p>
                      </div>
                    ) : hotels.length === 0 ? (
                      <div className="text-center py-12">
                        <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun hôtel assigné</h4>
                        <p className="text-gray-600 mb-4">Ce directeur ne gère aucun hôtel pour le moment.</p>
                        <Link
                          to="/admin/hotels/create"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          <Building className="w-4 h-4" />
                          Créer un hôtel
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {hotels.map((hotel) => (
                          <div
                            key={hotel.id}
                            className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                          >
                            {/* Image de couverture */}
                            <div className="h-48 bg-gray-200 relative">
                              {hotel.images?.[0] ? (
                                <img
                                  src={hotel.images[0].image}
                                  alt={hotel.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                                  <Building className="w-12 h-12 text-indigo-400" />
                                </div>
                              )}
                              <div className="absolute top-3 right-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  hotel.is_active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {hotel.is_active ? 'Actif' : 'Inactif'}
                                </span>
                              </div>
                            </div>

                            {/* Contenu */}
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-bold text-gray-900 line-clamp-1">{hotel.name}</h4>
                                <button
                                  onClick={() => setSelectedHotel(selectedHotel?.id === hotel.id ? null : hotel)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <MapPin className="w-4 h-4" />
                                  <span>{hotel.city}, {hotel.country}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="w-4 h-4" />
                                  <span>{hotel.phone || 'Non renseigné'}</span>
                                </div>

                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Bed className="w-4 h-4 text-gray-400" />
                                    <span>{hotel.rooms?.length || 0} chambres</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span>{hotel.average_rating || 'N/A'}/5</span>
                                  </div>
                                </div>

                                {/* Équipements */}
                                {hotel?.rooms && hotel.rooms.length > 0 && (
                                  <div className="pt-2 border-t border-gray-100">
                                    <div className="flex flex-wrap gap-2">
                                      {hotel.rooms
                                        .flatMap(room => room.amenities || []) // récupérer toutes les amenities
                                        .slice(0, 3) // seulement 3 premières
                                        .map((amenity, index) => (
                                          <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                            title={amenity}
                                          >
                                            {getAmenityIcon(amenity)}
                                            {amenity}
                                          </span>
                                    ))}
                                      {hotel.rooms.flatMap(room => room.amenities || []).length > 3 && (
                                        <span className="text-xs text-gray-500">
                                          +{hotel.rooms.flatMap(room => room.amenities || []).length - 3} autres
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="pt-4 mt-4 border-t border-gray-100">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => navigate(`/admin/hotels/${hotel.id}`)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Voir détails
                                  </button>
                                  <button
                                    onClick={() => navigate(`/admin/hotels/${hotel.id}/edit`)}
                                    className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    title="Modifier"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Activité récente</h3>
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <Building className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Hôtels gérés</p>
                                <p className="text-sm text-gray-600">{stats.total_hotels} hôtel(s) assigné(s)</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Statut du compte</p>
                                <p className="text-sm text-gray-600">
                                  {director.is_blocked ? 'Compte bloqué' : 'Compte actif'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Performance</h3>
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-6 text-white">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-sm opacity-90">Score de gestion</p>
                              <p className="text-3xl font-bold">
                                {(stats.total_hotels > 0 ? 80 + (stats.active_hotels * 5) : 0)}/100
                              </p>
                            </div>
                            <TrendingUp className="w-8 h-8 opacity-80" />
                          </div>
                          <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                            <div
                              className="bg-white h-2 rounded-full"
                              style={{ width: `${stats.total_hotels > 0 ? 80 + (stats.active_hotels * 5) : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Système</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-500">Date de création</p>
                          <p className="font-medium text-gray-900">
                            {director.created_at ? formatDate(director.created_at) : 'Non disponible'}
                          </p>
                        </div>
                        {/* <div className="p-4 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-500">Dernière connexion</p>
                          <p className="font-medium text-gray-900">
                            {director.last_login ? formatDate(director.last_login) : 'Jamais'}
                          </p>
                        </div> */}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-8">
            {/* Carte Profil */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Profil</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">ID</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                        #{director.id}
                      </code>
                      <button
                        onClick={() => handleCopyToClipboard(director.id.toString())}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Rôle</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Shield className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium">Directeur d'hôtel</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Permissions</p>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Gestion des hôtels assignés</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Gestion des réservations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Gestion des équipes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte Contacts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Contact</h3>
                
                <div className="space-y-4">
                  <button
                    onClick={() => window.open(`mailto:${director.email}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{director.email}</p>
                    </div>
                  </button>
                  
                  {director.phone_number && (
                    <button
                      onClick={() => window.open(`tel:${director.phone_number}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Téléphone</p>
                        <p className="text-sm text-gray-600">{formatPhoneNumber(director.phone_number)}</p>
                      </div>
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowResetPassword(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Key className="w-5 h-5 text-gray-400" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Sécurité</p>
                      <p className="text-sm text-gray-600">Réinitialiser le mot de passe</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Carte Statistiques */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-6">Aperçu</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Hôtels actifs</span>
                  <span className="font-bold">{stats.active_hotels}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Chambres totales</span>
                  <span className="font-bold">{stats.total_rooms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Note moyenne</span>
                  <span className="font-bold">{stats.avg_rating}/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Statut</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    director.is_blocked
                      ? 'bg-red-400 text-white'
                      : 'bg-green-400 text-white'
                  }`}>
                    {director.is_blocked ? 'Bloqué' : 'Actif'}
                  </span>
                </div>
              </div>
              
              {/* <div className="mt-6 pt-6 border-t border-white border-opacity-30">
                <p className="text-sm opacity-90">Dernière activité</p>
                <p className="font-medium">
                  {director.last_login ? formatDate(director.last_login) : 'Jamais connecté'}
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorDetailPage;