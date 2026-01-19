import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Building, 
  Check,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Navigation
} from 'lucide-react';
import Loader from '../../components/Loader';
import type { createHotel } from '../../types/hotel';
import { hotelService } from '../../services/hotel.service';
import MapModal from '../../components/map/MapModal';

const HotelCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // État du formulaire selon l'interface createHotel
  const [formData, setFormData] = useState<Omit<createHotel, 'id' | 'is_active'> & { is_active: boolean }>({
    name: '',
    description: '',
    address: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    website: '',
    latitude: 0,
    longitude: 0,
    manager_id: undefined,
    is_active: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Gérer la sélection de position depuis la carte
  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
    setShowMapModal(false);
  };

  // Fonction pour utiliser la géolocalisation actuelle
  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          setError("Impossible d'obtenir votre position actuelle");
        }
      );
    } else {
      setError("La géolocalisation n'est pas supportée par votre navigateur");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validation des champs obligatoires
      const requiredFields = ['name', 'address', 'city', 'country'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        throw new Error(`Champs obligatoires manquants: ${missingFields.join(', ')}`);
      }

      // Validation des coordonnées GPS si fournies
      if (formData.latitude !== 0 && formData.longitude !== 0) {
        if (Math.abs(formData.latitude) > 90 || Math.abs(formData.longitude) > 180) {
          throw new Error('Coordonnées GPS invalides');
        }
      }

      // Préparer les données pour l'API
      const hotelData: createHotel = {
        ...formData,
        latitude: formData.latitude ?? 0,   // ← ici
        longitude: formData.longitude ?? 0, // ← ici
        is_active: isActive,
      };


      console.log('Payload envoyé à l’API :', hotelData);

      // Ici vous pouvez appeler votre service API
      const response = await hotelService.createHotel(hotelData);
      
      // Simulation d'appel API
      setSuccess('Hôtel créé avec succès ! Redirection...');
      
      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate('/admin/hotels');
      }, 2000);

    } catch (err: any) {
      console.error('Erreur création hôtel:', err);
      setError(err.message || 'Une erreur est survenue lors de la création de l\'hôtel');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !error && !success) {
    return <Loader fullScreen text="Création de l'hôtel en cours..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Modal pour la carte */}
      {showMapModal && (
        <MapModal
          initialLat={formData.latitude || 48.856613}
          initialLng={formData.longitude || 2.352222}
          onSelect={handleLocationSelect}
          onClose={() => setShowMapModal(false)}
          searchLabel="Rechercher l'hôtel..."
        />
      )}

      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Créer un nouvel hôtel
            </h1>
            <p className="text-gray-600 mt-1">
              Ajoutez un nouvel hôtel à la plateforme
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/hotels')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Retour à la liste
          </button>
        </div>
      </div>

      {/* Messages d'état */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-red-800">Erreur</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-green-800">Succès</h3>
            <p className="text-green-600 text-sm mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations générales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Informations générales</h2>
              <p className="text-sm text-gray-500">Informations de base sur l'hôtel</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'hôtel *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ex: Grand Hôtel Paris"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Décrivez l'hôtel, ses services, son ambiance..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="123 Avenue des Champs"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Paris"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays *
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="France"
              />
            </div>
          </div>
        </div>

        {/* Coordonnées GPS avec carte interactive */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Coordonnées GPS</h2>
              <p className="text-sm text-gray-500">Sélectionnez la position exacte de l'hôtel sur la carte</p>
            </div>
          </div>

          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition flex items-center justify-center gap-3"
            >
              <MapPin className="w-5 h-5 text-indigo-600" />
              <span className="font-medium text-indigo-600">Ouvrir la carte pour sélectionner la position</span>
            </button>
            
            <div className="flex gap-4 mt-4">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                <Navigation className="w-4 h-4" />
                Utiliser ma position actuelle
              </button>
              
              {(formData.latitude !== 0 || formData.longitude !== 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, latitude: 0, longitude: 0 }));
                  }}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Effacer les coordonnées
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude || ''}
                onChange={handleInputChange}
                step="0.000001"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="48.856613"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude || ''}
                onChange={handleInputChange}
                step="0.000001"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="2.352222"
              />
            </div>
          </div>

          {(formData.latitude !== 0 && formData.longitude !== 0) && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-800">Position sélectionnée</h3>
                  <p className="text-blue-700 text-sm mt-1">
                    Lat: {formData.latitude.toFixed(6)}, Lng: {formData.longitude.toFixed(6)}
                  </p>
                  <a
                    href={`https://maps.google.com/?q=${formData.latitude},${formData.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                  >
                    Voir sur Google Maps →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contacts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Informations de contact</h2>
              <p className="text-sm text-gray-500">Coordonnées de l'hôtel (optionnel)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="contact@hotel.com"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site web
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="https://www.hotel.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statut et Manager */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manager ID
              </label>
              <input
                type="number"
                name="manager_id"
                value={formData.manager_id || ''}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="ID du manager"
              />
              <p className="text-xs text-gray-500 mt-2">Laissez vide pour assigner automatiquement</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut de l'hôtel
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <div>
                  <span className={`font-medium ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
                    {isActive ? 'Actif' : 'Inactif'}
                  </span>
                  <p className="text-xs text-gray-500">
                    {isActive ? 'L\'hôtel est visible et disponible' : 'L\'hôtel est masqué'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/hotels')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Créer l'hôtel
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default HotelCreatePage;