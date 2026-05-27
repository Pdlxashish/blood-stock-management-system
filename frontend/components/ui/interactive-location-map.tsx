'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, X } from 'lucide-react';
import { Button } from './button';
import { geocodeLocationWithFallback } from '@/lib/geocoding';

interface InteractiveLocationMapProps {
  address: string;
  city: string;
  onLocationSelect: (lat: number, lng: number) => void;
  onAddressUpdate?: (address: string, city: string) => void; // New prop for reverse geocoding
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
}

export function InteractiveLocationMap({
  address,
  city,
  onLocationSelect,
  onAddressUpdate,
  onClose,
  initialLat,
  initialLng,
}: InteractiveLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObjRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  
  const [mapReady, setMapReady] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Load Leaflet
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Inject Leaflet CSS if not already present
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    // Inject Leaflet JS if not already present
    if (!(window as any).L) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = () => setMapReady(true);
      document.head.appendChild(script);
    } else {
      setMapReady(true);
    }
  }, []);

  // Fallback reverse geocoding using approximate city detection
  const fallbackReverseGeocode = (lat: number, lng: number) => {
    console.log('🔄 Using fallback reverse geocoding for coordinates:', lat, lng);
    
    // Expanded coordinates for Nepal cities with better coverage
    const cities = [
      { name: 'Kathmandu', lat: 27.7172, lng: 85.3240, radius: 0.15 },
      { name: 'Pokhara', lat: 28.2096, lng: 83.9856, radius: 0.12 },
      { name: 'Lalitpur', lat: 27.6667, lng: 85.3167, radius: 0.08 },
      { name: 'Bhaktapur', lat: 27.6710, lng: 85.4298, radius: 0.08 },
      { name: 'Biratnagar', lat: 26.4525, lng: 87.2718, radius: 0.12 },
      { name: 'Bharatpur', lat: 27.6782, lng: 84.4351, radius: 0.12 },
      { name: 'Dharan', lat: 26.8147, lng: 87.2798, radius: 0.08 },
      { name: 'Butwal', lat: 27.7000, lng: 83.4486, radius: 0.08 },
      { name: 'Nepalgunj', lat: 28.0500, lng: 81.6167, radius: 0.10 },
      { name: 'Janakpur', lat: 26.7288, lng: 85.9256, radius: 0.10 },
      { name: 'Hetauda', lat: 27.4281, lng: 85.0324, radius: 0.08 },
      { name: 'Birgunj', lat: 27.0104, lng: 84.8767, radius: 0.08 },
      { name: 'Dhangadhi', lat: 28.6833, lng: 80.6000, radius: 0.08 },
      { name: 'Itahari', lat: 26.6650, lng: 87.2718, radius: 0.08 },
    ];
    
    // Find closest city
    let closestCity = null;
    let minDistance = Infinity;
    
    for (const city of cities) {
      const distance = Math.sqrt(
        Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
      );
      
      if (distance < city.radius && distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    }
    
    if (closestCity && onAddressUpdate) {
      console.log(`📍 Fallback: Detected city as ${closestCity.name} (distance: ${minDistance.toFixed(4)})`);
      
      // Generate a generic address for the detected city
      const genericAddress = address && address.length > 3 ? address : `${closestCity.name} Area`;
      
      onAddressUpdate(genericAddress, closestCity.name);
    } else {
      console.log('📍 Fallback: No city detected within range, keeping original values');
      // Keep original values if no city detected
      if (onAddressUpdate && (address || city)) {
        onAddressUpdate(address || '', city || '');
      }
    }
  };

  // Reverse geocoding function using backend API (no CORS issues)
  const reverseGeocode = async (lat: number, lng: number) => {
    if (!onAddressUpdate) return;
    
    setIsReverseGeocoding(true);
    try {
      console.log(`🔄 Starting reverse geocoding for: ${lat}, ${lng}`);
      
      // Use backend API to avoid CORS issues
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(
        `${apiUrl}/api/geocoding/reverse?lat=${lat}&lon=${lng}`,
        {
          method: 'GET',
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🔄 Reverse geocoding result:', data);
      
      if (data.success && data.result && data.result.address) {
        // Extract address components
        const addr = data.result.address;
        
        // Build address string from components with better prioritization
        const addressParts = [];
        
        // Add house number and road (highest priority)
        if (addr.house_number && addr.road) {
          addressParts.push(`${addr.house_number} ${addr.road}`);
        } else if (addr.road) {
          addressParts.push(addr.road);
        }
        
        // Add area/suburb/neighbourhood (medium priority)
        if (addr.suburb) {
          addressParts.push(addr.suburb);
        } else if (addr.neighbourhood) {
          addressParts.push(addr.neighbourhood);
        } else if (addr.quarter) {
          addressParts.push(addr.quarter);
        } else if (addr.residential) {
          addressParts.push(addr.residential);
        }
        
        // Get city with better fallback logic
        let cityName = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
        
        // If no specific city found, try to extract from display_name
        if (!cityName && data.result.display_name) {
          const parts = data.result.display_name.split(',').map((p: string) => p.trim());
          
          // Look for known Nepal cities in the display name
          const nepalCities = [
            'kathmandu', 'pokhara', 'lalitpur', 'bhaktapur', 'biratnagar', 
            'bharatpur', 'dharan', 'butwal', 'nepalgunj', 'janakpur', 'hetauda',
            'birgunj', 'dhangadhi', 'itahari', 'gorkha', 'baglung', 'tansen'
          ];
          
          for (const part of parts) {
            const lowerPart = part.toLowerCase();
            for (const city of nepalCities) {
              if (lowerPart.includes(city)) {
                cityName = part;
                break;
              }
            }
            if (cityName) break;
          }
          
          // If still no city, use the second-to-last part (often the city in Nepal addresses)
          if (!cityName && parts.length >= 2) {
            cityName = parts[parts.length - 2];
          }
        }
        
        const newAddress = addressParts.join(', ');
        
        console.log('📍 Extracted address components:', { 
          addressParts, 
          newAddress, 
          cityName,
          originalCity: city,
          originalAddress: address 
        });
        
        // Update the form fields - always update if we got meaningful data
        if (newAddress || cityName) {
          // Use new address if found, otherwise keep original
          const finalAddress = newAddress && newAddress.length > 3 ? newAddress : address;
          // Use new city if found, otherwise keep original
          const finalCity = cityName && cityName.length > 2 ? cityName : city;
          
          onAddressUpdate(finalAddress, finalCity);
          
          console.log('✅ Address updated successfully:', { finalAddress, finalCity });
        } else {
          console.log('⚠️ No meaningful address data found, trying fallback');
          fallbackReverseGeocode(lat, lng);
        }
      } else {
        console.log('⚠️ No address data in response, trying fallback');
        fallbackReverseGeocode(lat, lng);
      }
    } catch (error: any) {
      console.error('❌ Reverse geocoding failed:', error);
      
      // Use fallback method for any error
      console.log('🔄 Attempting fallback reverse geocoding');
      fallbackReverseGeocode(lat, lng);
      
      // Log specific error types for debugging
      if (error.name === 'AbortError') {
        console.log('⏰ Reverse geocoding timed out - using fallback');
      } else if (error.message?.includes('Failed to fetch')) {
        console.log('🌐 Network error during reverse geocoding - using fallback');
      } else if (error.message?.includes('HTTP')) {
        console.log('🔧 API error during reverse geocoding - using fallback:', error.message);
      } else {
        console.log('🔧 Unknown reverse geocoding error - using fallback:', error.message);
      }
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const addMarker = (lat: number, lng: number) => {
    const L = leafletRef.current;
    if (!L || !mapObjRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      mapObjRef.current.removeLayer(markerRef.current);
    }

    // Create draggable marker with color based on confirmation status
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

    // Handle marker drag
    marker.on('dragend', (e: any) => {
      const position = e.target.getLatLng();
      const newCoords = { lat: position.lat, lng: position.lng };
      setCurrentCoords(newCoords);
      
      console.log('🖱️ Marker dragged to:', newCoords);
      
      // Trigger reverse geocoding when user drags the pin
      reverseGeocode(position.lat, position.lng);
      
      // Auto-select coordinates when dragged (this confirms the location)
      onLocationSelect(position.lat, position.lng);
      
      // Update marker to show it's been manually positioned
      setIsConfirmed(false); // Reset confirmation state so user can confirm new position
    });

    // Handle marker click for confirmation
    marker.on('click', () => {
      if (currentCoords) {
        handleConfirmLocation();
      }
    });

    markerRef.current = marker;
    setCurrentCoords({ lat, lng });
  };

  // Initialize map and handle address/city changes
  useEffect(() => {
    // Wait for both map library and user location before initializing
    if (!mapReady || !mapRef.current || mapObjRef.current) return;

    const L = (window as any).L;
    leafletRef.current = L;

    // Default to Pokhara if no coordinates provided
    const defaultLat = initialLat || 28.2096;
    const defaultLng = initialLng || 83.9856;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([defaultLat, defaultLng], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapObjRef.current = map;

    // Add initial marker
    addMarker(defaultLat, defaultLng);

    return () => {
      if (mapObjRef.current) {
        mapObjRef.current.remove();
        mapObjRef.current = null;
      }
    };
  }, [mapReady]);

  // Separate effect to handle geocoding when address or city changes
  useEffect(() => {
    if (!mapObjRef.current) return;
    
    // Geocode when either city or address changes
    if (city || address) {
      geocodeAddress();
    }
  }, [city, address]);

  const geocodeAddress = async () => {
    if (!city && !address) return; // Need at least city or address

    setIsGeocoding(true);
    try {
      let locationToGeocode = '';
      let zoomLevel = 13;

      // Determine what to geocode based on available data
      if (address && address.length > 3 && city) {
        // Full address with city - highest priority
        locationToGeocode = `${address}, ${city}`;
        zoomLevel = 16;
        console.log(`🗺️ Geocoding full address: "${locationToGeocode}"`);
      } else if (address && address.length > 3) {
        // Address without city
        locationToGeocode = address;
        zoomLevel = 15;
        console.log(`🗺️ Geocoding address only: "${locationToGeocode}"`);
      } else if (city) {
        // City only
        locationToGeocode = city;
        zoomLevel = 13;
        console.log(`🗺️ Geocoding city only: "${locationToGeocode}"`);
      } else {
        return; // Nothing to geocode
      }
      
      const coords = await geocodeLocationWithFallback(locationToGeocode);

      if (coords && mapObjRef.current) {
        // Move map to geocoded location
        mapObjRef.current.setView([coords.latitude, coords.longitude], zoomLevel);
        
        // Add marker at geocoded location
        addMarker(coords.latitude, coords.longitude);
        
        console.log(`✅ Map centered on: ${locationToGeocode} at ${coords.latitude}, ${coords.longitude}`);
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleConfirmLocation = () => {
    if (currentCoords) {
      onLocationSelect(currentCoords.lat, currentCoords.lng);
      setIsConfirmed(true);
      
      // Update marker color to green
      addMarker(currentCoords.lat, currentCoords.lng);
    }
  };

  const handleRecenter = () => {
    if (city || address) { // Need at least city or address to recenter
      geocodeAddress();
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
              {isConfirmed ? 'Location Confirmed' : 'Select Precise Location'}
            </p>
            <p className="text-xs text-slate-600">
              {isGeocoding ? 'Finding location...' : 
               isReverseGeocoding ? 'Updating address...' :
               isConfirmed ? 'Pin confirmed at selected location' :
               'Drag the pin to exact spot'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(city || address) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRecenter}
              disabled={isGeocoding}
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

      {/* Map */}
      <div className="relative">
        <div ref={mapRef} className="h-[300px] w-full" />
        
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-[#7F1D1D] rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-600">Loading map...</p>
            </div>
          </div>
        )}

        {(isGeocoding || isReverseGeocoding) && (
          <div className="absolute top-2 left-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg z-10">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-slate-200 border-t-[#7F1D1D] rounded-full animate-spin" />
              <span className="text-sm text-slate-600 font-medium">
                {isGeocoding ? 'Finding location...' : 'Updating address...'}
              </span>
            </div>
          </div>
        )}

        {/* Show coordinates when available */}
        {currentCoords && !isGeocoding && !isReverseGeocoding && (
          <div className="absolute bottom-2 left-2 bg-black/75 text-white text-xs px-2 py-1 rounded z-10">
            📍 {currentCoords.lat.toFixed(6)}, {currentCoords.lng.toFixed(6)}
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
            <span>Drag the pin to select location</span>
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