
import axios from 'axios';

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
  yearBuilt?: number;
  lotSize?: number;
  garage?: boolean;
  pool?: boolean;
  fireplace?: boolean;
  basement?: boolean;
}

interface IdxSearchCriteria {
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

interface IdxResponse {
  listings: IdxListing[];
  totalCount: number;
  hasMoreListings: boolean;
}

export async function testIdxConnection(): Promise<{ success: boolean; message: string }> {
  const apiKey = process.env.IDX_BROKER_API_KEY;
  
  if (!apiKey) {
    return {
      success: false,
      message: 'IDX Broker API key is not configured'
    };
  }

  try {
    console.log('[IDX] Testing connection with multiple endpoints...');
    
    // Test multiple endpoints to find one that works
    const testEndpoints = [
      'https://api.idxbroker.com/clients/accountinfo',
      'https://api.idxbroker.com/clients/systemlinks',
      'https://api.idxbroker.com/clients/listings'
    ];

    for (const endpoint of testEndpoints) {
      try {
        console.log(`[IDX] Testing ${endpoint}...`);
        
        const response = await axios.get(endpoint, {
          headers: {
            'accesskey': apiKey,
            'outputtype': 'json'
          },
          timeout: 10000,
          validateStatus: (status) => status < 500 // Don't throw on 4xx errors
        });

        console.log(`[IDX] ${endpoint} returned status: ${response.status}`);

        if (response.status === 200) {
          return {
            success: true,
            message: `IDX Broker API connection successful via ${endpoint}`
          };
        } else if (response.status === 401) {
          return {
            success: false,
            message: 'IDX Broker API key is invalid or expired'
          };
        } else if (response.status === 403) {
          return {
            success: false,
            message: 'IDX Broker API key lacks necessary permissions'
          };
        }
      } catch (endpointError: any) {
        console.log(`[IDX] ${endpoint} failed: ${endpointError.message}`);
        continue;
      }
    }

    return {
      success: false,
      message: 'All IDX Broker API endpoints failed to respond'
    };

  } catch (error: any) {
    console.error('[IDX] Connection test failed:', error.message);
    return {
      success: false,
      message: `IDX connection failed: ${error.message}`
    };
  }
}

export async function fetchIdxListings(criteria: IdxSearchCriteria = {}): Promise<IdxResponse> {
  const apiKey = process.env.IDX_BROKER_API_KEY;
  
  if (!apiKey) {
    console.log('[IDX] No API key found, returning empty results');
    return {
      listings: [],
      totalCount: 0,
      hasMoreListings: false
    };
  }

  try {
    console.log('[IDX] Fetching listings with criteria:', criteria);
    
    // Try multiple endpoints
    const endpoints = [
      'https://api.idxbroker.com/clients/listings',
      'https://api.idxbroker.com/clients/featured',
      'https://api.idxbroker.com/clients/search'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, {
          headers: {
            'accesskey': apiKey,
            'outputtype': 'json'
          },
          params: {
            limit: criteria.limit || 100
          },
          timeout: 15000,
          validateStatus: (status) => status < 500
        });

        if (response.status !== 200) {
          console.log(`[IDX] ${endpoint} returned status ${response.status}, trying next endpoint`);
          continue;
        }

        let listings: any[] = [];
        
        if (Array.isArray(response.data)) {
          listings = response.data;
        } else if (response.data && typeof response.data === 'object') {
          listings = Object.values(response.data);
        }

        if (listings.length === 0) {
          console.log(`[IDX] ${endpoint} returned no listings, trying next endpoint`);
          continue;
        }

        const convertedListings: IdxListing[] = listings.map((listing, index) => ({
          listingId: listing.idxID || listing.listingID || `idx-${index}`,
          address: listing.address || 'Unknown Address',
          city: listing.cityName || listing.city || 'Unknown City',
          state: listing.state || 'Unknown State',
          zipCode: listing.zipcode || listing.zipCode || 'Unknown',
          price: Number(listing.listPrice || listing.price || 0),
          bedrooms: Number(listing.bedrooms || 0),
          bathrooms: Number(listing.totalBaths || listing.bathrooms || 0),
          sqft: Number(listing.sqFt || listing.squareFeet || 0),
          propertyType: listing.propType || listing.propertyType || 'Unknown',
          images: Array.isArray(listing.image) ? listing.image : (listing.image ? [listing.image] : []),
          description: listing.remarksConcat || listing.description || '',
          listedDate: listing.listDate || new Date().toISOString(),
          yearBuilt: listing.yearBuilt ? Number(listing.yearBuilt) : undefined,
          lotSize: listing.lotSize ? Number(listing.lotSize) : undefined,
          garage: listing.garage === 'true' || listing.garage === true,
          pool: listing.pool === 'true' || listing.pool === true,
          fireplace: listing.fireplace === 'true' || listing.fireplace === true,
          basement: listing.basement === 'true' || listing.basement === true
        }));

        console.log(`[IDX] Successfully fetched ${convertedListings.length} listings from ${endpoint}`);

        return {
          listings: convertedListings,
          totalCount: convertedListings.length,
          hasMoreListings: convertedListings.length >= (criteria.limit || 100)
        };
      } catch (endpointError: any) {
        console.log(`[IDX] ${endpoint} failed: ${endpointError.message}`);
        continue;
      }
    }

    // If all endpoints failed
    console.error('[IDX] All endpoints failed');
    return {
      listings: [],
      totalCount: 0,
      hasMoreListings: false
    };

  } catch (error: any) {
    console.error('[IDX] Error fetching listings:', error.message);
    return {
      listings: [],
      totalCount: 0,
      hasMoreListings: false
    };
  }
}

export async function fetchIdxFeaturedListings(limit: number = 10): Promise<IdxListing[]> {
  const apiKey = process.env.IDX_BROKER_API_KEY;
  
  if (!apiKey) {
    return [];
  }

  try {
    const response = await axios.get('https://api.idxbroker.com/clients/featured', {
      headers: {
        'accesskey': apiKey,
        'outputtype': 'json'
      },
      params: { limit },
      timeout: 10000
    });

    if (response.status === 200 && Array.isArray(response.data)) {
      return response.data.map((listing, index) => ({
        listingId: listing.idxID || `featured-${index}`,
        address: listing.address || 'Unknown Address',
        city: listing.cityName || listing.city || 'Unknown City',
        state: listing.state || 'Unknown State',
        zipCode: listing.zipcode || 'Unknown',
        price: Number(listing.listPrice || 0),
        bedrooms: Number(listing.bedrooms || 0),
        bathrooms: Number(listing.totalBaths || 0),
        sqft: Number(listing.sqFt || 0),
        propertyType: listing.propType || 'Unknown',
        images: Array.isArray(listing.image) ? listing.image : (listing.image ? [listing.image] : []),
        description: listing.remarksConcat || '',
        listedDate: listing.listDate || new Date().toISOString()
      }));
    }

    return [];
  } catch (error) {
    console.error('[IDX] Error fetching featured listings:', error);
    return [];
  }
}

export async function fetchIdxSoldPendingListings(status: 'sold' | 'pending', limit: number = 10): Promise<IdxListing[]> {
  const apiKey = process.env.IDX_BROKER_API_KEY;
  
  if (!apiKey) {
    return [];
  }

  try {
    const response = await axios.get('https://api.idxbroker.com/clients/soldpending', {
      headers: {
        'accesskey': apiKey,
        'outputtype': 'json'
      },
      params: { 
        limit,
        status: status === 'sold' ? 'Sold' : 'Pending'
      },
      timeout: 10000
    });

    if (response.status === 200 && Array.isArray(response.data)) {
      return response.data.map((listing, index) => ({
        listingId: listing.idxID || `${status}-${index}`,
        address: listing.address || 'Unknown Address',
        city: listing.cityName || listing.city || 'Unknown City',
        state: listing.state || 'Unknown State',
        zipCode: listing.zipcode || 'Unknown',
        price: Number(listing.listPrice || 0),
        bedrooms: Number(listing.bedrooms || 0),
        bathrooms: Number(listing.totalBaths || 0),
        sqft: Number(listing.sqFt || 0),
        propertyType: listing.propType || 'Unknown',
        images: Array.isArray(listing.image) ? listing.image : (listing.image ? [listing.image] : []),
        description: listing.remarksConcat || '',
        listedDate: listing.listDate || new Date().toISOString()
      }));
    }

    return [];
  } catch (error) {
    console.error(`[IDX] Error fetching ${status} listings:`, error);
    return [];
  }
}

export async function fetchIdxCities(): Promise<string[]> {
  const apiKey = process.env.IDX_BROKER_API_KEY;
  
  if (!apiKey) {
    return [];
  }

  try {
    const response = await axios.get('https://api.idxbroker.com/clients/cities', {
      headers: {
        'accesskey': apiKey,
        'outputtype': 'json'
      },
      timeout: 10000
    });

    if (response.status === 200 && Array.isArray(response.data)) {
      return response.data.map(city => city.cityName || city.name || city);
    }

    return [];
  } catch (error) {
    console.error('[IDX] Error fetching cities:', error);
    return [];
  }
}

export async function fetchIdxCounties(): Promise<string[]> {
  const apiKey = process.env.IDX_BROKER_API_KEY;
  
  if (!apiKey) {
    return [];
  }

  try {
    const response = await axios.get('https://api.idxbroker.com/clients/counties', {
      headers: {
        'accesskey': apiKey,
        'outputtype': 'json'
      },
      timeout: 10000
    });

    if (response.status === 200 && Array.isArray(response.data)) {
      return response.data.map(county => county.countyName || county.name || county);
    }

    return [];
  } catch (error) {
    console.error('[IDX] Error fetching counties:', error);
    return [];
  }
}

export async function fetchIdxPostalCodes(): Promise<string[]> {
  const apiKey = process.env.IDX_BROKER_API_KEY;
  
  if (!apiKey) {
    return [];
  }

  try {
    const response = await axios.get('https://api.idxbroker.com/clients/postalcodes', {
      headers: {
        'accesskey': apiKey,
        'outputtype': 'json'
      },
      timeout: 10000
    });

    if (response.status === 200 && Array.isArray(response.data)) {
      return response.data.map(postal => postal.zipcode || postal.postalCode || postal);
    }

    return [];
  } catch (error) {
    console.error('[IDX] Error fetching postal codes:', error);
    return [];
  }
}

export async function fetchIdxSearchFields(): Promise<any[]> {
  const apiKey = process.env.IDX_BROKER_API_KEY;
  
  if (!apiKey) {
    return [];
  }

  try {
    const response = await axios.get('https://api.idxbroker.com/clients/searchfields', {
      headers: {
        'accesskey': apiKey,
        'outputtype': 'json'
      },
      timeout: 10000
    });

    if (response.status === 200) {
      return Array.isArray(response.data) ? response.data : [];
    }

    return [];
  } catch (error) {
    console.error('[IDX] Error fetching search fields:', error);
    return [];
  }
}

export async function searchIdxProperties(searchParams: any): Promise<IdxResponse> {
  const apiKey = process.env.IDX_BROKER_API_KEY;
  
  if (!apiKey) {
    return {
      listings: [],
      totalCount: 0,
      hasMoreListings: false
    };
  }

  try {
    const response = await axios.get('https://api.idxbroker.com/clients/search', {
      headers: {
        'accesskey': apiKey,
        'outputtype': 'json'
      },
      params: searchParams,
      timeout: 15000
    });

    if (response.status === 200 && Array.isArray(response.data)) {
      const listings = response.data.map((listing, index) => ({
        listingId: listing.idxID || `search-${index}`,
        address: listing.address || 'Unknown Address',
        city: listing.cityName || listing.city || 'Unknown City',
        state: listing.state || 'Unknown State',
        zipCode: listing.zipcode || 'Unknown',
        price: Number(listing.listPrice || 0),
        bedrooms: Number(listing.bedrooms || 0),
        bathrooms: Number(listing.totalBaths || 0),
        sqft: Number(listing.sqFt || 0),
        propertyType: listing.propType || 'Unknown',
        images: Array.isArray(listing.image) ? listing.image : (listing.image ? [listing.image] : []),
        description: listing.remarksConcat || '',
        listedDate: listing.listDate || new Date().toISOString()
      }));

      return {
        listings,
        totalCount: listings.length,
        hasMoreListings: listings.length >= (searchParams.limit || 100)
      };
    }

    return {
      listings: [],
      totalCount: 0,
      hasMoreListings: false
    };
  } catch (error) {
    console.error('[IDX] Error searching properties:', error);
    return {
      listings: [],
      totalCount: 0,
      hasMoreListings: false
    };
  }
}
