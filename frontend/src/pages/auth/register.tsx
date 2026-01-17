import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as registerUser } from "../../services/auth.service";
import Logo from "../../components/ui/Logo";
import Spinner from "../../components/ui/Spinner";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
      setSuccess("Compte créé avec succès ! Vérifiez votre e‑mail pour activer le compte.");
      // Redirect to activation info page with email in location state
      navigate('/activation-sent', { state: { email } });
    } catch (err: any) {
      setError(parseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-6">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <div className="hidden md:flex flex-col items-center justify-center p-8 bg-gradient-to-b from-indigo-500 to-pink-500 text-white">
          <Logo />
          <h3 className="mt-6 text-2xl font-semibold">Rejoignez HotelSphere</h3>
          <p className="mt-2 text-center text-indigo-100">Créez votre compte pour réserver rapidement et en toute confiance.</p>
          <div className="mt-6 w-full opacity-90">
            <img src="/src/assets/hotel-illustration.webp" alt="Hotel" className="w-full object-contain" />
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <Logo />
            <div className="text-sm text-gray-500">Créez votre compte</div>
          </div>

          {error && <div className="mb-4 text-red-600 font-medium">{error}</div>}
          {success && <div className="mb-4 text-green-600 font-medium">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Prénom</label>
                <input id="firstName" type="text" value={firstName} onChange={(e) => { setFirstName(e.target.value); setError(null); }} disabled={isLoading} className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed" required />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Nom</label>
                <input id="lastName" type="text" value={lastName} onChange={(e) => { setLastName(e.target.value); setError(null); }} disabled={isLoading} className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed" required />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
              <input id="username" type="text" value={username} onChange={(e) => { setUsername(e.target.value); setError(null); }} disabled={isLoading} className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed" required />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} disabled={isLoading} className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <input id="password" type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }} disabled={isLoading} className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed" required />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }} disabled={isLoading} className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed" required />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input id="phone" type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setError(null); }} disabled={isLoading} className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed" />
            </div>

            <button type="submit" disabled={isLoading} aria-busy={isLoading} className={`w-full mt-2 bg-indigo-600 text-white py-2 rounded-md transition ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-indigo-700'}`}>
              {isLoading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Spinner variant="inline" svgClass="h-5 w-5" />
                  Création en cours...
                </span>
              ) : 'Créer un compte'}
            </button>

            <div className="mt-4 text-sm text-center text-gray-600">
              Déjà un compte ? <Link to="/login" className="text-indigo-600 hover:underline">Se connecter</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
