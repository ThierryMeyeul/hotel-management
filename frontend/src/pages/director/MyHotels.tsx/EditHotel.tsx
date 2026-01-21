// src/components/director/hotels/EditHotel.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Save,
  X,
  Building,
  MapPin,
  Mail,
  Phone,
  Globe,
  Image as ImageIcon,
  Eye,
  Trash2,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Plus,
  Star,
  Home,
  Users,
  DollarSign,
  Calendar
} from 'lucide-react';
import { hotelService } from '../../../services/hotel.service';
import type { Hotel, HotelImage } from '../../../types/hotel';
import { toast } from 'react-toastify';

const EditHotel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // États du formulaire
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    city: '',
    country: '',
    email: '',
    phone: '',
    website: '',
    is_active: true,
  });
  
  // États pour les données
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les images
  const [images, setImages] = useState<HotelImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [coverImageId, setCoverImageId] = useState<number | null>(null);
  
  // États pour la validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Listes prédéfinies
  const [countries] = useState([
    'France', 'Belgique', 'Suisse', 'Espagne', 'Italie', 'Allemagne',
    'Royaume-Uni', 'États-Unis', 'Canada', 'Maroc', 'Tunisie', 'Algérie',
    'Sénégal', 'Côte d\'Ivoire', 'Cameroun', 'Gabon', 'Congo', 'RD Congo'
  ]);

  const [cities] = useState([
    'Paris', 'Lyon', 'Marseille', 'Nice', 'Bordeaux', 'Lille',
    'Toulouse', 'Nantes', 'Strasbourg', 'Montpellier', 'Rennes',
    'Genève', 'Bruxelles', 'Londres', 'Madrid', 'Rome', 'Berlin',
    'Casablanca', 'Tunis', 'Alger', 'Dakar', 'Abidjan', 'Douala',
    'Yaoundé', 'Libreville', 'Brazzaville', 'Kinshasa'
  ]);

  // Charger les données de l'hôtel
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
      setImages(hotelData.images);
      
      // Trouver l'image de couverture
      const coverImage = hotelData.images.find(img => img.is_cover);
      if (coverImage) {
        setCoverImageId(coverImage.id);
      }
      
      // Pré-remplir le formulaire
      setFormData({
        name: hotelData.name,
        address: hotelData.address,
        description: hotelData.description,
        city: hotelData.city,
        country: hotelData.country,
        email: hotelData.email || '',
        phone: hotelData.phone || '',
        website: hotelData.website || '',
        is_active: hotelData.is_active,
      });
      
    } catch (err: any) {
      console.error('Erreur lors du chargement:', err);
      setError(err.response?.data?.message || 'Erreur de connexion au serveur');
      toast.error('Impossible de charger les détails de l\'hôtel');
    } finally {
      setLoading(false);
    }
  };

  // Gérer les changements de champ
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Gérer l'upload de nouvelles images
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    const fileArray = Array.from(files);
    setNewImages(prev => [...prev, ...fileArray]);
  };

  // Supprimer une image existante
  const handleDeleteImage = async (imageId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette image ?') || !id) return;

    try {
      await hotelService.deleteHotelImage(parseInt(id), imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
      if (coverImageId === imageId) {
        setCoverImageId(images.find(img => img.id !== imageId)?.id || null);
      }
      toast.success('Image supprimée avec succès');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  // Définir comme image de couverture
  const handleSetCoverImage = (imageId: number) => {
    setCoverImageId(imageId);
  };

  // Supprimer une nouvelle image
  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  // Valider le formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de l\'hôtel est requis';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'L\'adresse est requise';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    } else if (formData.description.length < 20) {
      newErrors.description = 'La description doit contenir au moins 20 caractères';
    }
    
    if (!formData.city) {
      newErrors.city = 'La ville est requise';
    }
    
    if (!formData.country) {
      newErrors.country = 'Le pays est requis';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'URL invalide (commencez par http:// ou https://)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Uploader les nouvelles images
  const uploadNewImages = async () => {
    if (!id || newImages.length === 0) return;

    setUploadingImages(true);
    try {
      for (let i = 0; i < newImages.length; i++) {
        const image = newImages[i];
        const formData = new FormData();
        formData.append('image', image);
        formData.append('caption', `Image ${i + 1} - ${hotel?.name}`);
        formData.append('is_cover', i === 0 && images.length === 0 ? 'true' : 'false');

        const newImage = await hotelService.addHotelImage(parseInt(id), formData);
        setImages(prev => [...prev, newImage]);
        
        // Si c'est la première image et qu'il n'y avait pas d'image de couverture
        if (i === 0 && !coverImageId) {
          setCoverImageId(newImage.id);
        }
      }
      
      setNewImages([]);
      toast.success(`${newImages.length} image(s) téléchargée(s) avec succès`);
    } catch (err: any) {
      console.error('Erreur upload images:', err);
      toast.error('Erreur lors du téléchargement des images');
    } finally {
      setUploadingImages(false);
    }
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
      
      // Préparer les données
      const hotelData = {
        ...formData,
        email: formData.email || null,
        phone: formData.phone || null,
        website: formData.website || null,
      };
      
      // Mettre à jour l'hôtel
      const updatedHotel = await hotelService.updateHotel(parseInt(id!), hotelData);
      setHotel(updatedHotel);
      
      // Mettre à jour l'image de couverture si nécessaire
      if (coverImageId) {
        const coverImage = images.find(img => img.id === coverImageId);
        if (coverImage && !coverImage.is_cover) {
          // Ici, vous feriez un appel API pour définir l'image de couverture
          // await myHotelsApi.setCoverImage(parseInt(id!), coverImageId);
        }
      }
      
      // Uploader les nouvelles images
      if (newImages.length > 0) {
        await uploadNewImages();
      }
      
      toast.success('Hôtel mis à jour avec succès');
      
      // Rediriger vers la page de gestion
      navigate(`/director/hotels/${id}`);
      
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Rendu des états de chargement
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
          onClick={() => navigate('/director/hotels')}
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
            onClick={() => navigate(`/director/hotels/${id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Modifier l'hôtel</h1>
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
            <Building className="w-5 h-5" />
            Informations de base
          </h2>
          
          <div className="space-y-6">
            {/* Nom de l'hôtel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'hôtel *
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Grand Hôtel de Paris"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse complète *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.address ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 123 Avenue des Champs-Élysées"
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* Ville et Pays */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.city ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionnez une ville</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                  <option value="other">Autre...</option>
                </select>
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
                {formData.city === 'other' && (
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Entrez le nom de la ville"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.country ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionnez un pays</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                  <option value="other">Autre...</option>
                </select>
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                )}
                {formData.country === 'other' && (
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Entrez le nom du pays"
                  />
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description détaillée *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={5}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Décrivez votre hôtel, ses services, son histoire, ses particularités..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/1000 caractères
              </p>
            </div>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Coordonnées
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="contact@hotel.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Site web */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site web
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.website ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="https://www.votre-hotel.com"
                />
              </div>
              {errors.website && (
                <p className="mt-1 text-sm text-red-600">{errors.website}</p>
              )}
            </div>
          </div>
        </div>

        {/* Galerie d'images */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Galerie d'images
          </h2>
          
          {/* Images existantes */}
          {images.length > 0 && (
            <div className="mb-8">
              <h3 className="font-medium text-gray-700 mb-4">
                Images existantes ({images.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image.image}
                        alt={image.caption}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 rounded-lg">
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(image.id)}
                        className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetCoverImage(image.id)}
                        className={`absolute top-2 left-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                          coverImageId === image.id
                            ? 'bg-yellow-500 text-white'
                            : 'bg-white/80 hover:bg-white'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${coverImageId === image.id ? 'fill-white' : ''}`} />
                      </button>
                      <a
                        href={image.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-2 left-2 p-1 bg-white/80 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <Eye className="w-4 h-4 text-gray-700" />
                      </a>
                    </div>
                    {coverImageId === image.id && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                        Couverture
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload de nouvelles images */}
          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Glissez-déposez des images ou cliquez pour ajouter de nouvelles photos
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploadingImages}
                className="hidden"
                id="hotel-images-upload"
              />
              <label
                htmlFor="hotel-images-upload"
                className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition cursor-pointer"
              >
                {uploadingImages ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Téléchargement...
                  </>
                ) : (
                  'Ajouter des images'
                )}
              </label>
              <p className="text-xs text-gray-500 mt-4">
                Formats: JPG, PNG, WebP • Taille max: 5MB • Première image = couverture par défaut
              </p>
            </div>
          </div>

          {/* Aperçu des nouvelles images */}
          {newImages.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-4">
                Nouvelles images ({newImages.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {newImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Nouvelle image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 rounded-lg">
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                      {index === 0 && images.length === 0 && (
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

        {/* Statut de l'hôtel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Statut de l'hôtel
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Statut actuel</h3>
                <p className="text-sm text-gray-600">
                  Un hôtel inactif n'apparaîtra pas sur le site web
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('is_active', true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                    formData.is_active
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Actif
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('is_active', false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                    !formData.is_active
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  Inactif
                </button>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Information importante</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    Un hôtel désactivé ne sera pas visible par les clients et les nouvelles réservations seront suspendues. Les réservations existantes resteront actives.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate(`/director/hotels/${id}`)}
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
                  Mise à jour en cours...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Mettre à jour l'hôtel
                </>
              )}
            </button>
          </div>
          
          {/* Aperçu des modifications */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-4">Résumé des modifications</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nom:</span>
                <span className="font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ville:</span>
                <span className="font-medium">{formData.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Statut:</span>
                <span className={`font-medium ${formData.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {formData.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nouvelles images:</span>
                <span className="font-medium">{newImages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Images totales:</span>
                <span className="font-medium">{images.length + newImages.length}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditHotel;