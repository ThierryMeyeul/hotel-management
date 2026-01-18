import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Home, 
  ArrowLeft, 
  Lock, 
  AlertTriangle,
  UserX,
  LogIn
} from 'lucide-react';

export default function NotAuthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 sm:p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Accès Restreint</h1>
                <p className="text-red-100 text-sm mt-1">
                  Zone protégée - Autorisation requise
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm">
              <Lock className="w-4 h-4" />
              <span>403 - Forbidden</span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Contenu principal */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-50 mb-6">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Accès Refusé
            </h2>
            
            <div className="max-w-lg mx-auto">
              <p className="text-gray-700 mb-4">
                Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                Cette zone est réservée aux utilisateurs autorisés.
              </p>
              
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm">
                <UserX className="w-4 h-4" />
                <span>Permission insuffisante</span>
              </div>
            </div>
          </div>

          {/* Causes possibles */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Causes possibles :
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold mt-0.5">
                  1
                </div>
                <span>Vous n'êtes pas connecté avec le bon compte</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold mt-0.5">
                  2
                </div>
                <span>Votre rôle utilisateur ne vous permet pas d'accéder à cette section</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold mt-0.5">
                  3
                </div>
                <span>La page nécessite des permissions spécifiques que vous ne possédez pas</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 mb-2" />
              <span className="font-medium text-gray-700">Page précédente</span>
            </button>
            
            <Link
              to="/"
              className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
            >
              <Home className="w-6 h-6 text-gray-600 mb-2" />
              <span className="font-medium text-gray-700">Accueil</span>
            </Link>
            
            <Link
              to="/login"
              className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
            >
              <LogIn className="w-6 h-6 text-gray-600 mb-2" />
              <span className="font-medium text-gray-700">Se connecter</span>
            </Link>
          </div>

          {/* Bouton principal */}
          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-lg hover:from-red-600 hover:to-orange-600 transition shadow-lg hover:shadow-xl"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </Link>
          </div>

          {/* Message de support */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Vous pensez qu'il s'agit d'une erreur ?{' '}
              <Link to="/contact" className="text-indigo-600 hover:underline font-medium">
                Contactez le support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}