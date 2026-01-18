import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, saveToken, saveUserInfo } from "../../services/auth.service";
import Logo from "../../components/Logo";
import Spinner from "../../components/Spinner";
import { useAuth } from "../../context/AuthContext";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Mail, 
  ArrowRight,
  Smartphone,
  Shield
} from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login: loginContext } = useAuth();
    // const location = useLocation();
    
    const getRedirectPath = (userRole: string) => {
        switch(userRole) {
            case 'CLIENT':
                return '/client/dashboard';
            case 'manager':
            case 'DIRECTOR':
                return '/director/dashboard';
            case 'ADMIN':
                return '/admin/dashboard';
            default:
                return '/';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        
        try {
            const data = await login(username, password);
            setError(null);
            
            if (data) {
                saveToken(data.token);
                saveUserInfo(data.user);
                
                // Update context so RoleRoute can work immediately
                try { 
                    loginContext?.(data.user); 
                } catch (e) { 
                    console.error('Context update error:', e);
                }
                
                // Determine redirect path based on user role
                const redirectPath = getRedirectPath(data.user.role);
                navigate(redirectPath);
            }
        } catch (err: any) {
            // Extract message from backend response when possible
            let message = 'Échec de la connexion. Veuillez vérifier vos identifiants.';

            const respData = err?.response?.data;
            if (respData) {
                if (typeof respData === 'string') {
                    message = respData;
                } else if (respData.detail) {
                    message = respData.detail;
                } else if (respData.non_field_errors) {
                    message = Array.isArray(respData.non_field_errors)
                    ? respData.non_field_errors.join(' ')
                    : String(respData.non_field_errors);
                } else if (typeof respData === 'object') {
                    try {
                        const values = Object.values(respData).flat();
                        message = values.join(' ');
                    } catch (e) {
                        message = JSON.stringify(respData);
                    }
                }
            } else if (err?.message) {
                message = err.message;
            }

            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-4 sm:p-6">
        <div className="max-w-6xl w-full bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          {/* Colonne gauche - Illustration */}
          <div className="hidden lg:flex flex-col items-center justify-center p-6 md:p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
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
                Bienvenue sur <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">HotelSphere</span>
              </h2>
              
              <p className="text-indigo-100 mb-8 text-sm md:text-base">
                Réservez facilement — confort et élégance au rendez-vous. Connectez-vous pour accéder à votre espace personnalisé.
              </p>
              
              {/* Caractéristiques */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Connexion sécurisée</h4>
                    <p className="text-indigo-200 text-sm">Vos données sont protégées</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Multi-plateforme</h4>
                    <p className="text-indigo-200 text-sm">Accès depuis tous vos appareils</p>
                  </div>
                </div>
              </div>
              
              {/* Illustration */}
              <div className="mt-10">
                <img 
                  src="/src/assets/hotel-illustration.webp" 
                  alt="Hotel" 
                  className="w-full max-w-md mx-auto transform hover:scale-105 transition-transform duration-300"
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
                Connexion à votre compte
              </h2>
              <p className="text-gray-600 text-center text-sm">
                Accédez à votre espace personnalisé
              </p>
            </div>
            
            {/* En-tête desktop */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Connectez-vous à votre compte
              </h2>
            </div>
            
            {/* Message d'erreur */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <div className="p-1 bg-red-100 rounded-lg">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-red-800">Erreur de connexion</h3>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}
            
            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Champ email/username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Nom d'utilisateur ou Email</span>
                  </div>
                </label>
                <div className="relative">
                  <input 
                    id="username" 
                    type="text" 
                    value={username} 
                    onChange={(e) => { 
                      setUsername(e.target.value); 
                      setError(null); 
                    }} 
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    placeholder="votre@email.com ou nom_utilisateur"
                    required 
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              
              {/* Champ mot de passe */}
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
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    placeholder="Votre mot de passe"
                    required 
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="mt-2 flex justify-end">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline transition"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>
              
              {/* Options supplémentaires */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Se souvenir de moi
                  </label>
                </div>
              </div>
              
              {/* Bouton de connexion */}
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
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              
              {/* Séparateur */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Ou continuez avec</span>
                </div>
              </div>
              
              {/* Connexion sociale */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                
                <button 
                  type="button" 
                  className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                >
                  <svg className="w-5 h-5" fill="#000000" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Apple
                </button>
              </div>
            </form>
            
            {/* Lien d'inscription */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm">
                Vous n'avez pas de compte ?{' '}
                <Link 
                  to="/signup" 
                  className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition"
                >
                  Créer un compte
                </Link>
              </p>
              <p className="mt-2 text-xs text-gray-500">
                En vous connectant, vous acceptez nos{' '}
                <Link to="/terms" className="text-indigo-500 hover:underline">Conditions d'utilisation</Link>{' '}
                et notre{' '}
                <Link to="/privacy" className="text-indigo-500 hover:underline">Politique de confidentialité</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
}