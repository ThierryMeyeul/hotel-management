import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { activateAccount } from "../../services/auth.service";
import Logo from "../../components/Logo";


export default function ActivateAccount() {
    const { uidb64, token } = useParams();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const activatedRef = useRef(false);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        // Prevent double activation calls in React Strict Mode (dev)
        if (activatedRef.current) return;
        activatedRef.current = true;

        const activate = async () => {
            if (uidb64 && token) {
                try {
                    await activateAccount(uidb64, token);
                    setMessage("Votre compte a été activé avec succès ! Vous pouvez maintenant vous connecter.");
                    setError(null);
                    timeoutRef.current = window.setTimeout(() => {
                        navigate('/login');
                    }, 3000);
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
                }
            }
        };
        activate();

        return () => {
            // clear pending timeout when unmounting
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [uidb64, token, navigate]);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <Logo />
            <div className="text-sm text-gray-500">Activation du compte</div>
          </div>
          {message && <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">{message}</div>}
          {error && <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">{error}</div>}
          <div className="mt-4 text-center">
            <Link to="/login" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Retour à la page de connexion</Link>
          </div>
        </div>
      </div>
    );
}