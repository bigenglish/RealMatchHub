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
      return getMockListings(limit, offset);
    }

    try {
      console.log('Attempting to fetch real IDX listings with provided API key');
      
      // Make the actual API call to IDX Broker
      const response = await axios.get('https://api.idxbroker.com/clients/listings', {
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
      
      console.log('Successfully received response from IDX Broker API');
      return transformIdxResponse(response.data);
    } catch (apiError) {
      console.error('Error calling IDX Broker API:', apiError);
      console.log('Falling back to mock data due to API error');
      
      // If the API call fails, fallback to mock data
      return getMockListings(limit, offset);
    }
  } catch (error) {
    console.error('Error fetching IDX listings:', error);
    throw new Error('Failed to fetch IDX listings');
  }
}

/**
 * Get mock listings for demonstration purposes
 * In a real application, this would be replaced with actual API calls
 */
function getMockListings(limit: number, offset: number): IdxListingsResponse {
  // These would be fetched from the IDX API in a real implementation
  const allListings: IdxListing[] = [
    {
      listingId: 'IDX100',
      address: '789 Lakefront Drive',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      price: 1450000,
      bedrooms: 4,
      bathrooms: 3.5,
      sqft: 3600,
      propertyType: 'Single Family Home',
      images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'],
      description: 'Stunning waterfront property with amazing views, chef\'s kitchen, and luxurious finishes throughout.',
      listedDate: '2024-03-01',
    },
    {
      listingId: 'IDX101',
      address: '456 Highland Ave',
      city: 'Boston',
      state: 'MA',
      zipCode: '02215',
      price: 875000,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1800,
      propertyType: 'Condo',
      images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80'],
      description: 'Modern condo in desirable neighborhood, recently renovated with high-end appliances and finishes.',
      listedDate: '2024-02-25',
    },
    {
      listingId: 'IDX102',
      address: '123 Mountain View Rd',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      price: 950000,
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2800,
      propertyType: 'Single Family Home',
      images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
      description: 'Beautiful mountain home with breathtaking views, open floor plan, and large outdoor living space.',
      listedDate: '2024-03-10',
    },
  ];
  
  // Apply pagination
  const paginatedListings = allListings.slice(offset, offset + limit);
  
  return {
    listings: paginatedListings,
    totalCount: allListings.length,
    hasMoreListings: offset + limit < allListings.length
  };
}

/**
 * Transform IDX API response to our application format
 * This would be used with the actual API integration
 */
function transformIdxResponse(apiResponse: any): IdxListingsResponse {
  // This would transform the actual IDX API response format to our application format
  // For now, it's just a placeholder since we're using mock data
  
  return {
    listings: apiResponse.data.map((item: any) => ({
      listingId: item.idxID,
      address: item.address,
      city: item.cityName,
      state: item.state,
      zipCode: item.zipcode,
      price: parseFloat(item.listPrice),
      bedrooms: parseInt(item.bedrooms),
      bathrooms: parseFloat(item.totalBaths),
      sqft: parseInt(item.sqFt),
      propertyType: item.propType,
      images: item.images.map((img: any) => img.url),
      description: item.remarksConcat,
      listedDate: item.listDate,
    })),
    totalCount: apiResponse.totalCount,
    hasMoreListings: apiResponse.hasNextPage
  };
}