/**
 * Google Places API integration
 */
import axios from 'axios';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

console.log('[google-places] Module loaded, API key present:', !!GOOGLE_PLACES_API_KEY);
if (GOOGLE_PLACES_API_KEY) {
  console.log('[google-places] API key first 4 chars:', GOOGLE_PLACES_API_KEY.substring(0, 4) + '...');
} else {
  console.log('[google-places] WARNING: Google Places API key not found in environment variables');
}

export interface PlacesSearchParams {
  query: string;
  location: string;
  radius: number;
  category?: string;
}

export interface PlaceSearchResult {
  place_id: string;
  name: string;
  vicinity: string;
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  business_status?: string;
}

/**
 * Search for service providers using Google Places API
 * @param params Search parameters
 * @returns List of places matching the search criteria
 */
export async function searchNearbyPlaces(params: PlacesSearchParams): Promise<PlaceSearchResult[]> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('[google-places] Cannot search places: API key not found in environment variables');
    return [];
  }

  const { query, location, radius, category } = params;
  
  console.log(`[google-places] Searching for "${query}" near ${location} with radius ${radius}m${category ? ` and category ${category}` : ''}`);
  
  const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${GOOGLE_PLACES_API_KEY}&keyword=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&radius=${radius}&type=${encodeURIComponent(category || '')}`;

  try {
    console.log(`[google-places] Making API request to: ${apiUrl.replace(GOOGLE_PLACES_API_KEY, 'API_KEY_HIDDEN')}`);
    const response = await axios.get(apiUrl);
    
    console.log(`[google-places] API response status: ${response.status}`);
    if (response.data && response.data.status) {
      console.log(`[google-places] Google API status: ${response.data.status}`);
      
      if (response.data.status !== 'OK') {
        console.log(`[google-places] API error: ${response.data.error_message || 'No error message provided'}`);
      }
    }
    
    const results = response.data.results || [];
    console.log(`[google-places] Found ${results.length} results`);
    
    return results;
  } catch (error: any) {
    console.error('[google-places] Error fetching from Google Places API:', error.message);
    if (error.response) {
      console.error('[google-places] API response error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    return [];
  }
}

/**
 * Get details for a specific place by its ID
 * @param placeId Google Places place_id
 * @returns Detailed information about the place
 */
export async function getPlaceDetails(placeId: string): Promise<any> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('Google Places API key not found in environment variables');
    return null;
  }

  const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?key=${GOOGLE_PLACES_API_KEY}&place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,rating,reviews,photos,types`;

  try {
    const response = await axios.get(apiUrl);
    return response.data.result;
  } catch (error: any) {
    console.error('Error fetching place details from Google Places API:', error.message);
    return null;
  }
}

/**
 * Get a photo URL for a place
 * @param photoReference Photo reference from a Place result
 * @param maxWidth Maximum width of the photo
 * @returns URL to the photo
 */
export function getPlacePhotoUrl(photoReference: string, maxWidth: number = 400): string {
  if (!GOOGLE_PLACES_API_KEY || !photoReference) return '';
  
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
}