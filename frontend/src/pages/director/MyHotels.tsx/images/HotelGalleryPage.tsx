// src/components/director/hotels/HotelGallery.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  Star,
  Eye,
  Download,
  Search,
  Filter,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Grid3x3,
  List
} from 'lucide-react';
import { hotelService } from '../../../../services/hotel.service';
import type { Hotel, HotelImage } from '../../../../types/hotel';
import { toast } from 'react-toastify';

const HotelGallery: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [images, setImages] = useState<HotelImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<HotelImage | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

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
      
    } catch (err: any) {
      console.error('Erreur API:', err);
      setError(err.response?.data?.message || 'Erreur de connexion au serveur');
      toast.error('Impossible de charger les images de l\'hôtel');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les images
  const filteredImages = images.filter(image =>
    (image.caption ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Gérer l'upload d'image
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !id) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', files[0]);
      formData.append('caption', files[0].name);
      formData.append('is_cover', 'false');

      const newImage = await hotelService.addHotelImage(parseInt(id), formData);
      setImages(prev => [...prev, newImage]);
      toast.success('Image téléchargée avec succès');
      setShowUploadModal(false);
      
    } catch (err: any) {
      console.error('Erreur upload:', err);
      toast.error(err.response?.data?.message || 'Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  // Définir comme image de couverture
  const handleSetCover = async (imageId: number) => {
    try {
      // Ici, vous feriez un appel API pour définir l'image comme couverture
      toast.success('Image de couverture définie');
    } catch (err) {
      toast.error('Erreur lors de la modification');
    }
  };

  // Supprimer une image
  const handleDeleteImage = async (imageId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette image ?') || !id) return;

    try {
      await hotelService.deleteHotelImage(parseInt(id), imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Image supprimée avec succès');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/director/hotels')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Galerie - {hotel.name}
            </h1>
            <p className="text-gray-600">
              {hotel.city}, {hotel.country} • Gestion des images
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Ajouter des images
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Images</p>
              <p className="text-2xl font-bold mt-1">{images.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <ImageIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Image de couverture</p>
              <p className="text-2xl font-bold mt-1">
                {images.filter(img => img.is_cover).length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Espace utilisé</p>
              <p className="text-2xl font-bold mt-1">
                {(images.length * 2).toFixed(1)} MB
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Barre de contrôle */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Recherche */}
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par description..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Boutons de vue */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Galerie */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {images.length === 0 
              ? 'Aucune image pour cet hôtel'
              : 'Aucune image correspondante'
            }
          </h3>
          <p className="text-gray-600 mb-6">
            {images.length === 0 
              ? 'Commencez par ajouter des images à votre hôtel'
              : 'Ajustez vos critères de recherche'
            }
          </p>
          {images.length === 0 && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2 mx-auto"
            >
              <Upload className="w-5 h-5" />
              Ajouter des images
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        // Vue Grille
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <div 
              key={image.id} 
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 group"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={image.image}
                  alt={image.caption}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {image.is_cover && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Couverture
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={() => setSelectedImage(image)}
                    className="p-2 bg-white/90 rounded-lg m-1 hover:bg-white transition"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {image.caption}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSetCover(image.id)}
                      className="p-1 hover:bg-yellow-50 rounded transition"
                      title="Définir comme couverture"
                    >
                      <Star className={`w-4 h-4 ${image.is_cover ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                    </button>
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="p-1 hover:bg-red-50 rounded transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Vue Liste
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                    Image
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                    Statut
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredImages.map((image) => (
                  <tr key={image.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-6">
                      <div className="w-16 h-16 rounded-lg overflow-hidden">
                        <img
                          src={image.image}
                          alt={image.caption}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{image.caption}</div>
                    </td>
                    <td className="py-4 px-6">
                      {image.is_cover ? (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Couverture
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedImage(image)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleSetCover(image.id)}
                          className="p-1.5 hover:bg-yellow-50 rounded-lg transition"
                          title="Définir couverture"
                        >
                          <Star className={`w-4 h-4 ${image.is_cover ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteImage(image.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal d'upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Ajouter des images</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                  disabled={uploading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 mt-1">Sélectionnez une image à télécharger</p>
            </div>
            
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Glissez-déposez une image ou cliquez pour sélectionner
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Téléchargement...
                    </>
                  ) : (
                    'Sélectionner une image'
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de visualisation */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img
              src={selectedImage.image}
              alt={selectedImage.caption}
              className="w-full h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{selectedImage.caption}</div>
                  {selectedImage.is_cover && (
                    <div className="flex items-center gap-1 text-sm text-yellow-300">
                      <Star className="w-3 h-3" />
                      Image de couverture
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={selectedImage.image}
                    download
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelGallery;