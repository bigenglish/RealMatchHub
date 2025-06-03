import axios from 'axios';
import * as cheerio from 'cheerio';

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

    // First try the JSON API endpoint
    const apiEndpoints = [
      // Try JSON API format
      {
        url: 'https://homesai.net.idxbroker.com/idx/api/search',
        params: Object.fromEntries(searchParams)
      },
      // Try results page with JSON format
      {
        url: `https://homesai.net.idxbroker.com/idx/results/listings`,
        params: {
          ...Object.fromEntries(searchParams),
          format: 'json'
        }
      }
    ];

    let response = null;
    let successfulEndpoint = null;

    // Try API endpoints first
    for (const endpoint of apiEndpoints) {
      try {
        console.log(`[IDX-HomesAI] Trying API endpoint: ${endpoint.url}`);
        
        response = await axios.get(endpoint.url, {
          params: endpoint.params,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/html, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          timeout: 15000,
          httpsAgent: new (require('https').Agent)({
            rejectUnauthorized: false,
            secureProtocol: 'TLSv1_2_method'
          })
        });

        if (response.status === 200 && response.data) {
          console.log(`[IDX-HomesAI] API response type: ${typeof response.data}`);
          
          // Check if we got JSON data with properties
          if (typeof response.data === 'object' && !response.data.includes?.('<html>')) {
            console.log(`[IDX-HomesAI] Got JSON response from ${endpoint.url}`);
            successfulEndpoint = endpoint.url;
            break;
          }
        }
        
      } catch (error: any) {
        console.log(`[IDX-HomesAI] API endpoint failed: ${endpoint.url} - ${error.response?.status || error.message}`);
        continue;
      }
    }

    // If API endpoints fail, scrape the HTML results page
    if (!response || !successfulEndpoint) {
      console.log('[IDX-HomesAI] API endpoints failed, trying HTML scraping');
      
      try {
        response = await axios.get(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; HomesAI/1.0)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          timeout: 15000
        });

        if (response.status === 200 && response.data && typeof response.data === 'string') {
          console.log(`[IDX-HomesAI] Got HTML response, parsing for property data`);
          successfulEndpoint = searchUrl;
          
          // Parse HTML for property listings
          const propertyData = parsePropertyListingsFromHTML(response.data);
          if (propertyData.length > 0) {
            response.data = propertyData;
          }
        }
        
      } catch (htmlError: any) {
        console.log(`[IDX-HomesAI] HTML scraping failed: ${htmlError.message}`);
      }
    }

    // If still no data, try the map search endpoint
    if (!response || !response.data || (Array.isArray(response.data) && response.data.length === 0)) {
      console.log('[IDX-HomesAI] Trying map search endpoint');
      
      try {
        const mapSearchUrl = `https://homesai.net.idxbroker.com/idx/map/mapsearch?${searchParams.toString()}`;
        
        response = await axios.get(mapSearchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; HomesAI/1.0)',
            'Accept': 'application/json, text/html'
          },
          timeout: 15000
        });

        if (response.status === 200 && response.data) {
          console.log(`[IDX-HomesAI] Map search returned data`);
          successfulEndpoint = mapSearchUrl;
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
    $('.listing-item, .property-item, .search-result').each((index, element) => {
      const $element = $(element);
      
      // Extract property data from HTML elements
      const listing = {
        idxID: $element.attr('data-listing-id') || $element.find('[data-listing-id]').attr('data-listing-id'),
        address: $element.find('.address, .listing-address').text().trim(),
        listPrice: parseFloat($element.find('.price, .listing-price').text().replace(/[^\d.]/g, '')) || 0,
        bedrooms: parseInt($element.find('.beds, .bedrooms').text().replace(/\D/g, '')) || 0,
        totalBaths: parseFloat($element.find('.baths, .bathrooms').text().replace(/[^\d.]/g, '')) || 0,
        sqFt: parseInt($element.find('.sqft, .square-feet').text().replace(/\D/g, '')) || 0,
        propType: $element.find('.property-type').text().trim() || 'Residential',
        image: $element.find('img').attr('src') || '',
        remarksConcat: $element.find('.description, .remarks').text().trim(),
        listDate: $element.find('.list-date').text().trim() || new Date().toISOString()
      };

      // Only add if we have essential data
      if (listing.address && listing.listPrice > 0) {
        listings.push(listing);
      }
    });

    // Also check for JSON data embedded in script tags
    $('script').each((index, element) => {
      const scriptContent = $(element).html();
      if (scriptContent && scriptContent.includes('listings') && scriptContent.includes('idxID')) {
        try {
          // Try to extract JSON data from script tags
          const jsonMatch = scriptContent.match(/listings["\']?\s*:\s*(\[.*?\])/s);
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[1]);
            if (Array.isArray(jsonData)) {
              listings.push(...jsonData);
            }
          }
        } catch (jsonError) {
          // Ignore JSON parsing errors
        }
      }
    });

    console.log(`[IDX-HomesAI] Parsed ${listings.length} listings from HTML`);
    return listings;
  } catch (parseError) {
    console.log(`[IDX-HomesAI] HTML parsing failed: ${parseError}`);
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
        'User-Agent': 'Mozilla/5.0 (compatible; HomesAI/1.0)'
      },
      timeout: 8000
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