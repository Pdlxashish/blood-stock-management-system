'use client';

import { useEffect, useState, useCallback } from 'react';
import { LatLngExpression, Icon, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Loader2, Crosshair } from 'lucide-react';
import dynamic from 'next/dynamic';

// Import react-leaflet components that will be used inside the dynamic component
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';

// Custom pin icon using DivIcon for better styling
const createCustomIcon = () => {
  return new DivIcon({
    className: 'custom-pin-icon',
    html: `
      <div style="position: relative; width: 40px; height: 50px;">
        <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
          <!-- Drop shadow -->
          <ellipse cx="20" cy="47" rx="8" ry="3" fill="rgba(0,0,0,0.2)" />
          <!-- Pin body -->
          <path d="M20 2 C12 2 6 8 6 16 C6 26 20 46 20 46 C20 46 34 26 34 16 C34 8 28 2 20 2 Z" 
                fill="#DC2626" stroke="#991B1B" stroke-width="2"/>
          <!-- Inner circle -->
          <circle cx="20" cy="16" r="6" fill="white"/>
          <!-- Center dot -->
          <circle cx="20" cy="16" r="3" fill="#DC2626"/>
        </svg>
      </div>
    `,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50],
  });
};

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

// Nepal cities database for quick offline search
const NEPAL_CITIES: Record<string, { lat: number; lng: number; name: string }> = {
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

function DraggableMarker({ 
  position, 
  onLocationSelect,
  onDragEnd 
}: { 
  position: LatLngExpression | null; 
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  onDragEnd: (lat: number, lng: number) => void;
}) {
  const [markerRef, setMarkerRef] = useState<any>(null);
  const customIcon = createCustomIcon();

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      onDragEnd(lat, lng);
      
      // Reverse geocode to get address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        onLocationSelect(lat, lng, address);
      } catch (error) {
        console.error('Geocoding error:', error);
        onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    },
  });

  const eventHandlers = {
    dragend: async () => {
      const marker = markerRef;
      if (marker != null) {
        const { lat, lng } = marker.getLatLng();
        onDragEnd(lat, lng);
        
        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          onLocationSelect(lat, lng, address);
        } catch (error) {
          console.error('Geocoding error:', error);
          onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      }
    },
  };

  return position ? (
    <Marker 
      position={position} 
      draggable={true}
      eventHandlers={eventHandlers}
      ref={setMarkerRef}
      icon={customIcon}
    />
  ) : null;
}

function MapController({ center }: { center: LatLngExpression }) {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      map.setView(center, 13);
    }
  }, [center, map]);
  
  return null;
}

export default function MapPicker({ latitude, longitude, onLocationSelect }: MapPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<LatLngExpression | null>(
    latitude && longitude ? [latitude, longitude] : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(
    latitude && longitude ? [latitude, longitude] : [27.7172, 85.3240]
  );
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
      setMapCenter([latitude, longitude]);
    }
  }, [latitude, longitude]);

  // Debounced search function
  const searchLocation = useCallback(
    async (query: string) => {
      if (query.length < 3) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setIsSearching(true);

      try {
        // First, check local Nepal cities database
        const normalizedQuery = query.toLowerCase();
        const localResults = Object.entries(NEPAL_CITIES)
          .filter(([key, city]) => 
            city.name.toLowerCase().includes(normalizedQuery) ||
            key.includes(normalizedQuery)
          )
          .map(([_, city]) => ({
            place_id: Math.random(),
            display_name: `${city.name}, Nepal`,
            lat: city.lat.toString(),
            lon: city.lng.toString(),
            type: 'city',
          }));

        // Then search using Nominatim API for more detailed results
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(query)}&` +
          `format=json&` +
          `limit=8&` +
          `countrycodes=np&` +
          `addressdetails=1`,
          {
            headers: {
              'Accept': 'application/json',
            }
          }
        );

        if (response.ok) {
          const data: SearchResult[] = await response.json();
          
          // Combine local and API results, remove duplicates
          const combinedResults = [...localResults, ...data];
          const uniqueResults = combinedResults.filter((result, index, self) =>
            index === self.findIndex((r) => 
              Math.abs(parseFloat(r.lat) - parseFloat(result.lat)) < 0.01 &&
              Math.abs(parseFloat(r.lon) - parseFloat(result.lon)) < 0.01
            )
          ).slice(0, 8);

          setSearchResults(uniqueResults);
          setShowSearchResults(uniqueResults.length > 0);
        } else {
          // Fallback to local results only
          setSearchResults(localResults);
          setShowSearchResults(localResults.length > 0);
        }
      } catch (error) {
        console.error('Search error:', error);
        // Fallback to local Nepal cities
        const normalizedQuery = query.toLowerCase();
        const localResults = Object.entries(NEPAL_CITIES)
          .filter(([key, city]) => 
            city.name.toLowerCase().includes(normalizedQuery) ||
            key.includes(normalizedQuery)
          )
          .map(([_, city]) => ({
            place_id: Math.random(),
            display_name: `${city.name}, Nepal`,
            lat: city.lat.toString(),
            lon: city.lng.toString(),
            type: 'city',
          }));
        
        setSearchResults(localResults);
        setShowSearchResults(localResults.length > 0);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchLocation(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchLocation]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
    } else {
      setIsSearching(true);
    }
  };

  const handleSelectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setMapCenter([lat, lng]);
    setPosition([lat, lng]);
    setSelectedAddress(result.display_name);
    onLocationSelect(lat, lng, result.display_name);
    setSearchQuery(result.display_name);
    setShowSearchResults(false);
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setPosition([lat, lng]);
    setSelectedAddress(address);
    onLocationSelect(lat, lng, address);
  };

  const handleMarkerDragEnd = (lat: number, lng: number) => {
    setPosition([lat, lng]);
  };

  const handleRecenterToUserLocation = () => {
    setIsLocating(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setMapCenter([lat, lng]);
          setPosition([lat, lng]);
          
          // Reverse geocode to get address
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            setSelectedAddress(address);
            onLocationSelect(lat, lng, address);
          } catch (error) {
            console.error('Geocoding error:', error);
            const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            setSelectedAddress(address);
            onLocationSelect(lat, lng, address);
          }
          
          setIsLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please check your browser permissions.');
          setIsLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setIsLocating(false);
    }
  };

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  // Create the map component
  const MapComponent = () => (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DraggableMarker 
        position={position} 
        onLocationSelect={handleLocationSelect}
        onDragEnd={handleMarkerDragEnd}
      />
      <MapController center={mapCenter} />
    </MapContainer>
  );

  return (
    <div className="space-y-3">
      {/* Search Bar with Recenter Button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search for a location in Nepal..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              className="pl-9 pr-9"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
            )}
          </div>
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 flex items-start gap-2 border-b border-slate-100 last:border-b-0 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 font-medium truncate">
                      {result.display_name.split(',')[0]}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {result.display_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Recenter Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleRecenterToUserLocation}
          disabled={isLocating}
          className="flex-shrink-0 gap-2"
          title="Use my current location"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Crosshair className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">My Location</span>
        </Button>
      </div>

      {/* Selected Address Display */}
      {selectedAddress && (
        <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-blue-900">Selected Location:</p>
            <p className="text-xs text-blue-700 break-words">{selectedAddress}</p>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-300 relative">
        <MapComponent />
        
        {/* Instructions Overlay */}
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg px-3 py-2 shadow-lg z-[1000]">
          <p className="text-xs text-slate-700 flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
            <span>Search, click on map, or drag the pin to select location</span>
          </p>
        </div>
      </div>

      {/* Coordinates Display */}
      {position && (
        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
          <span className="font-medium">Coordinates:</span>
          <span className="font-mono">
            {Array.isArray(position) ? `${position[0].toFixed(6)}, ${position[1].toFixed(6)}` : ''}
          </span>
        </div>
      )}
    </div>
  );
}
