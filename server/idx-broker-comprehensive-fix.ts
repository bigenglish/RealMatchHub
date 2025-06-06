
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
  status?: string;
  mlsNumber?: string;
  yearBuilt?: number;
  lotSize?: number;
  daysOnMarket?: number;
  listingAgent?: string;
  listingOffice?: string;
}

export interface IdxSearchCriteria {
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
  [key: string]: any;
}

export interface IdxResponse {
  listings: IdxListing[];
  totalCount: number;
  hasMoreListings: boolean;
}

export class IdxBrokerAPI {
  private apiKey: string;
  private baseUrl = 'https://api.idxbroker.com';
  
  constructor() {
    this.apiKey = process.env.IDX_BROKER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('IDX_BROKER_API_KEY environment variable is required');
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      'accesskey': this.apiKey,
      'outputtype': 'json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'RealtyAI/1.0'
    };
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const headers = this.getHeaders();
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add parameters to URL
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    console.log(`[IDX-API] Making request to: ${url.toString()}`);
    console.log(`[IDX-API] Headers:`, Object.keys(headers));

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
        timeout: 15000
      });

      console.log(`[IDX-API] Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[IDX-API] Error response:`, errorText);
        
        switch (response.status) {
          case 401:
            throw new Error('Invalid API key or unauthorized access');
          case 403:
            throw new Error('API key lacks necessary permissions');
          case 404:
            throw new Error('Endpoint not found - check account configuration');
          case 406:
            throw new Error('Request format not acceptable - check parameters');
          case 429:
            throw new Error('Rate limit exceeded');
          default:
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
      }

      const responseText = await response.text();
      
      if (!responseText.trim()) {
        throw new Error('Empty response from API');
      }

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error(`[IDX-API] JSON parse error:`, parseError);
        console.error(`[IDX-API] Raw response:`, responseText.substring(0, 500));
        throw new Error('Invalid JSON response from API');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[IDX-API] Request failed:`, error.message);
        throw error;
      }
      throw new Error('Unknown error occurred during API request');
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; accountInfo?: any }> {
    try {
      console.log('[IDX-API] Testing connection...');
      const accountInfo = await this.makeRequest('/clients/accountinfo');
      
      return {
        success: true,
        message: `Connected successfully. Account: ${accountInfo?.clientName || 'Unknown'}`,
        accountInfo
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  async getListings(criteria: IdxSearchCriteria = {}): Promise<IdxResponse> {
    const {
      limit = 50,
      offset = 0,
      city,
      state,
      zipCode,
      minPrice,
      maxPrice,
      bedrooms,
      minBedrooms,
      bathrooms,
      minBathrooms,
      propertyType
    } = criteria;

    // Try multiple endpoints in order of preference
    const endpoints = [
      {
        path: '/clients/featured',
        params: {
          limit: Math.min(limit, 100),
          rf: 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType,image,remarksConcat,listDate'
        }
      },
      {
        path: '/clients/listings',
        params: {
          limit: Math.min(limit, 100),
          offset,
          rf: 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType,image,remarksConcat,listDate'
        }
      },
      {
        path: '/clients/systemlinks',
        params: {}
      }
    ];

    // Add search criteria to params
    const searchParams: Record<string, any> = {};
    if (city) searchParams['city[]'] = city;
    if (state) searchParams.state = state;
    if (zipCode) searchParams['zipcode[]'] = zipCode;
    if (minPrice) searchParams.lp = minPrice;
    if (maxPrice) searchParams.hp = maxPrice;
    if (bedrooms || minBedrooms) searchParams.bd = bedrooms || minBedrooms;
    if (bathrooms || minBathrooms) searchParams.tb = bathrooms || minBathrooms;
    if (propertyType && propertyType !== 'sfr') searchParams.pt = propertyType;

    for (const endpoint of endpoints) {
      try {
        console.log(`[IDX-API] Trying endpoint: ${endpoint.path}`);
        
        const params = { ...endpoint.params, ...searchParams };
        const data = await this.makeRequest(endpoint.path, params);
        
        let listings: any[] = [];
        
        if (Array.isArray(data)) {
          listings = data;
        } else if (data && typeof data === 'object') {
          if (data.listings) listings = data.listings;
          else if (data.featured) listings = data.featured;
          else if (data.results) listings = data.results;
          else {
            // Try to find any array property
            const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]));
            if (arrayKeys.length > 0) {
              listings = data[arrayKeys[0]];
            }
          }
        }

        if (listings.length > 0) {
          console.log(`[IDX-API] Found ${listings.length} listings from ${endpoint.path}`);
          
          const transformedListings = this.transformListings(listings);
          
          return {
            listings: transformedListings.slice(0, limit),
            totalCount: transformedListings.length,
            hasMoreListings: transformedListings.length > limit
          };
        }
      } catch (error) {
        console.error(`[IDX-API] Endpoint ${endpoint.path} failed:`, error);
        continue;
      }
    }

    // If all endpoints failed, return empty result
    return {
      listings: [],
      totalCount: 0,
      hasMoreListings: false
    };
  }

  private transformListings(rawListings: any[]): IdxListing[] {
    return rawListings
      .filter(item => item && typeof item === 'object')
      .map((item, index) => ({
        listingId: item.idxID || item.listingID || `idx-${index}`,
        address: item.address || item.streetAddress || 'Address not available',
        city: item.cityName || item.city || 'Unknown City',
        state: item.state || item.stateAbbr || 'Unknown State',
        zipCode: item.zipcode || item.zip || '',
        price: parseFloat(item.listPrice || item.price || '0') || 0,
        bedrooms: parseInt(item.bedrooms || item.beds || '0') || 0,
        bathrooms: parseFloat(item.totalBaths || item.baths || '0') || 0,
        sqft: parseInt(item.sqFt || item.squareFeet || '0') || 0,
        propertyType: item.propType || item.propertyType || 'Residential',
        images: this.extractImages(item),
        description: item.remarksConcat || item.description || item.remarks || '',
        listedDate: item.listDate || item.dateAdded || new Date().toISOString(),
        status: item.propStatus || item.status || 'Active',
        mlsNumber: item.mlsID || item.mlsNumber || undefined,
        yearBuilt: item.yearBuilt ? parseInt(item.yearBuilt) : undefined,
        lotSize: item.lotSize ? parseFloat(item.lotSize) : undefined,
        daysOnMarket: item.daysOnMarket ? parseInt(item.daysOnMarket) : undefined,
        listingAgent: item.listingAgent || item.agentName || '',
        listingOffice: item.listingOffice || item.officeName || ''
      }));
  }

  private extractImages(item: any): string[] {
    if (item.image) {
      if (typeof item.image === 'string') {
        return [item.image];
      } else if (Array.isArray(item.image)) {
        return item.image.filter(img => typeof img === 'string');
      }
    }
    if (item.images && Array.isArray(item.images)) {
      return item.images.filter(img => typeof img === 'string');
    }
    return [];
  }
}

// Export functions for backward compatibility
export async function testIdxConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const api = new IdxBrokerAPI();
    const result = await api.testConnection();
    return { success: result.success, message: result.message };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'IDX API initialization failed'
    };
  }
}

export async function fetchIdxListings(criteria: IdxSearchCriteria = {}): Promise<IdxResponse> {
  try {
    const api = new IdxBrokerAPI();
    return await api.getListings(criteria);
  } catch (error) {
    console.error('[IDX-API] Error fetching listings:', error);
    return {
      listings: [],
      totalCount: 0,
      hasMoreListings: false
    };
  }
}
