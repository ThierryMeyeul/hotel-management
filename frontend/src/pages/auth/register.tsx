import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as registerUser } from "../../services/auth.service";
import Logo from "../../components/Logo";
import Spinner from "../../components/Spinner";
import {
  User,
  Mail,
  Lock,
  Phone,
  Check,
  X,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Smartphone,
  UserPlus
} from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Vérifications de force du mot de passe
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  const parseError = (err: any) => {
    let message = "Échec de l'inscription. Veuillez vérifier les informations.";
    const respData = err?.response?.data;
    if (respData) {
      if (typeof respData === "string") {
        message = respData;
      } else if (respData.detail) {
        message = respData.detail;
      } else if (typeof respData === "object") {
        try {
          const values = Object.values(respData).flat();
          message = values.join(" ");
        } catch (e) {
          message = JSON.stringify(respData);
        }
      }
    } else if (err?.message) {
      message = err.message;
    }
    return message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    try {
      setIsLoading(true);
      const data = await registerUser(username, password, email, firstName, lastName, phone);
      setError(null);
      setSuccess("Compte créé avec succès !");
      // Redirection vers la page d'activation
      navigate('/activation-sent', { state: { email } });
    } catch (err: any) {
      setError(parseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-4 sm:p-6">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Colonne gauche - Illustration */}
        <div className="hidden lg:flex flex-col items-center justify-center p-6 md:p-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
          {/* Effet de fond */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-white"></div>
          </div>
          
          <div className="relative z-10 w-full max-w-md">
            <div className="mb-8">
              <Logo />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Rejoignez <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-pink-300">HotelSphere</span>
            </h2>
            
            <p className="text-blue-100 mb-8 text-sm md:text-base">
              Créez votre compte pour réserver facilement et profiter d'offres exclusives.
              Votre aventure commence ici !
            </p>
            
            {/* Avantages */}
            <div className="space-y-4 mb-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">Compte 100% sécurisé</h4>
                  <p className="text-blue-200 text-sm">Vos données sont protégées</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">Réservation rapide</h4>
                  <p className="text-blue-200 text-sm">En quelques clics seulement</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">Offres exclusives</h4>
                  <p className="text-blue-200 text-sm">Réservées aux membres</p>
                </div>
              </div>
            </div>
            
            {/* Illustration */}
            <div className="mt-8">
              <img 
                src="/src/assets/hotel-illustration.webp" 
                alt="Hotel" 
                className="w-full max-w-md mx-auto transform hover:scale-105 transition-transform duration-300 rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Colonne droite - Formulaire */}
        <div className="p-6 sm:p-8 md:p-10">
          {/* En-tête mobile */}
          <div className="lg:hidden mb-6">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Créez votre compte
            </h2>
            <p className="text-gray-600 text-center text-sm">
              Rejoignez notre communauté de voyageurs
            </p>
          </div>

          {/* En-tête desktop */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Inscrivez-vous gratuitement
            </h2>
            <p className="text-gray-600">
              Remplissez le formulaire ci-dessous pour créer votre compte
            </p>
          </div>

          {/* Messages d'erreur/succès */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <div className="p-1 bg-red-100 rounded-lg">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-red-800">Erreur d'inscription</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <div className="p-1 bg-green-100 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-green-800">Succès !</h3>
                <p className="text-green-600 text-sm mt-1">{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Prénom</span>
                  </div>
                </label>
                <input 
                  id="firstName" 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => { 
                    setFirstName(e.target.value); 
                    setError(null); 
                  }} 
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  placeholder="Votre prénom"
                  required 
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Nom</span>
                  </div>
                </label>
                <input 
                  id="lastName" 
                  type="text" 
                  value={lastName} 
                  onChange={(e) => { 
                    setLastName(e.target.value); 
                    setError(null); 
                  }} 
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  placeholder="Votre nom"
                  required 
                />
              </div>
            </div>

            {/* Nom d'utilisateur */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Nom d'utilisateur</span>
                </div>
              </label>
              <input 
                id="username" 
                type="text" 
                value={username} 
                onChange={(e) => { 
                  setUsername(e.target.value); 
                  setError(null); 
                }} 
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                placeholder="Choisissez un nom d'utilisateur"
                required 
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Adresse email</span>
                </div>
              </label>
              <input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => { 
                  setEmail(e.target.value); 
                  setError(null); 
                }} 
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                placeholder="votre@email.com"
                required 
              />
            </div>

            {/* Mot de passe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>Mot de passe</span>
                  </div>
                </label>
                <div className="relative">
                  <input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => { 
                      setPassword(e.target.value); 
                      setError(null); 
                    }} 
                    disabled={isLoading}
                    className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    placeholder="Votre mot de passe"
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>Confirmation</span>
                  </div>
                </label>
                <div className="relative">
                  <input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={(e) => { 
                      setConfirmPassword(e.target.value); 
                      setError(null); 
                    }} 
                    disabled={isLoading}
                    className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    placeholder="Confirmez votre mot de passe"
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Indicateur de force du mot de passe */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Force du mot de passe</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`p-0.5 rounded-full ${passwordChecks.length ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${passwordChecks.length ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <span className={`text-sm ${passwordChecks.length ? 'text-green-600' : 'text-gray-600'}`}>
                    Au moins 8 caractères
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`p-0.5 rounded-full ${passwordChecks.uppercase ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${passwordChecks.uppercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <span className={`text-sm ${passwordChecks.uppercase ? 'text-green-600' : 'text-gray-600'}`}>
                    Au moins une majuscule
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`p-0.5 rounded-full ${passwordChecks.number ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${passwordChecks.number ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <span className={`text-sm ${passwordChecks.number ? 'text-green-600' : 'text-gray-600'}`}>
                    Au moins un chiffre
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`p-0.5 rounded-full ${passwordChecks.special ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${passwordChecks.special ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <span className={`text-sm ${passwordChecks.special ? 'text-green-600' : 'text-gray-600'}`}>
                    Au moins un caractère spécial
                  </span>
                </div>
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>Téléphone (optionnel)</span>
                </div>
              </label>
              <input 
                id="phone" 
                type="tel" 
                value={phone} 
                onChange={(e) => { 
                  setPhone(e.target.value); 
                  setError(null); 
                }} 
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            {/* Conditions d'utilisation */}
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                J'accepte les{' '}
                <Link to="/terms" className="text-indigo-600 hover:text-indigo-700 hover:underline">
                  Conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link to="/privacy" className="text-indigo-600 hover:text-indigo-700 hover:underline">
                  Politique de confidentialité
                </Link>
              </label>
            </div>

            {/* Bouton d'inscription */}
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                isLoading 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl'
              } text-white`}
            >
              {isLoading ? (
                <>
                  <Spinner variant="inline" svgClass="h-5 w-5" />
                  <span>Création en cours...</span>
                </>
              ) : (
                <>
                  <span>Créer mon compte</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Lien vers connexion */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                Vous avez déjà un compte ?{' '}
                <Link 
                  to="/login" 
                  className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}