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

    // IDX Broker API using header-based authentication as required by your account
    const apiUrl = 'https://api.idxbroker.com/clients/featured';
    
    const headers = {
      'accesskey': process.env.IDX_BROKER_API_KEY,
      'outputtype': 'json',
      'apiversion': '1.8.0',
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    console.log(`[IDX-Official] Fetching from: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers
    });

    console.log(`[IDX-Official] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[IDX-Official] API Error: ${response.status} ${response.statusText}`);
      console.error(`[IDX-Official] Error details:`, errorText);
      throw new Error(`IDX Broker API error: ${response.status} ${response.statusText}`);
    }

    const responseText = await response.text();
    console.log(`[IDX-Official] Raw response:`, responseText.substring(0, 500));
    
    if (!responseText.trim()) {
      console.log(`[IDX-Official] Empty response from API - may indicate no featured listings`);
      return { listings: [], totalCount: 0 };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`[IDX-Official] JSON parse error:`, parseError);
      console.error(`[IDX-Official] Response was:`, responseText);
      throw new Error(`Invalid JSON response from IDX Broker API`);
    }
    console.log(`[IDX-Official] API Response received, type:`, typeof data);

    // Parse the IDX Broker API response
    let listings: any[] = [];
    
    if (Array.isArray(data)) {
      listings = data;
    } else if (data && typeof data === 'object') {
      // Look for common property arrays in IDX responses
      if (data.listing) listings = Array.isArray(data.listing) ? data.listing : [data.listing];
      else if (data.listings) listings = data.listings;
      else if (data.properties) listings = data.properties;
      else if (data.featured) listings = data.featured;
      else {
        // Check for any array properties
        const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]) && data[key].length > 0);
        if (arrayKeys.length > 0) {
          listings = data[arrayKeys[0]];
          console.log(`[IDX-Official] Found listings in property: ${arrayKeys[0]}`);
        }
      }
    }

    console.log(`[IDX-Official] Found ${listings.length} raw listings`);

    // Filter and transform listings to US properties only
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

        // Apply search criteria filters
        const price = parseFloat(item.listPrice || item.price || '0') || 0;
        const beds = parseInt(item.bedrooms || item.beds || '0') || 0;
        const baths = parseFloat(item.totalBaths || item.baths || item.bathrooms || '0') || 0;

        // Price filtering
        if (minPrice && price < minPrice) return false;
        if (maxPrice && price > maxPrice) return false;

        // Bedroom filtering
        if (bedrooms && beds !== bedrooms) return false;
        if (minBedrooms && beds < minBedrooms) return false;

        // Bathroom filtering
        if (bathrooms && baths !== bathrooms) return false;
        if (minBathrooms && baths < minBathrooms) return false;

        // Location filtering
        if (city && !cityLower.includes(city.toLowerCase())) return false;
        if (state && !stateLower.includes(state.toLowerCase())) return false;
        if (zipCode && !(item.zipcode || item.zip || '').includes(zipCode)) return false;

        return true;
      })
      .slice(offset, offset + limit)
      .map((item: any, index: number) => {
        // Transform to our schema
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

        // Handle images
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

    console.log(`[IDX-Official] Successfully transformed ${transformedListings.length} US properties`);

    return {
      listings: transformedListings,
      totalCount: transformedListings.length
    };

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