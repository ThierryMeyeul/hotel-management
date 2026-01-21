// src/components/director/hotels/HotelRooms.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Bed,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  DollarSign,
  Users,
  Calendar,
  Star,
  MoreVertical,
  Download,
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { hotelService } from '../../../../services/hotel.service';
import type { Hotel, Room } from '../../../../types/hotel';
import { toast } from 'react-toastify';

const HotelRooms: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');

  useEffect(() => {
    if (id) {
      fetchHotelDetails();
    }
  }, [id]);

  const fetchHotelDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const hotelData = await hotelService.getHotelDetails(parseInt(id!));
      setHotel(hotelData);
      setRooms(hotelData.rooms ?? []);
      
    } catch (err: any) {
      console.error('Erreur API:', err);
      setError(err.response?.data?.message || 'Erreur de connexion au serveur');
      toast.error('Impossible de charger les détails de l\'hôtel');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les chambres
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.room_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || room.room_type === typeFilter;
    const matchesAvailability = 
      availabilityFilter === 'all' || 
      (availabilityFilter === 'available' && room.is_available) ||
      (availabilityFilter === 'occupied' && !room.is_available);
    
    return matchesSearch && matchesType && matchesAvailability;
  });

  // Obtenir les types de chambre uniques
  const getUniqueRoomTypes = () => {
    return [...new Set(rooms.map(room => room.room_type))];
  };

  // Calculer les statistiques
  const calculateStats = () => {
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter(room => room.is_available).length;
    const averagePrice = rooms.length > 0 
      ? rooms.reduce((sum, room) => sum + parseFloat(room.price_per_night), 0) / rooms.length
      : 0;
    
    return {
      totalRooms,
      availableRooms,
      occupiedRooms: totalRooms - availableRooms,
      occupancyRate: totalRooms > 0 ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) : 0,
      averagePrice: averagePrice.toFixed(2),
      totalRevenue: rooms.reduce((sum, room) => sum + parseFloat(room.price_per_night), 0).toFixed(2)
    };
  };

  const stats = calculateStats();

  if (loading && !hotel) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {error || 'Hôtel non trouvé'}
        </h3>
        <button
          onClick={() => navigate('/director/hotels')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/director/hotels')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chambres - {hotel.name}
            </h1>
            <p className="text-gray-600">
              {hotel.city}, {hotel.country} • Gestion des chambres
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/director/hotels/${id}/rooms/add`)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter une chambre
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Chambres</p>
              <p className="text-2xl font-bold mt-1">{stats.totalRooms}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Bed className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Disponibles</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{stats.availableRooms}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Occupation</p>
              <p className="text-2xl font-bold mt-1 text-orange-600">{stats.occupancyRate}%</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Prix Moyen</p>
              <p className="text-2xl font-bold mt-1">{stats.averagePrice} €</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par numéro ou type..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <select
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Tous les types</option>
              {getUniqueRoomTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          <div className="relative">
            <select
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <option value="all">Toutes les disponibilités</option>
              <option value="available">Disponible</option>
              <option value="occupied">Occupée</option>
            </select>
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Liste des chambres */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <Bed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune chambre trouvée
            </h3>
            <p className="text-gray-600 mb-6">
              {rooms.length === 0 
                ? 'Cet hôtel n\'a pas encore de chambres'
                : 'Aucune chambre ne correspond à vos critères'
              }
            </p>
            {rooms.length === 0 && (
              <button
                onClick={() => navigate(`/director/hotels/${id}/rooms/add`)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Ajouter la première chambre
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                    Numéro
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                    Prix/Nuit
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                    Disponibilité
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
                          <Bed className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{room.room_number}</div>
                          <div className="text-xs text-gray-500">ID: {room.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {room.room_type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{room.price_per_night} €</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {room.is_available ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-green-600 font-medium">Disponible</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-red-600 font-medium">Occupée</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/director/hotels/${id}/rooms/${room.id}/edit`)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-red-50 rounded-lg transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelRooms;