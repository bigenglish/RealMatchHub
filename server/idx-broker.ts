import axios from 'axios';

/**
 * Tests the IDX Broker API connection
 * @returns Test results with connection status
 */
export async function testIdxConnection(): Promise<{ success: boolean; message: string }> {
  try {
    // Check if API key is available
    const apiKey = process.env.IDX_BROKER_API_KEY;

    if (!apiKey) {
      return { 
        success: false, 
        message: "IDX Broker API key is not configured" 
      };
    }

    // Make a simple request to test the connection
    try {
      // Test with the most standard IDX Broker API format
      const response = await axios.get('https://api.idxbroker.com/clients/accountinfo', {
        headers: {
          'accesskey': apiKey,
          'outputtype': 'json'
        },
        timeout: 8000 // 8 second timeout
      });

      console.log('IDX API test response status:', response.status);
      console.log('IDX API test response data keys:', Object.keys(response.data || {}));

      return { 
        success: true, 
        message: "Successfully connected to IDX Broker API",
        statusCode: response.status,
        hasData: !!response.data
      };
    } catch (apiError) {
      // Check the specific error and provide a better message
      if (axios.isAxiosError(apiError) && apiError.response) {
        const status = apiError.response.status;
        if (status === 401) {
          return {
            success: false,
            message: "Invalid IDX Broker API key. Please check your credentials."
          };
        } else if (status === 403) {
          return {
            success: false,
            message: "Access forbidden. Your IDX Broker API key may have insufficient permissions."
          };
        } else {
          return {
            success: false,
            message: `IDX Broker API error (${status}): ${apiError.message}`
          };
        }
      } else {
        return {
          success: false,
          message: "Could not connect to IDX Broker API. Please check your internet connection."
        };
      }
    }
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

// Define the IDX Broker API response types
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
 * Fetches property listings from IDX Broker API
 * 
 * @param options Options for the IDX API request
 * @returns Property listings from IDX Broker
 */
export async function fetchIdxListings({ 
  limit = 10, 
  offset = 0, 
  city = '', 
  minPrice = 0, 
  maxPrice = 0,
  bedrooms,
  bathrooms,
  propertyType = '',
  sqft_min = 0,
  sqft_max = 0,
  keywords = [],
  amenities = [],
  architecturalStyle = '',
  interiorStyle = '',
  features = [],
  yearBuiltMin,
  yearBuiltMax,
  lotSizeMin,
  lotSizeMax,
  waterfront,
  pool,
  garage,
  basement
}: { 
  limit?: number; 
  offset?: number; 
  city?: string; 
  minPrice?: number; 
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  sqft_min?: number;
  sqft_max?: number;
  keywords?: string[];
  amenities?: string[];
  architecturalStyle?: string;
  interiorStyle?: string;
}): Promise<IdxListingsResponse> {
  // Define additional search parameters mapping
  const styleToIdxMapping = {
    modern: 'contemporary',
    traditional: 'traditional',
    craftsman: 'craftsman',
    mediterranean: 'mediterranean',
    colonial: 'colonial',
    farmhouse: 'farmhouse',
    ranch: 'ranch',
    victorian: 'victorian'
  };

  const amenityToIdxMapping = {
    // Property Features
    basement: 'basement',
    attic: 'attic',
    'wine-cellar': 'wine_cellar',
    'home-theater': 'media_room',
    'outdoor-kitchen': 'outdoor_kitchen',
    'security-system': 'security_system',
    'solar-panels': 'solar_panels',
    generator: 'generator',
    'laundry-room': 'laundry_room',
    'walk-in-closets': 'walk_in_closets',

    // Outdoor Amenities
    patio: 'patio',
    deck: 'deck',
    balcony: 'balcony',
    garden: 'garden',
    'sprinkler-system': 'sprinkler_system',
    'outdoor-lighting': 'outdoor_lighting',
    'fire-pit': 'fire_pit',
    'bbq-area': 'bbq_area',
    'tennis-court': 'tennis_court',
    'basketball-court': 'basketball_court',

    // Community Features
    'gated-community': 'gated_community',
    'club-house': 'club_house',
    'community-pool': 'community_pool',
    'tennis-courts': 'tennis_courts',
    'golf-course': 'golf_course',
    'walking-trails': 'walking_trails',
    'park-access': 'park_access',
    'security-patrol': 'security_patrol',
    'guest-parking': 'guest_parking',
    'package-service': 'package_service',

    // Existing amenities
    pool: 'pool',
    garage: 'garage',
    yard: 'yard',
    'updated-kitchen': 'updated_kitchen',
    'fitness-center': 'fitness',
    'smart-home': 'smart_home',
    'natural-light': 'natural_light',
    'storage-space': 'storage',
    'central-air': 'central_air',
    'open-floor-plan': 'open_floor_plan',
    'pet-friendly': 'pets_allowed',
    'fenced-yard': 'fenced_yard'
  };

  // Map interior styles to IDX features
  const interiorToIdxMapping = {
    minimalist: 'modern',
    contemporary: 'contemporary',
    traditional: 'traditional',
    rustic: 'rustic',
    industrial: 'industrial',
    coastal: 'coastal',
    bohemian: 'eclectic',
    scandinavian: 'modern'  
  };

  try {
    // Check if API key is available
    const apiKey = process.env.IDX_BROKER_API_KEY;

    if (!apiKey) {
      console.warn('IDX_BROKER_API_KEY not found in environment variables');
      throw new Error('IDX Broker API key is required to fetch listings');
    }

    // Log API key info for debugging (without exposing the full key)
    console.log(`IDX API Key Info: Length=${apiKey.length}, Prefix=${apiKey.substring(0, 4)}...`);

    try {
      console.log('Fetching listings from IDX Broker API - trying property-specific endpoints');

      // Enhanced property-specific endpoints with better parameter handling
      const possibleEndpoints = [
        {
          url: 'https://api.idxbroker.com/clients/listings',
          params: {
            rf: 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType,image,remarksConcat,listDate,status',
            limit: Math.min(limit, 1000),
            offset,
            pt: '1,2,3,4,5,6,7,8,9,10', // All property types
            a_propStatus: 'Active'
          }
        },
        {
          url: 'https://api.idxbroker.com/clients/search',
          params: {
            rf: 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType,image,remarksConcat,listDate',
            limit: Math.min(limit, 1000),
            offset,
            orderby: 'listDate',
            orderdir: 'DESC'
          }
        },
        {
          url: 'https://api.idxbroker.com/mls/search',
          params: {
            limit: Math.min(limit, 1000),
            offset
          }
        },
        {
          url: 'https://api.idxbroker.com/clients/featured',
          params: {
            limit: Math.min(limit, 50)
          }
        },
        {
          url: 'https://api.idxbroker.com/clients/systemlinks',
          params: {}
        }
      ];

      // Different header combinations to try
      const possibleHeaders = [
        // IDX Broker standard format (most likely to work)
        {
          'Content-Type': 'application/x-www-form-urlencoded',
          'accesskey': apiKey,
          'outputtype': 'json'
        },
        // Alternative standard format
        {
          'accesskey': apiKey,
          'outputtype': 'json'
        },
        // With Accept header
        {
          'Content-Type': 'application/x-www-form-urlencoded',
          'accesskey': apiKey,
          'Accept': 'application/json'
        },
        // Minimal headers
        {
          'accesskey': apiKey
        }
      ];

      // Log that we're trying multiple combinations
      console.log(`Trying ${possibleEndpoints.length} different IDX API endpoints with ${possibleHeaders.length} header variations`);

      let response;
      let foundData = false;

      // Try each endpoint with each header combination until we find data
      for (const endpoint of possibleEndpoints) {
        // If we already found data, don't try more endpoints
        if (foundData) break;

        for (const headers of possibleHeaders) {
          try {
            console.log(`Trying IDX endpoint: ${endpoint.url}`);
            console.log(`Headers:`, Object.keys(headers));
            console.log(`API Key prefix: ${apiKey.substring(0, 4)}...`);

            // Add search filters to the endpoint parameters
            const enhancedParams = {
              ...endpoint.params,
              outputtype: 'json',
              // Enhanced location parameters
              ...(city && { city }),
              // Enhanced price parameters
              ...(minPrice > 0 && { minListPrice: minPrice }),
              ...(maxPrice > 0 && { maxListPrice: maxPrice }),
              // Enhanced property parameters
              ...(bedrooms !== undefined && { bedrooms }),
              ...(bathrooms !== undefined && { totalBaths: bathrooms }),
              ...(propertyType && { propType: propertyType }),
              ...(sqft_min > 0 && { minSqFt: sqft_min }),
              ...(sqft_max > 0 && { maxSqFt: sqft_max })
            };

            // Make the API call to IDX Broker with enhanced parameters
            response = await axios.get(endpoint.url, {
              headers,
              params: enhancedParams,
              timeout: 15000 // 15 second timeout for larger datasets
            });

            // If we got a successful response with data, flag success and break
            if (response.status === 200 && response.data) {
              // Check different ways data might be structured
              const hasData = 
                (Array.isArray(response.data) && response.data.length > 0) ||
                (response.data && typeof response.data === 'object' && Object.keys(response.data).length > 0) ||
                (response.data && typeof response.data === 'string' && response.data.length > 20); // Arbitrary 20 char min for string data

              if (hasData) {
                console.log(`Success! Endpoint ${endpoint} returned data with headers:`, Object.keys(headers));
                foundData = true;
                break;
              } else {
                console.log(`Endpoint ${endpoint} returned status ${response.status} but no usable data`);
              }
            } else {
              console.log(`Endpoint ${endpoint} returned status ${response.status} without data`);
            }
          } catch (err: any) {
            if (err.response) {
              console.log(`Failed request to ${endpoint}: HTTP ${err.response.status} - ${err.response.statusText}`);
              console.log(`Response data:`, err.response.data);

              // Log specific error meanings
              switch (err.response.status) {
                case 400:
                  console.log('400 Error: Bad Request - Invalid parameters or malformed request');
                  break;
                case 401:
                  console.log('401 Error: Unauthorized - Invalid API key');
                  break;
                case 403:
                  console.log('403 Error: Forbidden - API key lacks permissions');
                  break;
                case 406:
                  console.log('406 Error: Not Acceptable - Server cannot produce response in requested format');
                  break;
                case 416:
                  console.log('416 Error: Range Not Satisfiable - Invalid range request');
                  break;
                default:
                  console.log(`${err.response.status} Error: ${err.response.statusText}`);
              }
            } else if (err.request) {
              console.log(`Network error for ${endpoint}:`, err.message);
            } else {
              console.log(`Request setup error for ${endpoint}:`, err.message);
            }
          }
        }
      }

      // If we didn't get a successful response, create an empty one
      if (!response) {
        console.log('All IDX endpoints failed, creating empty response');
        response = { status: 404, data: [] };
      }

      console.log('Successfully received response from IDX Broker API:', response.status);
      console.log('Response data type:', typeof response.data);

      if (Array.isArray(response.data)) {
        console.log('Number of listings received:', response.data.length);
      } else {
        console.log('Response data is not an array. Structure:', Object.keys(response.data || {}));
      }

      // Transform the real API response
      return transformIdxResponse(response.data);
    } catch (apiError) {
      console.error('Error calling IDX Broker API:', apiError);
      throw apiError; // Re-throw the error to handle it upstream
    }
  } catch (error) {
    console.error('Error fetching IDX listings:', error);
    throw new Error('Failed to fetch IDX listings');
  }
}

// We've removed mock listings and now only use real data from IDX Broker API

/**
 * Fetch IDX cities
 */
export async function fetchIdxCities(): Promise<any[]> {
  try {
    const apiKey = process.env.IDX_BROKER_API_KEY;
    if (!apiKey) {
      throw new Error('IDX Broker API key is required');
    }

    // Try multiple endpoints for cities
    const endpoints = [
      'https://api.idxbroker.com/mls/cities',
      'https://api.idxbroker.com/clients/cities',
      'https://api.idxbroker.com/clients/systemlinks'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, {
          headers: {
            'accesskey': apiKey,
            'outputtype': 'json'
          },
          timeout: 8000
        });

        if (response.status === 200 && response.data) {
          // Handle different response formats
          if (Array.isArray(response.data)) {
            return response.data.map((city, index) => ({
              id: city.id || city.cityID || String(index),
              name: city.name || city.cityName || city,
              type: 'city',
              state: city.state || 'CA'
            }));
          } else if (response.data.cities && Array.isArray(response.data.cities)) {
            return response.data.cities.map((city, index) => ({
              id: city.id || String(index),
              name: city.name || city,
              type: 'city',
              state: city.state || 'CA'
            }));
          }
        }
      } catch (endpointError) {
        console.log(`Cities endpoint ${endpoint} failed, trying next...`);
        continue;
      }
    }

    // Return some default cities if API fails
    return [
      { id: 'los-angeles', name: 'Los Angeles', type: 'city', state: 'CA' },
      { id: 'san-francisco', name: 'San Francisco', type: 'city', state: 'CA' },
      { id: 'san-diego', name: 'San Diego', type: 'city', state: 'CA' },
      { id: 'sacramento', name: 'Sacramento', type: 'city', state: 'CA' },
      { id: 'oakland', name: 'Oakland', type: 'city', state: 'CA' }
    ];
  } catch (error) {
    console.error('Error fetching IDX cities:', error);
    return [];
  }
}

/**
 * Fetch IDX counties
 */
export async function fetchIdxCounties(): Promise<any[]> {
  try {
    const apiKey = process.env.IDX_BROKER_API_KEY;
    if (!apiKey) {
      throw new Error('IDX Broker API key is required');
    }

    // Try multiple endpoints for counties
    const endpoints = [
      'https://api.idxbroker.com/mls/counties',
      'https://api.idxbroker.com/clients/counties'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, {
          headers: {
            'accesskey': apiKey,
            'outputtype': 'json'
          },
          timeout: 8000
        });

        if (response.status === 200 && response.data) {
          if (Array.isArray(response.data)) {
            return response.data.map((county, index) => ({
              id: county.id || county.countyID || String(index),
              name: county.name || county.countyName || county,
              type: 'county',
              state: county.state || 'CA'
            }));
          }
        }
      } catch (endpointError) {
        console.log(`Counties endpoint ${endpoint} failed, trying next...`);
        continue;
      }
    }

    // Return some default counties if API fails
    return [
      { id: 'los-angeles', name: 'Los Angeles County', type: 'county', state: 'CA' },
      { id: 'orange', name: 'Orange County', type: 'county', state: 'CA' },
      { id: 'san-francisco', name: 'San Francisco County', type: 'county', state: 'CA' },
      { id: 'santa-clara', name: 'Santa Clara County', type: 'county', state: 'CA' },
      { id: 'san-diego', name: 'San Diego County', type: 'county', state: 'CA' }
    ];
  } catch (error) {
    console.error('Error fetching IDX counties:', error);
    return [];
  }
}

/**
 * Fetch IDX postal codes
 */
export async function fetchIdxPostalCodes(): Promise<any[]> {
  try {
    const apiKey = process.env.IDX_BROKER_API_KEY;
    if (!apiKey) {
      throw new Error('IDX Broker API key is required');
    }

    const response = await axios.get('https://api.idxbroker.com/mls/postalcodes', {
      headers: {
        'accesskey': apiKey,
        'outputtype': 'json'
      },
      timeout: 8000
    });

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching IDX postal codes:', error);
    return [];
  }
}

/**
 * Fetch IDX search fields
 */
export async function fetchIdxSearchFields(): Promise<any[]> {
  try {
    const apiKey = process.env.IDX_BROKER_API_KEY;
    if (!apiKey) {
      throw new Error('IDX Broker API key is required');
    }

    const response = await axios.get('https://api.idxbroker.com/mls/searchfields', {
      headers: {
        'accesskey': apiKey,
        'outputtype': 'json'
      },
      timeout: 8000
    });

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching IDX search fields:', error);
    return [];
  }
}

/**
 * Fetch IDX featured listings
 */
export async function fetchIdxFeaturedListings(limit: number = 10): Promise<any[]> {
  try {
    const apiKey = process.env.IDX_BROKER_API_KEY;
    if (!apiKey) {
      throw new Error('IDX Broker API key is required');
    }

    const response = await axios.get('https://api.idxbroker.com/clients/featured', {
      headers: {
        'accesskey': apiKey,
        'outputtype': 'json'
      },
      params: {
        limit
      },
      timeout: 8000
    });

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching IDX featured listings:', error);
    return [];
  }
}

/**
 * Fetch IDX sold/pending listings
 */
export async function fetchIdxSoldPendingListings(status: 'sold' | 'pending', limit: number = 10): Promise<any[]> {
  try {
    const apiKey = process.env.IDX_BROKER_API_KEY;
    if (!apiKey) {
      throw new Error('IDX Broker API key is required');
    }

    const response = await axios.get('https://api.idxbroker.com/clients/soldpending', {
      headers: {
        'accesskey': apiKey,
        'outputtype': 'json'
      },
      params: {
        status,
        limit
      },
      timeout: 8000
    });

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching IDX sold/pending listings:', error);
    return [];
  }
}

/**
 * Search IDX properties with advanced parameters
 */
export async function searchIdxProperties(params: {
  limit?: number;
  offset?: number;
  cityId?: string;
  countyId?: string;
  postalCodeId?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  filterField?: string;
  filterValue?: string;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}): Promise<any> {
  try {
    const apiKey = process.env.IDX_BROKER_API_KEY;
    if (!apiKey) {
      throw new Error('IDX Broker API key is required');
    }

    // Try multiple search endpoints
    const searchEndpoints = [
      'https://api.idxbroker.com/clients/search',
      'https://api.idxbroker.com/mls/search',
      'https://api.idxbroker.com/clients/listings'
    ];

    for (const endpoint of searchEndpoints) {
      try {
        const response = await axios.get(endpoint, {
          headers: {
            'accesskey': apiKey,
            'outputtype': 'json'
          },
          params: {
            limit: params.limit || 10,
            offset: params.offset || 0,
            ...(params.cityId && { cityId: params.cityId }),
            ...(params.countyId && { countyId: params.countyId }),
            ...(params.postalCodeId && { postalCodeId: params.postalCodeId }),
            ...(params.minPrice && { minListPrice: params.minPrice }),
            ...(params.maxPrice && { maxListPrice: params.maxPrice }),
            ...(params.bedrooms && { bedrooms: params.bedrooms }),
            ...(params.bathrooms && { bathrooms: params.bathrooms }),
            ...(params.propertyType && { propertyType: params.propertyType }),
            orderBy: params.orderBy || 'listDate',
            orderDir: params.orderDir || 'DESC'
          },
          timeout: 8000
        });

        if (response.status === 200 && response.data) {
          return {
            listings: Array.isArray(response.data) ? response.data : [],
            totalCount: Array.isArray(response.data) ? response.data.length : 0,
            hasMoreListings: false
          };
        }
      } catch (endpointError) {
        console.log(`Search endpoint ${endpoint} failed, trying next...`);
        continue;
      }
    }

    // If all endpoints fail, return empty result
    return {
      listings: [],
      totalCount: 0,
      hasMoreListings: false
    };
  } catch (error) {
    console.error('Error searching IDX properties:', error);
    return {
      listings: [],
      totalCount: 0,
      hasMoreListings: false
    };
  }
}

/**
 * Transform IDX API response to our application format
 */
function transformIdxResponse(apiResponse: any): IdxListingsResponse {
  console.log('Transforming IDX API response');

  // Handle different response formats from IDX Broker API
  let data: any[] = [];
  let totalCount = 0;
  let hasNext = false;

  // If response is empty or null, return empty response
  if (!apiResponse) {
    console.log('API response is empty');
    return { listings: [], totalCount: 0, hasMoreListings: false };
  }

  // Log the structure for debugging
  const responsePreview = typeof apiResponse === 'string' 
    ? apiResponse.substring(0, 200)
    : JSON.stringify(apiResponse).substring(0, 200);
  console.log('API Response structure:', responsePreview + '...');

  try {
    // Handle array response
    if (Array.isArray(apiResponse)) {
      console.log('Response is an array with', apiResponse.length, 'items');
      data = apiResponse;
      totalCount = apiResponse.length;
      hasNext = false;
    } 
    // Handle paginated response with data property
    else if (apiResponse && apiResponse.data && Array.isArray(apiResponse.data)) {
      console.log('Response has data array with', apiResponse.data.length, 'items');
      data = apiResponse.data;
      totalCount = apiResponse.totalCount || data.length;
      hasNext = apiResponse.hasNextPage || false;
    } 
    // Handle direct object response
    else if (apiResponse && typeof apiResponse === 'object') {
      console.log('Response is an object, properties:', Object.keys(apiResponse));

      // Special case for listing IDs endpoint
      if (apiResponse.ids && Array.isArray(apiResponse.ids)) {
        console.log('Found IDs array with', apiResponse.ids.length, 'items');
        // Convert IDs to minimal listing objects
        data = apiResponse.ids.map((id: string | number, index: number) => ({
          idxID: id,
          listingId: `idx-${id}`,
          address: `Property ${index + 1}`,
          city: 'Unknown',
          state: '',
          description: 'Property details not available. Please contact agent.',
          price: 0
        }));
        totalCount = data.length;
        hasNext = false;
      }
      // Convert regular object to array if necessary
      else if (Object.keys(apiResponse).length > 0) {
        data = Object.values(apiResponse);
        totalCount = data.length;
        hasNext = false;
      }
    }
    // Handle string response that might be JSON
    else if (typeof apiResponse === 'string' && apiResponse.trim().startsWith('{')) {
      try {
        const parsedResponse = JSON.parse(apiResponse);
        console.log('Parsed string response into object with keys:', Object.keys(parsedResponse));
        return transformIdxResponse(parsedResponse); // Recursively process the parsed object
      } catch (e) {
        console.error('Failed to parse string response as JSON:', e);
      }
    }
  } catch (error) {
    console.error('Error processing IDX API response:', error);
  }

  // If no real data was found, return empty results
  if (data.length === 0) {
    console.log('No properties found in IDX response. Check your IDX Broker account configuration.');
    console.log('API Response details:', {
      responseType: typeof apiResponse,
      keys: apiResponse ? Object.keys(apiResponse) : 'null',
      dataLength: apiResponse ? JSON.stringify(apiResponse).length : 0
    });
    
    return {
      listings: [],
      totalCount: 0,
      hasMoreListings: false
    };
  }

  console.log('Processing', data.length, 'listings');

  // Map the IDX data to our format
  const listings = data.map((item: any, index: number) => {
    // Log the first item to see its structure
    if (index === 0) {
      console.log('Sample listing:', JSON.stringify(item).substring(0, 200) + '...');
      console.log('Available fields:', Object.keys(item));
    }

    // Create a consistent property object from various possible IDX structures
    return {
      listingId: item.idxID || item.listingId || `idx-${index}`,
      address: item.address || item.streetAddress || item.fullAddress || 'Address not available',
      city: item.cityName || item.city || '',
      state: item.state || '',
      zipCode: item.zipcode || item.postalCode || '',
      price: parseFloat(item.listPrice || item.price || '0'),
      bedrooms: parseInt(item.bedrooms || item.totalBedrooms || '0'),
      bathrooms: parseFloat(item.totalBaths || item.bathrooms || '0'),
      sqft: parseInt(item.sqFt || item.squareFootage || '0'),
      propertyType: item.propType || item.propertyType || 'Residential',
      images: Array.isArray(item.images) 
        ? item.images.map((img: any) => typeof img === 'string' ? img : img.url || '')
        : item.image ? [item.image] : [],
      description: item.remarksConcat || item.description || item.remarks || 'No description available',
      listedDate: item.listDate || item.listedDate || new Date().toISOString().split('T')[0]
    };
  });

  return {
    listings,
    totalCount,
    hasMoreListings: hasNext
  };
}

async function searchProperties(params) {
  const IDX_BASE_URL = 'https://losangelesforsale.idxbroker.com/idx/results/listings';

  // Base parameters
  const searchParams = new URLSearchParams({
    propertyType: params.propertyType || '',
    minPrice: params.minPrice || '',
    maxPrice: params.maxPrice || '',
    location: params.location || '',
    beds: params.bedrooms || '',
    baths: params.bathrooms || '',
    sqft: params.squareFootage || ''
  });

  // Add architectural style
  if (params.architecturalStyle && styleToIdxMapping[params.architecturalStyle]) {
    searchParams.append('style', styleToIdxMapping[params.architecturalStyle]);
  }

  // Add interior style features
  if (params.interiorStyle && interiorToIdxMapping[params.interiorStyle]) {
    searchParams.append('features', interiorToIdxMapping[params.interiorStyle]);
  }

  // Add amenities
  if (params.amenities && Array.isArray(params.amenities)) {
    params.amenities.forEach(amenity => {
      if (amenityToIdxMapping[amenity]) {
        searchParams.append('features', amenityToIdxMapping[amenity]);
      }
    });
  }
}