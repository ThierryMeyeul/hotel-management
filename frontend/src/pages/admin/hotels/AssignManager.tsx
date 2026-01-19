import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building,
  Users,
  UserPlus,
  Search,
  Filter,
  MapPin,
  Globe,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Calendar,
  Shield,
  Star,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import Loader from '../../../components/Loader';
import { hotelService } from '../../../services/hotel.service';
import { getAllDirectors } from '../../../services/auth.service';

interface Hotel {
  id: number;
  name: string;
  address: string;
  description: string;
  city: string;
  country: string;
  email: string | null;
  latitude: number;
  longitude: number;
  manager: any | null;
  created_at: string;
  updated_at: string;
  images: any[];
  rooms: any[];
  is_active: boolean;
  distance: number | null;
  website: string | null;
  phone: string | null;
}

interface Director {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  date_joined: string;
  hotels_count?: number;
}

const AssignManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [directors, setDirectors] = useState<Director[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [filteredDirectors, setFilteredDirectors] = useState<Director[]>([]);
  const [searchHotelTerm, setSearchHotelTerm] = useState('');
  const [searchDirectorTerm, setSearchDirectorTerm] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedDirector, setSelectedDirector] = useState<Director | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [step, setStep] = useState(1); // 1: Sélection hôtel, 2: Sélection directeur, 3: Confirmation

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterHotels();
  }, [hotels, searchHotelTerm]);

  useEffect(() => {
    filterDirectors();
  }, [directors, searchDirectorTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Récupérer les hôtels sans manager
      const hotelsResponse = await hotelService.getHotelsWithoutManager();
      const hotelsMapped: Hotel[] = hotelsResponse.map(h => ({
        ...h,
    manager: h.manager ?? null,
    description: h.description ?? '',
    email: h.email ?? null,
    phone: h.phone ?? null,
    website: h.website ?? null,
    images: h.images ?? [],
  rooms: h.rooms ?? [],
  distance: h.distance ?? null
}));
setHotels(hotelsMapped);
setFilteredHotels(hotelsMapped);

const directorsResponse = await getAllDirectors();
const directorsMapped: Director[] = directorsResponse.map(d => ({
  ...d,
  phone: d.phone ?? null,
  is_active: d.is_active ?? true,
  date_joined: d.date_joined ?? new Date().toISOString()
}));
setDirectors(directorsMapped);
setFilteredDirectors(directorsMapped);
    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error);
      setErrorMessage('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const filterHotels = () => {
    let filtered = [...hotels];
    
    if (searchHotelTerm) {
      const term = searchHotelTerm.toLowerCase();
      filtered = filtered.filter(hotel =>
        hotel.name.toLowerCase().includes(term) ||
        hotel.city.toLowerCase().includes(term) ||
        hotel.country.toLowerCase().includes(term) ||
        hotel.email?.toLowerCase().includes(term) ||
        hotel.id.toString().includes(term)
      );
    }
    
    setFilteredHotels(filtered);
  };

  const filterDirectors = () => {
    let filtered = [...directors];
    
    if (searchDirectorTerm) {
      const term = searchDirectorTerm.toLowerCase();
      filtered = filtered.filter(director =>
        director.email.toLowerCase().includes(term) ||
        director.first_name?.toLowerCase().includes(term) ||
        director.last_name?.toLowerCase().includes(term) ||
        director.phone?.toLowerCase().includes(term)
      );
    }
    
    setFilteredDirectors(filtered);
  };

  const handleSelectHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setStep(2);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSelectDirector = (director: Director) => {
    setSelectedDirector(director);
    setStep(3);
  };

  const handleAssignManager = async () => {
    if (!selectedHotel || !selectedDirector) {
      setErrorMessage('Veuillez sélectionner un hôtel et un directeur');
      return;
    }

    setAssigning(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Appel API pour assigner le manager
      const response = await hotelService.assignManagerToHotel(
        selectedHotel.id,
        selectedDirector.id
      );

      setSuccessMessage(`Manager ${selectedDirector.first_name} ${selectedDirector.last_name} assigné avec succès à l'hôtel ${selectedHotel.name}`);

      // Rafraîchir la liste des hôtels
      setTimeout(() => {
        fetchData();
        resetSelection();
        setStep(1);
      }, 2000);

    } catch (error: any) {
      console.error('Erreur lors de l\'attribution du manager:', error);
      setErrorMessage(error.response?.data?.message || 'Erreur lors de l\'attribution du manager');
    } finally {
      setAssigning(false);
    }
  };

  const resetSelection = () => {
    setSelectedHotel(null);
    setSelectedDirector(null);
    setSearchHotelTerm('');
    setSearchDirectorTerm('');
    setStep(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getHotelStatus = (hotel: Hotel) => {
    if (hotel.manager) {
      return {
        text: 'Avec manager',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: <CheckCircle className="w-4 h-4" />
      };
    }
    return {
      text: 'Sans manager',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      icon: <AlertCircle className="w-4 h-4" />
    };
  };

  if (loading) {
    return <Loader fullScreen text="Chargement des données..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Bouton retour */}
        <button
          onClick={() => navigate('/admin/hotels')}
          className="flex items-center gap-2 px-4 py-3 mb-6 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Retour à la liste des hôtels</span>
        </button>

        <div className="max-w-6xl mx-auto">
          {/* En-tête */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Attribution de manager</h1>
                <p className="text-gray-600">
                  Assignez un directeur à un hôtel sans manager
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchData}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualiser
                </button>
              </div>
            </div>

            {/* Indicateur d'étape */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-3 ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">1. Sélection hôtel</div>
                    <div className="text-sm">{step > 1 ? 'Sélectionné' : 'À sélectionner'}</div>
                  </div>
                </div>

                <ChevronRight className={`w-5 h-5 ${step >= 2 ? 'text-indigo-600' : 'text-gray-300'}`} />

                <div className={`flex items-center gap-3 ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">2. Sélection directeur</div>
                    <div className="text-sm">{step > 2 ? 'Sélectionné' : step === 2 ? 'En cours' : 'À venir'}</div>
                  </div>
                </div>

                <ChevronRight className={`w-5 h-5 ${step >= 3 ? 'text-indigo-600' : 'text-gray-300'}`} />

                <div className={`flex items-center gap-3 ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">3. Confirmation</div>
                    <div className="text-sm">{step === 3 ? 'En cours' : 'À venir'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages d'erreur/succès */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Étape 1 : Sélection d'un hôtel */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-left-5">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Sélectionnez un hôtel</h2>
                    <p className="text-gray-600">
                      {filteredHotels.length} hôtel{filteredHotels.length !== 1 ? 's' : ''} sans manager
                    </p>
                  </div>
                </div>

                {/* Recherche */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un hôtel par nom, ville, pays..."
                      value={searchHotelTerm}
                      onChange={(e) => setSearchHotelTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Liste des hôtels */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {filteredHotels.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-lg">Aucun hôtel sans manager trouvé</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {searchHotelTerm ? 'Aucun hôtel ne correspond à votre recherche' : 'Tous les hôtels ont déjà un manager'}
                      </p>
                    </div>
                  ) : (
                    filteredHotels.map((hotel) => {
                      const status = getHotelStatus(hotel);
                      
                      return (
                        <div
                          key={hotel.id}
                          className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 hover:border-indigo-300"
                          onClick={() => handleSelectHotel(hotel)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-pink-50 rounded-lg flex items-center justify-center">
                                  <Building className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-900">{hotel.name}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${status.bgColor}`}>
                                      {status.icon}
                                      <span className={`font-medium ${status.color}`}>
                                        {status.text}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      ID: #{hotel.id}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <div>
                                    <p className="text-sm text-gray-900">{hotel.address}</p>
                                    <p className="text-xs text-gray-600">{hotel.city}, {hotel.country}</p>
                                  </div>
                                </div>
                                
                                {hotel.email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">{hotel.email}</span>
                                  </div>
                                )}
                                
                                {hotel.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">{hotel.phone}</span>
                                  </div>
                                )}
                                
                                {hotel.website && (
                                  <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-900 truncate">{hotel.website}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Créé le {formatDate(hotel.created_at)}</span>
                                </div>
                                {hotel.is_active ? (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Actif</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-red-600">
                                    <XCircle className="w-3 h-3" />
                                    <span>Inactif</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Étape 2 : Sélection d'un directeur */}
          {step === 2 && selectedHotel && (
            <div className="animate-in fade-in slide-in-from-left-5">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                {/* Hôtel sélectionné */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Building className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{selectedHotel.name}</h3>
                        <p className="text-sm text-gray-600">
                          {selectedHotel.city}, {selectedHotel.country}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ID: #{selectedHotel.id} • Sans manager
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Changer d'hôtel
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Sélectionnez un directeur</h2>
                    <p className="text-gray-600">
                      {filteredDirectors.length} directeur{filteredDirectors.length !== 1 ? 's' : ''} disponible{filteredDirectors.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Recherche */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un directeur par nom, email..."
                      value={searchDirectorTerm}
                      onChange={(e) => setSearchDirectorTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Liste des directeurs */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {filteredDirectors.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-lg">Aucun directeur trouvé</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {searchDirectorTerm ? 'Aucun directeur ne correspond à votre recherche' : 'Aucun directeur disponible'}
                      </p>
                    </div>
                  ) : (
                    filteredDirectors.map((director) => (
                      <div
                        key={director.id}
                        className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 hover:border-indigo-300"
                        onClick={() => handleSelectDirector(director)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-50 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900">
                                  {director.first_name} {director.last_name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    Directeur
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ID: #{director.id}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900">{director.email}</span>
                              </div>
                              
                              {director.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-900">{director.phone}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900">
                                  Membre depuis {formatDate(director.date_joined)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {director.is_active ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-green-600">Actif</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    <span className="text-sm text-red-600">Inactif</span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {director.hotels_count !== undefined && (
                              <div className="mt-3">
                                <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                  <Building className="w-3 h-3" />
                                  <span>{director.hotels_count} hôtel{director.hotels_count !== 1 ? 's' : ''} géré{director.hotels_count !== 1 ? 's' : ''}</span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Étape 3 : Confirmation */}
          {step === 3 && selectedHotel && selectedDirector && (
            <div className="animate-in fade-in slide-in-from-left-5">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <UserCheck className="w-10 h-10 text-indigo-600" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Confirmer l'attribution</h2>
                  <p className="text-gray-600">
                    Vérifiez les informations avant de confirmer l'attribution
                  </p>
                </div>

                {/* Détails de l'attribution */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Hôtel */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Building className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Hôtel</h3>
                          <p className="text-sm text-gray-600">Informations de l'hôtel sélectionné</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">Nom</p>
                          <p className="font-medium">{selectedHotel.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Localisation</p>
                          <p className="font-medium">{selectedHotel.city}, {selectedHotel.country}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Adresse</p>
                          <p className="font-medium">{selectedHotel.address}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">ID</p>
                          <p className="font-medium">#{selectedHotel.id}</p>
                        </div>
                      </div>
                    </div>

                    {/* Directeur */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Directeur</h3>
                          <p className="text-sm text-gray-600">Informations du directeur sélectionné</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">Nom complet</p>
                          <p className="font-medium">{selectedDirector.first_name} {selectedDirector.last_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-medium">{selectedDirector.email}</p>
                        </div>
                        {selectedDirector.phone && (
                          <div>
                            <p className="text-xs text-gray-500">Téléphone</p>
                            <p className="font-medium">{selectedDirector.phone}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-500">ID</p>
                          <p className="font-medium">#{selectedDirector.id}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Résumé */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Building className="w-5 h-5 text-indigo-600" />
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <UserPlus className="w-5 h-5 text-blue-600" />
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-gray-700">
                        Le directeur <span className="font-bold text-blue-700">{selectedDirector.first_name} {selectedDirector.last_name}</span> sera assigné comme manager de l'hôtel <span className="font-bold text-indigo-700">{selectedHotel.name}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Retour
                  </button>
                  
                  <button
                    onClick={handleAssignManager}
                    disabled={assigning}
                    className={`px-8 py-3 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-lg hover:from-indigo-700 hover:to-pink-700 transition-colors font-medium ${
                      assigning ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {assigning ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Attribution en cours...
                      </div>
                    ) : (
                      'Confirmer l\'attribution'
                    )}
                  </button>
                </div>

                {/* Information */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">
                        Une fois attribué, le directeur recevra un email de notification et aura accès à toutes les fonctionnalités de gestion de l'hôtel.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignManagerPage;