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
      // We'll make a simple call to get account information
      // This is typically a lightweight API call that should work if the key is valid
      const response = await axios.get('https://api.idxbroker.com/clients/accountinfo', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'accesskey': apiKey
        }
      });
      
      return { 
        success: true, 
        message: "Successfully connected to IDX Broker API",
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
  bathrooms
}: { 
  limit?: number; 
  offset?: number; 
  city?: string; 
  minPrice?: number; 
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
}): Promise<IdxListingsResponse> {
  try {
    // Check if API key is available
    const apiKey = process.env.IDX_BROKER_API_KEY;
    
    if (!apiKey) {
      console.warn('IDX_BROKER_API_KEY not found in environment variables');
      throw new Error('IDX Broker API key is required to fetch listings');
    }

    try {
      console.log('Fetching listings from IDX Broker API');
      
      // Make the actual API call to IDX Broker
      const response = await axios.get('https://api.idxbroker.com/clients/featured', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'accesskey': apiKey
        },
        params: {
          limit,
          offset,
          ...(city && { city }),
          ...(minPrice > 0 && { minPrice }),
          ...(maxPrice > 0 && { maxPrice }),
          ...(bedrooms !== undefined && { bedrooms }),
          ...(bathrooms !== undefined && { bathrooms })
        }
      });
      
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
 * Transform IDX API response to our application format
 */
function transformIdxResponse(apiResponse: any): IdxListingsResponse {
  console.log('Transforming IDX API response');
  
  // Handle different response formats from IDX Broker API
  let data = [];
  let totalCount = 0;
  let hasNext = false;
  
  // Log the structure for debugging
  console.log('API Response structure:', JSON.stringify(apiResponse).substring(0, 200) + '...');
  
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
    // Convert object to array if necessary
    if (Object.keys(apiResponse).length > 0) {
      data = Object.values(apiResponse);
      totalCount = data.length;
      hasNext = false;
    }
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