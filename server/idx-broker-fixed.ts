import axios from 'axios';

export interface IdxListing {
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
}

export interface IdxListingsResponse {
  listings: IdxListing[];
  totalCount: number;
  hasMoreListings: boolean;
}

/**
 * Fetches property listings from IDX Broker API using correct endpoints for RealtyCandy integration
 */
export async function fetchIdxListings({ 
  limit = 100, 
  offset = 0, 
  city = '', 
  minPrice = 0, 
  maxPrice = 0,
  bedrooms,
  bathrooms,
  propertyType = ''
}: { 
  limit?: number; 
  offset?: number; 
  city?: string; 
  minPrice?: number; 
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
} = {}): Promise<IdxListingsResponse> {
  try {
    const apiKey = process.env.IDX_BROKER_API_KEY;
    if (!apiKey) {
      throw new Error('IDX Broker API key is required');
    }

    console.log(`[IDX] Fetching listings with limit: ${limit}, offset: ${offset}`);

    // Use standard IDX Broker API endpoints based on documentation
    const endpoints = [
      // Primary: MLS property search with proper field selection
      {
        url: 'https://api.idxbroker.com/mls/search',
        params: {
          rf: 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType,image,remarksConcat,listDate',
          limit: Math.min(limit, 100),
          offset: offset,
          orderby: 'listDate',
          orderdir: 'DESC'
        }
      },
      // Secondary: Clients search endpoint  
      {
        url: 'https://api.idxbroker.com/clients/search',
        params: {
          rf: 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType,image,remarksConcat,listDate',
          limit: Math.min(limit, 100),
          offset: offset
        }
      },
      // Featured properties
      {
        url: 'https://api.idxbroker.com/clients/featured',
        params: {
          rf: 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType,image,remarksConcat,listDate',
          limit: Math.min(limit, 50)
        }
      },
      // Sold/pending for active data
      {
        url: 'https://api.idxbroker.com/clients/soldpending',
        params: {
          rf: 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType,image,remarksConcat,listDate',
          limit: Math.min(limit, 50)
        }
      }
    ];

    let response = null;
    let successfulEndpoint = null;

    // Try each endpoint until we get data
    for (const endpoint of endpoints) {
      try {
        console.log(`[IDX] Trying endpoint: ${endpoint.url}`);
        
        response = await axios.get(endpoint.url, {
          headers: {
            'accesskey': apiKey,
            'outputtype': 'json'
          },
          params: endpoint.params,
          timeout: 15000
        });

        if (response.status === 200 && response.data) {
          // Check if we got actual property data
          const hasPropertyData = Array.isArray(response.data) && response.data.length > 0 &&
            response.data[0] && (response.data[0].idxID || response.data[0].listPrice || response.data[0].address);
          
          if (hasPropertyData) {
            console.log(`[IDX] Success! Found ${response.data.length} properties from ${endpoint.url}`);
            successfulEndpoint = endpoint.url;
            break;
          } else {
            console.log(`[IDX] Endpoint returned data but not property listings: ${endpoint.url}`);
          }
        }
      } catch (error: any) {
        console.log(`[IDX] Endpoint failed: ${endpoint.url} - ${error.response?.status || error.message}`);
        continue;
      }
    }

    // If no endpoints worked, try to get data from RealtyCandy widget
    if (!response || !Array.isArray(response.data) || response.data.length === 0) {
      console.log('[IDX] Standard endpoints failed, trying RealtyCandy widget data');
      
      try {
        // Try RealtyCandy specific endpoint
        response = await axios.get('https://api.idxbroker.com/clients/widgetlistingsearch', {
          headers: {
            'accesskey': apiKey,
            'outputtype': 'json'
          },
          params: {
            limit: Math.min(limit, 500),
            searchtype: 'widget',
            widgetid: '40938' // From your HTML script
          },
          timeout: 15000
        });

        if (response.status === 200 && response.data) {
          console.log(`[IDX] RealtyCandy widget returned data`);
        }
      } catch (widgetError) {
        console.log('[IDX] RealtyCandy widget endpoint also failed');
      }
    }

    // If still no data, return empty result but log the issue
    if (!response || !response.data) {
      console.error('[IDX] All endpoints failed to return property data');
      return {
        listings: [],
        totalCount: 0,
        hasMoreListings: false
      };
    }

    console.log(`[IDX] Processing response from: ${successfulEndpoint || 'fallback endpoint'}`);
    console.log(`[IDX] Response type: ${typeof response.data}, Array: ${Array.isArray(response.data)}`);
    
    if (Array.isArray(response.data)) {
      console.log(`[IDX] Processing ${response.data.length} property records`);
    } else {
      console.log(`[IDX] Response structure:`, Object.keys(response.data || {}));
    }

    return transformIdxResponse(response.data);
  } catch (error) {
    console.error('[IDX] Error fetching listings:', error);
    throw new Error('Failed to fetch IDX listings');
  }
}

/**
 * Transform IDX API response to our application format
 */
function transformIdxResponse(data: any): IdxListingsResponse {
  console.log('[IDX] Transforming API response');
  
  if (!data) {
    return { listings: [], totalCount: 0, hasMoreListings: false };
  }

  let listings: any[] = [];

  // Handle different response formats
  if (Array.isArray(data)) {
    listings = data;
  } else if (data.listings && Array.isArray(data.listings)) {
    listings = data.listings;
  } else if (data.properties && Array.isArray(data.properties)) {
    listings = data.properties;
  } else if (typeof data === 'object') {
    // If it's an object, try to extract array values
    const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]));
    if (arrayKeys.length > 0) {
      listings = data[arrayKeys[0]];
    }
  }

  console.log(`[IDX] Found ${listings.length} listings to transform`);

  // Transform each listing to our format
  const transformedListings: IdxListing[] = listings.map((item: any, index: number) => {
    // Handle different possible field names from IDX API
    const id = item.idxID || item.listingId || item.id || `idx-${index}`;
    const address = item.address || item.streetName || item.fullAddress || 'Address not available';
    const city = item.cityName || item.city || '';
    const state = item.state || item.stateAbbr || '';
    const zipCode = item.zipcode || item.zip || item.postalCode || '';
    const price = parseFloat(item.listPrice || item.price || '0') || 0;
    const bedrooms = parseInt(item.bedrooms || item.beds || '0') || 0;
    const bathrooms = parseFloat(item.totalBaths || item.baths || item.bathrooms || '0') || 0;
    const sqft = parseInt(item.sqFt || item.squareFeet || item.livingArea || '0') || 0;
    const propertyType = item.propType || item.propertyType || 'Residential';
    const description = item.remarksConcat || item.description || item.remarks || '';
    const listedDate = item.listDate || item.dateAdded || new Date().toISOString();
    
    // Handle images
    let images: string[] = [];
    if (item.image && typeof item.image === 'string') {
      images = [item.image];
    } else if (Array.isArray(item.images)) {
      images = item.images;
    } else if (Array.isArray(item.image)) {
      images = item.image;
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
      images,
      description,
      listedDate
    };
  });

  console.log(`[IDX] Successfully transformed ${transformedListings.length} listings`);
  
  // Log a sample for debugging
  if (transformedListings.length > 0) {
    console.log('[IDX] Sample transformed listing:', {
      id: transformedListings[0].listingId,
      address: transformedListings[0].address,
      price: transformedListings[0].price,
      bedrooms: transformedListings[0].bedrooms
    });
  }

  return {
    listings: transformedListings,
    totalCount: transformedListings.length,
    hasMoreListings: transformedListings.length >= 100 // Assume more if we got a full page
  };
}

/**
 * Test IDX Broker API connection
 */
export async function testIdxConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const apiKey = process.env.IDX_BROKER_API_KEY;
    if (!apiKey) {
      return { success: false, message: "IDX Broker API key is not configured" };
    }

    const response = await axios.get('https://api.idxbroker.com/clients/accountinfo', {
      headers: {
        'accesskey': apiKey,
        'outputtype': 'json'
      },
      timeout: 8000
    });

    return { 
      success: true, 
      message: `Successfully connected to IDX Broker API. Account: ${response.data?.clientName || 'Unknown'}`
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      return { success: false, message: "Invalid IDX Broker API key" };
    } else if (error.response?.status === 403) {
      return { success: false, message: "IDX Broker API key lacks permissions" };
    } else {
      return { success: false, message: `IDX Broker API error: ${error.message}` };
    }
  }
}