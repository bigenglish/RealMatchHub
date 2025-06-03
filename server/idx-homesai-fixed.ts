import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

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

// Create a reusable HTTPS agent with relaxed SSL settings
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  secureProtocol: 'TLSv1_2_method'
});

/**
 * Fetch property listings using your working homesai.net.idxbroker.com URLs
 */
export async function fetchIdxListings({ 
  limit = 100, 
  offset = 0, 
  city = '', 
  minPrice = 0, 
  maxPrice = 0,
  bedrooms,
  bathrooms,
  propertyType = ''
}: { 
  limit?: number; 
  offset?: number; 
  city?: string; 
  minPrice?: number; 
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
} = {}): Promise<IdxListingsResponse> {
  try {
    console.log(`[IDX-HomesAI] Fetching listings from homesai.net.idxbroker.com, limit: ${limit}`);

    // Use the working URL patterns you provided
    const searchParams = new URLSearchParams();
    
    // Property type: sfr (single family residential) as default
    searchParams.append('pt', propertyType || 'sfr');
    
    // Price range - use defaults if not specified
    searchParams.append('lp', String(minPrice || 200000)); // Low price
    searchParams.append('hp', String(maxPrice || 800000)); // High price
    
    // Additional filters
    if (bedrooms) searchParams.append('bd', String(bedrooms));
    if (bathrooms) searchParams.append('ba', String(bathrooms));
    if (city) searchParams.append('ccz', 'city');
    
    // Pagination
    if (offset > 0) searchParams.append('start', String(offset));
    if (limit !== 100) searchParams.append('count', String(Math.min(limit, 100)));

    const searchUrl = `https://homesai.net.idxbroker.com/idx/results/listings?${searchParams.toString()}`;
    
    console.log(`[IDX-HomesAI] Searching: ${searchUrl}`);

    // Standard headers that work well with IDX Broker
    const standardHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache'
    };

    // Try the direct results page first (your working example)
    let response = null;
    let successfulEndpoint = null;

    try {
      console.log(`[IDX-HomesAI] Trying direct results page: ${searchUrl}`);
      
      response = await axios.get(searchUrl, {
        headers: standardHeaders,
        timeout: 15000,
        httpsAgent
      });

      if (response.status === 200 && response.data && typeof response.data === 'string') {
        console.log(`[IDX-HomesAI] Got HTML response from results page`);
        successfulEndpoint = searchUrl;
        
        // Parse HTML for property listings
        const propertyData = parsePropertyListingsFromHTML(response.data);
        if (propertyData.length > 0) {
          console.log(`[IDX-HomesAI] Parsed ${propertyData.length} properties from HTML`);
          response.data = propertyData;
        } else {
          console.log(`[IDX-HomesAI] No properties found in HTML, checking for embedded JSON`);
          // Try to extract JSON from script tags or data attributes
          const jsonData = extractJSONFromHTML(response.data);
          if (jsonData && jsonData.length > 0) {
            response.data = jsonData;
          }
        }
      }
    } catch (directError: any) {
      console.log(`[IDX-HomesAI] Direct results page failed: ${directError.message}`);
    }

    // Try map search endpoint if direct results fail
    if (!response || !response.data || (Array.isArray(response.data) && response.data.length === 0)) {
      console.log('[IDX-HomesAI] Trying map search endpoint');
      
      try {
        const mapSearchUrl = `https://homesai.net.idxbroker.com/idx/map/mapsearch?${searchParams.toString()}`;
        
        response = await axios.get(mapSearchUrl, {
          headers: {
            ...standardHeaders,
            'Accept': 'application/json, text/html, */*'
          },
          timeout: 15000,
          httpsAgent
        });

        if (response.status === 200 && response.data) {
          console.log(`[IDX-HomesAI] Map search returned data`);
          successfulEndpoint = mapSearchUrl;
          
          // Try to parse JSON if it's an API response
          if (typeof response.data === 'object') {
            console.log(`[IDX-HomesAI] Got JSON response from map search`);
          } else if (typeof response.data === 'string') {
            const jsonData = extractJSONFromHTML(response.data);
            if (jsonData && jsonData.length > 0) {
              response.data = jsonData;
            }
          }
        }
      } catch (mapError: any) {
        console.log(`[IDX-HomesAI] Map search failed: ${mapError.message}`);
      }
    }

    // If still no data, return empty result
    if (!response || !response.data) {
      console.error('[IDX-HomesAI] All endpoints failed to return property data');
      return {
        listings: [],
        totalCount: 0,
        hasMoreListings: false
      };
    }

    console.log(`[IDX-HomesAI] Processing response from: ${successfulEndpoint}`);
    return transformIdxResponse(response.data);
  } catch (error) {
    console.error('[IDX-HomesAI] Error fetching listings:', error);
    throw new Error('Failed to fetch IDX listings from HomesAI integration');
  }
}

/**
 * Parse property listings from HTML response
 */
function parsePropertyListingsFromHTML(html: string): any[] {
  try {
    const $ = cheerio.load(html);
    const listings: any[] = [];

    // Look for property listing elements in the HTML
    $('.listing-item, .property-item, .search-result, .listing-wrap, .idx-listing').each((index, element) => {
      const $element = $(element);
      
      // Extract property data from HTML elements
      const listing = {
        idxID: $element.attr('data-listing-id') || 
               $element.find('[data-listing-id]').attr('data-listing-id') ||
               $element.attr('data-listingid') ||
               `homesai-${index}`,
        address: $element.find('.address, .listing-address, .street-address').text().trim(),
        listPrice: parseFloat($element.find('.price, .listing-price, .list-price').text().replace(/[^\d.]/g, '')) || 0,
        bedrooms: parseInt($element.find('.beds, .bedrooms, .bed-count').text().replace(/\D/g, '')) || 0,
        totalBaths: parseFloat($element.find('.baths, .bathrooms, .bath-count').text().replace(/[^\d.]/g, '')) || 0,
        sqFt: parseInt($element.find('.sqft, .square-feet, .sq-ft').text().replace(/\D/g, '')) || 0,
        propType: $element.find('.property-type, .prop-type').text().trim() || 'Residential',
        image: $element.find('img').first().attr('src') || '',
        remarksConcat: $element.find('.description, .remarks, .listing-desc').text().trim(),
        listDate: $element.find('.list-date, .date-listed').text().trim() || new Date().toISOString()
      };

      // Only add if we have essential data
      if (listing.address && listing.listPrice > 0) {
        listings.push(listing);
      }
    });

    console.log(`[IDX-HomesAI] Parsed ${listings.length} listings from HTML elements`);
    return listings;
  } catch (parseError) {
    console.log(`[IDX-HomesAI] HTML parsing failed: ${parseError}`);
    return [];
  }
}

/**
 * Extract JSON data embedded in HTML script tags or data attributes
 */
function extractJSONFromHTML(html: string): any[] {
  try {
    const $ = cheerio.load(html);
    let listings: any[] = [];

    // Check for JSON data in script tags
    $('script').each((index, element) => {
      const scriptContent = $(element).html();
      if (scriptContent && (scriptContent.includes('listings') || scriptContent.includes('properties'))) {
        try {
          // Try to extract JSON data from various patterns
          const patterns = [
            /listings["\']?\s*:\s*(\[.*?\])/s,
            /properties["\']?\s*:\s*(\[.*?\])/s,
            /searchResults["\']?\s*:\s*(\[.*?\])/s,
            /var\s+listings\s*=\s*(\[.*?\]);/s,
            /window\.listings\s*=\s*(\[.*?\]);/s
          ];

          for (const pattern of patterns) {
            const jsonMatch = scriptContent.match(pattern);
            if (jsonMatch) {
              const jsonData = JSON.parse(jsonMatch[1]);
              if (Array.isArray(jsonData) && jsonData.length > 0) {
                listings.push(...jsonData);
                console.log(`[IDX-HomesAI] Found ${jsonData.length} listings in script tag`);
                break;
              }
            }
          }
        } catch (jsonError) {
          // Ignore JSON parsing errors
        }
      }
    });

    return listings;
  } catch (error) {
    console.log(`[IDX-HomesAI] JSON extraction failed: ${error}`);
    return [];
  }
}

/**
 * Transform IDX response to our application format
 */
function transformIdxResponse(data: any): IdxListingsResponse {
  console.log('[IDX-HomesAI] Transforming HomesAI response');
  
  if (!data) {
    return { listings: [], totalCount: 0, hasMoreListings: false };
  }

  let listings: any[] = [];

  // Handle different response formats
  if (Array.isArray(data)) {
    listings = data;
  } else if (data.results && Array.isArray(data.results)) {
    listings = data.results;
  } else if (data.listings && Array.isArray(data.listings)) {
    listings = data.listings;
  } else if (data.properties && Array.isArray(data.properties)) {
    listings = data.properties;
  } else if (typeof data === 'object') {
    // Check for any array properties that might contain listings
    const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]) && data[key].length > 0);
    if (arrayKeys.length > 0) {
      listings = data[arrayKeys[0]];
      console.log(`[IDX-HomesAI] Found listings in property: ${arrayKeys[0]}`);
    }
  }

  console.log(`[IDX-HomesAI] Found ${listings.length} items to process`);

  // Filter and transform each listing
  const transformedListings: IdxListing[] = listings
    .filter((item: any) => {
      // Filter out invalid entries
      return item && (item.idxID || item.listingID || item.address || item.listPrice);
    })
    .map((item: any, index: number) => {
      // Handle different possible field names
      const id = item.idxID || item.listingID || item.id || `homesai-${index}`;
      const address = item.address || item.streetAddress || item.fullAddress || 'Address not available';
      const city = item.cityName || item.city || extractCityFromAddress(address);
      const state = item.state || item.stateAbbr || 'CA';
      const zipCode = item.zipcode || item.zip || item.postalCode || extractZipFromAddress(address);
      const price = parseFloat(item.listPrice || item.price || '0') || 0;
      const bedrooms = parseInt(item.bedrooms || item.beds || '0') || 0;
      const bathrooms = parseFloat(item.totalBaths || item.baths || item.bathrooms || '0') || 0;
      const sqft = parseInt(item.sqFt || item.squareFeet || item.livingArea || '0') || 0;
      const propertyType = item.propType || item.propertyType || 'Residential';
      const description = item.remarksConcat || item.description || item.remarks || '';
      const listedDate = item.listDate || item.dateAdded || new Date().toISOString();
      
      // Handle images
      let images: string[] = [];
      if (item.image && typeof item.image === 'string') {
        images = [item.image];
      } else if (Array.isArray(item.images)) {
        images = item.images;
      } else if (Array.isArray(item.image)) {
        images = item.image;
      }

      return {
        listingId: id,
        address,
        city,
        state,
        zipCode,
        price,
        bedrooms,
        bathrooms,
        sqft,
        propertyType,
        images,
        description,
        listedDate
      };
    });

  console.log(`[IDX-HomesAI] Successfully transformed ${transformedListings.length} listings`);
  
  if (transformedListings.length > 0) {
    console.log('[IDX-HomesAI] Sample transformed listing:', {
      id: transformedListings[0].listingId,
      address: transformedListings[0].address,
      price: transformedListings[0].price,
      bedrooms: transformedListings[0].bedrooms
    });
  }

  return {
    listings: transformedListings,
    totalCount: transformedListings.length,
    hasMoreListings: transformedListings.length >= 100
  };
}

/**
 * Extract city from address string
 */
function extractCityFromAddress(address: string): string {
  if (!address) return '';
  
  // Look for city pattern in address (before state abbreviation)
  const cityMatch = address.match(/,\s*([^,]+)\s+[A-Z]{2}\s+\d{5}/);
  if (cityMatch) {
    return cityMatch[1].trim();
  }
  
  // Fallback: split by comma and take second-to-last part
  const parts = address.split(',');
  if (parts.length >= 2) {
    return parts[parts.length - 2].trim();
  }
  
  return '';
}

/**
 * Extract ZIP code from address string
 */
function extractZipFromAddress(address: string): string {
  if (!address) return '';
  
  // Look for 5-digit ZIP code
  const zipMatch = address.match(/\b\d{5}\b/);
  return zipMatch ? zipMatch[0] : '';
}

/**
 * Test HomesAI IDX connection
 */
export async function testIdxConnection(): Promise<{ success: boolean; message: string }> {
  try {
    // Test the working URL pattern you provided
    const testUrl = 'https://homesai.net.idxbroker.com/idx/results/listings?pt=sfr&lp=200000&hp=800000';
    
    const response = await axios.get(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 8000,
      httpsAgent
    });

    if (response.status === 200) {
      return { 
        success: true, 
        message: `HomesAI integration active. Connected to homesai.net.idxbroker.com`
      };
    } else {
      return { 
        success: false, 
        message: `HomesAI endpoint returned status: ${response.status}`
      };
    }
  } catch (error: any) {
    return { 
      success: false, 
      message: `HomesAI connection error: ${error.message}`
    };
  }
}