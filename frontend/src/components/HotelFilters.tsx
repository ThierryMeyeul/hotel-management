// import React, { useState, useEffect } from 'react';
// import { hotelService } from '../services/hotelService';
// import { Filter, X, Search, MapPin, Euro, Star } from 'lucide-react';
// import { HotelSearchParams } from '../types/hotel';

// interface HotelFiltersProps {
//   onFilterChange: (filters: HotelSearchParams) => void;
//   onClearFilters: () => void;
//   initialFilters?: HotelSearchParams;
//   className?: string;
// }

// const HotelFilters: React.FC<HotelFiltersProps> = ({
//   onFilterChange,
//   onClearFilters,
//   initialFilters = {},
//   className = '',
// }) => {
//   const [cities, setCities] = useState<string[]>([]);
//   const [loadingCities, setLoadingCities] = useState(false);
  
//   const [filters, setFilters] = useState({
//     city: initialFilters.city || '',
//     maxPrice: initialFilters.maxPrice?.toString() || '',
//     minRating: initialFilters.minRating?.toString() || '',
//     search: initialFilters.search || '',
//   });

//   useEffect(() => {
//     const loadCities = async () => {
//       setLoadingCities(true);
//       try {
//         const citiesData = await hotelService.getCities();
//         setCities(citiesData);
//       } catch (error) {
//         console.error('Erreur lors du chargement des villes:', error);
//       } finally {
//         setLoadingCities(false);
//       }
//     };

//     loadCities();
//   }, []);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     const newFilters = { ...filters, [name]: value };
//     setFilters(newFilters);
//     applyFilters(newFilters);
//   };

//   const applyFilters = (filterValues: typeof filters) => {
//     onFilterChange({
//       city: filterValues.city || undefined,
//       maxPrice: filterValues.maxPrice ? Number(filterValues.maxPrice) : undefined,
//       minRating: filterValues.minRating ? Number(filterValues.minRating) : undefined,
//       search: filterValues.search || undefined,
//     });
//   };

//   const handleClearFilters = () => {
//     const clearedFilters = {
//       city: '',
//       maxPrice: '',
//       minRating: '',
//       search: '',
//     };
//     setFilters(clearedFilters);
//     onClearFilters();
//   };

//   const hasActiveFilters = filters.city || filters.maxPrice || filters.minRating || filters.search;

//   return (
//     <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
//       {/* En-tête */}
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-3">
//           <Filter className="w-6 h-6 text-indigo-600" />
//           <h3 className="text-xl font-bold text-gray-900">Filtres de recherche</h3>
//         </div>
        
//         {hasActiveFilters && (
//           <button
//             onClick={handleClearFilters}
//             className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
//           >
//             <X className="w-4 h-4" />
//             Effacer tout
//           </button>
//         )}
//       </div>

//       {/* Grille de filtres */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         {/* Recherche textuelle */}
//         <div className="space-y-2">
//           <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
//             <Search className="w-4 h-4" />
//             Recherche
//           </label>
//           <input
//             type="text"
//             name="search"
//             placeholder="Nom, adresse, description..."
//             value={filters.search}
//             onChange={handleInputChange}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
//           />
//         </div>

//         {/* Ville */}
//         <div className="space-y-2">
//           <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
//             <MapPin className="w-4 h-4" />
//             Ville
//           </label>
//           <select
//             name="city"
//             value={filters.city}
//             onChange={handleInputChange}
//             disabled={loadingCities}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
//           >
//             <option value="">Toutes les villes</option>
//             {loadingCities ? (
//               <option>Chargement...</option>
//             ) : (
//               cities.map((city) => (
//                 <option key={city} value={city}>
//                   {city}
//                 </option>
//               ))
//             )}
//           </select>
//         </div>

//         {/* Prix maximum */}
//         <div className="space-y-2">
//           <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
//             <Euro className="w-4 h-4" />
//             Prix max (€)
//           </label>
//           <input
//             type="number"
//             name="maxPrice"
//             placeholder="Ex: 150"
//             min="0"
//             step="10"
//             value={filters.maxPrice}
//             onChange={handleInputChange}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
//           />
//         </div>

//         {/* Note minimum */}
//         <div className="space-y-2">
//           <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
//             <Star className="w-4 h-4" />
//             Note minimum
//           </label>
//           <select
//             name="minRating"
//             value={filters.minRating}
//             onChange={handleInputChange}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
//           >
//             <option value="">Toutes les notes</option>
//             <option value="4.5">4.5+ étoiles</option>
//             <option value="4">4+ étoiles</option>
//             <option value="3.5">3.5+ étoiles</option>
//             <option value="3">3+ étoiles</option>
//             <option value="2">2+ étoiles</option>
//           </select>
//         </div>
//       </div>

//       {/* Filtres actifs */}
//       {hasActiveFilters && (
//         <div className="pt-4 border-t border-gray-200">
//           <div className="flex flex-wrap items-center gap-2">
//             <span className="text-sm font-medium text-gray-600">Filtres actifs :</span>
            
//             {filters.city && (
//               <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
//                 <MapPin className="w-3 h-3" />
//                 {filters.city}
//                 <button
//                   onClick={() => handleInputChange({ target: { name: 'city', value: '' } } as any)}
//                   className="ml-1 hover:text-blue-900"
//                 >
//                   <X className="w-3 h-3" />
//                 </button>
//               </span>
//             )}
            
//             {filters.maxPrice && (
//               <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
//                 <Euro className="w-3 h-3" />
//                 {filters.maxPrice}€ max
//                 <button
//                   onClick={() => handleInputChange({ target: { name: 'maxPrice', value: '' } } as any)}
//                   className="ml-1 hover:text-green-900"
//                 >
//                   <X className="w-3 h-3" />
//                 </button>
//               </span>
//             )}
            
//             {filters.minRating && (
//               <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
//                 <Star className="w-3 h-3" />
//                 {filters.minRating}★ min
//                 <button
//                   onClick={() => handleInputChange({ target: { name: 'minRating', value: '' } } as any)}
//                   className="ml-1 hover:text-yellow-900"
//                 >
//                   <X className="w-3 h-3" />
//                 </button>
//               </span>
//             )}
            
//             {filters.search && (
//               <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
//                 <Search className="w-3 h-3" />
//                 "{filters.search}"
//                 <button
//                   onClick={() => handleInputChange({ target: { name: 'search', value: '' } } as any)}
//                   className="ml-1 hover:text-purple-900"
//                 >
//                   <X className="w-3 h-3" />
//                 </button>
//               </span>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default HotelFilters;