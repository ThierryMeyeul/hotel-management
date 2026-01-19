import React, { useEffect, useRef, useState } from 'react';
import { X, Search, MapPin, Navigation, Loader } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* =========================
   FIX icônes Leaflet
========================= */
// Solution plus propre pour les icônes Leaflet
const DefaultIcon = L.icon({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

/* =========================
   TYPES
========================= */
interface MapModalProps {
  initialLat: number;
  initialLng: number;
  onSelect: (lat: number, lng: number) => void;
  onClose: () => void;
  searchLabel?: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
  class?: string;
}

/* =========================
   COMPONENT
========================= */
const MapModal: React.FC<MapModalProps> = ({
  initialLat,
  initialLng,
  onSelect,
  onClose,
  searchLabel = 'Rechercher un hôtel, adresse, ville...',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [selectedLat, setSelectedLat] = useState(initialLat || 48.856613);
  const [selectedLng, setSelectedLng] = useState(initialLng || 2.352222);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* =========================
     INIT MAP
  ========================= */
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(
      [selectedLat, selectedLng],
      13
    );

    // Ajouter les tuiles OpenStreetMap avec un style plus clair
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Créer un marqueur personnalisé
    const customIcon = L.divIcon({
      html: `
        <div class="relative">
          <div class="w-8 h-8 bg-red-500 rounded-full border-3 border-white shadow-lg"></div>
          <div class="w-8 h-8 bg-red-500 rounded-full border-3 border-white shadow-lg animate-ping absolute top-0 left-0 opacity-75"></div>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    const marker = L.marker([selectedLat, selectedLng], {
      draggable: true,
      icon: customIcon,
    }).addTo(map);

    // Ajouter un popup au marqueur
    marker.bindPopup('Position sélectionnée').openPopup();

    marker.on('dragend', (e) => {
      const pos = (e.target as L.Marker).getLatLng();
      setSelectedLat(pos.lat);
      setSelectedLng(pos.lng);
      marker.setPopupContent(`Position sélectionnée<br>Lat: ${pos.lat.toFixed(6)}<br>Lng: ${pos.lng.toFixed(6)}`);
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      setSelectedLat(e.latlng.lat);
      setSelectedLng(e.latlng.lng);
      marker.setLatLng(e.latlng);
      marker.setPopupContent(`Position sélectionnée<br>Lat: ${e.latlng.lat.toFixed(6)}<br>Lng: ${e.latlng.lng.toFixed(6)}`);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  /* =========================
     UPDATE POSITION
  ========================= */
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([selectedLat, selectedLng]);
      markerRef.current.setLatLng([selectedLat, selectedLng]);
      markerRef.current.setPopupContent(
        `Position sélectionnée<br>Lat: ${selectedLat.toFixed(6)}<br>Lng: ${selectedLng.toFixed(6)}`
      );
    }
  }, [selectedLat, selectedLng]);

  /* =========================
     SEARCH (DEBOUNCE)
  ========================= */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value
          )}&limit=5&addressdetails=1`
        );
        const data: NominatimResult[] = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error('Erreur recherche:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  /* =========================
     SELECT RESULT
  ========================= */
  const handleSelectResult = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    setSelectedLat(lat);
    setSelectedLng(lng);
    setSearchQuery(result.display_name);
    setSearchResults([]);

    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([lat, lng], 16);
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.setPopupContent(
        `${result.display_name.split(',')[0]}<br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`
      );
    }
  };

  /* =========================
     GEOLOCATION
  ========================= */
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Géolocalisation non supportée');
      return;
    }

    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setSelectedLat(lat);
        setSelectedLng(lng);

        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
          markerRef.current.setPopupContent(
            `Votre position actuelle<br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`
          );
        }
        setIsSearching(false);
      },
      (error) => {
        console.error('Erreur géolocalisation:', error);
        alert('Impossible d\'obtenir votre position. Vérifiez les permissions.');
        setIsSearching(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  /* =========================
     COPY COORDINATES
  ========================= */
  const handleCopyCoordinates = async () => {
    try {
      await navigator.clipboard.writeText(`${selectedLat.toFixed(6)}, ${selectedLng.toFixed(6)}`);
      // Vous pourriez ajouter une notification ici
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-sm">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Sélectionner l'emplacement</h2>
              <p className="text-sm text-gray-500">Cliquez sur la carte ou recherchez une adresse</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden min-h-[500px]">
          {/* Left Panel */}
          <div className="w-full md:w-96 p-6 overflow-y-auto border-r border-gray-200 bg-gray-50/50">
            <div className="space-y-6">
              {/* Search Box */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher un lieu
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={searchLabel}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={isSearching}
                  />
                  {isSearching && (
                    <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                  )}
                </div>
              </div>

              {/* Current Location Button */}
              <button
                onClick={handleUseCurrentLocation}
                disabled={isSearching}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Navigation className="w-4 h-4" />
                Utiliser ma position actuelle
              </button>

              {/* Coordinates Display */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-gray-700 mb-3">Coordonnées sélectionnées</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Latitude</div>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded font-mono text-gray-800">
                      {selectedLat.toFixed(6)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Longitude</div>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded font-mono text-gray-800">
                      {selectedLng.toFixed(6)}
                    </div>
                  </div>
                  <button
                    onClick={handleCopyCoordinates}
                    className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors"
                  >
                    Copier les coordonnées
                  </button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="p-3 bg-gray-50 border-b">
                    <h3 className="font-medium text-gray-700">Résultats ({searchResults.length})</h3>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectResult(result)}
                        className="w-full text-left p-3 hover:bg-blue-50 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0 group-hover:text-blue-500" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 group-hover:text-blue-700 truncate">
                              {result.display_name.split(',')[0]}
                            </div>
                            <div className="text-xs text-gray-500 truncate mt-0.5">
                              {result.display_name.split(',').slice(1, 3).join(',').trim()}
                            </div>
                            <div className="flex gap-3 mt-2 text-xs">
                              <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                {result.type || 'Lieu'}
                              </span>
                              <span className="text-gray-600">
                                Lat: {parseFloat(result.lat).toFixed(4)}
                              </span>
                              <span className="text-gray-600">
                                Lng: {parseFloat(result.lon).toFixed(4)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Container */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6">
              <div
                ref={mapContainerRef}
                className="w-full h-full rounded-lg border border-gray-300 shadow-inner overflow-hidden"
              />
            </div>
            <div className="px-6 pb-4">
              <p className="text-sm text-gray-500 text-center">
                💡 <strong>Astuce :</strong> Cliquez sur la carte pour placer le marqueur ou déplacez-le directement
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Coordonnées : <span className="font-mono font-medium">{selectedLat.toFixed(6)}, {selectedLng.toFixed(6)}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSearching}
            >
              Annuler
            </button>
            <button
              onClick={() => onSelect(selectedLat, selectedLng)}
              disabled={isSearching}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MapPin className="w-4 h-4" />
              Valider cette position
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;