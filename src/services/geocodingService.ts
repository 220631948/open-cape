// Geocoding Service integrating OpenCage and/or Nominatim
// Handles address parsing and returns standardized coordinate data

export interface GeocodeResult {
  address: string;
  lat: number;
  lng: number;
  formattedAddress?: string;
  source: 'opencage' | 'nominatim';
  confidence?: number;
}

const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;

/**
 * Geocode an address to coordinates using OpenCage (if key exists) or Nominatim fallback.
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult[]> {
  if (!address || address.trim().length === 0) {
    return [];
  }

  // Use OpenCage if API key is provided
  if (OPENCAGE_API_KEY) {
    try {
      const url = new URL('https://api.opencagedata.com/geocode/v1/json');
      url.searchParams.append('q', address);
      url.searchParams.append('key', OPENCAGE_API_KEY);
      url.searchParams.append('limit', '5');
      url.searchParams.append('no_annotations', '1');

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`OpenCage API error: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.results) {
        return data.results.map((result: any) => ({
          address: address,
          lat: result.geometry.lat,
          lng: result.geometry.lng,
          formattedAddress: result.formatted,
          source: 'opencage',
          confidence: result.confidence
        }));
      }
    } catch (e) {
      console.warn("OpenCage geocoding failed, falling back to Nominatim", e);
    }
  }

  // Fallback to Nominatim API (OpenStreetMap)
  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.append('q', address);
    url.searchParams.append('format', 'json');
    url.searchParams.append('limit', '5');

    const response = await fetch(url.toString(), {
      headers: {
        // Nominatim requests require a User-Agent identifying the application
        'User-Agent': 'ReactGISApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    if (data && Array.isArray(data)) {
      return data.map((result: any) => ({
        address: address,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        formattedAddress: result.display_name,
        source: 'nominatim',
        confidence: result.importance ? result.importance * 10 : undefined // Normalized approx
      }));
    }
  } catch (e) {
    console.error("Nominatim geocoding failed", e);
  }

  return [];
}

/**
 * Reverse geocode coordinates to an address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  if (OPENCAGE_API_KEY) {
    try {
      const url = new URL('https://api.opencagedata.com/geocode/v1/json');
      url.searchParams.append('q', `${lat},${lng}`);
      url.searchParams.append('key', OPENCAGE_API_KEY);
      url.searchParams.append('limit', '1');
      url.searchParams.append('no_annotations', '1');

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`OpenCage API error: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          address: result.formatted,
          lat: result.geometry.lat,
          lng: result.geometry.lng,
          formattedAddress: result.formatted,
          source: 'opencage',
          confidence: result.confidence
        };
      }
    } catch (e) {
      console.warn("OpenCage reverse geocoding failed, falling back to Nominatim", e);
    }
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.append('lat', lat.toString());
    url.searchParams.append('lon', lng.toString());
    url.searchParams.append('format', 'json');

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'ReactGISApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.display_name) {
      return {
        address: data.display_name,
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lon),
        formattedAddress: data.display_name,
        source: 'nominatim'
      };
    }
  } catch (e) {
    console.error("Nominatim reverse geocoding failed", e);
  }

  return null;
}
