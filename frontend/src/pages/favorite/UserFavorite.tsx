// src/components/director/favorites/UserFavorites.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  HeartOff,
  ExternalLink,
  Loader2,
  AlertCircle,
  RefreshCw,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Home,
  Hotel,
  Award,
  ThumbsUp,
  Share2,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Bed,
  Bath,
  Square,
  Wifi,
  Coffee,
  Car,
  Dumbbell,
  Sparkles,
  Shield,
  Settings,
  Filter,
  Search,
  Grid,
  List,
  ArrowUpDown
} from 'lucide-react';
import { hotelService } from '../../services/hotel.service';
import { getUserInfo } from '../../services/auth.service';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-toastify';

// Types pour les hôtels favoris
interface HotelImage {
  id: number;
  image: string;
  caption: string;
  is_cover: boolean;
}

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
  created_at: string;
  updated_at: string;
  images: HotelImage[];
  rooms: any[];
  is_active: boolean;
  distance?: number | null;
  is_favorite: boolean;
  total_favorites: number;
}

// Types pour les filtres
interface Filters {
  search: string;
  sortBy: 'name' | 'city' | 'created_at' | 'total_favorites';
  sortOrder: 'asc' | 'desc';
}

// Types pour la vue
type ViewMode = 'grid' | 'list';

// Type pour le rôle utilisateur
type UserRole = 'admin' | 'director' | 'client' | string;

const UserFavorites: React.FC = () => {
  const navigate = useNavigate();
  
  // États pour les données
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('client');
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  
  // États pour les filtres
  const [filters, setFilters] = useState<Filters>({
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  
  // État pour le mode d'affichage
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // État pour le menu d'actions
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  
  // État pour le chargement des actions
  const [removingFavorite, setRemovingFavorite] = useState<number | null>(null);

  // Récupérer le rôle utilisateur au chargement
  useEffect(() => {
    const role = getUserInfo()?.role || 'client';
    const roleLower = role.toLowerCase();
    setUserRole(roleLower);
  }, []);

  // Charger les favoris
  useEffect(() => {
    fetchFavorites();
  }, []);

  // Appliquer les filtres et le tri
  useEffect(() => {
    if (hotels.length > 0) {
      applyFiltersAndSort();
    }
  }, [filters, hotels]);

  // Fonction pour obtenir le chemin de redirection selon le rôle
  const getRedirectPath = (basePath: string): string => {
    const role = getUserInfo()?.role || 'client';
    const roleLower = role.toLowerCase();
    
    // Mapping des chemins selon le rôle
    const pathMappings: Record<string, Record<string, string>> = {
      hotels: {
        admin: '/admin/hotels',
        director: '/director/hotels',
        client: '/client/hotels'
      },
      hotelDetails: {
        admin: '/admin/hotels',
        director: '/director/hotels',
        client: '/client/hotels'
      },
      dashboard: {
        admin: '/admin/dashboard',
        director: '/director/dashboard',
        client: '/client/dashboard'
      },
      exploreHotels: {
        admin: '/admin/hotels',
        director: '/director/hotels',
        client: '/client/hotels'
      },
      managerDetails: {
        admin: '/admin/hotels',
        director: '/director/hotels',
        client: '/client/hotels'
      }
    };

    // Retourne le chemin approprié ou le chemin par défaut
    return pathMappings[basePath]?.[roleLower] || `/${roleLower}/${basePath}`;
  };

  // Fonction pour obtenir le préfixe de route selon le rôle
  const getRoutePrefix = (): string => {
    const role = getUserInfo()?.role || 'client';
    const roleLower = role.toLowerCase();
    return `/${roleLower}`;
  };

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await hotelService.getMyFavoriteHotels();
      
      // La réponse est directement un tableau d'hôtels
      const favoritesData = Array.isArray(response) ? response : [];
      
      setHotels(favoritesData);
      
      if (favoritesData.length === 0) {
        toast.info('Vous n\'avez pas encore d\'hôtels favoris');
      }
      
    } catch (err: any) {
      console.error('Erreur lors du chargement des favoris:', err);
      setError(err.response?.data?.message || 'Erreur de connexion au serveur');
      toast.error('Impossible de charger vos favoris');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...hotels];

    // Filtre par recherche
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(hotel => 
        hotel.name.toLowerCase().includes(searchTerm) ||
        hotel.city.toLowerCase().includes(searchTerm) ||
        hotel.country.toLowerCase().includes(searchTerm) ||
        hotel.address.toLowerCase().includes(searchTerm) ||
        hotel.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'city':
          aValue = a.city.toLowerCase();
          bValue = b.city.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'total_favorites':
          aValue = a.total_favorites || 0;
          bValue = b.total_favorites || 0;
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredHotels(filtered);
    setCurrentPage(1);
  };

  // Gérer le changement de filtre
  const handleFilterChange = (field: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Gérer le tri
  const handleSort = (field: 'name' | 'city' | 'created_at' | 'total_favorites') => {
    if (filters.sortBy === field) {
      setFilters(prev => ({
        ...prev,
        sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        sortBy: field,
        sortOrder: 'desc'
      }));
    }
  };

  // Supprimer des favoris
  const handleRemoveFavorite = async (hotelId: number) => {
    try {
      setRemovingFavorite(hotelId);
      
      await hotelService.toogleFavoriteHotel(hotelId);
      
      // Mettre à jour la liste locale
      setHotels(prev => prev.filter(hotel => hotel.id !== hotelId));
      
      toast.success('Hôtel retiré des favoris');
    } catch (err) {
      console.error('Erreur lors de la suppression des favoris:', err);
      toast.error('Impossible de retirer cet hôtel des favoris');
    } finally {
      setRemovingFavorite(null);
      setActiveMenu(null);
    }
  };

  // Voir les détails de l'hôtel selon le rôle
  const handleViewHotel = (hotelId: number) => {
    const role = getUserInfo()?.role || 'client';
    const roleLower = role.toLowerCase();    
    switch(roleLower) {
      case 'admin':
        navigate(`/admin/hotels/${hotelId}`);
        break;
      case 'director':
        navigate(`/director/hotels/${hotelId}`);
        break;
      case 'client':
        navigate(`/client/hotels/${hotelId}`);
        break;
      default:
        navigate(`/client/hotels/${hotelId}`);
    }
  };

  // Voir le manager de l'hôtel selon le rôle
  const handleViewManager = (hotelId: number) => {
    const role = getUserInfo()?.role || 'client';
    const roleLower = role.toLowerCase();
    
    switch(roleLower) {
      case 'admin':
        navigate(`/admin/hotels/${hotelId}/manager`);
        break;
      case 'director':
        navigate(`/director/hotels/${hotelId}/manager`);
        break;
      case 'client':
        toast.info('Cette fonctionnalité n\'est pas disponible pour les clients');
        break;
      default:
        toast.info('Cette fonctionnalité n\'est pas disponible');
    }
  };

  // Explorer les hôtels selon le rôle
  const handleExploreHotels = () => {
    const role = getUserInfo()?.role || 'client';
    const roleLower = role.toLowerCase();
    switch(roleLower) {
      case 'admin':
        navigate('/admin/hotels');
        break;
      case 'director':
        navigate('/director/hotels');
        break;
      case 'client':
        navigate('/client/hotels');
        break;
      default:
        navigate('/client/hotels');
    }
  };

  // Retour au tableau de bord selon le rôle
  const handleBackToDashboard = () => {
    const role = getUserInfo()?.role || 'client';
    const roleLower = role.toLowerCase();
    switch(roleLower) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'director':
        navigate('/director/dashboard');
        break;
      case 'client':
        navigate('/client/dashboard');
        break;
      default:
        navigate('/client/dashboard');
    }
  };

  // Partager l'hôtel
  const handleShareHotel = (hotel: Hotel) => {
    const role = getUserInfo()?.role || 'client';
    const roleLower = role.toLowerCase();
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/${roleLower}/hotels/${hotel.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Lien copié dans le presse-papier');
  };

  // Nettoyer les filtres
  const clearFilters = () => {
    setFilters({
      search: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  // Obtenir l'image de couverture
  const getCoverImage = (hotel: Hotel): string => {
    const coverImage = hotel.images?.find(img => img.is_cover);
    return coverImage?.image || hotel.images?.[0]?.image || '';
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch {
      return dateString;
    }
  };

  // Obtenir le libellé du rôle pour l'affichage
  const getRoleLabel = (): string => {
    const role = getUserInfo()?.role || 'client';
    const roleLower = role.toLowerCase();
    switch(roleLower) {
      case 'admin':
        return 'Administrateur';
      case 'director':
        return 'Directeur';
      case 'client':
        return 'Client';
      default:
        return 'Utilisateur';
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHotels = filteredHotels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-rose-50 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <Heart className="w-20 h-20 text-rose-400 opacity-75" />
          </div>
          <Heart className="w-20 h-20 text-rose-500 relative animate-pulse" />
        </div>
        <p className="text-gray-600 text-lg mt-8">Chargement de vos favoris...</p>
        <p className="text-gray-500 text-sm mt-2">Bienvenue {getRoleLabel()}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-rose-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header avec rôle utilisateur */}
        <div className="mb-8">
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Connecté en tant que</p>
                <p className="font-semibold text-gray-900">{getRoleLabel()}</p>
              </div>
            </div>
            <button
              onClick={handleBackToDashboard}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Tableau de bord
            </button>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                  <Heart className="w-8 h-8 text-white fill-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    Mes favoris
                  </h1>
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <Hotel className="w-4 h-4" />
                    {hotels.length} hôtel{hotels.length !== 1 ? 's' : ''} enregistré{hotels.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              {/* Statistiques rapides */}
              {hotels.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                        <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total favoris</p>
                        <p className="text-2xl font-bold text-gray-900">{hotels.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Villes</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {new Set(hotels.map(h => h.city)).size}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Plus favorisé</p>
                        <p className="text-xl font-bold text-gray-900 truncate max-w-[120px]">
                          {hotels.reduce((max, hotel) => 
                            (hotel.total_favorites || 0) > (max.total_favorites || 0) ? hotel : max
                          , hotels[0]).name.split(' ').slice(0, 2).join(' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ajouté le</p>
                        <p className="text-lg font-bold text-gray-900">
                          {hotels[0]?.created_at ? formatDate(hotels[0].created_at) : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Sélecteur de mode d'affichage */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 p-1 flex shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Vue grille"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Vue liste"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              
              <button
                onClick={fetchFavorites}
                className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-lg hover:from-rose-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        {hotels.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 mb-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Recherche */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher dans mes favoris
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Nom de l'hôtel, ville, pays..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all bg-white/50"
                  />
                </div>
              </div>
              
              {/* Tri */}
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all bg-white/50"
                >
                  <option value="created_at_desc">Ajout récent</option>
                  <option value="created_at_asc">Ajout ancien</option>
                  <option value="name_asc">Nom (A-Z)</option>
                  <option value="name_desc">Nom (Z-A)</option>
                  <option value="city_asc">Ville (A-Z)</option>
                  <option value="city_desc">Ville (Z-A)</option>
                  <option value="total_favorites_desc">Plus favorisés</option>
                  <option value="total_favorites_asc">Moins favorisés</option>
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
            
            {/* Résultats */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">{filteredHotels.length}</span> résultat{filteredHotels.length !== 1 ? 's' : ''} trouvé{filteredHotels.length !== 1 ? 's' : ''}
                  {filters.search && (
                    <> pour "<span className="font-medium">{filters.search}</span>"</>
                  )}
                </div>
                {filters.search && (
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="text-sm text-rose-600 hover:text-rose-800 font-medium"
                  >
                    Effacer la recherche
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contenu principal */}
        {error ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-12 text-center shadow-xl">
            <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Erreur de chargement
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {error}
            </p>
            <button
              onClick={fetchFavorites}
              className="px-8 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:from-rose-700 hover:to-pink-700 transition-all shadow-lg inline-flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Réessayer
            </button>
          </div>
        ) : hotels.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-12 text-center shadow-xl">
            <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartOff className="w-12 h-12 text-rose-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Aucun favori pour le moment
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              Vous n'avez pas encore ajouté d'hôtels à vos favoris.
              Explorez notre catalogue et ajoutez vos hôtels préférés !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleExploreHotels}
                className="px-8 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:from-rose-700 hover:to-pink-700 transition-all shadow-lg inline-flex items-center gap-2"
              >
                <Hotel className="w-5 h-5" />
                Découvrir des hôtels
              </button>
              <button
                onClick={handleBackToDashboard}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all inline-flex items-center gap-2"
              >
                <Home className="w-5 h-5" />
                Retour au tableau de bord
              </button>
            </div>
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-12 text-center shadow-xl">
            <Search className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Aucun résultat
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Aucun hôtel favori ne correspond à vos critères de recherche.
            </p>
            <button
              onClick={clearFilters}
              className="px-8 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:from-rose-700 hover:to-pink-700 transition-all shadow-lg"
            >
              Effacer tous les filtres
            </button>
          </div>
        ) : (
          <>
            {/* Vue Grille */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentHotels.map((hotel) => {
                  const coverImage = getCoverImage(hotel);
                  const role = getUserInfo()?.role || 'client';
                  const roleLower = role.toLowerCase();
                  return (
                    <div
                      key={hotel.id}
                      className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        {coverImage ? (
                          <img
                            src={coverImage}
                            alt={hotel.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                            <Building className="w-16 h-16 text-rose-400" />
                          </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-rose-600 text-xs font-bold rounded-full border border-rose-200 shadow-sm">
                            FAVORI
                          </span>
                          {hotel.total_favorites > 0 && (
                            <span className="px-3 py-1.5 bg-rose-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-sm flex items-center gap-1">
                              <Heart className="w-3 h-3 fill-white" />
                              {hotel.total_favorites}
                            </span>
                          )}
                        </div>
                        
                        {/* Menu d'actions */}
                        <div className="absolute top-4 right-4">
                          <div className="relative">
                            <button
                              onClick={() => setActiveMenu(activeMenu === hotel.id ? null : hotel.id)}
                              className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all shadow-md"
                            >
                              <MoreVertical className="w-5 h-5 text-gray-700" />
                            </button>
                            
                            {activeMenu === hotel.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-10"
                                  onClick={() => setActiveMenu(null)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden">
                                  <button
                                    onClick={() => {
                                      handleViewHotel(hotel.id);
                                      setActiveMenu(null);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                  >
                                    <Eye className="w-4 h-4 text-blue-500" />
                                    <span>Voir détails</span>
                                  </button>
                                  
                                  {/* Le bouton "Voir manager" n'est pas disponible pour les clients */}
                                  {roleLower !== 'client' && (
                                    <button
                                      onClick={() => {
                                        handleViewManager(hotel.id);
                                        setActiveMenu(null);
                                      }}
                                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                    >
                                      <Users className="w-4 h-4 text-emerald-500" />
                                      <span>Voir manager</span>
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => {
                                      handleShareHotel(hotel);
                                      setActiveMenu(null);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                  >
                                    <Share2 className="w-4 h-4 text-purple-500" />
                                    <span>Partager</span>
                                  </button>
                                  <div className="border-t border-gray-200 my-1" />
                                  <button
                                    onClick={() => handleRemoveFavorite(hotel.id)}
                                    disabled={removingFavorite === hotel.id}
                                    className="w-full px-4 py-3 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-3 transition-colors disabled:opacity-50"
                                  >
                                    {removingFavorite === hotel.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <HeartOff className="w-4 h-4" />
                                    )}
                                    <span>Retirer des favoris</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Contenu */}
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 hover:text-rose-600 transition-colors cursor-pointer line-clamp-1">
                              {hotel.name}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span className="line-clamp-1">
                                {hotel.city}, {hotel.country}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {hotel.description || 'Aucune description disponible'}
                        </p>
                        
                        {/* Contact rapide */}
                        <div className="space-y-2 mb-4">
                          {hotel.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4 flex-shrink-0" />
                              <a 
                                href={`tel:${hotel.phone}`}
                                className="hover:text-rose-600 transition-colors line-clamp-1"
                              >
                                {hotel.phone}
                              </a>
                            </div>
                          )}
                          {hotel.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4 flex-shrink-0" />
                              <a 
                                href={`mailto:${hotel.email}`}
                                className="hover:text-rose-600 transition-colors line-clamp-1"
                              >
                                {hotel.email}
                              </a>
                            </div>
                          )}
                        </div>
                        
                        {/* Statistiques */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Ajouté le {formatDate(hotel.created_at)}</span>
                          </div>
                          <button
                            onClick={() => handleViewHotel(hotel.id)}
                            className="text-rose-600 hover:text-rose-700 font-medium text-sm flex items-center gap-1"
                          >
                            Détails
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Vue Liste */}
            {viewMode === 'list' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
                <div className="divide-y divide-gray-200">
                  {currentHotels.map((hotel) => {
                    const coverImage = getCoverImage(hotel);
                    const role = getUserInfo()?.role || 'client';
                    const roleLower = role.toLowerCase();
                    return (
                      <div
                        key={hotel.id}
                        className="p-6 hover:bg-gray-50/50 transition-all duration-300"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                          {/* Image */}
                          <div className="lg:w-48 flex-shrink-0">
                            <div className="relative h-32 rounded-xl overflow-hidden">
                              {coverImage ? (
                                <img
                                  src={coverImage}
                                  alt={hotel.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                                  <Building className="w-8 h-8 text-rose-400" />
                                </div>
                              )}
                              <div className="absolute top-2 left-2">
                                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-rose-600 text-xs font-bold rounded-full border border-rose-200">
                                  FAVORI
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Informations */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 hover:text-rose-600 transition-colors">
                                  {hotel.name}
                                </h3>
                                <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{hotel.address}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                  <MapPin className="w-4 h-4 opacity-0" />
                                  <span>{hotel.city}, {hotel.country}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">Ajouté le</p>
                                  <p className="font-medium text-gray-900">{formatDate(hotel.created_at)}</p>
                                </div>
                                {hotel.total_favorites > 0 && (
                                  <div className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg flex items-center gap-1">
                                    <Heart className="w-4 h-4 fill-rose-600" />
                                    <span className="font-bold">{hotel.total_favorites}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {hotel.description || 'Aucune description disponible'}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-6">
                              {hotel.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="w-4 h-4" />
                                  <a href={`tel:${hotel.phone}`} className="hover:text-rose-600">
                                    {hotel.phone}
                                  </a>
                                </div>
                              )}
                              {hotel.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Mail className="w-4 h-4" />
                                  <a href={`mailto:${hotel.email}`} className="hover:text-rose-600">
                                    {hotel.email}
                                  </a>
                                </div>
                              )}
                              {hotel.website && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Globe className="w-4 h-4" />
                                  <a 
                                    href={hotel.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-rose-600"
                                  >
                                    Site web
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex lg:flex-col gap-2">
                            <button
                              onClick={() => handleViewHotel(hotel.id)}
                              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all flex items-center gap-2 shadow-sm"
                            >
                              <Eye className="w-4 h-4" />
                              Détails
                            </button>
                            
                            {/* Le bouton "Voir manager" n'est pas disponible pour les clients */}
                            {roleLower !== 'client' && (
                              <button
                                onClick={() => handleViewManager(hotel.id)}
                                className="px-4 py-2 border border-emerald-300 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all flex items-center gap-2"
                              >
                                <Users className="w-4 h-4" />
                                Manager
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleRemoveFavorite(hotel.id)}
                              disabled={removingFavorite === hotel.id}
                              className="px-4 py-2 border border-rose-300 text-rose-600 rounded-lg hover:bg-rose-50 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                              {removingFavorite === hotel.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <HeartOff className="w-4 h-4" />
                              )}
                              Retirer
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredHotels.length)}
                  </span>{' '}
                  sur <span className="font-medium">{filteredHotels.length}</span> hôtel{filteredHotels.length !== 1 ? 's' : ''}
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
                              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
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
            )}
          </>
        )}
        
        {/* Footer avec conseils */}
        {hotels.length > 0 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl text-white shadow-xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1">Explorez plus d'hôtels</h4>
                  <p className="text-white/90">
                    Découvrez d'autres établissements et enrichissez votre liste de favoris
                  </p>
                </div>
              </div>
              <button
                onClick={handleExploreHotels}
                className="px-6 py-3 bg-white text-rose-600 rounded-xl hover:bg-gray-50 transition-all font-bold flex items-center gap-2 shadow-lg whitespace-nowrap"
              >
                <Hotel className="w-5 h-5" />
                Explorer les hôtels
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFavorites;