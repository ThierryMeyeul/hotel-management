import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { activateAccount } from "../../services/auth.service";
import Logo from "../../components/Logo";
// import Loader from "../../components/Loader";
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Home, 
  Mail, 
  Shield,
  RefreshCw,
  Clock
} from 'lucide-react';

export default function ActivateAccount() {
    const { uidb64, token } = useParams();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [countdown, setCountdown] = useState(5);
    const navigate = useNavigate();
    const activatedRef = useRef(false);
    const timeoutRef = useRef<number | null>(null);
    const countdownRef = useRef<number | null>(null);

    useEffect(() => {
        // Prevent double activation calls in React Strict Mode (dev)
        if (activatedRef.current) return;
        activatedRef.current = true;

        const activate = async () => {
            if (uidb64 && token) {
                try {
                    setIsLoading(true);
                    await activateAccount(uidb64, token);
                    setMessage("Votre compte a été activé avec succès ! Redirection vers la connexion...");
                    setError(null);
                    
                    // Démarrer le compte à rebours
                    countdownRef.current = window.setInterval(() => {
                        setCountdown(prev => {
                            if (prev <= 1) {
                                if (countdownRef.current) {
                                    clearInterval(countdownRef.current);
                                }
                                navigate('/login');
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);
                    
                } catch (err: any) {
                    // Log error for debugging
                    console.error('Activation error:', err);

                    let errorMsg = "Échec de l'activation du compte. Le lien peut être invalide ou expiré.";
                    const respData = err?.response?.data;
                    if (respData) {
                        if (typeof respData === 'string') {
                            errorMsg = respData;
                        } else if (respData.detail) {
                            errorMsg = respData.detail;
                        } else if (typeof respData === 'object') {
                            try {
                                const values = Object.values(respData).flat();
                                errorMsg = values.join(' ');
                            } catch (e) {
                                errorMsg = JSON.stringify(respData);
                            }
                        }
                    } else if (err?.message) {
                        errorMsg = err.message;
                    }
                    setError(errorMsg);
                    setMessage(null);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setError("Lien d'activation invalide. Veuillez vérifier l'URL.");
                setIsLoading(false);
            }
        };
        
        // Simuler un léger délai pour une meilleure UX
        const timer = setTimeout(activate, 500);
        
        return () => {
            clearTimeout(timer);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }
        };
    }, [uidb64, token, navigate]);

    const handleManualRedirect = () => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
        }
        navigate('/login');
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-4 sm:p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Logo />
              <div className="text-sm text-blue-100">Activation du compte</div>
            </div>
            <h1 className="text-2xl font-bold">Validation de votre compte</h1>
            <p className="text-blue-100 mt-2">
              Nous vérifions votre lien d'activation...
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {isLoading ? (
              <div className="space-y-6">
                {/* Animation de chargement */}
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 rounded-full border-4 border-gray-200 border-t-indigo-600 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-indigo-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Activation en cours
                  </h3>
                  <p className="text-gray-600">
                    Nous validons votre lien d'activation...
                  </p>
                </div>
              </div>
            ) : message ? (
              <div className="space-y-6">
                {/* Succès */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Compte activé avec succès ! 🎉
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Félicitations ! Votre compte a été activé. Vous pouvez maintenant vous connecter et profiter de toutes nos fonctionnalités.
                  </p>
                  
                  {/* Compte à rebours */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full mb-6">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Redirection automatique dans</span>
                    <span className="font-bold text-lg">{countdown}</span>
                    <span>secondes</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleManualRedirect}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Se connecter maintenant
                  </button>
                  
                  <Link
                    to="/"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Home className="w-5 h-5" />
                    Retour à l'accueil
                  </Link>
                </div>

                {/* Informations supplémentaires */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Prochaines étapes
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Connectez-vous avec vos identifiants</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Complétez votre profil personnel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Découvrez nos hôtels et offres exclusives</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : error ? (
              <div className="space-y-6">
                {/* Erreur */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
                    <XCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Échec de l'activation
                  </h3>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-6">
                    {error}
                  </div>
                </div>

                {/* Solutions */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                  <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Que faire maintenant ?
                  </h4>
                  <ul className="space-y-2 text-sm text-yellow-800">
                    <li className="flex items-start gap-2">
                      <span className="font-medium">1.</span>
                      <span>Vérifiez que le lien est complet et non expiré</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium">2.</span>
                      <span>Demandez un nouveau lien d'activation depuis la page de connexion</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium">3.</span>
                      <span>Contactez notre support si le problème persiste</span>
                    </li>
                  </ul>
                </div>

                {/* Actions pour erreur */}
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Aller à la page de connexion
                  </Link>
                  
                  <Link
                    to="/resend-activation"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Mail className="w-5 h-5" />
                    Renvoyer le lien d'activation
                  </Link>
                  
                  <Link
                    to="/contact"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Shield className="w-5 h-5" />
                    Contacter le support
                  </Link>
                </div>
              </div>
            ) : null}

            {/* Informations générales */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-3">
                  <div className="text-lg font-bold text-indigo-600">1</div>
                  <div className="text-xs text-gray-600">Inscription</div>
                </div>
                <div className="p-3">
                  <div className="text-lg font-bold text-indigo-600">2</div>
                  <div className="text-xs text-gray-600">Activation</div>
                </div>
                <div className="p-3">
                  <div className="text-lg font-bold text-gray-400">3</div>
                  <div className="text-xs text-gray-600">Connexion</div>
                </div>
              </div>
            </div>

            {/* Lien vers l'accueil */}
            <div className="mt-6 text-center">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                <Home className="w-4 h-4" />
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
}