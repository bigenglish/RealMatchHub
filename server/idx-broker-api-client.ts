
// server/idx-broker-api-client.ts
// This file contains the robust IdxBrokerAPI class with focused fetchListings logic.

import axios from 'axios';
import querystring from 'querystring';

// Interfaces (keep these consistent with your project)
export interface PropertySearchCriteria {
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
  mlsId?: string; // Added for MLS filtering
  [key: string]: any; // Allows for additional dynamic properties
}

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
  status: string;
  mlsNumber: string;
  lotSize?: number;
  yearBuilt?: number;
  daysOnMarket?: number;
  listingAgent?: string;
  listingOffice?: string;
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
  private userAgent = 'RealEstateApp/1.0 (Contact: support@yourdomain.com)';

  constructor() {
    this.apiKey = process.env.IDX_BROKER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('IDX_BROKER_API_KEY environment variable is required and must be correctly formatted.');
    }
    console.log('[IDX-API] IdxBrokerAPI initialized. API Key presence:', !!this.apiKey);
  }

  /**
   * Helper to build URL query parameters from an object,
   * ensuring correct encoding and filtering out undefined/null/empty string values.
   */
  private buildQueryParams(params: { [key: string]: any }): string {
    const filteredParams: { [key: string]: any } = {};
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        filteredParams[key] = params[key];
      }
    }
    return querystring.stringify(filteredParams);
  }

  /**
   * Standard headers for IDX Broker API requests
   */
  private getStandardHeaders() {
    return {
      'accesskey': this.apiKey,
      'outputtype': 'json',
      'Version': this.apiVersion,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': this.userAgent,
    };
  }

  /**
   * Discover available MLS IDs for the account
   */
  public async getAvailableMlsIds(): Promise<string[]> {
    try {
      console.log('[IDX-API] Discovering available MLS IDs...');
      
      const response = await axios.get(`${this.baseUrl}/mls/searchfields`, {
        headers: this.getStandardHeaders(),
        timeout: 10000
      });

      if (response.status === 200 && response.data) {
        const mlsIds: string[] = [];
        
        if (Array.isArray(response.data)) {
          response.data.forEach((item: any) => {
            if (item.mlsID || item.id) {
              mlsIds.push(item.mlsID || item.id);
            }
          });
        } else if (typeof response.data === 'object') {
          Object.keys(response.data).forEach(key => {
            if (key.match(/^[a-z]\d+$/i)) { // Pattern like 'd025'
              mlsIds.push(key);
            }
          });
        }

        console.log(`[IDX-API] Found ${mlsIds.length} available MLS IDs:`, mlsIds);
        return mlsIds;
      }
    } catch (error: any) {
      console.error('[IDX-API] Error discovering MLS IDs:', error.message);
    }
    
    return [];
  }

  /**
   * Get accessible endpoints using clients/listmethods
   */
  public async getAccessibleEndpoints(): Promise<string[]> {
    try {
      console.log('[IDX-API] Discovering accessible endpoints...');
      
      const response = await axios.get(`${this.baseUrl}/clients/listmethods`, {
        headers: this.getStandardHeaders(),
        timeout: 10000
      });

      if (response.status === 200 && response.data) {
        const endpoints: string[] = [];
        
        if (Array.isArray(response.data)) {
          endpoints.push(...response.data);
        } else if (typeof response.data === 'object') {
          endpoints.push(...Object.keys(response.data));
        }

        console.log(`[IDX-API] Found ${endpoints.length} accessible endpoints:`, endpoints);
        return endpoints;
      }
    } catch (error: any) {
      console.error('[IDX-API] Error discovering endpoints:', error.message);
    }
    
    return [];
  }

  /**
   * Enhanced parameter mapping for IDX Broker API
   */
  private mapSearchParameters(criteria: PropertySearchCriteria): { [key: string]: any } {
    const params: { [key: string]: any } = {};

    // Basic pagination
    if (criteria.limit) params.limit = criteria.limit;
    if (criteria.offset) params.offset = criteria.offset;

    // Location parameters
    if (criteria.city) {
      params['city[]'] = criteria.city; // IDX Broker uses array format
    }
    if (criteria.state) params.state = criteria.state;
    if (criteria.zipCode) params.zipcode = criteria.zipCode;

    // Price range - IDX Broker uses lp/hp format
    if (criteria.minPrice && criteria.maxPrice) {
      params.lp = `${criteria.minPrice}-${criteria.maxPrice}`;
    } else if (criteria.minPrice) {
      params.lp = criteria.minPrice;
    } else if (criteria.maxPrice) {
      params.hp = criteria.maxPrice;
    }

    // Property specifications
    if (criteria.bedrooms) params.bd = criteria.bedrooms;
    if (criteria.bathrooms) params.tb = criteria.bathrooms;

    // Property type mapping
    if (criteria.propertyType) {
      const typeMap: { [key: string]: string } = {
        'sfr': '1',
        'condo': '2',
        'townhouse': '3',
        'multi-family': '4'
      };
      params.pt = typeMap[criteria.propertyType.toLowerCase()] || criteria.propertyType;
    }

    // MLS filtering
    if (criteria.mlsId) {
      params.idxID = criteria.mlsId;
    }

    // Additional features
    if (criteria.garage) params.garage = '1';
    if (criteria.pool) params.pool = '1';
    if (criteria.fireplace) params.fireplace = '1';
    if (criteria.waterfront) params.waterfront = '1';

    return params;
  }

  /**
   * Transform IDX property data to our standard format
   */
  private transformIdxProperty(idxProperty: any, index: number): IdxListing | null {
    if (!idxProperty || typeof idxProperty !== 'object') {
      return null;
    }

    // Skip system configuration items
    if (idxProperty.name && idxProperty.url && idxProperty.category && !idxProperty.address) {
      return null;
    }

    const listingId = idxProperty.idxID || idxProperty.listingID || idxProperty.id || `idx-${index}`;

    return {
      listingId: String(listingId),
      address: String(idxProperty.address || idxProperty.fullAddress || idxProperty.displayAddress || 'Address not available'),
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

  /**
   * Fetch listings from a specific endpoint (no internal looping)
   */
  public async fetchListings(endpoint: string, criteria: PropertySearchCriteria = {}): Promise<IdxResponse> {
    console.log(`[IDX-API] Fetching listings from endpoint: ${endpoint}`);
    
    const params = this.mapSearchParameters(criteria);
    const queryParams = this.buildQueryParams(params);
    const url = `${this.baseUrl}/${endpoint}${queryParams ? '?' + queryParams : ''}`;
    
    console.log(`[IDX-API] Request URL: ${url}`);
    
    try {
      const response = await axios.get(url, {
        headers: this.getStandardHeaders(),
        timeout: 15000
      });

      console.log(`[IDX-API] Response status: ${response.status}`);
      const rawData = response.data;
      
      if (response.data?.errors) {
        console.error('[IDX-API] IDX Broker API reported errors:', response.data.errors);
        throw new Error(`IDX API Error: ${JSON.stringify(response.data.errors)}`);
      }

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
        // Handle object responses - look for property arrays
        const possibleListingProperties = ['listings', 'properties', 'results', 'data'];
        let foundListings = false;
        
        for (const prop of possibleListingProperties) {
          if (rawData[prop] && Array.isArray(rawData[prop])) {
            listings = rawData[prop]
              .filter((item: any) => item && typeof item === 'object')
              .map((item: any, index: number) => this.transformIdxProperty(item, index))
              .filter((listing: any) => listing !== null) as IdxListing[];
            
            totalCount = listings.length;
            hasMoreListings = criteria.limit !== undefined && listings.length === criteria.limit;
            foundListings = true;
            break;
          }
        }
        
        if (!foundListings) {
          console.warn(`[IDX-API] Unexpected response format from ${endpoint}`);
        }
      }

      console.log(`[IDX-API] Processed ${listings.length} listings from ${endpoint}`);
      return { listings, totalCount, hasMoreListings };

    } catch (error: any) {
      console.error(`[IDX-API] Error with ${endpoint}:`, error.message);
      if (error.response) {
        console.error(`[IDX-API] Response Status: ${error.response.status}`);
        console.error(`[IDX-API] Response Data:`, JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }

  public async testConnection(endpoint: string = 'clients/accountinfo'): Promise<any> {
    const url = `${this.baseUrl}/${endpoint}`;
    console.log(`[IDX-API] Testing connection to: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: this.getStandardHeaders(),
        timeout: 10000
      });
      
      console.log(`[IDX-API] Connection test successful. Status: ${response.status}`);
      return { 
        success: true, 
        status: response.status, 
        data: response.data,
        endpoint: endpoint
      };
    } catch (error: any) {
      console.error(`[IDX-API] Connection test failed to ${url}:`);
      if (error.response) {
        console.error('[IDX-API] Error Status:', error.response.status);
        console.error('[IDX-API] Error Data:', JSON.stringify(error.response.data, null, 2));
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

  /**
   * Comprehensive diagnostics with MLS discovery and endpoint validation
   */
  public async runDiagnostics(): Promise<any> {
    console.log('[IDX-API] Running comprehensive diagnostics...');
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      apiKeyPresent: !!this.apiKey,
      availableMlsIds: [] as string[],
      accessibleEndpoints: [] as string[],
      connectionTests: [] as any[],
      recommendation: ''
    };

    // Test basic connection
    const connectionTest = await this.testConnection();
    diagnostics.connectionTests.push({
      endpoint: 'clients/accountinfo',
      ...connectionTest
    });

    if (connectionTest.success) {
      // Discover MLS IDs and endpoints
      diagnostics.availableMlsIds = await this.getAvailableMlsIds();
      diagnostics.accessibleEndpoints = await this.getAccessibleEndpoints();
      
      // Test sample listing fetch using Client endpoints only
      try {
        const sampleListings = await this.fetchListings('clients/featured', { limit: 5 });
        diagnostics.connectionTests.push({
          endpoint: 'clients/featured',
          success: sampleListings.listings.length > 0,
          listingCount: sampleListings.listings.length,
          sampleListing: sampleListings.listings[0] || null
        });
      } catch (error) {
        diagnostics.connectionTests.push({
          endpoint: 'clients/featured',
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Generate recommendation
    if (diagnostics.availableMlsIds.length > 0) {
      diagnostics.recommendation = `Found ${diagnostics.availableMlsIds.length} MLS systems. API is properly configured for ${diagnostics.accessibleEndpoints.length} Client endpoints.`;
    } else if (connectionTest.success) {
      diagnostics.recommendation = 'Basic API access confirmed, but MLS discovery failed. Check account permissions.';
    } else {
      diagnostics.recommendation = 'API connection failed. Check API key configuration.';
    }

    return diagnostics;
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

export async function fetchIdxListings(criteria: PropertySearchCriteria = {}): Promise<IdxResponse> {
  try {
    const api = new IdxBrokerAPI();
    // Use clients/featured as default endpoint for backward compatibility
    return await api.fetchListings('clients/featured', criteria);
  } catch (error) {
    console.error('[IDX-API] Error in fetchIdxListings:', error);
    return {
      listings: [],
      totalCount: 0,
      hasMoreListings: false
    };
  }
}
