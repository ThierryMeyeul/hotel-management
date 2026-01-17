import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { login, saveToken, saveUserInfo } from "../../services/auth.service";
import Logo from "../../components/Logo";
import Spinner from "../../components/Spinner";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login: loginContext } = useAuth();
    const location = useLocation();
    const from = (location.state as any)?.from || '/';
    
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
                // update context so RoleRoute can work immediately
                try { loginContext?.(data.user); } catch (e) { /* noop */ }
            }
            // redirect to previous page if present
            navigate(from);
        } catch (err: any) {
            // Extract message from backend response when possible
            let message = 'Login failed. Please check your credentials.';

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
                // Join any field error messages
                    try {
                        const values = Object.values(respData).flat();
                        message = values.join(' ');
                    } catch (e) {
                        // fallback
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-6">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          <div className="hidden md:flex flex-col items-center justify-center p-8 bg-gradient-to-b from-indigo-500 to-pink-500 text-white">
            <Logo />
            <h3 className="mt-6 text-2xl font-semibold">Bienvenue sur HotelSphere</h3>
            <p className="mt-2 text-center text-indigo-100">Réservez facilement — confort et élégance au rendez-vous.</p>
            <div className="mt-6 w-full opacity-90">
              {/* optional illustration; place file at public or replace with image you prefer */}
              <img src="/src/assets/hotel-illustration.webp" alt="Hotel" className="w-full object-contain"/>
            </div>
          </div>
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <Logo />
              <div className="text-sm text-gray-500">Bienvenue — connectez-vous</div>
            </div>
            {error && <div className="mb-4 text-red-600 font-medium">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
                <input id="username" type="text" value={username} onChange={(e)=>{ setUsername(e.target.value); setError(null); }} disabled={isLoading} className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed" required />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <input id="password" type="password" value={password} onChange={(e)=>{ setPassword(e.target.value); setError(null); }} disabled={isLoading} className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed" required />
              </div>
              <div className="flex items-center justify-between text-sm">
                <Link to="/forgot-password" className="text-indigo-600 hover:underline">Mot de passe oublié ?</Link>
                <Link to="/signup" className="text-gray-600 hover:underline">Pas de compte ? S'inscrire</Link>
              </div>
              <button type="submit" disabled={isLoading} aria-busy={isLoading} className={`w-full mt-2 bg-indigo-600 text-white py-2 rounded-md transition ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-indigo-700'}`}>
                {isLoading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Spinner variant="inline" svgClass="h-5 w-5" />
                    Connexion...
                  </span>
                ) : 'Se connecter'}
              </button>
              <div className="mt-4 text-center text-sm text-gray-500">ou connectez-vous avec</div>
              <div className="mt-2 flex gap-3">
                <button type="button" className="flex-1 py-2 border rounded-md flex items-center justify-center gap-2 hover:bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" className="text-red-500"><path fill="currentColor" d="M21.35 11.1h-9.3v2.8h5.3c-.23 1.5-1.58 3.9-5.3 3.9-3.18 0-5.8-2.63-5.8-5.86 0-3.24 2.62-5.86 5.8-5.86 1.82 0 3.03.78 3.72 1.46l2.56-2.47C18.34 4.04 16.11 3 12.85 3 7.9 3 4 6.92 4 11.86s3.9 8.86 8.85 8.86c5.09 0 8.3-3.57 8.3-8.6 0-.58-.06-1.03-.8-1.02z"/></svg>
                  Google
                </button>
                <button type="button" className="flex-1 py-2 border rounded-md flex items-center justify-center gap-2 hover:bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" className="text-black"><path fill="currentColor" d="M16.365 1.43c-.85.06-2.03.57-2.7 1.3-.58.63-1.1 1.61-1.06 2.56.03.86.56 1.9 1.1 2.56.57.72 1.44 1.27 2.3 1.3.18-1.2.7-2.2 1.45-2.86.72-.62 1.36-1.36 1.17-2.43-.1-.64-.48-1.1-.99-1.66-.53-.6-1.45-.92-2.27-.77zM12.5 8.5c-.2-1.13-.04-2.47.6-3.53C12.1 4.7 11.2 4 10 4c-1.14 0-2.3.55-3 .86C6 6.17 5 7.5 5 9.3c0 2.53 1.4 5.1 4 6 1.5.55 2.7.27 3.7-.03.1-.03.7-.3.8-.38.4-.25.9-.62 1.3-1.1.3-.38.6-.8.6-1.45 0-1.6-1.02-2.85-1.9-3.9-.7-.8-1.3-1.53-1.6-2.3z"/></svg>
                  Apple
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
}