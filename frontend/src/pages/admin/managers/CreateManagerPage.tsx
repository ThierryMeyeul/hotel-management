import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UserPlus,
  ArrowLeft,
  Mail,
  Phone,
  User,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Shield,
  Loader as LoaderIcon
} from 'lucide-react';
import Loader from '../../../components/Loader';
import { registerDirector } from '../../../services/auth.service';

interface CreateManagerFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  password: string;
  confirmPassword: string;
  role: 'DIRECTOR';
}

const CreateManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<CreateManagerFormData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
    role: 'DIRECTOR'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    // Validation des champs obligatoires
    if (!formData.username.trim()) errors.push('Le nom d\'utilisateur est requis');
    if (!formData.email.trim()) errors.push('L\'email est requis');
    if (!formData.first_name.trim()) errors.push('Le prénom est requis');
    if (!formData.last_name.trim()) errors.push('Le nom est requis');
    if (!formData.password) errors.push('Le mot de passe est requis');
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('L\'email n\'est pas valide');
    }

    // Validation mot de passe
    if (formData.password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.push('Les mots de passe ne correspondent pas');
    }

    // Validation téléphone (optionnel mais format si fourni)
    if (formData.phone_number && !/^[\d\s\-\+\(\)]{10,20}$/.test(formData.phone_number)) {
      errors.push('Le numéro de téléphone n\'est pas valide');
    }

    // Validation nom d'utilisateur
    if (formData.username.length < 3) {
      errors.push('Le nom d\'utilisateur doit contenir au moins 3 caractères');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join('. '));
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Préparer les données pour l'API
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone_number: formData.phone_number.trim(),
        password: formData.password,
        role: 'DIRECTOR' as const
      };

      // Appel API via votre service
      const response = await registerDirector(userData.username, userData.password, userData.email, userData.first_name, userData.last_name, userData.phone_number, userData.role);
      
      setSuccess(`Manager "${response.first_name} ${response.last_name}" créé avec succès !`);
      
      // Réinitialiser le formulaire
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        password: '',
        confirmPassword: '',
        role: 'DIRECTOR'
      });
      
      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate('/admin/managers');
      }, 2000);

    } catch (err: any) {
      console.error('Erreur création manager:', err);
      
      // Gestion d'erreur spécifique selon la réponse de l'API
      if (err.response?.data) {
        const apiErrors = err.response.data;
        if (typeof apiErrors === 'object') {
          const errorMessages = Object.values(apiErrors).flat().join('. ');
          setError(`Erreur: ${errorMessages}`);
        } else {
          setError(err.response.data?.detail || err.message);
        }
      } else {
        setError(err.message || 'Une erreur est survenue lors de la création du manager');
      }
    } finally {
      setLoading(false);
    }
  };

  // Indicateur de force du mot de passe
  const getPasswordStrength = (password: string): { score: number; text: string; color: string, bg: string } => {
    if (!password) return { score: 0, text: '', color: 'gray', bg: 'bg-green-100' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    const strength = [
      { text: 'Très faible', color: 'text-red-600', bg: 'bg-red-500' },
      { text: 'Faible', color: 'text-orange-600', bg: 'bg-orange-500' },
      { text: 'Moyen', color: 'text-yellow-600', bg: 'bg-yellow-500' },
      { text: 'Fort', color: 'text-green-600', bg: 'bg-green-500' },
      { text: 'Très fort', color: 'text-emerald-600', bg: 'bg-emerald-500' }
    ][score];
    
    return { score, ...strength };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                to="/admin/managers"
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour à la liste</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ajouter un nouveau manager</h1>
                <p className="text-gray-600 mt-1">
                  Créez un compte manager avec les informations nécessaires
                </p>
              </div>
            </div>
          </div>
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
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="w-5 h-5" />
          </button>
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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
              <p className="text-sm text-gray-500">Informations de base du manager</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="John"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Doe"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                minLength={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="john.doe"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-2">
                Minimum 3 caractères, lettres, chiffres et underscores uniquement
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="john.doe@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="+33 1 23 45 67 89"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Format international recommandé
              </p>
            </div>

            <div className="md:col-span-2 flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Rôle du compte</p>
                <p className="text-sm text-blue-700">Ce compte sera créé avec le rôle <strong>DIRECTOR</strong></p>
              </div>
            </div>
          </div>
        </div>

        {/* Sécurité */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
              <p className="text-sm text-gray-500">Informations de connexion</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Indicateur de force du mot de passe */}
              {formData.password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      Force du mot de passe: {passwordStrength.text}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formData.password.length} caractères
                    </span>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${passwordStrength.bg} transition-all duration-300`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="mt-3 text-xs text-gray-500 space-y-1">
                <p className="flex items-center gap-1">
                  <Check className={`w-3 h-3 ${formData.password.length >= 8 ? 'text-green-500' : 'text-gray-300'}`} />
                  Au moins 8 caractères
                </p>
                <p className="flex items-center gap-1">
                  <Check className={`w-3 h-3 ${/[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-gray-300'}`} />
                  Une majuscule
                </p>
                <p className="flex items-center gap-1">
                  <Check className={`w-3 h-3 ${/[0-9]/.test(formData.password) ? 'text-green-500' : 'text-gray-300'}`} />
                  Un chiffre
                </p>
                <p className="flex items-center gap-1">
                  <Check className={`w-3 h-3 ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-500' : 'text-gray-300'}`} />
                  Un caractère spécial
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Validation de correspondance */}
              {formData.confirmPassword && (
                <div className={`mt-3 flex items-center gap-2 ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Les mots de passe correspondent</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      <span className="text-sm font-medium">Les mots de passe ne correspondent pas</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <Link
              to="/admin/managers"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <LoaderIcon className="w-5 h-5 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Créer le manager
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Notes */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Notes importantes</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Le manager recevra un email avec ses informations de connexion</li>
          <li>• Vous pourrez assigner des hôtels à ce manager plus tard depuis la liste des managers</li>
          <li>• Le manager aura accès au dashboard dédié aux directeurs</li>
          <li>• Vous pourrez modifier ses informations à tout moment</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateManagerPage;