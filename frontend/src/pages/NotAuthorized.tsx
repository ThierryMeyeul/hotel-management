import React from 'react';
import { Link } from 'react-router-dom';

export default function NotAuthorized(){
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Accès refusé</h2>
        <p className="text-gray-700">Vous n'avez pas la permission d'accéder à cette page.</p>
        <div className="mt-6">
          <Link to="/" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}