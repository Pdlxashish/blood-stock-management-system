// Nominatim API for geocoding (OpenStreetMap)
// Free geocoding service - no API key required

/**
 * Get coordinates for a location using Nominatim API only
 * @param location - City name or address to geocode
 * @returns Coordinates {latitude, longitude} or null if not found
 */
export async function geocodeLocation(location: string): Promise<{ latitude: number; longitude: number } | null> {
  if (!location || location.trim().length === 0) return null;
  
  try {
    // Clean the location string - handle ward numbers
    let cleanLocation = location.trim();
    
    // If it contains ward number (e.g., "Biratnagar-18"), try multiple formats
    const wardMatch = cleanLocation.match(/^([a-zA-Z\s]+)[-\s]*(\d+)$/);
    
    if (wardMatch) {
      const cityName = wardMatch[1].trim();
      const wardNumber = wardMatch[2];
      
      // Try different query formats in order of preference
      const queries = [
        `${cityName}-${wardNumber}, Nepal`,  // Original format with Nepal
        `${cityName} Ward ${wardNumber}, Nepal`,  // Ward format
        `${cityName}, Nepal`,  // Just city name
        cleanLocation,  // Original input
      ];
      
      for (const query of queries) {
        console.log(`🔍 Trying geocoding: "${query}"`);
        const result = await tryNominatimGeocode(query);
        if (result) {
          console.log(`✅ Success with: "${query}"`, result);
          return result;
        }
      }
    } else {
      // Regular location without ward number - try with and without Nepal
      const queries = [
        `${cleanLocation}, Nepal`,
        cleanLocation
      ];
      
      for (const query of queries) {
        console.log(`🔍 Trying geocoding: "${query}"`);
        const result = await tryNominatimGeocode(query);
        if (result) {
          console.log(`✅ Success with: "${query}"`, result);
          return result;
        }
      }
    }

    console.log(`❌ No results found for: "${location}"`);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Helper function to try geocoding with backend API (no CORS issues)
 */
async function tryNominatimGeocode(query: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const encodedQuery = encodeURIComponent(query);
    
    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    // Use backend API to avoid CORS issues
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(
      `${apiUrl}/api/geocoding/forward?q=${encodedQuery}`,
      {
        method: 'GET',
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('Geocoding API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.success && data.results && data.results.length > 0) {
      // Log all results for debugging
      console.log(`📍 Found ${data.results.length} results for "${query}":`, 
        data.results.map((r: any) => ({ 
          name: r.display_name, 
          lat: r.lat, 
          lon: r.lon,
          importance: r.importance 
        }))
      );
      
      // Return the first (most relevant) result
      const result = {
        latitude: parseFloat(data.results[0].lat),
        longitude: parseFloat(data.results[0].lon),
      };
      return result;
    }

    return null;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error(`⏰ Geocoding timeout for "${query}"`);
    } else if (error.message?.includes('Failed to fetch')) {
      console.error(`🌐 Network error for "${query}":`, error.message);
    } else {
      console.error(`❌ Geocoding error for "${query}":`, error);
    }
    return null;
  }
}

/**
 * Get coordinates with smart fallback strategy
 * Tries local database first, then Nominatim API
 */
export async function geocodeLocationWithFallback(
  location: string | undefined
): Promise<{ latitude: number; longitude: number } | null> {
  if (!location) return null;

  console.log('🌍 Geocoding location:', location);

  // Try local database first for known cities (faster and more reliable)
  const localResult = getMajorCityCoordinates(location);
  if (localResult) {
    console.log('✅ Local database match:', localResult);
    return localResult;
  }

  // Try Nominatim API for unknown locations
  console.log('🔍 Trying Nominatim API for unknown location...');
  const apiResult = await geocodeLocation(location);
  if (apiResult) {
    console.log('✅ Nominatim API geocoding successful:', apiResult);
    return apiResult;
  }

  console.log('❌ No coordinates found for:', location);
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// MINIMAL FALLBACK - Only for major cities when API fails
// ═══════════════════════════════════════════════════════════════════════════

const majorCityCoordinates: Record<string, { latitude: number; longitude: number }> = {
  'kathmandu': { latitude: 27.7172, longitude: 85.3240 },
  'pokhara': { latitude: 28.2096, longitude: 83.9856 },
  'lalitpur': { latitude: 27.6667, longitude: 85.3167 },
  'bhaktapur': { latitude: 27.6710, longitude: 85.4298 },
  'biratnagar': { latitude: 26.4525, longitude: 87.2718 },
  'bharatpur': { latitude: 27.6782, longitude: 84.4351 },
  'chitwan': { latitude: 27.6782, longitude: 84.4351 },
  'dharan': { latitude: 26.8147, longitude: 87.2798 },
  'butwal': { latitude: 27.7000, longitude: 83.4486 },
  'nepalgunj': { latitude: 28.0500, longitude: 81.6167 },
  'janakpur': { latitude: 26.7288, longitude: 85.9256 },
  'hetauda': { latitude: 27.4281, longitude: 85.0324 },
};

/**
 * Get coordinates from major cities only (minimal fallback)
 */
export function getMajorCityCoordinates(city: string | undefined): { latitude: number; longitude: number } | null {
  if (!city) return null;
  
  const normalizedCity = city.toLowerCase().trim();
  console.log('🏙️ Checking major cities for:', normalizedCity);
  
  // Try exact match first
  if (majorCityCoordinates[normalizedCity]) {
    console.log('✅ Exact match found:', majorCityCoordinates[normalizedCity]);
    return majorCityCoordinates[normalizedCity];
  }
  
  // Try to extract city name from ward format (e.g., "Biratnagar-18" -> "biratnagar")
  const cityMatch = normalizedCity.match(/^([a-zA-Z\s]+)[-\s]*\d*$/);
  if (cityMatch) {
    const extractedCity = cityMatch[1].trim();
    console.log('🔍 Extracted city name:', extractedCity);
    
    if (majorCityCoordinates[extractedCity]) {
      console.log('✅ Found coordinates for extracted city:', majorCityCoordinates[extractedCity]);
      return majorCityCoordinates[extractedCity];
    }
  }
  
  // Try partial match for major cities only
  for (const [key, coords] of Object.entries(majorCityCoordinates)) {
    if (normalizedCity.startsWith(key)) {
      console.log('✅ Partial match found:', key, coords);
      return coords;
    }
  }
  
  console.log('❌ No major city match found');
  return null;
}

// Keep the old function for backward compatibility
export const getCityCoordinates = getMajorCityCoordinates;
