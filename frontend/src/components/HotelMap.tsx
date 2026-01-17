import React, { useEffect, useRef } from 'react';
import type { Hotel } from '../types/hotel';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface HotelMapProps {
  hotels: Hotel[];
  userLocation?: { latitude: number; longitude: number };
  className?: string;
}

// Icône hôtel
const hotelIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Icône utilisateur
const userIcon = L.icon({
  iconUrl:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNGY0NmU1IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSIzIi8+PHBhdGggZD0iTTEyIDIxYTkgOSAwIDAgMC05LTkiLz48L3N2Zz4=',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

const HotelMap: React.FC<HotelMapProps> = ({
  hotels,
  userLocation,
  className = '',
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 🔐 Filtrer les hôtels ayant une position valide
  const validHotels = hotels.filter(
    h => h.latitude !== undefined && h.longitude !== undefined
  );

  useEffect(() => {
    if (!containerRef.current || validHotels.length === 0) return;
    if (mapRef.current) return;

    // Initialisation de la carte
    mapRef.current = L.map(containerRef.current).setView(
      [validHotels[0].latitude!, validHotels[0].longitude!],
      13
    );

    // Fond de carte
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Marqueurs hôtels
    validHotels.forEach(hotel => {
      L.marker(
        [hotel.latitude!, hotel.longitude!],
        { icon: hotelIcon }
      )
        .addTo(mapRef.current!)
        .bindPopup(`
          <div>
            <strong>${hotel.name}</strong><br/>
            ${hotel.address ?? ''}
          </div>
        `);
    });

    // Marqueur utilisateur
    if (userLocation) {
      L.marker(
        [userLocation.latitude, userLocation.longitude],
        { icon: userIcon }
      )
        .addTo(mapRef.current!)
        .bindPopup('Votre position');
    }

    // Ajustement des limites
    const bounds = L.latLngBounds(
      validHotels.map(h => [h.latitude!, h.longitude!] as L.LatLngTuple)
    );

    if (userLocation) {
      bounds.extend([userLocation.latitude, userLocation.longitude]);
    }

    mapRef.current.fitBounds(bounds, { padding: [50, 50] });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [validHotels, userLocation]);

  if (validHotels.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-xl ${className}`}
        style={{ height: '400px' }}
      >
        <p className="text-gray-500">Aucun hôtel avec position valide</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl overflow-hidden shadow-lg ${className}`}
      style={{ height: '400px' }}
    >
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default HotelMap;
