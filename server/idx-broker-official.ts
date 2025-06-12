
import axios from 'axios';
import querystring from 'querystring';

// Define interfaces locally since they're not in shared schema
interface PropertySearchCriteria {
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
  status: string;
  mlsNumber: string;
  lotSize?: number;
  yearBuilt?: number;
  daysOnMarket?: number;
  listingAgent?: string;
  listingOffice?: string;
}

interface IdxResponse {
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
      console.warn('[IDX-Official] Warning: API key format may be invalid. Expected to start with "a" or "@"');
    }
    
    console.log('[IDX-Official] IdxBrokerAPI initialized.');
    console.log('[IDX-Official] API Key format:', this.apiKey.startsWith('@') ? 'New format (@...)' : 'Traditional format (a...)');
    console.log('[IDX-Official] API Key length:', this.apiKey.length);
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

  private transformIdxProperty(idxProperty: any, index: number): IdxListing | null {
    // Use IDX API standard field names as documented
    const listingId = idxProperty.idxID || idxProperty.listingID || idxProperty.id || `idx-${index}`;

    // Validate required fields
    if (!idxProperty || typeof idxProperty !== 'object' || !idxProperty.address || idxProperty.address === 'Address not available') {
      console.log(`[IDX-Official] Filtering out invalid property:`, idxProperty?.address || 'No address');
      return null;
    }

    return {
      listingId: String(listingId),
      address: String(idxProperty.address || 'Address not available'),
      city: String(idxProperty.cityName || idxProperty.city || 'Unknown'),
      state: String(idxProperty.state || idxProperty.stateAbbr || 'Unknown'),
      zipCode: String(idxProperty.zipcode || idxProperty.zipCode || idxProperty.zip || ''),
      price: parseFloat(idxProperty.listPrice || idxProperty.price || '0'),
      bedrooms: parseInt(idxProperty.bedrooms || idxProperty.beds || '0'),
      bathrooms: parseFloat(idxProperty.totalBaths || idxProperty.baths || idxProperty.bathrooms || '0'),
      sqft: parseInt(idxProperty.sqFt || idxProperty.squareFeet || idxProperty.livingArea || '0'),
      propertyType: this.mapPropertyType(idxProperty.propType || idxProperty.propertyType || idxProperty.idxPropType),
      images: this.extractImages(idxProperty),
      description: String(idxProperty.remarksConcat || idxProperty.remarks || idxProperty.description || 'No description available'),
      listedDate: String(idxProperty.listDate || idxProperty.dateAdded || new Date().toISOString().split('T')[0]),
      status: String(idxProperty.status || idxProperty.propStatus || 'Active'),
      mlsNumber: String(idxProperty.mlsID || idxProperty.mlsNumber || ''),
      lotSize: this.parseNumeric(idxProperty.acreage || idxProperty.lotSize, undefined),
      yearBuilt: this.parseNumeric(idxProperty.yearBuilt, undefined),
      daysOnMarket: this.parseNumeric(idxProperty.daysOnMarket, undefined),
      listingAgent: String(idxProperty.listingAgentName || idxProperty.listingAgent || idxProperty.agentName || ''),
      listingOffice: String(idxProperty.listingOfficeName || idxProperty.listingOffice || idxProperty.officeName || ''),
    };
  }

  private mapPropertyType(type: string | number): string {
    if (typeof type === 'number') type = String(type);
    if (!type) return 'Single Family Residential';

    const typeMap: { [key: string]: string } = {
      '1': 'Single Family Residential',
      '2': 'Condominium',
      '3': 'Townhouse',
      '4': 'Multi-Family',
      'sfr': 'Single Family Residential',
      'condo': 'Condominium',
      'townhouse': 'Townhouse',
      'multi': 'Multi-Family'
    };

    return typeMap[type.toLowerCase()] || type || 'Single Family Residential';
  }

  private parseNumeric(value: any, defaultValue: any): number | undefined {
    if (value === undefined || value === null) return defaultValue;
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
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

  public async fetchListings(
    endpoint: string,
    criteria: PropertySearchCriteria = {}
  ): Promise<IdxResponse> {
    const queryParams = this.buildQueryParams(criteria);
    const url = `${this.baseUrl}/${endpoint}${queryParams ? '?' + queryParams : ''}`;

    console.log(`[IDX-Official] Attempting to fetch from URL: ${url}`);
    console.log('[IDX-Official] Request Headers:', this.getStandardHeaders());

    try {
      const response = await axios.get(url, {
        headers: this.getStandardHeaders(),
        timeout: 15000
      });

      console.log(`[IDX-Official] Received status: ${response.status} from ${url}`);
      const rawData = response.data;
      console.log('[IDX-Official] Raw IDX Broker Response Type:', typeof rawData);
      console.log('[IDX-Official] Raw IDX Broker Response Preview:', JSON.stringify(rawData).substring(0, 500));

      let listings: IdxListing[] = [];
      let totalCount: number = 0;
      let hasMoreListings: boolean = false;

      if (Array.isArray(rawData)) {
        listings = rawData
          .filter(item => item && typeof item === 'object')
          .map((item, index) => this.transformIdxProperty(item, index))
          .filter(listing => listing !== null) as IdxListing[];

        totalCount = listings.length;
        hasMoreListings = criteria.limit !== undefined && listings.length === criteria.limit;

      } else if (rawData && typeof rawData === 'object') {
        if (rawData.errors) {
          console.error('[IDX-Official] IDX Broker API reported errors:', rawData.errors);
          throw new Error(`IDX Broker API error: ${JSON.stringify(rawData.errors)}`);
        }
        
        // Handle object responses that might contain listings under a property
        const possibleListingProperties = ['listings', 'properties', 'results', 'data'];
        for (const prop of possibleListingProperties) {
          if (rawData[prop] && Array.isArray(rawData[prop])) {
            return this.fetchListings(`data-${prop}`, criteria); // Recursive call with array
          }
        }
        
        console.warn('[IDX-Official] Unexpected response format, returning empty results');
        listings = [];
        totalCount = 0;
        hasMoreListings = false;
      }

      return { listings, totalCount, hasMoreListings };

    } catch (error: any) {
      console.error(`[IDX-Official] Error during API call to ${url}:`);
      if (error.response) {
        console.error('[IDX-Official] Response Status:', error.response.status);
        console.error('[IDX-Official] Response Data:', JSON.stringify(error.response.data, null, 2));
        
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
        console.error('[IDX-Official] No response received:', error.message);
        throw new Error('No response from IDX Broker API. Check network or API endpoint.');
      } else {
        console.error('[IDX-Official] Request setup error:', error.message);
        throw new Error(`Error preparing IDX Broker API request: ${error.message}`);
      }
    }
  }

  public async testConnection(endpoint: string = 'clients/accountinfo'): Promise<any> {
    const url = `${this.baseUrl}/${endpoint}`;
    console.log(`[IDX-Official] Testing connection to: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: this.getStandardHeaders(),
        timeout: 10000
      });
      
      console.log(`[IDX-Official] Connection test successful. Status: ${response.status}`);
      return { 
        success: true, 
        status: response.status, 
        data: response.data,
        endpoint: endpoint
      };
    } catch (error: any) {
      console.error(`[IDX-Official] Connection test failed to ${url}:`);
      if (error.response) {
        console.error('[IDX-Official] Error Status:', error.response.status);
        console.error('[IDX-Official] Error Data:', JSON.stringify(error.response.data, null, 2));
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
      console.log(`[IDX-Official] Testing endpoint: ${endpoint}`);
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

// Export main function for backward compatibility
export async function fetchIdxListingsOfficial(criteria: PropertySearchCriteria): Promise<{ listings: IdxListing[], totalCount: number }> {
  try {
    console.log(`[IDX-Official] Fetching properties with criteria:`, JSON.stringify(criteria, null, 2));

    if (!process.env.IDX_BROKER_API_KEY) {
      throw new Error('IDX_BROKER_API_KEY is required for authentic MLS data access');
    }

    const api = new IdxBrokerAPI();
    
    // Try primary endpoints in order of likelihood to have property data
    const endpoints = [
      'clients/featured',
      'clients/systemlinks',
      'clients/soldpending',
      'clients/supplemental'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`[IDX-Official] Trying endpoint: ${endpoint}`);
        
        const result = await api.fetchListings(endpoint, criteria);
        
        if (result.listings.length > 0) {
          console.log(`[IDX-Official] ✅ SUCCESS: Found ${result.listings.length} valid properties from ${endpoint}`);
          
          return {
            listings: result.listings,
            totalCount: result.totalCount
          };
        } else {
          console.log(`[IDX-Official] No properties found in ${endpoint}, trying next endpoint`);
        }
      } catch (endpointError: any) {
        console.error(`[IDX-Official] Error with ${endpoint}:`, endpointError.message);
        continue;
      }
    }

    // If all endpoints failed, throw an error
    throw new Error('All IDX Broker API endpoints failed');

  } catch (error) {
    console.error('[IDX-Official] Error fetching listings:', error);
    throw error;
  }
}
