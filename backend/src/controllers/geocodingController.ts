import { Request, Response } from 'express';
import { geocodeLocation } from '../utils/geocoding';

/**
 * Forward geocoding: Convert address/city to coordinates
 * GET /api/geocoding/forward?q=location
 */
export const forwardGeocode = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required',
      });
    }

    console.log(`🔍 Forward geocoding request: "${q}"`);

    // Use Nominatim API through backend (no CORS issues)
    const encodedQuery = encodeURIComponent(q);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=3&countrycodes=np&addressdetails=1`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'BloodBankManagementSystem/1.0',
        },
      }
    );

    if (!response.ok) {
      console.error('Nominatim API error:', response.status, response.statusText);
      return res.status(response.status).json({
        success: false,
        message: 'Geocoding service error',
      });
    }

    const data = await response.json();

    if (data && data.length > 0) {
      console.log(`✅ Found ${data.length} results for "${q}"`);
      return res.json({
        success: true,
        results: data.map((item: any) => ({
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          display_name: item.display_name,
          importance: item.importance,
          address: item.address,
        })),
      });
    }

    console.log(`❌ No results found for "${q}"`);
    return res.json({
      success: true,
      results: [],
    });
  } catch (error: any) {
    console.error('Forward geocoding error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during geocoding',
      error: error.message,
    });
  }
};

/**
 * Reverse geocoding: Convert coordinates to address
 * GET /api/geocoding/reverse?lat=27.7172&lon=85.3240
 */
export const reverseGeocode = async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon || typeof lat !== 'string' || typeof lon !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query parameters "lat" and "lon" are required',
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude values',
      });
    }

    console.log(`🔄 Reverse geocoding request: ${latitude}, ${longitude}`);

    // Use Nominatim reverse geocoding API through backend (no CORS issues)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&countrycodes=np&zoom=16&accept-language=en`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'BloodBankManagementSystem/1.0',
          'Accept': 'application/json',
          'Accept-Language': 'en',
        },
      }
    );

    if (!response.ok) {
      console.error('Nominatim API error:', response.status, response.statusText);
      return res.status(response.status).json({
        success: false,
        message: 'Reverse geocoding service error',
      });
    }

    const data = await response.json();

    if (data && data.address) {
      console.log(`✅ Reverse geocoding successful for ${latitude}, ${longitude}`);
      return res.json({
        success: true,
        result: {
          display_name: data.display_name,
          address: data.address,
          lat: data.lat,
          lon: data.lon,
        },
      });
    }

    console.log(`❌ No address found for ${latitude}, ${longitude}`);
    return res.json({
      success: true,
      result: null,
    });
  } catch (error: any) {
    console.error('Reverse geocoding error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during reverse geocoding',
      error: error.message,
    });
  }
};
