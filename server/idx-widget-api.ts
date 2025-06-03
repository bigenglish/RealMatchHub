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
 * Fetch property listings using widget-based approach for RealtyCandy integration
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

    console.log(`[IDX-Widget] Fetching listings via widget API, limit: ${limit}`);

    // Widget-based endpoints using your homesai.idxbroker.com configuration
    const endpoints = [
      // Direct widget API using your widget ID 40938
      {
        url: 'https://homesai.idxbroker.com/idx/api/search',
        params: {
          widgetid: '40938',
          count: Math.min(limit, 100),
          start: offset,
          format: 'json',
          ...(city && { cityName: city }),
          ...(minPrice > 0 && { lp: minPrice }),
          ...(maxPrice > 0 && { hp: maxPrice }),
          ...(bedrooms && { bd: bedrooms }),
          ...(bathrooms && { tb: bathrooms }),
          ...(propertyType && { pt: propertyType })
        }
      },
      // Alternative widget search
      {
        url: 'https://homesai.idxbroker.com/idx/search/results',
        params: {
          format: 'json',
          count: Math.min(limit, 100),
          start: offset
        }
      },
      // API endpoint with widget authentication
      {
        url: 'https://api.idxbroker.com/clients/search',
        params: {
          rf: 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType,image,remarksConcat,listDate',
          count: Math.min(limit, 100),
          start: offset,
          ccz: 'city',
          pt: '1',
          a_propStatus: 'Active',
          idxID: 'd025'
        }
      },
      // Featured listings endpoint
      {
        url: 'https://api.idxbroker.com/clients/featured',
        params: {
          rf: 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType,image,remarksConcat,listDate',
          count: Math.min(limit, 50)
        }
      }
    ];

    let response = null;
    let successfulEndpoint = null;

    // Try each endpoint with proper authentication
    for (const endpoint of endpoints) {
      try {
        console.log(`[IDX-Widget] Trying endpoint: ${endpoint.url}`);
        
        // Use different authentication methods for different endpoint types
        let requestConfig: any = {
          params: endpoint.params,
          timeout: 15000
        };

        if (endpoint.url.includes('api.idxbroker.com')) {
          // Use API key authentication for IDX Broker API endpoints
          requestConfig.headers = {
            'accesskey': apiKey,
            'outputtype': 'json'
          };
        } else {
          // For widget endpoints, try different approaches
          requestConfig.headers = {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey
          };
        }

        response = await axios.get(endpoint.url, requestConfig);

        if (response.status === 200 && response.data) {
          // Check if we got actual property data
          let hasPropertyData = false;
          
          if (Array.isArray(response.data) && response.data.length > 0) {
            hasPropertyData = response.data.some(item => 
              item && (item.idxID || item.listingID || item.listPrice || item.address)
            );
          } else if (response.data && typeof response.data === 'object') {
            // Check for nested property arrays
            const dataKeys = Object.keys(response.data);
            for (const key of dataKeys) {
              if (Array.isArray(response.data[key]) && response.data[key].length > 0) {
                const nestedData = response.data[key];
                hasPropertyData = nestedData.some((item: any) => 
                  item && (item.idxID || item.listingID || item.listPrice || item.address)
                );
                if (hasPropertyData) {
                  response.data = nestedData;
                  break;
                }
              }
            }
          }
          
          if (hasPropertyData) {
            console.log(`[IDX-Widget] Success! Found ${Array.isArray(response.data) ? response.data.length : 'nested'} properties from ${endpoint.url}`);
            successfulEndpoint = endpoint.url;
            break;
          } else {
            console.log(`[IDX-Widget] Endpoint returned data but no property listings: ${endpoint.url}`);
          }
        }
        
      } catch (error: any) {
        console.log(`[IDX-Widget] Endpoint failed: ${endpoint.url} - ${error.response?.status || error.message}`);
        continue;
      }
    }

    // If no endpoints worked, try a direct HTTP request to your widget
    if (!response || !Array.isArray(response.data) || response.data.length === 0) {
      console.log('[IDX-Widget] Standard endpoints failed, trying direct widget access');
      
      try {
        // Try to access the widget JavaScript output and parse it
        const widgetResponse = await axios.get(`https://homesai.idxbroker.com/idx/quicksearchjs.php?widgetid=40938&format=json`, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; HomesAI/1.0)'
          }
        });

        if (widgetResponse.status === 200 && widgetResponse.data) {
          console.log(`[IDX-Widget] Direct widget access returned data`);
          response = widgetResponse;
        }
      } catch (widgetError) {
        console.log('[IDX-Widget] Direct widget access also failed');
      }
    }

    // If still no data, return empty result but log the issue
    if (!response || !response.data) {
      console.error('[IDX-Widget] All widget endpoints failed to return property data');
      console.error('[IDX-Widget] This suggests the RealtyCandy integration may need different authentication or endpoints');
      return {
        listings: [],
        totalCount: 0,
        hasMoreListings: false
      };
    }

    console.log(`[IDX-Widget] Processing response from: ${successfulEndpoint || 'widget endpoint'}`);
    return transformIdxResponse(response.data);
  } catch (error) {
    console.error('[IDX-Widget] Error fetching listings:', error);
    throw new Error('Failed to fetch IDX listings through widget API');
  }
}

/**
 * Transform IDX widget response to our application format
 */
function transformIdxResponse(data: any): IdxListingsResponse {
  console.log('[IDX-Widget] Transforming widget API response');
  
  if (!data) {
    return { listings: [], totalCount: 0, hasMoreListings: false };
  }

  let listings: any[] = [];

  // Handle different response formats from widget API
  if (Array.isArray(data)) {
    listings = data;
  } else if (data.results && Array.isArray(data.results)) {
    listings = data.results;
  } else if (data.listings && Array.isArray(data.listings)) {
    listings = data.listings;
  } else if (data.properties && Array.isArray(data.properties)) {
    listings = data.properties;
  } else if (data.data && Array.isArray(data.data)) {
    listings = data.data;
  } else if (typeof data === 'object') {
    // Check for any array properties that might contain listings
    const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]) && data[key].length > 0);
    if (arrayKeys.length > 0) {
      listings = data[arrayKeys[0]];
      console.log(`[IDX-Widget] Found listings in property: ${arrayKeys[0]}`);
    }
  }

  console.log(`[IDX-Widget] Found ${listings.length} listings to transform`);

  // Filter out non-property items (like system links)
  const propertyListings = listings.filter((item: any) => {
    return item && (
      item.idxID || 
      item.listingID || 
      item.listPrice || 
      (item.address && !item.url) // Exclude system links with URLs
    );
  });

  console.log(`[IDX-Widget] Filtered to ${propertyListings.length} actual property listings`);

  // Transform each listing to our format
  const transformedListings: IdxListing[] = propertyListings.map((item: any, index: number) => {
    // Handle different possible field names from widget API
    const id = item.idxID || item.listingID || item.id || `widget-${index}`;
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

  console.log(`[IDX-Widget] Successfully transformed ${transformedListings.length} listings`);
  
  if (transformedListings.length > 0) {
    console.log('[IDX-Widget] Sample transformed listing:', {
      id: transformedListings[0].listingId,
      address: transformedListings[0].address,
      price: transformedListings[0].price,
      bedrooms: transformedListings[0].bedrooms
    });
  }

  return {
    listings: transformedListings,
    totalCount: transformedListings.length,
    hasMoreListings: transformedListings.length >= 100
  };
}

/**
 * Test widget API connection
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
      message: `Widget API ready. Account: ${accountInfo?.clientName || 'Unknown'}, MLS: d025, Widget: 40938`
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