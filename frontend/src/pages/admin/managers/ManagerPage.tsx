import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  UserPlus,
  MoreVertical,
  Shield,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Loader as LoaderIcon,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import Loader from '../../../components/Loader';
import { getAllDirectors, toggleBlockUser, deleteUser } from '../../../services/auth.service'; // Importez vos services
import type { Director } from "../../../types/auth" // Type depuis votre service

interface DirectorExtended extends Director {
  // Vous pouvez étendre l'interface si nécessaire
}

const ManagersPage: React.FC = () => {
  const navigate = useNavigate();
  const [directors, setDirectors] = useState<DirectorExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked'>('all');
  const [selectedDirector, setSelectedDirector] = useState<DirectorExtended | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Charger les managers depuis l'API
  useEffect(() => {
    fetchDirectors();
  }, []);

  const fetchDirectors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getAllDirectors();
      setDirectors(data);
    } catch (err: any) {
      console.error('Erreur lors du chargement des managers:', err);
      setError(err.message || 'Une erreur est survenue lors du chargement des managers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDirectors();
  };

  // Filtrer les managers selon la recherche et le statut
  const filteredDirectors = directors.filter(director => {
    const matchesSearch = 
      director.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      director.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      director.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      director.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (director.phone_number && director.phone_number.includes(searchTerm));

    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && !director.is_blocked) ||
      (filterStatus === 'blocked' && director.is_blocked);

    return matchesSearch && matchesStatus;
  });

  // Toggle le statut de blocage d'un manager
  const toggleBlockStatus = async (director: DirectorExtended) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir ${director.is_blocked ? 'débloquer' : 'bloquer'} ce manager ?`)) {
      return;
    }

    try {
      setActionLoading(director.id);
      
      // Appel à votre service
      await toggleBlockUser(director.id, true);

      // Mettre à jour la liste localement
      setDirectors(prev => prev.map(d => 
        d.id === director.id ? { ...d, is_blocked: !d.is_blocked } : d
      ));

    } catch (err: any) {
      console.error('Erreur lors du changement de statut:', err);
      alert(err.message || 'Une erreur est survenue lors du changement de statut');
    } finally {
      setActionLoading(null);
    }
  };

  // Supprimer un manager
  const handleDeleteDirector = async (director: DirectorExtended) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le manager "${director.first_name} ${director.last_name}" ?`)) {
      return;
    }

    try {
      setActionLoading(director.id);
      
      // Appel à votre service
      await deleteUser(director.id);

      // Retirer le manager de la liste
      setDirectors(prev => prev.filter(d => d.id !== director.id));

      alert('Manager supprimé avec succès');

    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      alert(err.message || 'Une erreur est survenue lors de la suppression');
    } finally {
      setActionLoading(null);
    }
  };

  // Fonction pour formater le numéro de téléphone
  const formatPhoneNumber = (phone: string | null | undefined): string => {
    if (!phone) return 'Non renseigné';
    return phone;
  };

  if (loading) {
    return <Loader fullScreen text="Chargement des managers..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Managers</h1>
                <p className="text-gray-600 mt-1">
                  Gérez les directeurs d'hôtels et leurs permissions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-gray-500">
                <span className="font-medium">{directors.length}</span> manager(s) au total
              </span>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Rafraîchissement...' : 'Rafraîchir'}
              </button>
            </div>
          </div>
          
          <Link
            to="/admin/managers/create"
            className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm hover:shadow"
          >
            <UserPlus className="w-5 h-5" />
            Ajouter un manager
          </Link>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-red-800">Erreur de chargement</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={fetchDirectors}
              className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Barre de contrôle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Barre de recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un manager..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif seulement</option>
              <option value="blocked">Bloqué seulement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des managers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* En-tête du tableau */}
        <div className="border-b border-gray-200">
          <div className="grid grid-cols-12 px-6 py-3 bg-gray-50 text-sm font-semibold text-gray-700 uppercase tracking-wider">
            <div className="col-span-4">Manager</div>
            <div className="col-span-3">Contact</div>
            <div className="col-span-2">Statut</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>
        </div>

        {/* Corps du tableau */}
        <div className="divide-y divide-gray-100">
          {filteredDirectors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'Aucun résultat' : 'Aucun manager'}
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-4">
                {searchTerm || filterStatus !== 'all'
                  ? 'Aucun manager ne correspond à vos critères de recherche.'
                  : 'Commencez par ajouter un nouveau manager.'}
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Link
                  to="/admin/managers/create"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  Ajouter un manager
                </Link>
              )}
            </div>
          ) : (
            filteredDirectors.map((director) => (
              <div key={director.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-12 items-center gap-4">
                  {/* Informations du manager */}
                  <div className="col-span-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">
                            {director.first_name || 'Prénom'} {director.last_name || 'Nom'}
                          </h3>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            {director.role || 'DIRECTOR'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">@{director.username}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="col-span-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 text-sm truncate" title={director.email}>
                          {director.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 text-sm" title={formatPhoneNumber(director.phone_number)}>
                          {formatPhoneNumber(director.phone_number)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Statut */}
                  <div className="col-span-2">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      director.is_blocked
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {director.is_blocked ? (
                        <>
                          <XCircle className="w-4 h-4" />
                          Bloqué
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Actif
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin/managers/${director.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Voir les détails"
                        disabled={actionLoading === director.id}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => navigate(`/admin/managers/${director.id}/edit`)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Modifier"
                        disabled={actionLoading === director.id}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => toggleBlockStatus(director)}
                        className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          director.is_blocked
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-yellow-600 hover:bg-yellow-50'
                        }`}
                        title={director.is_blocked ? 'Débloquer' : 'Bloquer'}
                        disabled={actionLoading === director.id}
                      >
                        {actionLoading === director.id ? (
                          <LoaderIcon className="w-4 h-4 animate-spin" />
                        ) : director.is_blocked ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteDirector(director)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Supprimer"
                        disabled={actionLoading === director.id}
                      >
                        {actionLoading === director.id ? (
                          <LoaderIcon className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setSelectedDirector(selectedDirector?.id === director.id ? null : director)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={actionLoading === director.id}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {selectedDirector?.id === director.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  navigate(`/admin/managers/${director.id}/hotels`);
                                  setSelectedDirector(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                Voir les hôtels assignés
                              </button>
                              <button
                                onClick={() => {
                                  // Fonctionnalité de réinitialisation du mot de passe
                                  alert(`Réinitialisation du mot de passe pour ${director.first_name}`);
                                  setSelectedDirector(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                Réinitialiser le mot de passe
                              </button>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(director.email);
                                  alert('Email copié dans le presse-papier');
                                  setSelectedDirector(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                Copier l'email
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Statistiques */}
      {directors.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-700 font-medium">Total Managers</p>
                <p className="text-2xl font-bold text-indigo-900">{directors.length}</p>
              </div>
              <Users className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Managers Actifs</p>
                <p className="text-2xl font-bold text-green-900">
                  {directors.filter(d => !d.is_blocked).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Managers Bloqués</p>
                <p className="text-2xl font-bold text-red-900">
                  {directors.filter(d => d.is_blocked).length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Affichage de {filteredDirectors.length} manager(s) sur {directors.length}
          {searchTerm && ` (recherche: "${searchTerm}")`}
        </p>
      </div>
    </div>
  );
};

export default ManagersPage;