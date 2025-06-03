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
 * Fetch property listings using RealtyCandy-specific endpoints and widget integration
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

    console.log(`[IDX-RC] Fetching listings with RealtyCandy integration, limit: ${limit}`);

    // RealtyCandy-specific endpoints based on your widget configuration
    const endpoints = [
      // Widget-based search endpoint using your widget ID 40938
      {
        url: 'https://api.idxbroker.com/clients/widgetlistingsearch',
        params: {
          widgetid: '40938',
          count: Math.min(limit, 100),
          start: offset
        }
      },
      // Direct MLS search with d025 MLS parameter
      {
        url: 'https://api.idxbroker.com/clients/search',
        params: {
          idxID: 'd025',
          count: Math.min(limit, 100),
          start: offset,
          pt: '1', // Residential properties
          a_propStatus: 'Active'
        }
      },
      // Alternative widget search
      {
        url: 'https://homesai.idxbroker.com/idx/search/widget',
        params: {
          widgetid: '40938',
          outputtype: 'json',
          count: Math.min(limit, 100)
        }
      },
      // MLS direct access with proper format
      {
        url: 'https://api.idxbroker.com/mls/search',
        params: {
          mlsid: 'd025',
          count: Math.min(limit, 100),
          start: offset
        }
      }
    ];

    let response = null;
    let successfulEndpoint = null;

    // Try each endpoint with different parameter formats
    for (const endpoint of endpoints) {
      try {
        console.log(`[IDX-RC] Trying endpoint: ${endpoint.url}`);
        
        // Try multiple header combinations for RealtyCandy compatibility
        const headerVariations = [
          {
            'accesskey': apiKey,
            'outputtype': 'json'
          },
          {
            'accesskey': apiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          {
            'accesskey': apiKey
          }
        ];

        for (const headers of headerVariations) {
          try {
            response = await axios.get(endpoint.url, {
              headers,
              params: {
                ...endpoint.params,
                outputtype: 'json'
              },
              timeout: 15000
            });

            if (response.status === 200 && response.data) {
              // Check if we got actual property data
              if (Array.isArray(response.data) && response.data.length > 0) {
                const hasPropertyData = response.data.some(item => 
                  item && (item.idxID || item.listingID || item.listPrice || item.address)
                );
                
                if (hasPropertyData) {
                  console.log(`[IDX-RC] Success! Found ${response.data.length} properties from ${endpoint.url}`);
                  successfulEndpoint = endpoint.url;
                  break;
                }
              } else if (response.data && typeof response.data === 'object') {
                // Check for nested property arrays
                const dataKeys = Object.keys(response.data);
                const arrayKey = dataKeys.find(key => Array.isArray(response.data[key]));
                if (arrayKey && response.data[arrayKey].length > 0) {
                  console.log(`[IDX-RC] Found properties in nested array: ${arrayKey}`);
                  response.data = response.data[arrayKey];
                  successfulEndpoint = endpoint.url;
                  break;
                }
              }
            }
          } catch (headerError) {
            console.log(`[IDX-RC] Header variation failed: ${headerError.response?.status || headerError.message}`);
            continue;
          }
        }

        if (successfulEndpoint) break;
        
      } catch (error: any) {
        console.log(`[IDX-RC] Endpoint failed: ${endpoint.url} - ${error.response?.status || error.message}`);
        continue;
      }
    }

    // If standard endpoints fail, try the widget direct access method
    if (!response || !Array.isArray(response.data) || response.data.length === 0) {
      console.log('[IDX-RC] Standard endpoints failed, trying direct widget access');
      
      try {
        // Try accessing the widget data directly through the search interface
        response = await axios.get('https://api.idxbroker.com/clients/search', {
          headers: {
            'accesskey': apiKey,
            'outputtype': 'json'
          },
          params: {
            // Use parameters that match your Los Angeles market focus
            cityName: city || 'Los Angeles',
            state: 'CA',
            idxID: 'd025',
            pt: propertyType || '1,2,3', // Residential types
            minListPrice: minPrice || 200000,
            maxListPrice: maxPrice || 2000000,
            ...(bedrooms && { bedrooms }),
            ...(bathrooms && { totalBaths: bathrooms }),
            count: Math.min(limit, 100),
            orderby: 'listDate',
            orderdir: 'DESC'
          },
          timeout: 15000
        });

        if (response.status === 200 && response.data) {
          console.log(`[IDX-RC] Direct widget access returned data`);
        }
      } catch (widgetError) {
        console.log('[IDX-RC] Direct widget access also failed');
      }
    }

    // If still no data, return empty result but log the issue
    if (!response || !response.data) {
      console.error('[IDX-RC] All RealtyCandy endpoints failed to return property data');
      return {
        listings: [],
        totalCount: 0,
        hasMoreListings: false
      };
    }

    console.log(`[IDX-RC] Processing response from: ${successfulEndpoint || 'fallback endpoint'}`);
    return transformIdxResponse(response.data);
  } catch (error) {
    console.error('[IDX-RC] Error fetching listings:', error);
    throw new Error('Failed to fetch IDX listings through RealtyCandy integration');
  }
}

/**
 * Transform IDX API response to our application format
 */
function transformIdxResponse(data: any): IdxListingsResponse {
  console.log('[IDX-RC] Transforming RealtyCandy API response');
  
  if (!data) {
    return { listings: [], totalCount: 0, hasMoreListings: false };
  }

  let listings: any[] = [];

  // Handle different response formats from RealtyCandy
  if (Array.isArray(data)) {
    listings = data;
  } else if (data.results && Array.isArray(data.results)) {
    listings = data.results;
  } else if (data.listings && Array.isArray(data.listings)) {
    listings = data.listings;
  } else if (data.properties && Array.isArray(data.properties)) {
    listings = data.properties;
  } else if (typeof data === 'object') {
    // Check for any array properties that might contain listings
    const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]) && data[key].length > 0);
    if (arrayKeys.length > 0) {
      listings = data[arrayKeys[0]];
    }
  }

  console.log(`[IDX-RC] Found ${listings.length} listings to transform`);

  // Transform each listing to our format
  const transformedListings: IdxListing[] = listings.map((item: any, index: number) => {
    // Handle different possible field names from RealtyCandy/IDX API
    const id = item.idxID || item.listingID || item.id || `rc-${index}`;
    const address = item.address || item.streetAddress || item.fullAddress || 'Address not available';
    const city = item.cityName || item.city || '';
    const state = item.state || item.stateAbbr || 'CA';
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

  console.log(`[IDX-RC] Successfully transformed ${transformedListings.length} listings`);
  
  if (transformedListings.length > 0) {
    console.log('[IDX-RC] Sample transformed listing:', {
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
 * Test RealtyCandy IDX connection
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

    const accountInfo = response.data;
    return { 
      success: true, 
      message: `RealtyCandy integration active. Account: ${accountInfo?.clientName || 'Unknown'}, MLS: d025 ${accountInfo?.mlsMembership?.d025?.paperworkApproved === 'y' ? '(Approved)' : '(Pending)'}`
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