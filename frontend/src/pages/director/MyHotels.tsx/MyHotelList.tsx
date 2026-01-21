import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building,
  Search,
  Filter,
  Plus,
  MapPin,
  Phone,
  Mail,
  Globe,
  Eye,
  Edit,
  Home,
  Image as ImageIcon,
  ChevronRight,
  Star,
  CheckCircle,
  XCircle,
  Loader as LoaderIcon,
  AlertCircle,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';
import Loader from '../../../components/Loader';
import { hotelService } from '../../../services/hotel.service';
import type { Hotel } from '../../../types/hotel';

const MyHotelList: React.FC = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hotelService.getDirectorHotels();
      setHotels(data);
    } catch (err: any) {
      console.error('Erreur chargement hôtels:', err);
      setError(err.message || 'Erreur lors du chargement des hôtels');
    } finally {
      setLoading(false);
    }
  };

  const toggleHotelStatus = async (hotel: Hotel) => {
    try {
      setUpdatingStatus(hotel.id);
      const updatedHotel = await hotelService.updateHotelStatus(hotel.id, !hotel.is_active);
      setHotels(prev => prev.map(h => h.id === hotel.id ? updatedHotel : h));
    } catch (err: any) {
      console.error('Erreur changement statut:', err);
      alert(err.message || 'Erreur lors du changement de statut');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = 
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.country.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && hotel.is_active) ||
      (filterStatus === 'inactive' && !hotel.is_active);

    return matchesSearch && matchesStatus;
  });

  const getTotalRooms = (hotel: Hotel) => hotel.rooms?.length || 0;
  const getAvailableRooms = (hotel: Hotel) => hotel.rooms?.filter(r => r.is_available).length || 0;

  if (loading) return <Loader fullScreen text="Chargement de vos hôtels..." />;

  return (
    <div className="max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mes Hôtels</h1>
                <p className="text-gray-600 mt-1">
                  Gérez tous vos hôtels depuis cette interface
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              <span className="font-medium">{hotels.length}</span> hôtel(s) au total • 
              <span className="font-medium ml-2">
                {hotels.reduce((sum, hotel) => sum + getTotalRooms(hotel), 0)}
              </span> chambre(s)
            </div>
          </div>
          
          <Link
            to="/director/hotels/create"
            className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow"
          >
            <Plus className="w-5 h-5" />
            Ajouter un hôtel
          </Link>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-red-800">Erreur</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={fetchHotels}
              className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Barre de contrôle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un hôtel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs seulement</option>
              <option value="inactive">Inactifs seulement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Hôtels Actifs</p>
              <p className="text-2xl font-bold text-blue-900">
                {hotels.filter(h => h.is_active).length}
              </p>
            </div>
            <Building className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Total Chambres</p>
              <p className="text-2xl font-bold text-green-900">
                {hotels.reduce((sum, hotel) => sum + getTotalRooms(hotel), 0)}
              </p>
            </div>
            <Home className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Chambres Disponibles</p>
              <p className="text-2xl font-bold text-purple-900">
                {hotels.reduce((sum, hotel) => sum + getAvailableRooms(hotel), 0)}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700 font-medium">Taux d'occupation</p>
              <p className="text-2xl font-bold text-amber-900">
                {(() => {
                  const total = hotels.reduce((sum, hotel) => sum + getTotalRooms(hotel), 0);
                  const available = hotels.reduce((sum, hotel) => sum + getAvailableRooms(hotel), 0);
                  return total > 0 ? `${Math.round(((total - available) / total) * 100)}%` : '0%';
                })()}
              </p>
            </div>
            <Users className="w-8 h-8 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Liste des hôtels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredHotels.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm ? 'Aucun hôtel trouvé' : 'Aucun hôtel'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchTerm 
                ? 'Aucun hôtel ne correspond à votre recherche.'
                : 'Commencez par ajouter votre premier hôtel.'}
            </p>
            {!searchTerm && (
              <Link
                to="/director/hotels/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                Ajouter un hôtel
              </Link>
            )}
          </div>
        ) : (
          filteredHotels.map((hotel) => (
            <div key={hotel.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow">
              {/* En-tête */}
              <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-50">
                {hotel.images && hotel.images.length > 0 ? (
                  <img
                    src={hotel.images[0].image}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building className="w-16 h-16 text-blue-400" />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    hotel.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {hotel.is_active ? 'Actif' : 'Inactif'}
                  </div>
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {getTotalRooms(hotel)} chambres
                  </div>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{hotel.name}</h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{hotel.city}, {hotel.country}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleHotelStatus(hotel)}
                    disabled={updatingStatus === hotel.id}
                    className={`p-2 rounded-lg transition-colors ${
                      hotel.is_active
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-green-600 hover:bg-green-50'
                    } disabled:opacity-50`}
                    title={hotel.is_active ? 'Désactiver' : 'Activer'}
                  >
                    {updatingStatus === hotel.id ? (
                      <LoaderIcon className="w-5 h-5 animate-spin" />
                    ) : hotel.is_active ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Description */}
                {hotel.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {hotel.description}
                  </p>
                )}

                {/* Contact info */}
                <div className="space-y-2 mb-6">
                  {hotel.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 truncate">{hotel.email}</span>
                    </div>
                  )}
                  {hotel.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{hotel.phone}</span>
                    </div>
                  )}
                  {hotel.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-blue-600 hover:underline truncate">{hotel.website}</span>
                    </div>
                  )}
                </div>

                {/* Stats chambres */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{getTotalRooms(hotel)}</div>
                    <div className="text-xs text-gray-600">Total chambres</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-900">{getAvailableRooms(hotel)}</div>
                    <div className="text-xs text-green-600">Disponibles</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => navigate(`/director/hotels/${hotel.id}`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Voir les détails"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => navigate(`/director/hotels/${hotel.id}/edit`)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => navigate(`/director/hotels/${hotel.id}/rooms`)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Gérer les chambres"
                  >
                    <Home className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => navigate(`/director/hotels/${hotel.id}/images`)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Gérer les images"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Bouton principal */}
                <button
                  onClick={() => navigate(`/director/hotels/${hotel.id}`)}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors group"
                >
                  <span>Gérer cet hôtel</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyHotelList;