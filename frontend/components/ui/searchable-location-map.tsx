'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, X, Search } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';

interface SearchableLocationMapProps {
  address: string;
  city: string;
  onLocationSelect: (lat: number, lng: number) => void;
  onAddressUpdate?: (address: string, city: string) => void;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
}

// Comprehensive Nepal city coordinates database
const NEPAL_CITIES: Record<string, { lat: number; lng: number; name: string }> = {
  // Major Cities
  'kathmandu': { lat: 27.7172, lng: 85.3240, name: 'Kathmandu' },
  'pokhara': { lat: 28.2096, lng: 83.9856, name: 'Pokhara' },
  'lalitpur': { lat: 27.6667, lng: 85.3167, name: 'Lalitpur' },
  'bhaktapur': { lat: 27.6710, lng: 85.4298, name: 'Bhaktapur' },
  'biratnagar': { lat: 26.4525, lng: 87.2718, name: 'Biratnagar' },
  'bharatpur': { lat: 27.6782, lng: 84.4351, name: 'Bharatpur' },
  'chitwan': { lat: 27.6782, lng: 84.4351, name: 'Chitwan' },
  'dharan': { lat: 26.8147, lng: 87.2798, name: 'Dharan' },
  'butwal': { lat: 27.7000, lng: 83.4486, name: 'Butwal' },
  'nepalgunj': { lat: 28.0500, lng: 81.6167, name: 'Nepalgunj' },
  'janakpur': { lat: 26.7288, lng: 85.9256, name: 'Janakpur' },
  'hetauda': { lat: 27.4281, lng: 85.0324, name: 'Hetauda' },
  'birgunj': { lat: 27.0104, lng: 84.8767, name: 'Birgunj' },
  'dhangadhi': { lat: 28.6833, lng: 80.6000, name: 'Dhangadhi' },
  'itahari': { lat: 26.6650, lng: 87.2718, name: 'Itahari' },
  'gorkha': { lat: 28.0000, lng: 84.6333, name: 'Gorkha' },
  'baglung': { lat: 28.2667, lng: 83.5833, name: 'Baglung' },
  'tansen': { lat: 27.8667, lng: 83.5500, name: 'Tansen' },
  'dang': { lat: 28.0333, lng: 82.3000, name: 'Dang' },
  'tulsipur': { lat: 28.1333, lng: 82.2833, name: 'Tulsipur' },
};

export function SearchableLocationMap({
  address,
  city,
  onLocationSelect,
  onAddressUpdate,
  onClose,
  initialLat,
  initialLng,
}: SearchableLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObjRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  
  const [mapReady, setMapReady] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [detectedCity, setDetectedCity] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ name: string; lat: number; lng: number }>>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Load Leaflet
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    if (!(window as any).L) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = () => setMapReady(true);
      document.head.appendChild(script);
    } else {
      setMapReady(true);
    }
  }, []);

  // Search cities
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const normalizedQuery = query.toLowerCase();
    const results = Object.entries(NEPAL_CITIES)
      .filter(([key, city]) => 
        city.name.toLowerCase().includes(normalizedQuery) ||
        key.includes(normalizedQuery)
      )
      .map(([_, city]) => city)
      .slice(0, 5);

    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  };

  // Select search result
  const handleSelectSearchResult = (result: { name: string; lat: number; lng: number }) => {
    if (mapObjRef.current) {
      mapObjRef.current.setView([result.lat, result.lng], 14);
      addMarker(result.lat, result.lng);
      setSearchQuery(result.name);
      setShowSearchResults(false);
      
      if (onAddressUpdate) {
        onAddressUpdate(address || result.name, result.name);
      }
    }
  };

  // Find city coordinates from database
  const findCityCoordinates = (cityName: string) => {
    if (!cityName) return null;
    
    const normalizedCity = cityName.toLowerCase().trim();
    
    if (NEPAL_CITIES[normalizedCity]) {
      return NEPAL_CITIES[normalizedCity];
    }
    
    const cityMatch = normalizedCity.match(/^([a-zA-Z\s]+)[-\s]*\d*$/);
    if (cityMatch) {
      const extractedCity = cityMatch[1].trim();
      if (NEPAL_CITIES[extractedCity]) {
        return NEPAL_CITIES[extractedCity];
      }
    }
    
    for (const [key, coords] of Object.entries(NEPAL_CITIES)) {
      if (normalizedCity.includes(key) || key.includes(normalizedCity)) {
        return coords;
      }
    }
    
    return null;
  };

  // Reverse geocoding
  const offlineReverseGeocode = (lat: number, lng: number) => {
    let closestCity = null;
    let minDistance = Infinity;
    
    for (const [key, cityData] of Object.entries(NEPAL_CITIES)) {
      const distance = Math.sqrt(
        Math.pow(lat - cityData.lat, 2) + Math.pow(lng - cityData.lng, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = { key, ...cityData, distance };
      }
    }
    
    if (closestCity && closestCity.distance < 0.1) {
      setDetectedCity(closestCity.name);
      
      if (onAddressUpdate) {
        const newAddress = address && address.length > 3 ? address : `${closestCity.name} Area`;
        onAddressUpdate(newAddress, closestCity.name);
      }
    } else {
      setDetectedCity('Unknown Location');
    }
  };

  const addMarker = (lat: number, lng: number) => {
    const L = leafletRef.current;
    if (!L || !mapObjRef.current) return;

    if (markerRef.current) {
      mapObjRef.current.removeLayer(markerRef.current);
    }

    const marker = L.marker([lat, lng], {
      draggable: true,
      icon: L.divIcon({
        className: "",
        html: `
          <div style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: ${isConfirmed ? '#059669' : '#7F1D1D'};
            border: 3px solid #fff;
            box-shadow: 0 4px 14px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: move;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      }),
    }).addTo(mapObjRef.current);

    marker.on('dragend', (e: any) => {
      const position = e.target.getLatLng();
      const newCoords = { lat: position.lat, lng: position.lng };
      setCurrentCoords(newCoords);
      offlineReverseGeocode(position.lat, position.lng);
      onLocationSelect(position.lat, position.lng);
      setIsConfirmed(false);
    });

    marker.on('click', () => {
      if (currentCoords) {
        handleConfirmLocation();
      }
    });

    markerRef.current = marker;
    setCurrentCoords({ lat, lng });
    offlineReverseGeocode(lat, lng);
  };

  // Initialize map
  useEffect(() => {
    if (!mapReady || !mapRef.current || mapObjRef.current) return;

    const L = (window as any).L;
    leafletRef.current = L;

    let defaultLat = initialLat || 28.2096;
    let defaultLng = initialLng || 83.9856;

    if (city) {
      const cityCoords = findCityCoordinates(city);
      if (cityCoords) {
        defaultLat = cityCoords.lat;
        defaultLng = cityCoords.lng;
      }
    }

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([defaultLat, defaultLng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapObjRef.current = map;
    addMarker(defaultLat, defaultLng);

    return () => {
      if (mapObjRef.current) {
        mapObjRef.current.remove();
        mapObjRef.current = null;
      }
    };
  }, [mapReady]);

  // Update map when city changes
  useEffect(() => {
    if (!mapObjRef.current || !city) return;
    
    const cityCoords = findCityCoordinates(city);
    if (cityCoords) {
      mapObjRef.current.setView([cityCoords.lat, cityCoords.lng], 14);
      addMarker(cityCoords.lat, cityCoords.lng);
    }
  }, [city]);

  const handleConfirmLocation = () => {
    if (currentCoords) {
      onLocationSelect(currentCoords.lat, currentCoords.lng);
      setIsConfirmed(true);
      addMarker(currentCoords.lat, currentCoords.lng);
    }
  };

  const handleRecenter = () => {
    if (city) {
      const cityCoords = findCityCoordinates(city);
      if (cityCoords && mapObjRef.current) {
        mapObjRef.current.setView([cityCoords.lat, cityCoords.lng], 14);
        addMarker(cityCoords.lat, cityCoords.lng);
      }
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-[#7F1D1D]" />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {isConfirmed ? 'Location Confirmed' : 'Select Location'}
            </p>
            <p className="text-xs text-slate-600">
              {detectedCity ? `Detected: ${detectedCity}` : 'Search or drag the pin'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {city && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRecenter}
              className="gap-1"
            >
              <Navigation size={12} />
              Recenter
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="gap-1"
          >
            <X size={12} />
            Close
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-slate-100 bg-white relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search for a city..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
            className="pl-9"
          />
        </div>
        
        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute z-50 w-[calc(100%-1.5rem)] mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSelectSearchResult(result)}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100 last:border-b-0"
              >
                <MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-sm text-slate-900">{result.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="relative">
        <div ref={mapRef} className="h-[350px] w-full" />
        
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-[#7F1D1D] rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-600">Loading map...</p>
            </div>
          </div>
        )}

        {currentCoords && (
          <div className="absolute bottom-2 left-2 bg-black/75 text-white text-xs px-2 py-1 rounded z-10">
            📍 {currentCoords.lat.toFixed(6)}, {currentCoords.lng.toFixed(6)}
          </div>
        )}

        {detectedCity && (
          <div className="absolute top-2 left-2 bg-white/90 border border-slate-200 rounded px-2 py-1 text-xs z-10">
            📍 {detectedCity}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-3 border-t border-slate-100 bg-slate-50">
        <div className="text-xs text-slate-600">
          {currentCoords ? (
            <span>
              📍 {currentCoords.lat.toFixed(6)}, {currentCoords.lng.toFixed(6)}
            </span>
          ) : (
            <span>Search or drag the pin to select location</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isConfirmed && (
            <Button
              type="button"
              onClick={handleConfirmLocation}
              disabled={!currentCoords}
              className="bg-[#7F1D1D] hover:bg-[#991B1B] text-white"
              size="sm"
            >
              Confirm Location
            </Button>
          )}
          {isConfirmed && (
            <div className="flex items-center gap-2 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Location Confirmed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
