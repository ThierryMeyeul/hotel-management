import React from 'react';
import type { Hotel } from '../types/hotel';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';

interface HotelCardProps {
  hotel: Hotel;
  onViewDetails?: (hotel: Hotel) => void;
  showDistance?: boolean;
  highlight?: boolean;
}

const HotelCard: React.FC<HotelCardProps> = ({ 
  hotel, 
  onViewDetails, 
  showDistance = false, 
  highlight = false 
}) => {
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(hotel);
    }
  };

//   const renderStars = (rating: number | null) => {
//     if (!rating) return null;
    
//     const stars = [];
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 >= 0.5;
    
//     for (let i = 0; i < fullStars; i++) {
//       stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />);
//     }
    
//     if (hasHalfStar) {
//       stars.push(<Star key="half" className="w-4 h-4 text-yellow-400 fill-current opacity-70" />);
//     }
    
//     const emptyStars = 5 - Math.ceil(rating);
//     for (let i = 0; i < emptyStars; i++) {
//       stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
//     }
    
//     return (
//       <div className="flex items-center gap-1">
//         {stars}
//         <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
//       </div>
//     );
//   };

  return (
    <div className={`
      group relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 
      transition-all duration-300 hover:shadow-xl hover:-translate-y-1
      ${highlight 
        ? 'border-indigo-500 ring-2 ring-indigo-100 ring-opacity-50' 
        : 'border-gray-100 hover:border-indigo-200'
      }
    `}>
      {/* Badge en surbrillance */}
      {highlight && (
        <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-indigo-600 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
          Recommandé
        </div>
      )}
      
      {/* Image de l'hôtel */}
      <div className="h-48 bg-gradient-to-br from-indigo-100 to-pink-50 relative overflow-hidden">
        {/* {hotel.image_url ? (
          <img 
            src={hotel.image_url} 
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🏨</div>
              <p className="text-gray-500 font-medium">{hotel.name}</p>
            </div>
          </div>
        )} */}
        
        {/* Overlay dégradé */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {/* En-tête avec nom et étoiles */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">
              {hotel.name}
            </h3>
            <div className="flex items-center gap-2">
              {/* {renderStars(hotel.rating)} */}
            </div>
          </div>
          
          {/* Distance et prix */}
          <div className="text-right space-y-2">
            {showDistance && hotel.distance !== undefined && (
              <div className="flex items-center justify-end gap-2 bg-gradient-to-r from-indigo-50 to-pink-50 text-indigo-700 px-3 py-1.5 rounded-lg">
                <span className="text-sm font-bold">{hotel.distance.toFixed(1)} km</span>
              </div>
            )}
            
            {/* {hotel.price_per_night !== null && hotel.price_per_night !== undefined && (
              <div className="text-lg font-bold text-gray-900">
                {hotel.price_per_night.toFixed(0)} <span className="text-gray-600 text-sm font-normal">€/nuit</span>
              </div>
            )} */}
          </div>
        </div>

        {/* Localisation */}
        <div className="flex items-start gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-gray-800 font-medium">{hotel.address}</p>
            <p className="text-gray-600 text-sm">{hotel.city}, {hotel.country}</p>
          </div>
        </div>

        {/* Informations de contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {hotel.phone && (
            <div className="flex items-center gap-3 p-2 hover:bg-blue-50 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-gray-700 font-medium">{hotel.phone}</span>
            </div>
          )}
          
          {hotel.email && (
            <div className="flex items-center gap-3 p-2 hover:bg-green-50 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-gray-700 font-medium truncate">{hotel.email}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {hotel.description && (
          <p className="text-gray-600 text-sm mb-6 line-clamp-2 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg">
            {hotel.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleViewDetails}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Voir les détails
          </button>
          
          <div className="flex items-center gap-3">
            {hotel.website && (
              <a
                href={hotel.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:text-blue-800 hover:bg-blue-100 font-medium rounded-lg transition-colors duration-200"
              >
                <Globe className="w-4 h-4" />
                Site web
              </a>
            )}
            
            {hotel.email && (
              <a
                href={`mailto:${hotel.email}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 hover:text-green-800 hover:bg-green-100 font-medium rounded-lg transition-colors duration-200"
              >
                <Mail className="w-4 h-4" />
                Contacter
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;