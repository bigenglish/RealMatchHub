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
export interface PropertySearchCriteria {
  // Basic pagination and limits
  limit?: number;
  offset?: number;
  
  // Location filters
  city?: string;
  state?: string;
  zipCode?: string;
  county?: string;
  neighborhood?: string;
  mls?: string;
  
  // Price filters
  minPrice?: number;
  maxPrice?: number;
  
  // Property basics
  bedrooms?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  bathrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  propertyType?: string; // sfr, condo, townhouse, mobile, land, etc.
  
  // Size and lot
  minSquareFeet?: number;
  maxSquareFeet?: number;
  minLotSize?: number;
  maxLotSize?: number;
  minAcres?: number;
  maxAcres?: number;
  
  // Property features
  garage?: boolean;
  parking?: number; // Number of parking spaces
  pool?: boolean;
  poolType?: string; // "In Ground", "Above Ground", "Spa/Hot Tub"
  waterfront?: boolean;
  fireplace?: boolean;
  basement?: boolean;
  
  // Building details
  yearBuilt?: number;
  minYearBuilt?: number;
  maxYearBuilt?: number;
  stories?: number;
  architectural?: string;
  
  // Listing status and timing
  status?: string; // Active, Pending, Sold, etc.
  daysOnMarket?: number;
  maxDaysOnMarket?: number;
  newConstruction?: boolean;
  
  // Financial
  hoa?: boolean;
  maxHOA?: number;
  taxAmount?: number;
  maxTaxAmount?: number;
  
  // Investment/rental specific
  rental?: boolean;
  cashFlow?: number;
  capRate?: number;
  
  // Accessibility and special needs
  seniorCommunity?: boolean;
  wheelchair?: boolean;
  
  // Energy and environment
  energyEfficient?: boolean;
  solar?: boolean;
  greenCertified?: boolean;
  
  // School districts (important for families)
  schoolDistrict?: string;
  elementarySchool?: string;
  middleSchool?: string;
  highSchool?: string;
  
  // Sorting and ordering
  sortBy?: string; // price, date, sqft, beds, etc.
  sortOrder?: 'asc' | 'desc';
}

export async function fetchIdxListings(criteria: PropertySearchCriteria = {}): Promise<IdxListingsResponse> {
  const {
    limit = 100,
    offset = 0,
    city = '',
    state = '',
    zipCode = '',
    county = '',
    neighborhood = '',
    mls = '',
    minPrice = 0,
    maxPrice = 0,
    bedrooms,
    minBedrooms,
    maxBedrooms,
    bathrooms,
    minBathrooms,
    maxBathrooms,
    propertyType = '',
    minSquareFeet,
    maxSquareFeet,
    minLotSize,
    maxLotSize,
    minAcres,
    maxAcres,
    garage,
    parking,
    pool,
    poolType,
    waterfront,
    fireplace,
    basement,
    yearBuilt,
    minYearBuilt,
    maxYearBuilt,
    stories,
    architectural,
    status,
    daysOnMarket,
    maxDaysOnMarket,
    newConstruction,
    hoa,
    maxHOA,
    taxAmount,
    maxTaxAmount,
    rental,
    cashFlow,
    capRate,
    seniorCommunity,
    wheelchair,
    energyEfficient,
    solar,
    greenCertified,
    schoolDistrict,
    elementarySchool,
    middleSchool,
    highSchool,
    sortBy,
    sortOrder
  } = criteria;
  try {
    console.log(`[IDX-HomesAI] Fetching listings from homesai.net.idxbroker.com, limit: ${limit}`);

    // Build comprehensive search parameters for IDX Broker
    const searchParams = new URLSearchParams();
    
    // Core property filters
    searchParams.append('pt', propertyType || 'sfr'); // Property type: sfr, condo, townhouse, mobile, land
    
    // Price range
    if (minPrice || maxPrice) {
      searchParams.append('lp', String(minPrice || 0)); // Low price
      searchParams.append('hp', String(maxPrice || 10000000)); // High price
    } else {
      // Default price range if none specified
      searchParams.append('lp', '200000');
      searchParams.append('hp', '800000');
    }
    
    // Bedrooms - support exact, min, and max
    if (bedrooms) searchParams.append('bd', String(bedrooms));
    if (minBedrooms) searchParams.append('mnbd', String(minBedrooms));
    if (maxBedrooms) searchParams.append('mxbd', String(maxBedrooms));
    
    // Bathrooms - support exact, min, and max
    if (bathrooms) searchParams.append('ba', String(bathrooms));
    if (minBathrooms) searchParams.append('mnba', String(minBathrooms));
    if (maxBathrooms) searchParams.append('mxba', String(maxBathrooms));
    
    // Square footage
    if (minSquareFeet) searchParams.append('sf', String(minSquareFeet));
    if (maxSquareFeet) searchParams.append('msf', String(maxSquareFeet));
    
    // Lot size
    if (minLotSize) searchParams.append('ls', String(minLotSize));
    if (maxLotSize) searchParams.append('mls', String(maxLotSize));
    
    // Acres
    if (minAcres) searchParams.append('ac', String(minAcres));
    if (maxAcres) searchParams.append('mac', String(maxAcres));
    
    // Location filters
    if (city) searchParams.append('ccz', 'city'); // City/County/Zip search
    if (zipCode) searchParams.append('zip', zipCode);
    if (county) searchParams.append('county', county);
    if (neighborhood) searchParams.append('area', neighborhood);
    if (mls) searchParams.append('idxID', mls);
    
    // Year built
    if (yearBuilt) searchParams.append('yr', String(yearBuilt));
    if (minYearBuilt) searchParams.append('mnyr', String(minYearBuilt));
    if (maxYearBuilt) searchParams.append('mxyr', String(maxYearBuilt));
    
    // Property features - using common IDX parameter patterns
    if (garage) searchParams.append('gar', '1'); // Has garage
    if (parking) searchParams.append('park', String(parking)); // Parking spaces
    if (pool) searchParams.append('pool', '1'); // Has pool
    if (poolType) searchParams.append('a_poolFeatures', poolType); // Pool type (like your example)
    if (waterfront) searchParams.append('wf', '1'); // Waterfront
    if (fireplace) searchParams.append('fp', '1'); // Fireplace
    if (basement) searchParams.append('bsmt', '1'); // Basement
    
    // Building details
    if (stories) searchParams.append('stories', String(stories));
    if (architectural) searchParams.append('arch', architectural);
    
    // Listing status and timing
    if (status) searchParams.append('status', status); // Active, Pending, Sold
    if (maxDaysOnMarket) searchParams.append('dom', String(maxDaysOnMarket));
    if (newConstruction) searchParams.append('new', '1');
    
    // Financial filters
    if (hoa) searchParams.append('hoa', '1');
    if (maxHOA) searchParams.append('mhoa', String(maxHOA));
    if (maxTaxAmount) searchParams.append('mtax', String(maxTaxAmount));
    
    // Investment/rental specific
    if (rental) searchParams.append('rental', '1');
    if (cashFlow) searchParams.append('cf', String(cashFlow));
    if (capRate) searchParams.append('cap', String(capRate));
    
    // Accessibility and special needs
    if (seniorCommunity) searchParams.append('senior', '1');
    if (wheelchair) searchParams.append('accessible', '1');
    
    // Energy and environment
    if (energyEfficient) searchParams.append('energy', '1');
    if (solar) searchParams.append('solar', '1');
    if (greenCertified) searchParams.append('green', '1');
    
    // School districts (critical for family buyers)
    if (schoolDistrict) searchParams.append('school', schoolDistrict);
    if (elementarySchool) searchParams.append('elem', elementarySchool);
    if (middleSchool) searchParams.append('middle', middleSchool);
    if (highSchool) searchParams.append('high', highSchool);
    
    // Sorting
    if (sortBy) {
      searchParams.append('sb', sortBy); // Sort by: price, date, sqft, beds, etc.
      if (sortOrder) searchParams.append('so', sortOrder); // asc or desc
    }
    
    // Pagination
    if (offset > 0) searchParams.append('start', String(offset));
    if (limit !== 100) searchParams.append('count', String(Math.min(limit, 100)));

    const searchUrl = `https://homesai.idxbroker.com/idx/results/listings?${searchParams.toString()}`;
    
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
        const mapSearchUrl = `https://homesai.idxbroker.com/idx/map/mapsearch?${searchParams.toString()}`;
        
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

    // Look for IDX property listing elements in the HTML
    $('.IDX-resultsCell').each((index, element) => {
      const $element = $(element);
      
      // Extract property data from IDX HTML structure
      const listingId = $element.attr('data-listingid') || `homesai-${index}`;
      const idxId = $element.attr('data-idxid') || 'd025';
      const price = parseFloat($element.attr('data-price') || '0') || 0;
      
      // Extract address components
      const addressNumber = $element.find('.IDX-resultsAddressNumber').text().trim();
      const addressName = $element.find('.IDX-resultsAddressName').text().trim();
      const city = $element.find('.IDX-resultsAddressCity').text().trim();
      const state = $element.find('.IDX-resultsAddressState, .IDX-resultsAddressStateAbrv').text().trim();
      const zip = $element.find('.IDX-resultsAddressZip').text().trim();
      
      const fullAddress = `${addressNumber}${addressName}, ${city}, ${state} ${zip}`.trim();
      
      // Extract property details
      const priceText = $element.find('.IDX-field-listingPrice .IDX-text, .IDX-field-price .IDX-text').text().trim();
      const listPrice = price || parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;
      
      // Look for bedrooms and bathrooms in various possible locations
      const bedrooms = parseInt($element.find('.IDX-field-bedrooms .IDX-text, .IDX-field-beds .IDX-text').text().replace(/\D/g, '')) || 
                     parseInt($element.text().match(/(\d+)\s*bed/i)?.[1] || '0') || 0;
      
      const totalBaths = parseFloat($element.find('.IDX-field-totalBaths .IDX-text, .IDX-field-baths .IDX-text').text().replace(/[^\d.]/g, '')) ||
                        parseFloat($element.text().match(/(\d+(?:\.\d+)?)\s*bath/i)?.[1] || '0') || 0;
      
      // Extract square footage
      const sqFt = parseInt($element.find('.IDX-field-sqFt .IDX-text').text().replace(/\D/g, '')) ||
                   parseInt($element.text().match(/(\d{3,})\s*sq\s*ft/i)?.[1] || '0') || 0;
      
      // Extract property type and status
      const propStatus = $element.find('.IDX-field-propStatus .IDX-resultsText').text().trim() || 'Active';
      const propType = $element.find('.IDX-field-propType .IDX-resultsText').text().trim() || 'Residential';
      
      // Extract description
      const description = $element.find('.IDX-resultsDescription').text().trim();
      
      // Extract image
      const imageElement = $element.find('.IDX-resultsPhotoImg, .IDX-resultsPhoto img').first();
      const image = imageElement.attr('data-src') || imageElement.attr('src') || '';
      
      // Extract listing date (if available)
      const listDate = $element.find('.IDX-field-listDate .IDX-resultsText').text().trim() || new Date().toISOString();
      
      const listing = {
        idxID: listingId,
        idxMLS: idxId,
        address: fullAddress || `${addressNumber}${addressName}`.trim(),
        listPrice: listPrice,
        bedrooms: bedrooms,
        totalBaths: totalBaths,
        sqFt: sqFt,
        propType: propType,
        propStatus: propStatus,
        image: image,
        remarksConcat: description,
        listDate: listDate,
        // Additional IDX-specific fields
        city: city,
        state: state.replace('California', 'CA').trim(),
        zipcode: zip,
        latitude: parseFloat($element.attr('data-lat') || '0'),
        longitude: parseFloat($element.attr('data-lng') || '0')
      };

      // Only add if we have essential data (listing ID and either address or price)
      if (listing.idxID && (listing.address || listing.listPrice > 0)) {
        listings.push(listing);
        console.log(`[IDX-HomesAI] Found property: ${listing.idxID} - ${listing.address} - $${listing.listPrice}`);
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
    const testUrl = 'https://homesai.idxbroker.com/idx/results/listings?lp=500000&hp=600000';
    
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