import React, { useState, useEffect } from 'react';
import { Star, X, Edit, AlertCircle, CheckCircle } from 'lucide-react';
import { reviewService } from '../services/review.service';
import type { Review } from '../types/review';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelId: number;
  hotelName: string;
  reservationId?: number;
  existingReview?: Review | null;
  onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  hotelId,
  hotelName,
  reservationId,
  existingReview,
  onSuccess
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialiser le formulaire avec les données existantes
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    } else {
      setRating(5);
      setComment('');
    }
  }, [existingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (existingReview) {
        // Mettre à jour l'avis existant
        await reviewService.updateReview(existingReview.id, {
          rating,
          comment
        });
        setSuccess('Votre avis a été modifié avec succès !');
      } else {
        // Créer un nouvel avis
        await reviewService.createReview({
          hotel: hotelId,
          rating,
          comment,
          reservation_id: reservationId
        });
        setSuccess('Votre avis a été publié avec succès !');
      }

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="p-6">
          {/* En-tête */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {existingReview ? 'Modifier votre avis' : 'Donner votre avis'}
              </h2>
              <p className="text-gray-600 mt-1">{hotelName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Messages d'erreur/succès */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            {/* Sélection des étoiles */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Votre note
              </label>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoveredRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-lg font-medium text-gray-700 ml-2">
                  {rating}/5
                </span>
              </div>
            </div>

            {/* Commentaire */}
            <div className="mb-6">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Votre commentaire
              </label>
              <textarea
                id="comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre expérience dans cet hôtel..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Minimum 10 caractères, maximum 500 caractères
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || comment.length < 10}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-lg hover:from-indigo-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {existingReview ? (
                  <>
                    <Edit className="w-4 h-4" />
                    Modifier l'avis
                  </>
                ) : (
                  'Publier l\'avis'
                )}
              </button>
            </div>
          </form>

          {/* Note sur la modification */}
          {existingReview && (
            <div className="mt-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Vous avez déjà laissé un avis pour cet hôtel. Vous pouvez le modifier ou le supprimer.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;