import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { activateAccount } from "../../services/auth.service";
import Logo from "../../components/Logo";
import { CheckCircle, XCircle, ArrowRight, Home, Clock } from 'lucide-react';

export default function ActivateAccount() {
    const { uidb64, token } = useParams();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(5);
    const [isLoading, setIsLoading] = useState(true);
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
                    setMessage("Votre compte a été activé avec succès ! Vous pouvez maintenant vous connecter.");
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
        activate();

        return () => {
            // clear pending timeout when unmounting
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
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="hidden sm:block">
                  <Logo />
                </div>
                <div className="sm:hidden">
                  <div className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-pink-300 bg-clip-text text-transparent">
                    HS
                  </div>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">Activation du compte</h1>
                  <p className="text-indigo-100 text-sm">
                    {isLoading ? "Validation en cours..." : "Terminez votre inscription"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Chargement */}
            {isLoading && (
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-indigo-600 animate-spin"></div>
                </div>
                <p className="text-gray-600">Activation de votre compte en cours...</p>
              </div>
            )}

            {/* Message de succès */}
            {message && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Succès !</h3>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 mb-4">
                    {message}
                  </div>
                  
                  {/* Compte à rebours */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full mb-6">
                    <Clock className="w-4 h-4" />
                    <span>Redirection dans</span>
                    <span className="font-bold text-lg">{countdown}</span>
                    <span>s</span>
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
              </div>
            )}

            {/* Message d'erreur */}
            {error && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Échec de l'activation</h3>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
                    {error}
                  </div>
                </div>

                {/* Actions d'erreur */}
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Aller à la page de connexion
                  </Link>
                  
                  <Link
                    to="/"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Home className="w-5 h-5" />
                    Retour à l'accueil
                  </Link>
                </div>
              </div>
            )}

            {/* Indicateur de progression */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className={`text-sm ${message ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                  Étape 2/3
                </div>
                <div className="flex gap-2">
                  <div className={`w-2 h-2 rounded-full ${message ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div className={`w-2 h-2 rounded-full ${message ? 'bg-green-500' : isLoading ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                  <div className={`w-2 h-2 rounded-full ${message ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>
                Vous rencontrez des problèmes ?{' '}
                <Link to="/contact" className="text-indigo-600 hover:underline">
                  Contactez-nous
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
}