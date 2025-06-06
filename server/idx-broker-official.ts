
export async function fetchIdxListingsOfficial(criteria: PropertySearchCriteria): Promise<{ listings: IdxListing[], totalCount: number }> {
  const {
    limit = 50,
    offset = 0,
    minPrice,
    maxPrice,
    bedrooms,
    minBedrooms,
    bathrooms,
    minBathrooms,
    city,
    state,
    zipCode,
    propertyType
  } = criteria;

  try {
    console.log(`[IDX-Official] Fetching properties with criteria:`, JSON.stringify(criteria, null, 2));

    if (!process.env.IDX_BROKER_API_KEY) {
      throw new Error('IDX_BROKER_API_KEY is required for authentic MLS data access');
    }

    const apiKey = process.env.IDX_BROKER_API_KEY;
    console.log(`[IDX-Official] Using API key: ${apiKey.substring(0, 4)}...`);
    
    // Validate API key format
    if (!apiKey.startsWith('a') || apiKey.length !== 22) {
      console.warn(`[IDX-Official] API key format warning: Expected format 'a...' with 22 characters, got '${apiKey.substring(0, 4)}...' with ${apiKey.length} characters`);
    }

    // Use Client API endpoints based on your account type
    const endpoints = [
      'https://api.idxbroker.com/clients/featured',
      'https://api.idxbroker.com/clients/systemlinks'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`[IDX-Official] Trying endpoint: ${endpoint}`);

        const headers = {
          'accesskey': apiKey,
          'outputtype': 'json'
        };

        const params = new URLSearchParams();
        
        // Add search criteria as URL parameters
        if (minPrice) params.append('lp', minPrice.toString());
        if (maxPrice) params.append('hp', maxPrice.toString());
        if (bedrooms) params.append('bd', bedrooms.toString());
        if (minBedrooms) params.append('bd', minBedrooms.toString());
        if (bathrooms) params.append('tb', bathrooms.toString());
        if (minBathrooms) params.append('tb', minBathrooms.toString());
        if (city) params.append('city[]', city);
        if (state) params.append('state', state);
        if (zipCode) params.append('zipcode[]', zipCode);
        if (propertyType && propertyType !== 'sfr') params.append('pt', propertyType);
        
        // Add default parameters
        params.append('limit', Math.min(limit, 100).toString());
        
        const apiUrl = `${endpoint}?${params.toString()}`;
        console.log(`[IDX-Official] Full URL: ${apiUrl}`);

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers,
          timeout: 15000
        });

        console.log(`[IDX-Official] Response status: ${response.status} ${response.statusText}`);

        if (response.status === 200) {
          const responseText = await response.text();
          console.log(`[IDX-Official] Raw response length: ${responseText.length}`);
          
          if (!responseText.trim()) {
            console.log(`[IDX-Official] Empty response from ${endpoint}`);
            continue;
          }

          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error(`[IDX-Official] JSON parse error for ${endpoint}:`, parseError);
            continue;
          }

          // Parse the IDX Broker API response
          let listings: any[] = [];
          
          if (Array.isArray(data)) {
            listings = data;
          } else if (data && typeof data === 'object') {
            if (data.listing) listings = Array.isArray(data.listing) ? data.listing : [data.listing];
            else if (data.listings) listings = data.listings;
            else if (data.properties) listings = data.properties;
            else if (data.featured) listings = data.featured;
            else {
              const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]) && data[key].length > 0);
              if (arrayKeys.length > 0) {
                listings = data[arrayKeys[0]];
                console.log(`[IDX-Official] Found listings in property: ${arrayKeys[0]}`);
              }
            }
          }

          console.log(`[IDX-Official] Found ${listings.length} raw listings from ${endpoint}`);

          if (listings.length > 0) {
            // Filter and transform listings
            const transformedListings: IdxListing[] = listings
              .filter((item: any) => {
                if (!item) return false;

                // Filter out international properties
                const address = item.address || item.streetAddress || item.fullAddress || '';
                const city = item.cityName || item.city || '';
                const state = item.state || item.stateAbbr || '';

                const internationalPatterns = [
                  'greece', 'mexico', 'cyprus', 'italy', 'athens', 'pafos', 'tijuana', 'baja',
                  'outside area (outside u.s.)', 'outside area (outside ca)', 'foreign country',
                  'other,', ', other,', ', other ', 'outside area', 'umbria'
                ];

                const addressLower = address.toLowerCase();
                const cityLower = city.toLowerCase();
                const stateLower = state.toLowerCase();

                const isInternational = internationalPatterns.some(pattern => 
                  addressLower.includes(pattern) || cityLower.includes(pattern) || stateLower.includes(pattern)
                );

                if (isInternational) {
                  console.log(`[IDX-Official] Filtering out international property: ${address}`);
                  return false;
                }

                return true;
              })
              .slice(offset, offset + limit)
              .map((item: any, index: number) => {
                const id = item.idxID || item.listingID || item.id || `idx-${index}`;
                const address = item.address || item.streetAddress || item.fullAddress || 'Address not available';
                const city = item.cityName || item.city || extractCityFromAddress(address);
                const state = item.state || item.stateAbbr || 'CA';
                const zipCode = item.zipcode || item.zip || item.postalCode || '';
                const price = parseFloat(item.listPrice || item.price || '0') || 0;
                const bedrooms = parseInt(item.bedrooms || item.beds || '0') || 0;
                const bathrooms = parseFloat(item.totalBaths || item.baths || item.bathrooms || '0') || 0;
                const sqft = parseInt(item.sqFt || item.squareFeet || item.livingArea || '0') || 0;
                const propertyType = item.propType || item.propertyType || 'Residential';
                const description = item.remarksConcat || item.description || item.remarks || '';

                let images: string[] = [];
                if (item.image && typeof item.image === 'string') {
                  images = [item.image];
                } else if (Array.isArray(item.images)) {
                  images = item.images;
                }

                return {
                  listingId: id,
                  address,
                  city,
                  state,
                  zipCode,
                  price,
                  bedrooms,
                  bathrooms,
                  sqft,
                  propertyType,
                  description,
                  images,
                  listedDate: item.listDate || item.dateAdded || new Date().toISOString(),
                  status: item.propStatus || item.status || 'Active',
                  mlsNumber: item.mlsID || item.mlsNumber || id,
                  lotSize: parseInt(item.acreage || item.lotSize || '0') || undefined,
                  yearBuilt: parseInt(item.yearBuilt || '0') || undefined,
                  daysOnMarket: parseInt(item.daysOnMarket || '0') || undefined,
                  listingAgent: item.listingAgent || item.agentName || '',
                  listingOffice: item.listingOffice || item.officeName || ''
                };
              });

            console.log(`[IDX-Official] Successfully transformed ${transformedListings.length} US properties from ${endpoint}`);

            return {
              listings: transformedListings,
              totalCount: transformedListings.length
            };
          }
        } else if (response.status === 401) {
          console.error(`[IDX-Official] 401 Unauthorized - API key may be invalid`);
        } else if (response.status === 406) {
          console.error(`[IDX-Official] 406 Not Acceptable - endpoint may not support this request format`);
        } else {
          console.error(`[IDX-Official] HTTP ${response.status} from ${endpoint}`);
        }
      } catch (endpointError: any) {
        console.error(`[IDX-Official] Error with ${endpoint}:`, endpointError.message);
        continue;
      }
    }

    // If all endpoints failed, throw an error
    throw new Error('All IDX Broker API endpoints failed');

  } catch (error) {
    console.error('[IDX-Official] Error fetching listings:', error);
    throw error;
  }
}

// Helper function to extract city from address
function extractCityFromAddress(address: string): string {
  const parts = address.split(',');
  if (parts.length >= 2) {
    return parts[1].trim();
  }
  return 'Unknown City';
}

// Define interfaces locally since they're not in shared schema
interface PropertySearchCriteria {
  limit?: number;
  offset?: number;
  city?: string;
  state?: string;
  zipCode?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  bathrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  propertyType?: string;
  garage?: boolean;
  pool?: boolean;
  fireplace?: boolean;
  basement?: boolean;
  waterfront?: boolean;
  yearBuilt?: number;
  minYearBuilt?: number;
  maxYearBuilt?: number;
  [key: string]: any;
}

interface IdxListing {
  listingId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: string;
  images: string[];
  description: string;
  listedDate: string;
  status: string;
  mlsNumber: string;
  lotSize?: number;
  yearBuilt?: number;
  daysOnMarket?: number;
  listingAgent: string;
  listingOffice: string;
}
