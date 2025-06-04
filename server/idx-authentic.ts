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
    // Extract property data from HTML structure
    const propertyMatches = html.match(/<div[^>]*class="[^"]*property-item[^"]*"[^>]*>[\s\S]*?<\/div>/g);
    
    if (!propertyMatches) {
      console.log('[IDX-Authentic] No property items found in HTML');
      return properties;
    }

    for (const propertyHtml of propertyMatches) {
      try {
        const listing = extractPropertyData(propertyHtml);
        if (listing && listing.listingId) {
          properties.push(listing);
        }
      } catch (error) {
        console.error('[IDX-Authentic] Error parsing individual property:', error);
      }
    }

    console.log(`[IDX-Authentic] Successfully parsed ${properties.length} properties from HTML`);
  } catch (error) {
    console.error('[IDX-Authentic] Error parsing properties from HTML:', error);
  }

  return properties;
}

/**
 * Extract individual property data from HTML
 */
function extractPropertyData(html: string): IdxListing | null {
  try {
    // Extract listing ID
    const idMatch = html.match(/data-listing-id="([^"]+)"/);
    const listingId = idMatch ? idMatch[1] : '';

    // Extract address
    const addressMatch = html.match(/<div[^>]*class="[^"]*address[^"]*"[^>]*>([^<]+)</);
    const address = addressMatch ? addressMatch[1].trim() : '';

    // Extract price
    const priceMatch = html.match(/[\$]([0-9,]+)/);
    const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0;

    // Extract bedrooms
    const bedroomMatch = html.match(/(\d+)\s*(?:bed|br|bedroom)/i);
    const bedrooms = bedroomMatch ? parseInt(bedroomMatch[1]) : 0;

    // Extract bathrooms
    const bathroomMatch = html.match(/(\d+(?:\.\d+)?)\s*(?:bath|ba|bathroom)/i);
    const bathrooms = bathroomMatch ? parseFloat(bathroomMatch[1]) : 0;

    // Extract square footage
    const sqftMatch = html.match(/([0-9,]+)\s*(?:sq\.?\s*ft|sqft|square feet)/i);
    const sqft = sqftMatch ? parseInt(sqftMatch[1].replace(/,/g, '')) : 0;

    if (!listingId || !address || price === 0) {
      return null;
    }

    return {
      listingId,
      address,
      city: extractCity(address),
      state: extractState(address),
      zipCode: extractZipCode(address),
      price,
      bedrooms,
      bathrooms,
      sqft,
      propertyType: 'Residential',
      images: [],
      description: '',
      listedDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('[IDX-Authentic] Error extracting property data:', error);
    return null;
  }
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