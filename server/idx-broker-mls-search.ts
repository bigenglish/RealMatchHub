import axios from 'axios';
import * as querystring from 'querystring';

interface MLSSearchCriteria {
  limit?: number;
  offset?: number;
  city?: string;
  state?: string;
  zipCode?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  [key: string]: any;
}

interface MLSListing {
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
  listingAgent: string;
  listingOffice: string;
}

export class MLSSearchAPI {
  private apiKey: string;
  private baseUrl = 'https://api.idxbroker.com';

  constructor() {
    this.apiKey = process.env.IDX_BROKER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('IDX_BROKER_API_KEY environment variable is required');
    }
    console.log('[MLS-Search] Initialized for full MLS database access');
  }

  private getHeaders() {
    return {
      'accesskey': this.apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'RealtyAI-MLS/1.0'
    };
  }

  private buildSearchParams(criteria: MLSSearchCriteria): string {
    const params: { [key: string]: any } = {};
    
    // Basic parameters
    if (criteria.limit) params.limit = Math.min(criteria.limit, 500);
    if (criteria.offset) params.offset = criteria.offset;
    
    // Location filters
    if (criteria.city) params.city = criteria.city;
    if (criteria.state) params.state = criteria.state;
    if (criteria.zipCode) params.zipcode = criteria.zipCode;
    
    // Price filters
    if (criteria.minPrice) params.lp = criteria.minPrice; // low price
    if (criteria.maxPrice) params.hp = criteria.maxPrice; // high price
    
    // Property details
    if (criteria.bedrooms) params.bd = criteria.bedrooms; // bedrooms
    if (criteria.bathrooms) params.tb = criteria.bathrooms; // total baths
    
    // Property type - use pt parameter
    if (criteria.propertyType === 'sfr') params.pt = 'sfr';
    
    // Return fields for complete property data
    params.rf = 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType,image,remarksConcat,listDate,mlsID,listingAgentName,listingOfficeName';
    
    console.log('[MLS-Search] Search parameters:', params);
    return querystring.stringify(params);
  }

  async searchMLS(criteria: MLSSearchCriteria): Promise<{ listings: MLSListing[], totalCount: number }> {
    try {
      console.log('[MLS-Search] Searching MLS database with criteria:', criteria);
      
      // Use MLS endpoints for Client accounts - these provide full database access
      const searchEndpoints = [
        'mls/prices',
        'mls/propertycount', 
        'mls/cities',
        'clients/savedlinks'
      ];

      for (const endpoint of searchEndpoints) {
        try {
          console.log(`[MLS-Search] Trying endpoint: ${endpoint}`);
          
          const queryParams = this.buildSearchParams(criteria);
          const url = `${this.baseUrl}/${endpoint}?${queryParams}`;
          
          console.log(`[MLS-Search] Request URL: ${url}`);
          
          const response = await axios.get(url, {
            headers: this.getHeaders(),
            timeout: 20000
          });

          console.log(`[MLS-Search] Response status: ${response.status}`);
          console.log(`[MLS-Search] Response headers:`, response.headers);
          
          if (response.status === 204) {
            console.log(`[MLS-Search] ${endpoint} returned 204 No Content - trying next endpoint`);
            continue;
          }

          if (response.data && Array.isArray(response.data)) {
            const listings = this.transformListings(response.data);
            console.log(`[MLS-Search] Successfully retrieved ${listings.length} listings from ${endpoint}`);
            
            return {
              listings,
              totalCount: listings.length
            };
          }

          if (response.data && typeof response.data === 'object') {
            // Handle different response formats
            const listingsArray = response.data.listings || response.data.results || [];
            if (Array.isArray(listingsArray)) {
              const listings = this.transformListings(listingsArray);
              console.log(`[MLS-Search] Successfully retrieved ${listings.length} listings from ${endpoint}`);
              
              return {
                listings,
                totalCount: response.data.totalCount || listings.length
              };
            }
          }

          console.log(`[MLS-Search] ${endpoint} returned unexpected format:`, typeof response.data);
          
        } catch (endpointError: any) {
          console.log(`[MLS-Search] ${endpoint} failed:`, endpointError.response?.status, endpointError.response?.statusText);
          if (endpointError.response?.data) {
            console.log(`[MLS-Search] Error response:`, endpointError.response.data);
          }
          continue;
        }
      }

      console.log('[MLS-Search] All endpoints failed - no MLS data available');
      return { listings: [], totalCount: 0 };

    } catch (error: any) {
      console.error('[MLS-Search] Critical error:', error.message);
      return { listings: [], totalCount: 0 };
    }
  }

  private transformListings(rawListings: any[]): MLSListing[] {
    return rawListings.map((listing: any) => ({
      listingId: listing.idxID || listing.id || listing.listingId || '',
      address: listing.address || listing.fullAddress || '',
      city: listing.cityName || listing.city || '',
      state: listing.state || '',
      zipCode: listing.zipcode || listing.zipCode || '',
      price: parseFloat(listing.listPrice || listing.price || '0'),
      bedrooms: parseInt(listing.bedrooms || listing.bd || '0'),
      bathrooms: parseFloat(listing.totalBaths || listing.bathrooms || listing.tb || '0'),
      sqft: parseInt(listing.sqFt || listing.squareFeet || '0'),
      propertyType: listing.propType || listing.propertyType || 'Single Family Residence',
      images: listing.image ? [listing.image] : [],
      description: listing.remarksConcat || listing.description || '',
      listedDate: listing.listDate || new Date().toISOString(),
      status: listing.status || 'Active',
      mlsNumber: listing.mlsID || listing.mlsNumber || '',
      listingAgent: listing.listingAgentName || listing.agent || '',
      listingOffice: listing.listingOfficeName || listing.office || ''
    })).filter(listing => listing.listingId && listing.address);
  }
}

export const mlsSearchAPI = new MLSSearchAPI();