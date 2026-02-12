import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Search,
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
  Building,
  MapPin,
  User,
  MessageSquare,
  RefreshCw,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Eye,
  Filter,
  XCircle
} from 'lucide-react';
import Loader from '../../components/Loader';
import { directorReviewService } from '../../services/director-review.service';
import { hotelService } from '../../services/hotel.service';
import { useAuth } from '../../context/AuthContext';
import type { Review } from '../../types/review';
import type { Hotel } from '../../types/hotel';

interface HotelWithStats extends Hotel {
  review_count?: number;
  average_rating?: number;
}

const DirectorHotelReviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // États principaux
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [hotels, setHotels] = useState<HotelWithStats[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<HotelWithStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [hotelStats, setHotelStats] = useState<any>(null);
  
  // États pour les statistiques
  const [showStats, setShowStats] = useState(true);
  
  // États de filtrage
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // États de pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // États pour l'export
  const [exporting, setExporting] = useState(false);
  
  // États pour les avis détaillés
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showReviewDetail, setShowReviewDetail] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchHotels(),
      fetchStatistics()
    ]);
  }, []);

  useEffect(() => {
    if (!selectedHotel) return;
    fetchHotelReviews(selectedHotel.id);
  }, [selectedHotel, currentPage, ratingFilter, dateRange]);

  const fetchHotels = async () => {
    try {
      const response = await hotelService.getDirectorHotels();
      let hotelsData: Hotel[] = [];
      
      if (Array.isArray(response)) {
        hotelsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        hotelsData = response.data;
      } else if (Array.isArray(response?.hotels)) {
        hotelsData = response.hotels;
      }
      
      setHotels(hotelsData);
      
      // Sélectionner le premier hôtel par défaut
      if (hotelsData.length > 0 && !selectedHotel) {
        setSelectedHotel(hotelsData[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des hôtels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await directorReviewService.getStatistics();
      setStatistics(stats);
      
      // Enrichir les hôtels avec leurs statistiques
      if (stats.reviews_by_hotel) {
        setHotels(prevHotels => 
          prevHotels.map(hotel => {
            const hotelStats = stats.reviews_by_hotel.find(
              (h: any) => h.hotel__id === hotel.id
            );
            return {
              ...hotel,
              review_count: hotelStats?.count || 0,
              average_rating: hotelStats?.average || 0
            };
          })
        );
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const fetchHotelReviews = async (hotelId: number) => {
    setLoadingReviews(true);
    try {
      const response = await directorReviewService.getHotelReviews(hotelId, {
        page: currentPage,
        page_size: itemsPerPage,
        rating: ratingFilter,
        date_from: dateRange.start || undefined,
        date_to: dateRange.end || undefined
      });
      
      setReviews(response.reviews);
      setHotelStats(response.stats);
      setTotalPages(response.pagination.total_pages);
      
      // Mettre à jour les statistiques de l'hôtel sélectionné
    //   setSelectedHotel(prev => 
    //     prev ? {
    //       ...prev,
    //       review_count: response.stats.total_reviews,
    //       average_rating: response.stats.average_rating
    //     } : null
    //   );
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleExportReviews = async () => {
    if (!selectedHotel) return;
    
    setExporting(true);
    try {
      const blob = await directorReviewService.exportHotelReviews(selectedHotel.id);
      
      // Télécharger le fichier
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `avis_${selectedHotel.name}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export des avis');
    } finally {
      setExporting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setRatingFilter('all');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
  };

  const filterReviews = (reviews: Review[]) => {
    if (!searchTerm) return reviews;
    
    const term = searchTerm.toLowerCase();
    return reviews.filter(r =>
      r.comment.toLowerCase().includes(term) ||
      r.username.toLowerCase().includes(term)
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4) return 'text-green-500';
    if (rating >= 3) return 'text-yellow-500';
    if (rating >= 2) return 'text-orange-500';
    return 'text-red-500';
  };

  const getTrendIcon = (value: number) => {
    if (value > 4) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (value < 3) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
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
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredReviews = filterReviews(reviews);

  if (loading) {
    return <Loader fullScreen text="Chargement des avis..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Avis clients</h1>
              <p className="text-gray-600">
                Consultez tous les avis laissés par vos clients
              </p>
              {user && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                    {user.role === 'DIRECTOR' ? 'Directeur' : 'Administrateur'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/director/hotels')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Building className="w-4 h-4" />
                Mes hôtels
              </button>
              
              <button
                onClick={() => {
                  fetchStatistics();
                  if (selectedHotel) fetchHotelReviews(selectedHotel.id);
                }}
                className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                title="Actualiser"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Statistiques globales */}
          {statistics && showStats && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Vue d'ensemble</h2>
                </div>
                <button
                  onClick={() => setShowStats(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-5">
                  <p className="text-sm text-indigo-700 mb-1">Total avis</p>
                  <p className="text-3xl font-bold text-indigo-900">{statistics.total_reviews}</p>
                  <p className="text-xs text-indigo-600 mt-1">Tous hôtels confondus</p>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl p-5">
                  <p className="text-sm text-yellow-700 mb-1">Note moyenne</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-yellow-900">{statistics.average_rating}</p>
                    <div className="flex items-center">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">Sur 5 étoiles</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-5">
                  <p className="text-sm text-green-700 mb-1">Satisfaction</p>
                  <p className="text-3xl font-bold text-green-900">
                    {Math.round(((statistics.rating_distribution?.[4] || 0) + 
                      (statistics.rating_distribution?.[5] || 0)) / 
                      (statistics.total_reviews || 1) * 100)}%
                  </p>
                  <p className="text-xs text-green-600 mt-1">Avis 4-5 étoiles</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-5">
                  <p className="text-sm text-purple-700 mb-1">Hôtels actifs</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {statistics.reviews_by_hotel?.length || 0}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">sur {hotels.length} établissements</p>
                </div>
              </div>
              
              {/* Distribution des notes */}
              {statistics.total_reviews > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Distribution des notes</h3>
                  <div className="grid grid-cols-5 gap-4">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = statistics.rating_distribution?.[rating] || 0;
                      const percentage = (count / (statistics.total_reviews || 1)) * 100;
                      
                      return (
                        <div key={rating} className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-2">
                            <span className="font-bold text-gray-900">{rating}</span>
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-sm font-medium text-gray-700 mt-2">{count}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {!showStats && statistics && (
            <button
              onClick={() => setShowStats(true)}
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Afficher les statistiques
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sélecteur d'hôtel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2 min-w-[120px]">
              <Building className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Hôtel :</span>
            </div>
            
            <div className="flex flex-wrap gap-2 flex-1">
              {hotels.length > 0 ? (
                hotels.map((hotel) => (
                  <button
                    key={hotel.id}
                    onClick={() => {
                      setSelectedHotel(hotel);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedHotel?.id === hotel.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{hotel.name}</span>
                      {hotel.review_count !== undefined && hotel.review_count > 0 && (
                        <>
                          <span className="text-xs opacity-75">•</span>
                          <div className="flex items-center gap-1">
                            <Star className={`w-3 h-3 ${selectedHotel?.id === hotel.id ? 'fill-white' : 'fill-gray-500'}`} />
                            <span className="text-xs font-medium">
                              {hotel.average_rating?.toFixed(1) || '0.0'}
                            </span>
                            <span className="text-xs opacity-75">
                              ({hotel.review_count})
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-gray-500 text-sm py-2">Aucun hôtel trouvé</p>
              )}
            </div>
            
            {selectedHotel && selectedHotel.review_count ? (
              <button
                onClick={handleExportReviews}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Export en cours...' : 'Exporter CSV'}
              </button>
            ) : (
              <button
                disabled
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Aucun avis à exporter
              </button>
            )}
          </div>
        </div>

        {selectedHotel ? (
          <>
            {/* Filtres */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher dans les commentaires ou par client..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={ratingFilter}
                    onChange={(e) => {
                      setRatingFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">Toutes les notes</option>
                    <option value="5">5 étoiles ⭐⭐⭐⭐⭐</option>
                    <option value="4">4 étoiles ⭐⭐⭐⭐</option>
                    <option value="3">3 étoiles ⭐⭐⭐</option>
                    <option value="2">2 étoiles ⭐⭐</option>
                    <option value="1">1 étoile ⭐</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => {
                        setDateRange({ ...dateRange, start: e.target.value });
                        setCurrentPage(1);
                      }}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="Date début"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => {
                        setDateRange({ ...dateRange, end: e.target.value });
                        setCurrentPage(1);
                      }}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="Date fin"
                    />
                  </div>
                </div>

                {(searchTerm || ratingFilter !== 'all' || dateRange.start || dateRange.end) && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Effacer
                  </button>
                )}
              </div>
            </div>

            {/* Statistiques de l'hôtel sélectionné */}
            {hotelStats && hotelStats.total_reviews > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Note moyenne</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className={`text-2xl font-bold ${getRatingColor(hotelStats.average_rating)}`}>
                          {hotelStats.average_rating}
                        </p>
                        <div className="flex items-center">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      {getTrendIcon(hotelStats.average_rating)}
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total avis</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {hotelStats.total_reviews}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">avis clients</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Dernier avis</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {reviews.length > 0 ? formatDate(reviews[0].created_at) : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {reviews.length > 0 ? reviews[0].username : ''}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Liste des avis */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {loadingReviews ? (
                <div className="py-16">
                  <Loader text="Chargement des avis..." />
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun avis trouvé
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {searchTerm || ratingFilter !== 'all' || dateRange.start || dateRange.end
                      ? 'Aucun avis ne correspond à vos critères de recherche'
                      : 'Cet hôtel n\'a pas encore reçu d\'avis de la part de ses clients'}
                  </p>
                  {(searchTerm || ratingFilter !== 'all' || dateRange.start || dateRange.end) && (
                    <button
                      onClick={handleClearFilters}
                      className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Effacer les filtres
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-200">
                    {filteredReviews.map((review) => (
                      <div 
                        key={review.id} 
                        className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedReview(review);
                          setShowReviewDetail(true);
                        }}
                      >
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {review.username?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-gray-900">
                                    {review.username}
                                  </h3>
                                  <span className="text-sm text-gray-500">
                                    {formatDateTime(review.created_at)}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`w-4 h-4 ${
                                          star <= review.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm font-medium text-gray-700">
                                    {review.rating}/5
                                  </span>
                                </div>
                                
                                <div className="text-gray-700 line-clamp-3">
                                  {review.comment}
                                </div>
                              </div>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedReview(review);
                                  setShowReviewDetail(true);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex-shrink-0"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="text-sm font-medium">Lire</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-700">
                          Page <span className="font-medium">{currentPage}</span> sur{' '}
                          <span className="font-medium">{totalPages}</span>
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg ${
                              currentPage === 1
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          
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
                                className={`w-10 h-10 rounded-lg font-medium ${
                                  currentPage === pageNum
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg ${
                              currentPage === totalPages
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun hôtel assigné</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Vous n'avez pas encore d'hôtels sous votre gestion. 
              Contactez l'administrateur pour vous assigner des établissements.
            </p>
            <button
              onClick={() => navigate('/director/help')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Contacter le support
            </button>
          </div>
        )}

        {/* Modal de détail de l'avis */}
        {showReviewDetail && selectedReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {selectedReview.username?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedReview.username}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(selectedReview.created_at)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReviewDetail(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= selectedReview.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {selectedReview.rating}/5
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-5 mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Commentaire</h3>
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {selectedReview.comment}
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowReviewDetail(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectorHotelReviewsPage;