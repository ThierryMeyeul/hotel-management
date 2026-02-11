// src/components/shared/HotelCard.tsx
import React from 'react';
import type { Hotel } from '../types/hotel';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Building, 
  Bed, 
  Calendar, 
  Star, 
  User, 
  CheckCircle, 
  XCircle,
  Eye,
  Settings,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface HotelCardProps {
  hotel: Hotel;
  onViewDetails?: (hotel: Hotel) => void;
  showDistance?: boolean;
  highlight?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
}

const HotelCard: React.FC<HotelCardProps> = ({ 
  hotel, 
  onViewDetails, 
  showDistance = false, 
  highlight = false,
  variant = 'default',
  showActions = true
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(hotel);
    }

    let route = `/hotels/${hotel.id}`;
    
    if (isAuthenticated && user) {
      const userRole = user.role.toLowerCase();
      
      switch (userRole) {
        case 'admin':
          route = `/admin/hotels/${hotel.id}`;
          break;
        case 'director':
          route = `/director/hotels/list/${hotel.id}`;
          break;
        case 'client':
          route = `/client/hotels/${hotel.id}`;
          break;
        default:
          route = `/hotels/${hotel.id}`;
      }
    }

    navigate(route);
  };

  const handleManageHotel = () => {
    if (isAuthenticated && user && user.role.toLowerCase() === 'director') {
      navigate(`/director/hotels/${hotel.id}`);
    } else {
      navigate(`/admin/hotels/${hotel.id}`);
    }
  };

  const websiteUrl = hotel.website &&
    (hotel.website.startsWith('http://') || hotel.website.startsWith('https://')
      ? hotel.website
      : `https://${hotel.website}`);

  // Calculer les statistiques

  const roomsHotel = hotel.rooms ?? [];
  const imagesHotel = hotel.images ?? [];
  const availableRooms = roomsHotel.filter(room => room.is_available).length;
  const stats = {
    totalRooms: roomsHotel.length,
    availableRooms,
    totalImages: imagesHotel.length,
    occupancyRate:
      roomsHotel.length > 0
        ? Math.round(((roomsHotel.length - availableRooms) / roomsHotel.length) * 100)
        : 0
  };
  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Rendu compact
  if (variant === 'compact') {
    return (
      <div className={`
        group bg-white rounded-xl border border-gray-200 overflow-hidden 
        hover:shadow-md transition-all duration-300 hover:-translate-y-1
        ${highlight ? 'border-indigo-300 bg-indigo-50' : ''}
      `}>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 truncate">{hotel.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${hotel.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {hotel.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{hotel.city}, {hotel.country}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Bed className="w-3 h-3" />
                  {stats.totalRooms} chambres
                </span>
                {stats.totalImages > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {stats.totalImages} images
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleViewDetails}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Rendu détaillé
  if (variant === 'detailed') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-6">
          {/* En-tête */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{hotel.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${hotel.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {hotel.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{hotel.address} • {hotel.city}, {hotel.country}</span>
                </div>
              </div>
            </div>
            {showDistance && hotel.distance !== undefined && (
              <div className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">
                {hotel.distance.toFixed(1)} km
              </div>
            )}
          </div>

          {/* Grille d'informations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Informations de base */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 mb-3">Informations générales</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">ID de l'hôtel</div>
                  <div className="font-medium text-gray-900">#{hotel.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Manager</div>
                  <div className="font-medium text-gray-900">
                    {hotel.manager ? `ID: ${hotel.manager}` : 'Non assigné'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Coordonnées GPS</div>
                  <div className="font-medium text-gray-900">
                    {hotel.latitude}, {hotel.longitude}
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 mb-3">Statistiques</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-blue-600">Chambres totales</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalRooms}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-green-600">Chambres dispo.</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.availableRooms}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-sm text-purple-600">Taux occupation</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-sm text-yellow-600">Images</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalImages}</div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 mb-3">Contact</h3>
              <div className="space-y-3">
                {hotel.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Téléphone</div>
                      <div className="font-medium text-gray-900">{hotel.phone}</div>
                    </div>
                  </div>
                )}
                
                {hotel.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium text-gray-900 truncate">{hotel.email}</div>
                    </div>
                  </div>
                )}
                
                {websiteUrl && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Site web</div>
                      <a 
                        href={websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-purple-600 hover:text-purple-700 hover:underline"
                      >
                        {hotel.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {hotel.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                {hotel.description}
              </p>
            </div>
          )}

          {/* Métadonnées */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <div>
                <div className="text-gray-500">Créé le</div>
                <div className="font-medium">{formatDate(hotel.created_at)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <div>
                <div className="text-gray-500">Mis à jour le</div>
                <div className="font-medium">{formatDate(hotel.updated_at)}</div>
              </div>
            </div>
            {/* <div className="flex items-center gap-3 text-sm text-gray-600">
              <Building className="w-4 h-4" />
              <div>
                <div className="text-gray-500">Location</div>
                <div className="font-medium truncate">{hotel.location}</div>
              </div>
            </div> */}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={handleViewDetails}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Voir les détails
              </button>
              
              {(isAuthenticated && (user?.role.toLowerCase() === 'admin' || user?.role.toLowerCase() === 'director')) && (
                <button
                  onClick={handleManageHotel}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Gérer l'hôtel
                </button>
              )}
              
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Visiter le site
                </a>
              )}
              
              {hotel.email && (
                <a
                  href={`mailto:${hotel.email}`}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Envoyer un email
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Rendu par défaut (comme avant mais amélioré)
  return (
    <div className={`
      group relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 
      transition-all duration-300 hover:shadow-xl hover:-translate-y-1
      ${highlight 
        ? 'border-indigo-500 ring-2 ring-indigo-100 ring-opacity-50' 
        : 'border-gray-100 hover:border-indigo-200'
      }
    `}>
      {/* Badge de statut */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${hotel.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {hotel.is_active ? 'Actif' : 'Inactif'}
        </span>
      </div>
      
      {/* Image de l'hôtel */}
      <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
        {hotel.images && hotel.images.length > 0 ? (
          <img 
            src={hotel.images[0].image} 
            alt={hotel.images[0].caption || hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🏨</div>
              <p className="text-gray-500 font-medium">{hotel.name}</p>
            </div>
          </div>
        )}
        
        {/* Overlay avec informations rapides */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div>
              <div className="text-sm font-medium">ID: #{hotel.id}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-sm">
                <Bed className="w-3 h-3" />
                {stats.totalRooms}
              </span>
              {stats.totalImages > 0 && (
                <span className="flex items-center gap-1 text-sm">
                  <Eye className="w-3 h-3" />
                  {stats.totalImages}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {/* En-tête avec nom et localisation */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
            {hotel.name}
          </h3>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 text-red-500" />
            <span className="font-medium">{hotel.city}, {hotel.country}</span>
          </div>
        </div>

        {/* Description */}
        {hotel.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {hotel.description}
          </p>
        )}

        {/* Informations de contact en colonne */}
        <div className="space-y-3 mb-4">
          {hotel.phone && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Téléphone</div>
                <div className="font-medium text-gray-900">{hotel.phone}</div>
              </div>
            </div>
          )}
          
          {hotel.email && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Email</div>
                <div className="font-medium text-gray-900 truncate">{hotel.email}</div>
              </div>
            </div>
          )}
          
          {websiteUrl && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Site web</div>
                <a 
                  href={websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-purple-600 hover:text-purple-700 hover:underline truncate block"
                >
                  {hotel.website}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-xs text-blue-600">Chambres</div>
            <div className="font-bold text-gray-900">{stats.totalRooms}</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="text-xs text-green-600">Disponibles</div>
            <div className="font-bold text-gray-900">{stats.availableRooms}</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <div className="text-xs text-purple-600">Occupation</div>
            <div className="font-bold text-gray-900">{stats.occupancyRate}%</div>
          </div>
        </div>

        {/* Informations additionnelles */}
        <div className="text-xs text-gray-500 mb-4 space-y-1">
          <div className="flex items-center justify-between">
            <span>Créé le:</span>
            <span className="font-medium">{formatDate(hotel.created_at)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Manager:</span>
            <span className="font-medium">
              {hotel.manager ? `ID ${hotel.manager}` : 'Non assigné'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={handleViewDetails}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Détails
          </button>
          
          {(isAuthenticated && (user?.role.toLowerCase() === 'director')) && (
            <button
              onClick={handleManageHotel}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Gérer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelCard;