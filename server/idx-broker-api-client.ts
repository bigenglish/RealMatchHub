
import axios from 'axios';
import querystring from 'querystring';

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
  private apiVersion = '1.8.0';
  private userAgent = 'RealtyAI/1.0 (Contact: support@realtyai.com)';

  constructor() {
    this.apiKey = process.env.IDX_BROKER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('IDX_BROKER_API_KEY environment variable is required and must be correctly formatted.');
    }
    
    // Validate API key format
    const isValidFormat = this.apiKey.startsWith('a') || this.apiKey.startsWith('@');
    if (!isValidFormat) {
      console.warn('[IDX-API-Client] Warning: API key format may be invalid. Expected to start with "a" or "@"');
    }
    
    console.log('[IDX-API-Client] IdxBrokerAPI initialized.');
    console.log('[IDX-API-Client] API Key format:', this.apiKey.startsWith('@') ? 'New format (@...)' : 'Traditional format (a...)');
    console.log('[IDX-API-Client] API Key length:', this.apiKey.length);
  }

  private buildQueryParams(params: { [key: string]: any }): string {
    const filteredParams: { [key: string]: any } = {};
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        filteredParams[key] = params[key];
      }
    }
    return querystring.stringify(filteredParams);
  }

  private getStandardHeaders() {
    return {
      'accesskey': this.apiKey, // IDX Broker uses lowercase
      'outputtype': 'json',
      'Version': this.apiVersion,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': this.userAgent,
    };
  }

  public async fetchListings(
    endpoint: string,
    criteria: IdxSearchCriteria = {}
  ): Promise<IdxResponse> {
    const queryParams = this.buildQueryParams(criteria);
    const url = `${this.baseUrl}/${endpoint}${queryParams ? '?' + queryParams : ''}`;

    console.log(`[IDX-API-Client] Attempting to fetch from URL: ${url}`);
    console.log('[IDX-API-Client] Request Headers:', this.getStandardHeaders());

    try {
      const response = await axios.get(url, {
        headers: this.getStandardHeaders(),
        timeout: 15000
      });

      console.log(`[IDX-API-Client] Received status: ${response.status} from ${url}`);
      const rawData = response.data;
      console.log('[IDX-API-Client] Raw IDX Broker Response Type:', typeof rawData);
      console.log('[IDX-API-Client] Raw IDX Broker Response Preview:', JSON.stringify(rawData).substring(0, 500));

      let listings: IdxListing[] = [];
      let totalCount: number = 0;
      let hasMoreListings: boolean = false;

      if (Array.isArray(rawData)) {
        listings = rawData
          .filter(item => item && typeof item === 'object')
          .map((item, index) => ({
            listingId: item.idxID || item.listingID || item.id || `idx-${index}`,
            address: item.address || item.streetAddress || 'Address not available',
            city: item.cityName || item.city || 'Unknown City',
            state: item.state || item.stateAbbr || 'Unknown State',
            zipCode: item.zipcode || item.zipCode || item.zip || '',
            price: parseFloat(item.listPrice || item.price || '0') || 0,
            bedrooms: parseInt(item.bedrooms || item.beds || '0') || 0,
            bathrooms: parseFloat(item.totalBaths || item.baths || item.bathrooms || '0') || 0,
            sqft: parseInt(item.sqFt || item.squareFeet || item.livingArea || '0') || 0,
            propertyType: item.idxPropType || item.propType || item.propertyType || 'Residential',
            images: this.extractImages(item),
            description: item.remarks || item.remarksConcat || item.description || 'No description available.',
            listedDate: item.listingDate || item.listDate || item.dateAdded || new Date().toISOString(),
            status: item.status || item.propStatus || 'Active',
            mlsNumber: item.mlsID || item.mlsNumber || undefined,
            yearBuilt: parseInt(item.yearBuilt || '0') || undefined,
            lotSize: parseFloat(item.lotSizeSqFt || item.lotSize || '0') || undefined,
            daysOnMarket: parseInt(item.daysOnMarket || '0') || undefined,
            listingAgent: item.listingAgentName || item.listingAgent || item.agentName || undefined,
            listingOffice: item.listingOfficeName || item.listingOffice || item.officeName || undefined,
          }))
          .filter(listing => listing.listingId && listing.listingId !== 'N/A');

        totalCount = listings.length;
        hasMoreListings = criteria.limit !== undefined && listings.length === criteria.limit;

      } else if (rawData && typeof rawData === 'object') {
        if (rawData.errors) {
          console.error('[IDX-API-Client] IDX Broker API reported errors:', rawData.errors);
          throw new Error(`IDX Broker API error: ${JSON.stringify(rawData.errors)}`);
        }
        
        // Handle object responses that might contain listings under a property
        const possibleListingProperties = ['listings', 'properties', 'results', 'data'];
        for (const prop of possibleListingProperties) {
          if (rawData[prop] && Array.isArray(rawData[prop])) {
            return this.fetchListings(`data-${prop}`, criteria); // Recursive call with array
          }
        }
        
        console.warn('[IDX-API-Client] Unexpected response format, returning empty results');
        listings = [];
        totalCount = 0;
        hasMoreListings = false;
      }

      return { listings, totalCount, hasMoreListings };

    } catch (error: any) {
      console.error(`[IDX-API-Client] Error during API call to ${url}:`);
      if (error.response) {
        console.error('[IDX-API-Client] Response Status:', error.response.status);
        console.error('[IDX-API-Client] Response Data:', JSON.stringify(error.response.data, null, 2));
        
        // Handle specific HTTP status codes
        if (error.response.status === 401) {
          throw new Error('IDX Broker API authentication failed - check API key');
        } else if (error.response.status === 403) {
          throw new Error('IDX Broker API access forbidden - check account permissions');
        } else if (error.response.status === 400) {
          throw new Error(`IDX Broker API bad request - check parameters: ${JSON.stringify(criteria)}`);
        }
        
        throw new Error(`IDX Broker API request failed with status ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('[IDX-API-Client] No response received:', error.message);
        throw new Error('No response from IDX Broker API. Check network or API endpoint.');
      } else {
        console.error('[IDX-API-Client] Request setup error:', error.message);
        throw new Error(`Error preparing IDX Broker API request: ${error.message}`);
      }
    }
  }

  private extractImages(item: any): string[] {
    if (item.photos && Array.isArray(item.photos)) {
      return item.photos.map((p: any) => typeof p === 'string' ? p : p.url).filter(Boolean);
    }
    if (item.image) {
      return typeof item.image === 'string' ? [item.image] : [];
    }
    if (item.images && Array.isArray(item.images)) {
      return item.images.filter(img => typeof img === 'string');
    }
    return [];
  }

  public async testConnection(endpoint: string = 'clients/accountinfo'): Promise<any> {
    const url = `${this.baseUrl}/${endpoint}`;
    console.log(`[IDX-API-Client] Testing connection to: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: this.getStandardHeaders(),
        timeout: 10000
      });
      
      console.log(`[IDX-API-Client] Connection test successful. Status: ${response.status}`);
      return { 
        success: true, 
        status: response.status, 
        data: response.data,
        endpoint: endpoint
      };
    } catch (error: any) {
      console.error(`[IDX-API-Client] Connection test failed to ${url}:`);
      if (error.response) {
        console.error('[IDX-API-Client] Error Status:', error.response.status);
        console.error('[IDX-API-Client] Error Data:', JSON.stringify(error.response.data, null, 2));
      }
      return { 
        success: false, 
        status: error.response?.status, 
        error: error.message, 
        details: error.response?.data,
        endpoint: endpoint
      };
    }
  }

  // Test multiple endpoints to find working ones
  public async runDiagnostics(): Promise<any> {
    const testEndpoints = [
      'clients/accountinfo',
      'clients/featured',
      'clients/systemlinks',
      'clients/listings'
    ];

    const results = [];
    
    for (const endpoint of testEndpoints) {
      console.log(`[IDX-API-Client] Testing endpoint: ${endpoint}`);
      const result = await this.testConnection(endpoint);
      results.push({
        endpoint,
        ...result
      });
      
      // If this endpoint works, try to fetch a few listings
      if (result.success) {
        try {
          const listingsTest = await this.fetchListings(endpoint, { limit: 5 });
          result.listingsTest = {
            success: true,
            count: listingsTest.listings.length,
            sampleListing: listingsTest.listings[0] || null
          };
        } catch (listingsError) {
          result.listingsTest = {
            success: false,
            error: listingsError instanceof Error ? listingsError.message : String(listingsError)
          };
        }
      }
    }

    return {
      timestamp: new Date().toISOString(),
      apiKeyPresent: !!this.apiKey,
      results,
      workingEndpoints: results.filter(r => r.success).map(r => r.endpoint),
      recommendation: results.filter(r => r.success).length > 0 ? 
        'IDX Broker API is accessible' : 
        'IDX Broker API access issues detected'
    };
  }
}

// Export convenience functions for backward compatibility
export async function testIdxConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const api = new IdxBrokerAPI();
    const result = await api.testConnection();
    return { 
      success: result.success, 
      message: result.success ? 'IDX connection successful' : result.error 
    };
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
    return await api.fetchListings('clients/featured', criteria);
  } catch (error) {
    console.error('[IDX-API-Client] Error in fetchIdxListings:', error);
    return {
      listings: [],
      totalCount: 0,
      hasMoreListings: false
    };
  }
}
