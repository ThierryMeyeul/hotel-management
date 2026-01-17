import { Link, useLocation } from 'react-router-dom';
import Logo from '../../components/ui/Logo';

export default function ActivationSent() {
  const location = useLocation();
  const email = (location.state as any)?.email as string | undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <Logo />
          <div className="text-sm text-gray-500">Activation du compte</div>
        </div>
        <h2 className="text-xl font-semibold mb-4">Vérifiez votre e‑mail</h2>
        <p className="text-gray-700">
          {email ? (
            <>
              Un e‑mail d'activation a été envoyé à <strong className="text-gray-900">{email}</strong>.
            </>
          ) : (
            "Un e‑mail d'activation a été envoyé à l'adresse fournie lors de l'inscription."
          )}
        </p>
        <p className="mt-4 text-gray-700">Cliquez sur le lien dans l'e‑mail pour activer votre compte, puis revenez vous connecter.</p>

        <div className="mt-6 flex gap-3">
          <Link to="/login" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Se connecter</Link>
          <Link to="/" className="inline-block px-4 py-2 border rounded-md text-gray-700">Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}
