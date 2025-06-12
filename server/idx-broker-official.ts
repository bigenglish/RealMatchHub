
// server/idx-broker-official.ts
// This file contains the robust IdxBrokerAPI class with updated fetchListings logic.

import axios from 'axios';
import querystring from 'querystring';

// Ensure these interfaces match what you've already defined.
// Added PropertySearchCriteria for clarity based on your provided code.
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
      'accesskey': this.apiKey,
      'outputtype': 'json',
      'Version': this.apiVersion,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': this.userAgent,
    };
  }

  private transformIdxProperty(idxProperty: any, index: number): IdxListing | null {
    // Use IDX API standard field names as documented
    const listingId = idxProperty.idxID || idxProperty.listingID || idxProperty.id || `idx-${index}`;

    // Validate required fields - be more lenient with addresses
    if (!idxProperty || typeof idxProperty !== 'object') {
      console.log(`[IDX-Official] Filtering out invalid property: not an object`);
      return null;
    }

    // Check if this is a system link/configuration item vs actual property
    if (idxProperty.name && idxProperty.url && idxProperty.category && !idxProperty.address) {
      console.log(`[IDX-Official] Filtering out system configuration: ${idxProperty.name}`);
      return null;
    }

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

  public async fetchListings(criteria: PropertySearchCriteria = {}): Promise<IdxResponse> {
    const { limit = 50, offset = 0 } = criteria;
    
    console.log(`[IDX-Official] Fetching listings with criteria:`, criteria);
    
    // Use broader search to get more results, then filter client-side if needed
    const endpoints = [
      // Clients listings - general active listings (try first with broader parameters)
      {
        name: 'Clients Listings Broad', 
        url: 'clients/listings',
        params: {
          rf: 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType,image,remarksConcat,listDate,mlsID',
          limit: Math.min(limit * 2, 500), // Request more to ensure we have enough after filtering
          offset: offset,
          // Use broader search parameters
          'a_propStatus[]': 'Active'
        }
      },
      // Clients search endpoint - most flexible for filtering
      {
        name: 'Clients Search',
        url: 'clients/search',
        params: {
          rf: 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType,image,remarksConcat,listDate,mlsID',
          limit: Math.min(limit * 2, 500),
          offset: offset,
          'a_propStatus[]': 'Active'
        }
      },
      // Clients featured properties as fallback
      {
        name: 'Clients Featured',
        url: 'clients/featured',
        params: {
          rf: 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType,image,remarksConcat,listDate,mlsID',
          limit: Math.min(limit, 100)
        }
      }
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`[IDX-Official] Trying endpoint: ${endpoint.name}`);
        
        // Build URL with parameters including search criteria
        let apiParams = { ...endpoint.params };
        
        // For broader results, only apply location and status filters to the API
        // We'll do more specific filtering client-side
        
        // Location parameters - be more flexible
        if (criteria.city) {
          // For Los Angeles, try multiple variations
          if (criteria.city.toLowerCase().includes('los angeles')) {
            // Don't restrict by city in API call - get all CA properties
            apiParams.state = 'CA';
          } else {
            apiParams['city[]'] = criteria.city;
          }
        } else {
          // Default to California to get substantial results
          apiParams.state = 'CA';
        }
        
        // Only use broader price range to ensure we get results
        if (criteria.maxPrice && criteria.maxPrice < 5000000) {
          apiParams.hp = '5000000'; // Use broader range
        }
        if (criteria.minPrice && criteria.minPrice > 200000) {
          apiParams.lp = '200000'; // Use broader range
        }
        
        // Don't restrict bedrooms/bathrooms in API call - filter client-side
        // Property type - only if very specific
        if (criteria.propertyType && criteria.propertyType.toLowerCase() === 'condo') {
          apiParams.pt = '2';
        } else {
          // Default to residential properties
          apiParams.pt = '1,2,3'; // Include SFR, Condo, Townhouse
        }
        
        // Add property status filter for active listings
        apiParams['a_propStatus[]'] = 'Active';
        
        const queryParams = this.buildQueryParams(apiParams);
        const url = `${this.baseUrl}/${endpoint.url}${queryParams ? '?' + queryParams : ''}`;
        
        console.log(`[IDX-Official] Attempting to fetch from URL: ${url}`);
        console.log(`[IDX-Official] API Parameters:`, apiParams);
        
        const response = await axios.get(url, {
          headers: this.getStandardHeaders(),
          timeout: 15000
        });

        console.log(`[IDX-Official] Received status: ${response.status} from ${endpoint.name}`);
        const rawData = response.data;
        console.log('[IDX-Official] Raw Response Type:', typeof rawData);
        console.log('[IDX-Official] Raw Response Preview:', JSON.stringify(rawData).substring(0, 500));

        let listings: IdxListing[] = [];
        let totalCount: number = 0;
        let hasMoreListings: boolean = false;

        if (Array.isArray(rawData)) {
          // Transform all properties first
          let allListings = rawData
            .filter(item => item && typeof item === 'object')
            .map((item, index) => this.transformIdxProperty(item, index))
            .filter(listing => listing !== null) as IdxListing[];

          // Apply client-side filtering to get specific results
          listings = allListings.filter(listing => {
            // City filter
            if (criteria.city && listing.city) {
              const cityMatch = listing.city.toLowerCase().includes(criteria.city.toLowerCase()) ||
                               criteria.city.toLowerCase().includes(listing.city.toLowerCase());
              if (!cityMatch) return false;
            }
            
            // Price filters
            if (criteria.minPrice && listing.price < criteria.minPrice) return false;
            if (criteria.maxPrice && listing.price > criteria.maxPrice) return false;
            
            // Bedroom filter
            if (criteria.bedrooms && listing.bedrooms !== criteria.bedrooms) return false;
            
            // Bathroom filter (allow some flexibility - within 0.5)
            if (criteria.bathrooms) {
              const bathDiff = Math.abs(listing.bathrooms - criteria.bathrooms);
              if (bathDiff > 0.5) return false;
            }
            
            // Property type filter
            if (criteria.propertyType) {
              const typeMatch = criteria.propertyType.toLowerCase() === 'sfr' && 
                               listing.propertyType.toLowerCase().includes('single family');
              if (criteria.propertyType.toLowerCase() === 'sfr' && !typeMatch) return false;
            }
            
            return true;
          });

          // Limit results after filtering
          if (criteria.limit && listings.length > criteria.limit) {
            listings = listings.slice(0, criteria.limit);
          }

          totalCount = listings.length;
          hasMoreListings = allListings.length > listings.length;

        } else if (rawData && typeof rawData === 'object') {
          if (rawData.errors) {
            console.error('[IDX-Official] IDX Broker API reported errors:', rawData.errors);
            continue; // Try next endpoint
          }
          
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
          
          // If it's an object but not a recognized structure, try to parse individual properties
          if (!foundListings) {
            const propertyKeys = Object.keys(rawData);
            const potentialProperties = propertyKeys.filter(key => 
              rawData[key] && typeof rawData[key] === 'object' && rawData[key].address
            );
            
            if (potentialProperties.length > 0) {
              listings = potentialProperties
                .map((key, index) => this.transformIdxProperty(rawData[key], index))
                .filter(listing => listing !== null) as IdxListing[];
              
              totalCount = listings.length;
              hasMoreListings = false;
              foundListings = true;
            }
          }
          
          if (!foundListings) {
            console.warn(`[IDX-Official] Unexpected response format from ${endpoint.name}, trying next endpoint`);
            continue;
          }
        }

        if (listings.length > 0) {
          console.log(`[IDX-Official] ✅ SUCCESS: Found ${listings.length} valid properties from ${endpoint.name}`);
          return { listings, totalCount, hasMoreListings };
        } else {
          console.log(`[IDX-Official] No properties found in ${endpoint.name}, trying next endpoint`);
        }

      } catch (error: any) {
        console.error(`[IDX-Official] Error with ${endpoint.name}:`, error.message);
        if (error.response) {
          console.error(`[IDX-Official] Response Status: ${error.response.status}`);
          console.error(`[IDX-Official] Response Data:`, JSON.stringify(error.response.data, null, 2));
        }
        continue;
      }
    }

    // If we get here, all endpoints failed
    console.warn('[IDX-Official] All endpoints failed to return property data');
    return { listings: [], totalCount: 0, hasMoreListings: false };
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
}

// Export main function for backward compatibility
export async function fetchIdxListingsOfficial(criteria: PropertySearchCriteria): Promise<{ listings: IdxListing[], totalCount: number }> {
  try {
    console.log(`[IDX-Official] Fetching properties with criteria:`, JSON.stringify(criteria, null, 2));

    if (!process.env.IDX_BROKER_API_KEY) {
      throw new Error('IDX_BROKER_API_KEY is required for authentic MLS data access');
    }

    const api = new IdxBrokerAPI();
    const result = await api.fetchListings(criteria);
    
    return {
      listings: result.listings,
      totalCount: result.totalCount
    };

  } catch (error) {
    console.error('[IDX-Official] Error fetching listings:', error);
    throw error;
  }
}
