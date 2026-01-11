import React from 'react';

export default function AdminDashboard(){
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-3xl w-full p-8">
        <h1 className="text-3xl font-bold">Admin Dashboard (exemple)</h1>
        <p className="mt-4 text-gray-600">Contenu protégé visible uniquement aux administrateurs.</p>
      </div>
    </div>
  );
}