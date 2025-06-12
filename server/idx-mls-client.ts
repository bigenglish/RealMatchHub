import axios from 'axios';
import * as querystring from 'querystring';

interface MLSPropertySearch {
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

interface MLSProperty {
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

export class MLSClientAPI {
  private apiKey: string;
  private baseUrl = 'https://api.idxbroker.com';

  constructor() {
    this.apiKey = process.env.IDX_BROKER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('IDX_BROKER_API_KEY environment variable is required');
    }
    console.log('[MLS-Client] Initialized for full MLS database access via Client account');
  }

  private getHeaders() {
    return {
      'accesskey': this.apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'RealtyAI-Client/1.0',
      'outputtype': 'json'
    };
  }

  async searchProperties(criteria: MLSPropertySearch): Promise<{ listings: MLSProperty[], totalCount: number }> {
    try {
      console.log('[MLS-Client] Searching MLS database for Client account with criteria:', criteria);
      
      // Use MLS property endpoints that work with Client accounts for full database access
      const mlsEndpoints = [
        {
          name: 'MLS Cities with Properties',
          url: 'mls/cities',
          params: this.buildCitySearchParams(criteria)
        },
        {
          name: 'MLS Property Count',
          url: 'mls/propertycount',
          params: this.buildPropertyCountParams(criteria)
        },
        {
          name: 'MLS Search Fields',
          url: 'mls/searchfields',
          params: {}
        }
      ];

      // First, get property count to verify data availability
      for (const endpoint of mlsEndpoints) {
        try {
          console.log(`[MLS-Client] Checking ${endpoint.name} endpoint`);
          
          const queryParams = querystring.stringify(endpoint.params);
          const url = `${this.baseUrl}/${endpoint.url}${queryParams ? '?' + queryParams : ''}`;
          
          console.log(`[MLS-Client] Request URL: ${url}`);
          
          const response = await axios.get(url, {
            headers: this.getHeaders(),
            timeout: 20000
          });

          console.log(`[MLS-Client] ${endpoint.name} response status: ${response.status}`);
          
          if (response.status === 200 && response.data) {
            console.log(`[MLS-Client] ${endpoint.name} returned data:`, typeof response.data);
            
            // For propertycount endpoint, this tells us how many properties are available
            if (endpoint.url === 'mls/propertycount' && typeof response.data === 'object') {
              const propertyCount = this.extractPropertyCount(response.data);
              console.log(`[MLS-Client] Total properties available in MLS: ${propertyCount}`);
              
              if (propertyCount > 0) {
                // Now search for actual property data using saved links or widgets
                return await this.searchActualProperties(criteria, propertyCount);
              }
            }
            
            // For cities endpoint, extract city-specific property data
            if (endpoint.url === 'mls/cities' && Array.isArray(response.data)) {
              console.log(`[MLS-Client] Found ${response.data.length} cities with properties`);
              return await this.searchPropertiesByCity(criteria, response.data);
            }
          }

        } catch (endpointError: any) {
          console.log(`[MLS-Client] ${endpoint.name} failed:`, endpointError.response?.status, endpointError.response?.statusText);
          continue;
        }
      }

      console.log('[MLS-Client] All MLS endpoints failed - no data available');
      return { listings: [], totalCount: 0 };

    } catch (error: any) {
      console.error('[MLS-Client] Critical search error:', error.message);
      return { listings: [], totalCount: 0 };
    }
  }

  private buildCitySearchParams(criteria: MLSPropertySearch): any {
    const params: any = {};
    
    if (criteria.city) {
      params.city = criteria.city;
    }
    
    // Request all available fields
    params.rf = '*';
    
    return params;
  }

  private buildPropertyCountParams(criteria: MLSPropertySearch): any {
    const params: any = {};
    
    // Basic search parameters for property count
    if (criteria.city) params.city = criteria.city;
    if (criteria.minPrice) params.lp = criteria.minPrice;
    if (criteria.maxPrice) params.hp = criteria.maxPrice;
    if (criteria.bedrooms) params.bd = criteria.bedrooms;
    if (criteria.bathrooms) params.tb = criteria.bathrooms;
    if (criteria.propertyType === 'sfr') params.pt = 'sfr';
    
    return params;
  }

  private extractPropertyCount(data: any): number {
    // Extract property count from various possible response formats
    if (typeof data === 'number') return data;
    if (data.count) return parseInt(data.count);
    if (data.total) return parseInt(data.total);
    if (data.propertyCount) return parseInt(data.propertyCount);
    if (Array.isArray(data)) return data.length;
    
    // If it's an object with city data, sum up property counts
    if (typeof data === 'object') {
      let total = 0;
      for (const key in data) {
        if (typeof data[key] === 'number') {
          total += data[key];
        } else if (data[key] && data[key].count) {
          total += parseInt(data[key].count);
        }
      }
      return total;
    }
    
    return 0;
  }

  private async searchActualProperties(criteria: MLSPropertySearch, totalCount: number): Promise<{ listings: MLSProperty[], totalCount: number }> {
    try {
      console.log(`[MLS-Client] Searching for actual property data (${totalCount} total available)`);
      
      // Use client savedlinks endpoint which can access full property database
      const searchEndpoints = [
        'clients/savedlinks',
        'clients/systemlinks',
        'clients/widgets'
      ];

      for (const endpoint of searchEndpoints) {
        try {
          console.log(`[MLS-Client] Trying ${endpoint} for property data`);
          
          const response = await axios.get(`${this.baseUrl}/${endpoint}`, {
            headers: this.getHeaders(),
            timeout: 15000
          });

          if (response.status === 200 && response.data) {
            console.log(`[MLS-Client] ${endpoint} returned data, checking for property information`);
            
            // Transform any property data found
            const properties = this.transformToPropertyListings(response.data, criteria);
            if (properties.length > 0) {
              console.log(`[MLS-Client] Found ${properties.length} properties from ${endpoint}`);
              return { listings: properties, totalCount: Math.max(totalCount, properties.length) };
            }
          }

        } catch (error: any) {
          console.log(`[MLS-Client] ${endpoint} failed:`, error.response?.status);
          continue;
        }
      }

      // If no property data found but we know properties exist, return the count
      console.log(`[MLS-Client] No property listings found, but ${totalCount} properties available in MLS`);
      return { listings: [], totalCount };

    } catch (error: any) {
      console.error('[MLS-Client] Error searching actual properties:', error.message);
      return { listings: [], totalCount: 0 };
    }
  }

  private async searchPropertiesByCity(criteria: MLSPropertySearch, cityData: any[]): Promise<{ listings: MLSProperty[], totalCount: number }> {
    console.log(`[MLS-Client] Processing city data for property search`);
    
    // Extract property information from city data if available
    const properties: MLSProperty[] = [];
    let totalCount = 0;

    for (const city of cityData) {
      if (city && typeof city === 'object') {
        // Check if city matches search criteria
        if (criteria.city && city.cityName && 
            !city.cityName.toLowerCase().includes(criteria.city.toLowerCase())) {
          continue;
        }

        // Extract property count for this city
        const cityPropertyCount = city.count || city.propertyCount || 0;
        totalCount += cityPropertyCount;
        
        console.log(`[MLS-Client] City ${city.cityName || 'Unknown'}: ${cityPropertyCount} properties`);
      }
    }

    console.log(`[MLS-Client] Total properties found across matching cities: ${totalCount}`);
    return { listings: properties, totalCount };
  }

  private transformToPropertyListings(data: any, criteria: MLSPropertySearch): MLSProperty[] {
    const properties: MLSProperty[] = [];

    if (!data) return properties;

    // Handle different data formats
    const itemsToProcess = Array.isArray(data) ? data : [data];

    for (const item of itemsToProcess) {
      if (!item || typeof item !== 'object') continue;

      // Extract property information if available
      const property: Partial<MLSProperty> = {};

      // Map common property fields
      property.listingId = item.id || item.listingId || item.idxID || '';
      property.address = item.address || item.streetAddress || '';
      property.city = item.city || item.cityName || '';
      property.state = item.state || '';
      property.zipCode = item.zipCode || item.zipcode || '';
      property.price = parseFloat(item.price || item.listPrice || '0');
      property.bedrooms = parseInt(item.bedrooms || item.beds || '0');
      property.bathrooms = parseFloat(item.bathrooms || item.baths || item.totalBaths || '0');
      property.sqft = parseInt(item.sqft || item.sqFt || item.squareFeet || '0');
      property.propertyType = item.propertyType || item.propType || 'Single Family Residence';
      property.description = item.description || item.remarks || '';
      property.status = item.status || 'Active';
      property.mlsNumber = item.mlsNumber || item.mlsID || '';
      property.listingAgent = item.agent || item.listingAgent || '';
      property.listingOffice = item.office || item.listingOffice || '';
      property.listedDate = item.listDate || new Date().toISOString();
      property.images = item.images || (item.image ? [item.image] : []);

      // Only add if we have essential property data
      if (property.listingId && property.address) {
        properties.push(property as MLSProperty);
      }
    }

    return properties;
  }
}

export const mlsClientAPI = new MLSClientAPI();