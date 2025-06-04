/**
 * Authentic IDX Broker Integration with Real Data
 * Removes duplicate properties and implements proper filtering
 */

import fetch from 'node-fetch';

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

export interface PropertySearchCriteria {
  limit?: number;
  offset?: number;
  city?: string;
  state?: string;
  zipCode?: string;
  county?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  bathrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  propertyType?: string;
  minSquareFeet?: number;
  maxSquareFeet?: number;
  pool?: boolean;
  poolType?: string;
  garage?: boolean;
  waterfront?: boolean;
  fireplace?: boolean;
  newConstruction?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Build URL with proper filter parameters for IDX Broker
 */
function buildSearchUrl(criteria: PropertySearchCriteria = {}, page: number = 1): string {
  const baseUrl = 'https://homesai.idxbroker.com/idx/results/listings';
  const searchParams = new URLSearchParams();

  // Core pagination
  searchParams.append('p', String(page));
  searchParams.append('count', '50');

  // Property type
  if (criteria.propertyType) {
    searchParams.append('pt', criteria.propertyType);
  }

  // Price filters
  if (criteria.minPrice && criteria.minPrice > 0) {
    searchParams.append('lp', String(criteria.minPrice));
  }
  if (criteria.maxPrice && criteria.maxPrice > 0) {
    searchParams.append('hp', String(criteria.maxPrice));
  }

  // Bedroom filters
  if (criteria.bedrooms) {
    searchParams.append('bd', String(criteria.bedrooms));
  }
  if (criteria.minBedrooms) {
    searchParams.append('mnbd', String(criteria.minBedrooms));
  }
  if (criteria.maxBedrooms) {
    searchParams.append('mxbd', String(criteria.maxBedrooms));
  }

  // Bathroom filters
  if (criteria.bathrooms) {
    searchParams.append('ba', String(criteria.bathrooms));
  }
  if (criteria.minBathrooms) {
    searchParams.append('mnba', String(criteria.minBathrooms));
  }
  if (criteria.maxBathrooms) {
    searchParams.append('mxba', String(criteria.maxBathrooms));
  }

  // Square footage
  if (criteria.minSquareFeet) {
    searchParams.append('mnsqft', String(criteria.minSquareFeet));
  }
  if (criteria.maxSquareFeet) {
    searchParams.append('mxsqft', String(criteria.maxSquareFeet));
  }

  // Location filters
  if (criteria.city) {
    searchParams.append('city', criteria.city);
  }
  if (criteria.state) {
    searchParams.append('state', criteria.state);
  }
  if (criteria.zipCode) {
    searchParams.append('zip', criteria.zipCode);
  }

  // Feature filters
  if (criteria.pool) {
    searchParams.append('pool', '1');
  }
  if (criteria.garage) {
    searchParams.append('garage', '1');
  }
  if (criteria.waterfront) {
    searchParams.append('waterfront', '1');
  }
  if (criteria.fireplace) {
    searchParams.append('fireplace', '1');
  }

  const url = `${baseUrl}?${searchParams.toString()}`;
  console.log(`[IDX-Authentic] Building URL: ${url}`);
  return url;
}

/**
 * Parse property listings from IDX HTML response
 */
function parsePropertiesFromHtml(html: string): IdxListing[] {
  const properties: IdxListing[] = [];
  
  try {
    // Split HTML by property cells for more accurate parsing
    const cellPattern = /<div[^>]*class="[^"]*IDX-resultsCell[^"]*"[^>]*>/g;
    const cells = html.split(cellPattern);
    
    console.log(`[IDX-Authentic] Found ${cells.length - 1} potential property cells`);
    
    // Process each cell (skip first element which is before the first match)
    for (let i = 1; i < cells.length; i++) {
      try {
        const cellHtml = cells[i];
        
        // Extract basic property data using more flexible patterns
        const listingId = extractValue(cellHtml, /data-listingid="([^"]+)"/);
        const price = extractPrice(cellHtml);
        const bedrooms = extractBedrooms(cellHtml);
        const bathrooms = extractBathrooms(cellHtml);
        const address = extractAddress(cellHtml);
        
        if (listingId && price > 0 && address) {
          const listing: IdxListing = {
            listingId,
            address,
            city: extractCity(address),
            state: extractState(address),
            zipCode: extractZipCode(address),
            price,
            bedrooms,
            bathrooms,
            sqft: extractSqft(cellHtml),
            propertyType: 'Residential',
            images: [],
            description: '',
            listedDate: new Date().toISOString()
          };
          
          properties.push(listing);
          console.log(`[IDX-Authentic] Parsed: ${listingId} - ${address} - $${price.toLocaleString()}`);
        }
      } catch (error) {
        console.error('[IDX-Authentic] Error parsing cell:', error);
      }
    }

    console.log(`[IDX-Authentic] Successfully parsed ${properties.length} properties`);
  } catch (error) {
    console.error('[IDX-Authentic] Error parsing properties from HTML:', error);
  }

  return properties;
}

/**
 * Extract value using regex pattern
 */
function extractValue(html: string, pattern: RegExp): string {
  const match = html.match(pattern);
  return match ? match[1].trim() : '';
}

/**
 * Extract price from property HTML
 */
function extractPrice(html: string): number {
  const patterns = [
    /IDX-text">\$([0-9,]+)<\/span>/,
    /\$([0-9,]+)/,
    /Price[^>]*>[\s\S]*?\$([0-9,]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''));
    }
  }
  return 0;
}

/**
 * Extract bedrooms from property HTML
 */
function extractBedrooms(html: string): number {
  const patterns = [
    /IDX-field-bedrooms[\s\S]*?IDX-text">(\d+)</,
    /(\d+)\s*Bedroom/i,
    /(\d+)\s*bed/i
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  return 0;
}

/**
 * Extract bathrooms from property HTML
 */
function extractBathrooms(html: string): number {
  const patterns = [
    /IDX-field-totalBaths[\s\S]*?IDX-text">(\d+(?:\.\d+)?)</,
    /(\d+(?:\.\d+)?)\s*Total Baths/i,
    /(\d+(?:\.\d+)?)\s*bath/i
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  return 0;
}

/**
 * Extract square footage from property HTML
 */
function extractSqft(html: string): number {
  const patterns = [
    /IDX-field-sqFt[\s\S]*?IDX-text">\s*([0-9,]+)/,
    /([0-9,]+)\s*SqFt/i,
    /([0-9,]+)\s*sq\.?\s*ft/i
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''));
    }
  }
  return 0;
}

/**
 * Extract address from property HTML
 */
function extractAddress(html: string): string {
  const patterns = [
    /IDX-resultsAddressNumber">([^<]*)<\/span>[\s\S]*?IDX-resultsAddressName">([^<]*)<\/span>/,
    /IDX-resultsAddress[\s\S]*?<h4>(.*?)<\/h4>/,
    /<h4[^>]*>(.*?)<\/h4>/
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      if (match.length > 2) {
        // Reconstruct address from components
        return `${match[1]} ${match[2]}`.trim();
      } else {
        // Clean up full address
        return match[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      }
    }
  }
  return '';
}



/**
 * Extract city from address
 */
function extractCity(address: string): string {
  const parts = address.split(',');
  if (parts.length >= 2) {
    return parts[1].trim();
  }
  return '';
}

/**
 * Extract state from address
 */
function extractState(address: string): string {
  const stateMatch = address.match(/,\s*([A-Z]{2})\s+\d{5}/);
  return stateMatch ? stateMatch[1] : 'CA';
}

/**
 * Extract ZIP code from address
 */
function extractZipCode(address: string): string {
  const zipMatch = address.match(/\b(\d{5})\b/);
  return zipMatch ? zipMatch[1] : '';
}

/**
 * Fetch properties with proper filtering and duplicate removal
 */
export async function fetchIdxListings(criteria: PropertySearchCriteria = {}): Promise<IdxListingsResponse> {
  const { limit = 50, offset = 0 } = criteria;
  const page = Math.floor(offset / 25) + 1;
  
  console.log(`[IDX-Authentic] Fetching page ${page} with criteria:`, JSON.stringify(criteria, null, 2));
  
  try {
    const url = buildSearchUrl(criteria, page);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const listings = parsePropertiesFromHtml(html);
    
    console.log(`[IDX-Authentic] Successfully fetched ${listings.length} listings from page ${page}`);
    
    return {
      listings: listings.slice(0, limit),
      totalCount: listings.length,
      hasMoreListings: listings.length >= 25
    };
    
  } catch (error) {
    console.error('[IDX-Authentic] Error fetching listings:', error);
    return {
      listings: [],
      totalCount: 0,
      hasMoreListings: false
    };
  }
}

/**
 * Fetch all available properties with duplicate removal
 */
export async function fetchAllIdxListings(criteria: PropertySearchCriteria = {}): Promise<IdxListingsResponse> {
  const allListings: IdxListing[] = [];
  const seenIds = new Set<string>();
  const maxPages = 20;
  
  console.log('[IDX-Authentic] Starting comprehensive property fetch with duplicate removal');
  
  for (let page = 1; page <= maxPages; page++) {
    try {
      const pageResults = await fetchIdxListings({ 
        ...criteria, 
        offset: (page - 1) * 25, 
        limit: 25 
      });
      
      if (pageResults.listings.length === 0) {
        console.log(`[IDX-Authentic] No listings on page ${page}, stopping`);
        break;
      }
      
      // Filter duplicates
      const uniqueListings = pageResults.listings.filter(listing => {
        if (seenIds.has(listing.listingId)) {
          return false;
        }
        seenIds.add(listing.listingId);
        return true;
      });
      
      allListings.push(...uniqueListings);
      
      console.log(`[IDX-Authentic] Page ${page}: ${uniqueListings.length} unique properties (${pageResults.listings.length - uniqueListings.length} duplicates removed). Total: ${allListings.length}`);
      
      // Stop if we're getting too many duplicates
      if (uniqueListings.length === 0 && page > 3) {
        console.log('[IDX-Authentic] Too many duplicates, stopping pagination');
        break;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`[IDX-Authentic] Error on page ${page}:`, error);
      break;
    }
  }
  
  console.log(`[IDX-Authentic] Completed fetch: ${allListings.length} unique properties`);
  
  return {
    listings: allListings,
    totalCount: allListings.length,
    hasMoreListings: false
  };
}