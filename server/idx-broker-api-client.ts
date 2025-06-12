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
  private apiVersion = '1.8.0'; // As per your provided documentation example snippets
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
   * @param params An object of key-value pairs for query parameters.
   * @returns A URL-encoded query string.
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
   * Standardized headers for all IDX Broker API requests.
   */
  private getStandardHeaders() {
    return {
      'AccessKey': this.apiKey,
      'outputtype': 'json', // Ensures JSON response
      'Version': this.apiVersion,
      'Content-Type': 'application/x-www-form-urlencoded', // Recommended for IDX Broker
      'User-Agent': this.userAgent,
    };
  }

  /**
   * Helper to transform a raw IDX Broker property object into your IdxListing interface.
   * @param idxProperty The raw property object from IDX Broker.
   * @param index An index for fallback ID if primary ID is missing.
   * @returns A transformed IdxListing object or null if invalid.
   */
  private transformIdxProperty(idxProperty: any, index: number): IdxListing | null {
    const listingId = idxProperty.idxID || idxProperty.listingID || idxProperty.id || `temp-idx-${index}`;

    if (!idxProperty || typeof idxProperty !== 'object' || !listingId) {
      return null;
    }

    // Validate address - must be meaningful
    const address = idxProperty.address || idxProperty.fullAddress || idxProperty.displayAddress;
    if (!address || address === 'Address not available' || address.length < 5) {
      return null;
    }

    // Validate price - must be realistic for real estate
    const price = parseFloat(idxProperty.listPrice || idxProperty.price || '0') || 0;
    if (price < 50000 || price > 50000000) {
      return null; // Skip unrealistic prices
    }

    let images: string[] = [];
    if (idxProperty.photos && Array.isArray(idxProperty.photos)) {
      images = idxProperty.photos.map((p: any) => p.url).filter(Boolean);
    } else if (idxProperty.image && typeof idxProperty.image === 'string') {
      images = [idxProperty.image];
    }
    if (images.length === 0) {
      images = [`https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000 + index)}`];
    }

    // Generate better description if missing
    let description = idxProperty.remarksConcat || idxProperty.remarks || idxProperty.description;
    if (!description || description.length < 20) {
      const bedrooms = parseInt(idxProperty.bedrooms || idxProperty.beds || '0') || 0;
      const bathrooms = parseFloat(idxProperty.totalBaths || idxProperty.baths || idxProperty.bathrooms || '0') || 0;
      const sqft = parseInt(idxProperty.sqFt || idxProperty.squareFeet || idxProperty.livingArea || '0') || 0;
      const propertyType = this.mapPropertyType(idxProperty.propType || idxProperty.propertyType || idxProperty.idxPropType || '');
      
      description = `Beautiful ${propertyType.toLowerCase()} featuring ${bedrooms} bedrooms and ${bathrooms} bathrooms`;
      if (sqft > 0) {
        description += ` with ${sqft.toLocaleString()} square feet of living space`;
      }
      description += `. Located in a desirable neighborhood with convenient access to local amenities. This property offers excellent value and potential.`;
    }

    return {
      listingId: String(listingId),
      address: String(address),
      city: String(idxProperty.cityName || idxProperty.city || 'Los Angeles'),
      state: String(idxProperty.state || idxProperty.stateAbbr || 'CA'),
      zipCode: String(idxProperty.zipcode || idxProperty.zipCode || idxProperty.zip || '90210'),
      price: price,
      bedrooms: parseInt(idxProperty.bedrooms || idxProperty.beds || '0') || 0,
      bathrooms: parseFloat(idxProperty.totalBaths || idxProperty.baths || idxProperty.bathrooms || '0') || 0,
      sqft: parseInt(idxProperty.sqFt || idxProperty.squareFeet || idxProperty.livingArea || '0') || 0,
      propertyType: this.mapPropertyType(idxProperty.propType || idxProperty.propertyType || idxProperty.idxPropType || ''),
      images: images,
      description: description,
      listedDate: String(idxProperty.listDate || idxProperty.dateAdded || new Date().toISOString().split('T')[0]),
      status: String(idxProperty.status || idxProperty.propStatus || 'Active'),
      mlsNumber: String(idxProperty.mlsID || idxProperty.mlsNumber || ''),
      lotSize: this.parseNumeric(idxProperty.acreage || idxProperty.lotSize, undefined),
      yearBuilt: this.parseNumeric(idxProperty.yearBuilt, undefined),
      daysOnMarket: this.parseNumeric(idxProperty.daysOnMarket, undefined),
      listingAgent: String(idxProperty.listingAgentName || ''),
      listingOffice: String(idxProperty.listingOfficeName || ''),
    };
  }

  private mapPropertyType(type: string | number): string {
    if (typeof type === 'number') type = String(type);
    if (!type) return 'Single Family Residential';

    const typeMap: { [key: string]: string } = {
      '1': 'Single Family Residential', 'sfr': 'Single Family Residential',
      '2': 'Condominium', 'condo': 'Condominium',
      '3': 'Townhouse', 'townhouse': 'Townhouse',
      '4': 'Multi-Family', 'multi': 'Multi-Family',
      'com': 'Commercial', 'land': 'Land', 'lot': 'Land',
    };
    return typeMap[type.toLowerCase()] || type || 'Single Family Residential';
  }

  private parseNumeric(value: any, defaultValue: any): number | undefined {
    if (value === undefined || value === null || value === '') return defaultValue;
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Fetches listings from a specified IDX Broker API endpoint with search criteria.
   * This method targets a single endpoint and handles all parameter mapping and response transformation.
   *
   * @param endpoint The specific API path, e.g., 'clients/featured', 'clients/activels', 'mls/search'.
   * You MUST confirm the correct endpoint for general active listings from IDX Broker docs.
   * @param criteria Search criteria to filter listings.
   * @returns A promise that resolves to an IdxResponse object.
   */
  public async fetchListings(
    endpoint: string,
    criteria: PropertySearchCriteria = {}
  ): Promise<IdxResponse> {
    const { limit = 50, offset = 0, minPrice, maxPrice, bedrooms, bathrooms, propertyType, city, state, zipCode, mlsId } = criteria;

    const queryParams: any = {};

    // Always include return fields for property data
    queryParams.rf = 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType,image,remarksConcat,listDate,yearBuilt,lotSize,daysOnMarket,mlsID,photos,listingAgentName,listingOfficeName';

    // Pagination
    queryParams.limit = limit;
    queryParams.offset = offset;

    // Price filters: lp (low price), hp (high price)
    if (minPrice) queryParams.lp = minPrice;
    if (maxPrice) queryParams.hp = maxPrice;

    // Bedroom/Bathroom filters: beds (bedrooms), baths (total baths) - CORRECTED
    if (bedrooms) queryParams.beds = bedrooms; // Changed from bd to beds
    if (bathrooms) queryParams.baths = bathrooms; // Changed from tb to baths

    // Property type filter: pt (property type)
    if (propertyType) {
      queryParams.pt = this.mapPropertyType(propertyType);
    }

    // Location filters: city[] for array of cities, state, zipcode
    if (city) {
      queryParams['city[]'] = city; // Using array format for city
    }
    if (state) queryParams.state = state;
    if (zipCode) queryParams.zipcode = zipCode;

    // MLS ID filter if using an MLS-specific endpoint like mls/search
    if (mlsId) {
        queryParams.idxID = mlsId; // This is the parameter for MLS ID in many MLS-level calls
    }

    // Add other criteria from PropertySearchCriteria if IDX Broker supports them
    // Example: if IDX uses `yr` for yearBuilt: if (criteria.yearBuilt) queryParams.yr = criteria.yearBuilt;

    const queryString = this.buildQueryParams(queryParams);
    const url = `${this.baseUrl}/${endpoint}?${queryString}`;

    console.log(`[IDX-API] Attempting to fetch from URL: ${url}`);
    console.log('[IDX-API] Request Headers:', this.getStandardHeaders());

    try {
      const response = await axios.get(url, {
        headers: this.getStandardHeaders(),
        timeout: 15000 // Axios timeout in milliseconds
      });

      console.log(`[IDX-API] Received status: ${response.status} from ${url}`);
      const rawData = response.data;
      console.log('[IDX-API] Raw IDX Broker Response Data (sample):', JSON.stringify(rawData, null, 2).substring(0, 500) + (JSON.stringify(rawData).length > 500 ? '...' : ''));

      let listings: IdxListing[] = [];
      let totalCount: number = 0;
      let hasMoreListings: boolean = false;

      // Handle common IDX Broker response formats (array or nested array)
      let potentialListingsArray: any[] = [];
      if (Array.isArray(rawData)) {
        potentialListingsArray = rawData;
      } else if (rawData && typeof rawData === 'object') {
        // Look for nested arrays (e.g., 'listings', 'properties', 'results', 'data')
        for (const key of ['listings', 'properties', 'results', 'data']) {
          if (Array.isArray(rawData[key]) && rawData[key].length > 0) {
            potentialListingsArray = rawData[key];
            break; // Found the array, stop searching
          }
        }
      }

      if (potentialListingsArray.length > 0) {
        console.log(`[IDX-API] Found ${potentialListingsArray.length} raw items from ${endpoint}`);
        const transformedProperties = potentialListingsArray
          .map((item: any, index: number) => this.transformIdxProperty(item, index))
          .filter(listing => listing !== null) as IdxListing[];

        listings = transformedProperties;
        totalCount = listings.length;
        hasMoreListings = listings.length === limit; // Simple check for pagination
      } else {
        console.log(`[IDX-API] No valid properties found or unexpected format from ${endpoint}. Raw data was:`, JSON.stringify(rawData, null, 2));
      }

      return { listings, totalCount, hasMoreListings };

    } catch (error: any) {
      console.error(`[IDX-API] Error during IDX Broker API call to ${url}:`);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        console.error('Response Status:', error.response.status);
        console.error('Response Headers:', error.response.headers);
        throw new Error(`IDX Broker API request failed with status ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      } else if (axios.isAxiosError(error) && error.request) {
        console.error('No response received:', error.request);
        throw new Error('No response from IDX Broker API. Check network or API endpoint.');
      } else {
        console.error('Error setting up IDX Broker API request:', error.message);
        throw new Error(`Error preparing IDX Broker API request: ${error.message}`);
      }
    }
  }

  /**
   * A diagnostic method to test basic IDX Broker API connection and credentials.
   */
  public async testConnection(endpoint: string = 'clients/accountinfo'): Promise<any> {
    const url = `${this.baseUrl}/${endpoint}`;
    console.log(`[IDX-API] Testing IDX Broker API connection to: ${url}`);
    console.log('[IDX-API] Test Headers:', this.getStandardHeaders());

    try {
      const response = await axios.get(url, {
        headers: this.getStandardHeaders(),
        timeout: 10000
      });
      console.log(`[IDX-API] Connection test successful. Status: ${response.status}`);
      console.log('[IDX-API] Test Response Data (sample):', JSON.stringify(response.data, null, 2).substring(0, 500) + (JSON.stringify(response.data).length > 500 ? '...' : ''));
      return { success: true, status: response.status, data: response.data };
    } catch (error: any) {
      console.error(`[IDX-API] Connection test failed to ${url}:`);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        console.error('Response Status:', error.response.status);
      } else if (axios.isAxiosError(error) && error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error:', error.message);
      }
      return { success: false, status: error.response?.status, error: error.message, details: error.response?.data };
    }
  }

  /**
   * Fetches a list of available MLS IDs that your account has access to.
   * This corresponds to the 'MLS - availablemls GET' endpoint.
   */
  public async getAvailableMlsIds(): Promise<{ success: boolean; data: string[]; error?: string }> {
    const endpoint = 'mls/availablemls';
    const url = `${this.baseUrl}/${endpoint}`;
    console.log(`[IDX-API] Fetching available MLS IDs from: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: this.getStandardHeaders(),
        timeout: 10000
      });

      if (response.status === 200 && Array.isArray(response.data)) {
        const mlsIds = response.data.map((mls: any) => mls.idxID).filter(Boolean) as string[];
        console.log(`[IDX-API] Found ${mlsIds.length} available MLS IDs.`);
        return { success: true, data: mlsIds };
      } else {
        const errorMessage = `Unexpected response for available MLS IDs: Status ${response.status}, Data: ${JSON.stringify(response.data)}`;
        console.warn(`[IDX-API] ${errorMessage}`);
        return { success: false, data: [], error: errorMessage };
      }
    } catch (error: any) {
      const errorMessage = `Error fetching available MLS IDs: ${error.message}`;
      console.error(`[IDX-API] ${errorMessage}`);
      return { success: false, data: [], error: errorMessage };
    }
  }

  /**
   * Fetches a list of API methods (endpoints) accessible to your account.
   * Corresponds to 'Clients - listmethods GET'.
   */
  public async getAccessibleEndpoints(): Promise<{ success: boolean; data: any; error?: string }> {
    const endpoint = 'clients/listmethods';
    const url = `${this.baseUrl}/${endpoint}`;
    console.log(`[IDX-API] Fetching accessible endpoints from: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: this.getStandardHeaders(),
        timeout: 10000
      });

      if (response.status === 200) {
        console.log(`[IDX-API] Successfully fetched accessible endpoints.`);
        return { success: true, data: response.data };
      } else {
        const errorMessage = `Unexpected response for accessible endpoints: Status ${response.status}, Data: ${JSON.stringify(response.data)}`;
        console.warn(`[IDX-API] ${errorMessage}`);
        return { success: false, data: {}, error: errorMessage };
      }
    } catch (error: any) {
      const errorMessage = `Error fetching accessible endpoints: ${error.message}`;
      console.error(`[IDX-API] ${errorMessage}`);
      return { success: false, data: {}, error: errorMessage };
    }
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