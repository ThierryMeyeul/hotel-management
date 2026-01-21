// src/components/director/hotels/AddEditRoom.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft,
  Save,
  X,
  Bed,
  Users,
  Ruler,
  DollarSign,
  CheckCircle,
  XCircle,
  Wifi,
  Tv,
  Coffee,
  Wind,
  Bath,
  Phone,
  Minus,
  Plus,
  Upload,
  Image as ImageIcon,
  Star,
  AlertCircle,
  Loader2,
  Building,
  Hash
} from 'lucide-react';
import { hotelService } from '../../../../services/hotel.service';
import type { CreateRoomData } from '../../../../types/hotel';
import { toast } from 'react-toastify';

// Types pour les aménités
interface Amenity {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const AMENITIES: Amenity[] = [
  { id: 'wifi', label: 'Wi-Fi Gratuit', icon: <Wifi className="w-5 h-5" />, description: 'Connexion internet haut débit' },
  { id: 'tv', label: 'Télévision', icon: <Tv className="w-5 h-5" />, description: 'TV écran plat avec chaînes satellite' },
  { id: 'ac', label: 'Climatisation', icon: <Wind className="w-5 h-5" />, description: 'Climatisation individuelle' },
  { id: 'minibar', label: 'Minibar', icon: <Coffee className="w-5 h-5" />, description: 'Minibar bien fourni' },
  { id: 'safe', label: 'Coffre-fort', icon: <Hash className="w-5 h-5" />, description: 'Coffre-fort électronique' },
  { id: 'hairdryer', label: 'Sèche-cheveux', icon: <Wind className="w-5 h-5" />, description: 'Sèche-cheveux professionnel' },
  { id: 'bathrobe', label: 'Peignoir', icon: <Bath className="w-5 h-5" />, description: 'Peignoir et pantoufles' },
  { id: 'phone', label: 'Téléphone', icon: <Phone className="w-5 h-5" />, description: 'Téléphone direct' },
];

// Types de chambre prédéfinis
const ROOM_TYPES = [
  { value: 'SIMPLE', label: 'Chambre Simple', capacity: 1, basePrice: 50 },
  { value: 'DOUBLE', label: 'Chambre Double', capacity: 2, basePrice: 80 },
  { value: 'TWIN', label: 'Chambre Twin', capacity: 2, basePrice: 85 },
  { value: 'TRIPLE', label: 'Chambre Triple', capacity: 3, basePrice: 120 },
  { value: 'FAMILY', label: 'Chambre Familiale', capacity: 4, basePrice: 150 },
  { value: 'SUITE', label: 'Suite', capacity: 2, basePrice: 200 },
  { value: 'VIP', label: 'Suite VIP', capacity: 2, basePrice: 350 },
  { value: 'PRESIDENTIAL', label: 'Suite Présidentielle', capacity: 4, basePrice: 500 },
];

const AddEditRoom: React.FC = () => {
  const { id: hotelId, roomId } = useParams<{ id: string; roomId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isEditMode = !!roomId;
  
  // États du formulaire
  const [formData, setFormData] = useState<CreateRoomData>({
    hotel: parseInt(hotelId || '0'),
    room_number: '',
    room_type: 'DOUBLE',
    price_per_night: 0,
    capacity: 2,
    size: '25',
    description: '',
    amenities: ['wifi', 'tv', 'ac'],
    is_available: true,
  });
  
  // États pour les données
  const [hotel, setHotel] = useState<any>(null);
  const [existingRoom, setExistingRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingRoomNumbers, setExistingRoomNumbers] = useState<string[]>([]);
  
  // États pour les images
  const [images, setImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  // États pour la validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Charger les données initiales
  useEffect(() => {
    if (hotelId) {
      fetchInitialData();
    }
  }, [hotelId, roomId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les informations de l'hôtel
      const hotelData = await hotelService.getHotelDetails(parseInt(hotelId!));
      setHotel(hotelData);
      
      // Récupérer les numéros de chambre existants
      const existingRooms = hotelData.rooms;
      setExistingRoomNumbers(
        (existingRooms ?? []).map((room: any) => room.room_number)
      );

      
      // Si mode édition, récupérer la chambre
      if (isEditMode && roomId) {
        const roomData = await hotelService.getRoomById(parseInt(hotelId!), parseInt(roomId));
        setExistingRoom(roomData);
        
        // Pré-remplir le formulaire
        setFormData({
          hotel: roomData.hotel,
          room_number: roomData.room_number,
          room_type: roomData.room_type,
          price_per_night: roomData.price_per_night,
          capacity: roomData.capacity,
          size: roomData.size?.replace(' m²', '') || '',
          description: roomData.description ?? '', // ✅ FIX ICI
          amenities: roomData.amenities ?? [],
          is_available: roomData.is_available,
        });
      }
      
    } catch (err: any) {
      console.error('Erreur lors du chargement:', err);
      setError(err.response?.data?.message || 'Erreur de connexion au serveur');
      toast.error('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  // Gérer les changements de champ
  const handleChange = (field: keyof CreateRoomData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Si le type de chambre change, mettre à jour la capacité et le prix par défaut
    if (field === 'room_type') {
      const selectedType = ROOM_TYPES.find(type => type.value === value);
      if (selectedType) {
        setFormData(prev => ({
          ...prev,
          capacity: selectedType.capacity,
          price_per_night: selectedType.basePrice
        }));
      }
    }
  };

  // Gérer les aménités
  const toggleAmenity = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  // Gérer les images
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    const newImages = Array.from(files);
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Valider le formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.room_number.trim()) {
      newErrors.room_number = 'Le numéro de chambre est requis';
    } else if (existingRoomNumbers.includes(formData.room_number) && (!isEditMode || formData.room_number !== existingRoom?.room_number)) {
      newErrors.room_number = 'Ce numéro de chambre existe déjà';
    }
    
    if (!formData.room_type) {
      newErrors.room_type = 'Le type de chambre est requis';
    }
    
    if (!formData.price_per_night || formData.price_per_night <= 0) {
      newErrors.price_per_night = 'Le prix doit être supérieur à 0';
    }
    
    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = 'La capacité doit être au moins 1';
    }
    
    if (!formData.size || parseFloat(formData.size) <= 0) {
      newErrors.size = 'La taille doit être supérieure à 0';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    } else if (formData.description.length < 10) {
      newErrors.description = 'La description doit contenir au moins 10 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }
    
    try {
      setSaving(true);
      
      // Préparer les données - price_per_night est déjà un number
      const roomData = {
        ...formData,
        size: `${formData.size} m²`,
        // price_per_night est déjà un number, pas besoin de conversion
      };
      
      let result;
      if (isEditMode && roomId) {
        console.log('roomData envoyé:', roomData);
        result = await hotelService.updateRoom(parseInt(hotelId!), parseInt(roomId), roomData);
        toast.success('Chambre mise à jour avec succès');
      } else {
        result = await hotelService.createRoom(parseInt(hotelId!), roomData);
        toast.success('Chambre créée avec succès');
      }
      
      // Uploader les images si nécessaire
      if (images.length > 0) {
        setUploadingImages(true);
        await uploadImages(result.id);
      }
      
      // Rediriger vers la liste des chambres
      navigate(`/director/hotels/${hotelId}/rooms`);
      
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la sauvegarde';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  };

  // Uploader les images
  const uploadImages = async (roomId: number) => {
    for (const image of images) {
      const formData = new FormData();
      formData.append('image', image);
    //   formData.append('caption', `Image de la chambre ${formData.room_number}`);
      formData.append('is_cover', images.indexOf(image) === 0 ? 'true' : 'false');
      
      try {
        // await hotelService.addRoomImage(parseInt(hotelId!), roomId, formData);
      } catch (err) {
        console.error('Erreur lors de l\'upload de l\'image:', err);
        toast.warning('Certaines images n\'ont pas pu être téléchargées');
      }
    }
  };

  // Récupérer le type de chambre sélectionné
  const getSelectedRoomType = () => {
    return ROOM_TYPES.find(type => type.value === formData.room_type);
  };

  if (loading) {
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
          onClick={() => navigate(`/director/hotels/${hotelId}/rooms`)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/director/hotels/${hotelId}/rooms`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Modifier la Chambre' : 'Ajouter une Chambre'}
            </h1>
            <p className="text-gray-600">
              {hotel.name} • {hotel.city}, {hotel.country}
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations de base */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Bed className="w-5 h-5" />
            Informations de base
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Numéro de chambre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de chambre *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.room_number}
                  onChange={(e) => handleChange('room_number', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.room_number ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 101, A201, SUITE-1"
                />
              </div>
              {errors.room_number && (
                <p className="mt-1 text-sm text-red-600">{errors.room_number}</p>
              )}
            </div>

            {/* Type de chambre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de chambre *
              </label>
              <select
                value={formData.room_type}
                onChange={(e) => handleChange('room_type', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.room_type ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                {ROOM_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} ({type.capacity} pers. ~ {type.basePrice}€/nuit)
                  </option>
                ))}
              </select>
              {errors.room_type && (
                <p className="mt-1 text-sm text-red-600">{errors.room_type}</p>
              )}
            </div>

            {/* Prix par nuit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix par nuit (€) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price_per_night}
                  onChange={(e) => handleChange('price_per_night', parseFloat(e.target.value) || 0)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.price_per_night ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.price_per_night && (
                <p className="mt-1 text-sm text-red-600">{errors.price_per_night}</p>
              )}
            </div>

            {/* Capacité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacité (personnes) *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.capacity}
                  onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 1)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.capacity ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
              )}
            </div>

            {/* Taille */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taille (m²) *
              </label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  min="10"
                  step="0.5"
                  value={formData.size}
                  onChange={(e) => handleChange('size', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.size ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 25"
                />
              </div>
              {errors.size && (
                <p className="mt-1 text-sm text-red-600">{errors.size}</p>
              )}
            </div>

            {/* Disponibilité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disponibilité
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleChange('is_available', true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition ${
                    formData.is_available
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  Disponible
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('is_available', false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition ${
                    !formData.is_available
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <XCircle className="w-5 h-5" />
                  Occupée
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description de la chambre *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Décrivez la chambre, ses caractéristiques, vue, etc..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/500 caractères
            </p>
          </div>
        </div>

        {/* Aménités */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Aménités et équipements
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AMENITIES.map(amenity => (
              <button
                key={amenity.id}
                type="button"
                onClick={() => toggleAmenity(amenity.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.amenities.includes(amenity.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    formData.amenities.includes(amenity.id)
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {amenity.icon}
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-gray-900">{amenity.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{amenity.description}</div>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    formData.amenities.includes(amenity.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {formData.amenities.includes(amenity.id) && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Photos de la chambre
          </h2>
          
          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Glissez-déposez des images ou cliquez pour sélectionner
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploadingImages}
                className="hidden"
                id="room-images-upload"
              />
              <label
                htmlFor="room-images-upload"
                className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition cursor-pointer"
              >
                {uploadingImages ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Téléchargement...
                  </>
                ) : (
                  'Sélectionner des images'
                )}
              </label>
              <p className="text-xs text-gray-500 mt-4">
                Formats acceptés: JPG, PNG, WebP • Taille max: 5MB par image
              </p>
            </div>
          </div>

          {/* Aperçu des images */}
          {images.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-4">
                Images sélectionnées ({images.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Chambre ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 rounded-lg">
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                      {index === 0 && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                          Couverture
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {image.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Récapitulatif et Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Récapitulatif
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Détails de la chambre */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Détails de la chambre</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Numéro:</span>
                  <span className="font-medium">{formData.room_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">
                    {ROOM_TYPES.find(t => t.value === formData.room_type)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix/nuit:</span>
                  <span className="font-medium text-blue-600">
                    {formData.price_per_night} €
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacité:</span>
                  <span className="font-medium">{formData.capacity} personnes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taille:</span>
                  <span className="font-medium">{formData.size} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut:</span>
                  <span className={`font-medium ${formData.is_available ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.is_available ? 'Disponible' : 'Occupée'}
                  </span>
                </div>
              </div>
            </div>

            {/* Aménités sélectionnées */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Aménités incluses</h3>
              <div className="space-y-2">
                {AMENITIES.filter(a => formData.amenities.includes(a.id)).map(amenity => (
                  <div key={amenity.id} className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded">
                      {amenity.icon}
                    </div>
                    <span className="text-gray-700">{amenity.label}</span>
                  </div>
                ))}
                {formData.amenities.length === 0 && (
                  <p className="text-gray-500 italic">Aucune aménité sélectionnée</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(`/director/hotels/${hotelId}/rooms`)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={saving || uploadingImages}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImages}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isEditMode ? 'Mise à jour...' : 'Création...'}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditMode ? 'Mettre à jour la chambre' : 'Créer la chambre'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditRoom;