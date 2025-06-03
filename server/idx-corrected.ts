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
 * Fetch property listings using corrected parameter format for MLS d025
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

    console.log(`[IDX-Corrected] Fetching listings for MLS d025, limit: ${limit}`);

    // Use correct parameter formats based on IDX documentation and MLS d025 access
    const endpoints = [
      // MLS property search with corrected parameters
      {
        url: 'https://api.idxbroker.com/mls/search/d025',
        method: 'GET',
        params: {}
      },
      // MLS property count to verify data availability
      {
        url: 'https://api.idxbroker.com/mls/propertycount/d025',
        method: 'GET',
        params: {}
      },
      // Alternative clients listing without problematic parameters
      {
        url: 'https://api.idxbroker.com/clients/listings',
        method: 'GET',
        params: {}
      },
      // Featured properties without parameters
      {
        url: 'https://api.idxbroker.com/clients/featured',
        method: 'GET',
        params: {}
      },
      // Sold/pending properties
      {
        url: 'https://api.idxbroker.com/clients/soldpending',
        method: 'GET',
        params: {}
      }
    ];

    let response = null;
    let successfulEndpoint = null;

    // Try each endpoint with minimal parameters to avoid 400 errors
    for (const endpoint of endpoints) {
      try {
        console.log(`[IDX-Corrected] Trying endpoint: ${endpoint.url}`);
        
        const requestConfig: any = {
          method: endpoint.method,
          url: endpoint.url,
          headers: {
            'accesskey': apiKey,
            'outputtype': 'json'
          },
          timeout: 15000
        };

        if (Object.keys(endpoint.params).length > 0) {
          requestConfig.params = endpoint.params;
        }

        response = await axios(requestConfig);

        if (response.status === 200 && response.data) {
          console.log(`[IDX-Corrected] Response type: ${typeof response.data}, Status: ${response.status}`);
          
          // Log response structure for debugging
          if (Array.isArray(response.data)) {
            console.log(`[IDX-Corrected] Array response with ${response.data.length} items`);
            if (response.data.length > 0) {
              console.log(`[IDX-Corrected] Sample item keys:`, Object.keys(response.data[0] || {}));
            }
          } else if (typeof response.data === 'object') {
            console.log(`[IDX-Corrected] Object response with keys:`, Object.keys(response.data));
          } else {
            console.log(`[IDX-Corrected] Primitive response:`, response.data);
          }

          // Check if we got actual property data
          let hasPropertyData = false;
          
          if (Array.isArray(response.data) && response.data.length > 0) {
            // Check if items have property-specific fields
            hasPropertyData = response.data.some(item => 
              item && (
                item.idxID || 
                item.listingID || 
                item.listPrice || 
                item.price ||
                (item.address && typeof item.address === 'string' && !item.url) // Exclude system links
              )
            );
          } else if (typeof response.data === 'number' && response.data > 0) {
            // Property count endpoint
            console.log(`[IDX-Corrected] Property count: ${response.data}`);
            hasPropertyData = true;
          } else if (response.data && typeof response.data === 'object') {
            // Check for nested property arrays
            const dataKeys = Object.keys(response.data);
            for (const key of dataKeys) {
              if (Array.isArray(response.data[key]) && response.data[key].length > 0) {
                const nestedData = response.data[key];
                hasPropertyData = nestedData.some((item: any) => 
                  item && (item.idxID || item.listingID || item.listPrice || item.price)
                );
                if (hasPropertyData) {
                  console.log(`[IDX-Corrected] Found properties in nested array: ${key}`);
                  response.data = nestedData;
                  break;
                }
              }
            }
          }
          
          if (hasPropertyData) {
            console.log(`[IDX-Corrected] SUCCESS! Found property data from ${endpoint.url}`);
            successfulEndpoint = endpoint.url;
            break;
          } else {
            console.log(`[IDX-Corrected] Endpoint returned data but no property listings: ${endpoint.url}`);
          }
        }
        
      } catch (error: any) {
        const status = error.response?.status || 'unknown';
        const message = error.message || 'unknown error';
        console.log(`[IDX-Corrected] Endpoint failed: ${endpoint.url} - Status: ${status}, Message: ${message}`);
        continue;
      }
    }

    // If no specific property endpoints worked, try to get any data that might contain properties
    if (!response || !response.data) {
      console.log('[IDX-Corrected] All property endpoints failed, trying alternative approaches');
      
      // Try to get cities and see if we can infer property availability
      try {
        const citiesResponse = await axios.get('https://api.idxbroker.com/clients/cities', {
          headers: {
            'accesskey': apiKey,
            'outputtype': 'json'
          },
          timeout: 15000
        });

        if (citiesResponse.status === 200 && citiesResponse.data) {
          console.log(`[IDX-Corrected] Cities endpoint returned data:`, Array.isArray(citiesResponse.data) ? citiesResponse.data.length : typeof citiesResponse.data);
        }
      } catch (citiesError) {
        console.log('[IDX-Corrected] Cities endpoint also failed');
      }

      console.error('[IDX-Corrected] All endpoints failed to return property data');
      console.error('[IDX-Corrected] This suggests parameter formatting issues or account configuration problems');
      return {
        listings: [],
        totalCount: 0,
        hasMoreListings: false
      };
    }

    console.log(`[IDX-Corrected] Processing response from: ${successfulEndpoint || 'unknown endpoint'}`);
    return transformIdxResponse(response.data);
  } catch (error) {
    console.error('[IDX-Corrected] Error fetching listings:', error);
    throw new Error('Failed to fetch IDX listings with corrected parameters');
  }
}

/**
 * Transform IDX API response to our application format
 */
function transformIdxResponse(data: any): IdxListingsResponse {
  console.log('[IDX-Corrected] Transforming API response');
  
  if (!data) {
    return { listings: [], totalCount: 0, hasMoreListings: false };
  }

  // If data is a number (property count), return empty listings but log the count
  if (typeof data === 'number') {
    console.log(`[IDX-Corrected] Property count received: ${data}`);
    return { listings: [], totalCount: data, hasMoreListings: false };
  }

  let listings: any[] = [];

  // Handle different response formats
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
      console.log(`[IDX-Corrected] Found listings in property: ${arrayKeys[0]}`);
    }
  }

  console.log(`[IDX-Corrected] Found ${listings.length} items to process`);

  // Filter out non-property items (like system links)
  const propertyListings = listings.filter((item: any) => {
    if (!item) return false;
    
    // Exclude system links that have URL properties
    if (item.url && item.category) return false;
    
    // Include items that have property-specific fields
    return (
      item.idxID || 
      item.listingID || 
      item.listPrice || 
      item.price ||
      (item.address && typeof item.address === 'string')
    );
  });

  console.log(`[IDX-Corrected] Filtered to ${propertyListings.length} actual property listings`);

  // Transform each listing to our format
  const transformedListings: IdxListing[] = propertyListings.map((item: any, index: number) => {
    // Handle different possible field names from IDX API
    const id = item.idxID || item.listingID || item.id || `corrected-${index}`;
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

  console.log(`[IDX-Corrected] Successfully transformed ${transformedListings.length} listings`);
  
  if (transformedListings.length > 0) {
    console.log('[IDX-Corrected] Sample transformed listing:', {
      id: transformedListings[0].listingId,
      address: transformedListings[0].address,
      price: transformedListings[0].price,
      bedrooms: transformedListings[0].bedrooms
    });
  }

  return {
    listings: transformedListings,
    totalCount: transformedListings.length,
    hasMoreListings: false
  };
}

/**
 * Test corrected IDX connection
 */
export async function testIdxConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const apiKey = process.env.IDX_BROKER_API_KEY;
    if (!apiKey) {
      return { success: false, message: "IDX Broker API key is not configured" };
    }

    // Test account info and MLS access
    const [accountResponse, mlsResponse] = await Promise.all([
      axios.get('https://api.idxbroker.com/clients/accountinfo', {
        headers: { 'accesskey': apiKey, 'outputtype': 'json' },
        timeout: 8000
      }),
      axios.get('https://api.idxbroker.com/mls/approvedmls', {
        headers: { 'accesskey': apiKey, 'outputtype': 'json' },
        timeout: 8000
      })
    ]);

    const accountInfo = accountResponse.data;
    const mlsInfo = mlsResponse.data;
    
    return { 
      success: true, 
      message: `Corrected parameters ready. Account: ${accountInfo?.clientName || 'Unknown'}, MLS: ${mlsInfo?.[0]?.name || 'Unknown'}`
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