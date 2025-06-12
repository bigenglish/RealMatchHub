export async function fetchIdxListingsOfficial(criteria: PropertySearchCriteria): Promise<{ listings: IdxListing[], totalCount: number }> {
  const {
    limit = 50,
    offset = 0,
    minPrice,
    maxPrice,
    bedrooms,
    minBedrooms,
    bathrooms,
    minBathrooms,
    city,
    state,
    zipCode,
    propertyType
  } = criteria;

  try {
    console.log(`[IDX-Official] Fetching properties with criteria:`, JSON.stringify(criteria, null, 2));

    if (!process.env.IDX_BROKER_API_KEY) {
      throw new Error('IDX_BROKER_API_KEY is required for authentic MLS data access');
    }

    const apiKey = process.env.IDX_BROKER_API_KEY;
    console.log(`[IDX-Official] Using API key: ${apiKey.substring(0, 4)}...`);

    // Validate API key format
    if (!apiKey.startsWith('a') || apiKey.length !== 22) {
      console.warn(`[IDX-Official] API key format warning: Expected format 'a...' with 22 characters, got '${apiKey.substring(0, 4)}...' with ${apiKey.length} characters`);
    }

    const endpoints = [
      {
        name: 'Featured Properties',
        url: 'https://api.idxbroker.com/clients/featured',
        params: {
          rf: 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType,image,remarksConcat,listDate',
          limit: criteria.limit || 50
        }
      },
      {
        name: 'System Links',
        url: 'https://api.idxbroker.com/clients/systemlinks',
        params: {
          rf: 'url,name,category,systemresults'
        }
      },
      {
        name: 'Sold/Pending',
        url: 'https://api.idxbroker.com/clients/soldpending',
        params: {
          rf: 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType,image,remarksConcat,listDate',
          limit: criteria.limit || 50
        }
      },
      {
        name: 'Supplemental',
        url: 'https://api.idxbroker.com/clients/supplemental',
        params: {
          rf: 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType,image,remarksConcat,listDate',
          limit: criteria.limit || 50
        }
      }
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`[IDX-Official] Trying endpoint: ${endpoint.url}`);

        const headers = {
          'accesskey': apiKey,
          'outputtype': 'json'
        };

        const params = new URLSearchParams();

        // Build query parameters based on IDX API documentation
        const queryParams: any = {};

        // Always include return fields for property data
        queryParams.rf = 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType,image,remarksConcat,listDate,yearBuilt,lotSize,daysOnMarket,mlsID';

        if (limit) queryParams.limit = limit;
        if (offset) queryParams.offset = offset;

        // Price filters - use correct IDX parameter names
        if (minPrice) queryParams.lp = minPrice; // low price
        if (maxPrice) queryParams.hp = maxPrice; // high price

        // Bedroom/Bathroom filters - use correct IDX parameter names
        if (bedrooms) queryParams.bd = bedrooms;
        if (bathrooms) queryParams.tb = bathrooms; // total baths

        // Property type filter
        if (propertyType) {
          // Map common property types to IDX values
          const propertyTypeMap: { [key: string]: string } = {
            'sfr': '1', // Single Family Residential
            'condo': '2', // Condominium
            'townhouse': '3', // Townhouse
            'multi': '4' // Multi-family
          };
          queryParams.pt = propertyTypeMap[propertyType] || '1';
        }

        // Location filters - use array format for cities as per API docs
        if (city) {
          queryParams['city[]'] = city;
        }
        if (state) queryParams.state = state;
        if (zipCode) queryParams.zipcode = zipCode;

        for (const key in queryParams) {
          params.append(key, queryParams[key].toString());
        }

        const apiUrl = `${endpoint.url}?${params.toString()}`;
        console.log(`[IDX-Official] Full URL: ${apiUrl}`);

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers,
          timeout: 15000
        });

        console.log(`[IDX-Official] Response status: ${response.status} ${response.statusText}`);

        if (response.status === 200) {
          const responseText = await response.text();
          console.log(`[IDX-Official] Raw response length: ${responseText.length}`);

          if (!responseText.trim()) {
            console.log(`[IDX-Official] Empty response from ${endpoint.url}`);
            continue;
          }

          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error(`[IDX-Official] JSON parse error for ${endpoint.url}:`, parseError);
            continue;
          }

          let rawData = data;

          console.log(`[IDX-Official] Response status: ${response.status}, data type: ${typeof rawData}, is array: ${Array.isArray(rawData)}`);

          // Handle different response formats from IDX API
          if (Array.isArray(rawData) && rawData.length > 0) {
            console.log(`[IDX-Official] Found ${rawData.length} raw listings from ${endpoint.url}`);

            // Filter out invalid entries and transform
            const validProperties = rawData.filter(item => {
              return item &&
                     typeof item === 'object' &&
                     (item.idxID || item.listingID || item.address || item.listPrice) &&
                     item.address !== 'Address not available';
            });

            if (validProperties.length > 0) {
              const transformedProperties = validProperties.map((item, index) => this.transformIdxProperty(item, index));

              console.log(`[IDX-Official] Successfully transformed ${transformedProperties.length} valid properties from ${endpoint.url}`);

              const filteredListings = transformedProperties.filter(listing => listing !== null);

              return {
                listings: filteredListings,
                totalCount: filteredListings.length
              };
            } else {
              console.log(`[IDX-Official] No valid properties found in ${rawData.length} raw items from ${endpoint.url}`);
            }
          } else if (rawData && typeof rawData === 'object') {
            console.log(`[IDX-Official] Got object response from ${endpoint.url}, checking for nested data`);
            // Handle object responses that might contain arrays
            for (const key of ['listings', 'properties', 'results', 'data']) {
              if (rawData[key] && Array.isArray(rawData[key]) && rawData[key].length > 0) {
                const validProperties = rawData[key].filter((item: any) => {
                  return item &&
                         typeof item === 'object' &&
                         (item.idxID || item.listingID || item.address || item.listPrice) &&
                         item.address !== 'Address not available';
                });

                if (validProperties.length > 0) {
                  const transformedProperties = validProperties.map((item: any, index: number) => this.transformIdxProperty(item, index));

                  console.log(`[IDX-Official] Successfully transformed ${transformedProperties.length} properties from nested ${key} in ${endpoint.url}`);

                  const filteredListings = transformedProperties.filter(listing => listing !== null);

                  return {
                    listings: filteredListings,
                    totalCount: filteredListings.length
                  };
                }
              }
            }

            // If it's a systemlinks response, it might be link data instead of properties
            if (endpoint.name === 'System Links' && Object.keys(rawData).length > 0) {
              console.log(`[IDX-Official] System links endpoint returned configuration data, not properties`);
              continue; // Move to next endpoint for actual property data
            }
          }
        } else if (response.status === 401) {
          console.error(`[IDX-Official] 401 Unauthorized - API key may be invalid`);
        } else if (response.status === 406) {
          console.error(`[IDX-Official] 406 Not Acceptable - endpoint may not support this request format`);
        } else if (response.status === 204) {
          console.log(`[IDX-Official] HTTP 204 No Content from ${endpoint.url}`);
          continue;
        } else {
          console.log(`[IDX-Official] Unexpected response status ${response.status} from ${endpoint.url}`);
        }
      } catch (endpointError: any) {
        console.error(`[IDX-Official] Error with ${endpoint.url}:`, endpointError.message);
        continue;
      }
    }

    // If all endpoints failed, throw an error
    throw new Error('All IDX Broker API endpoints failed');

  } catch (error) {
    console.error('[IDX-Official] Error fetching listings:', error);
    throw error;
  }
}

// Helper function to extract city from address
function extractCityFromAddress(address: string): string {
  const parts = address.split(',');
  if (parts.length >= 2) {
    return parts[1].trim();
  }
  return 'Unknown City';
}

// Helper functions for generating realistic property data
function generateStreetName(): string {
  const streetNames = [
    'Oak', 'Pine', 'Maple', 'Cedar', 'Elm', 'Sunset', 'Main', 'Park', 'Hill', 'Valley',
    'Rose', 'Spring', 'River', 'Lake', 'Mountain', 'Garden', 'Forest', 'Meadow', 'Highland', 'Vista'
  ];
  return streetNames[Math.floor(Math.random() * streetNames.length)];
}

function generateStreetType(): string {
  const streetTypes = ['St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Way', 'Ct', 'Pl'];
  return streetTypes[Math.floor(Math.random() * streetTypes.length)];
}

function generateZipCode(city: string): string {
  // Generate realistic zip codes based on city
  if (city.toLowerCase().includes('los angeles')) {
    const laCodes = ['90210', '90211', '90212', '90401', '90402', '90403', '90404', '90405'];
    return laCodes[Math.floor(Math.random() * laCodes.length)];
  }
  return '9' + Math.floor(Math.random() * 9999).toString().padStart(4, '0');
}

function generateRealisticPrice(): number {
  // Generate prices between $400K - $2M for LA area
  return Math.floor(Math.random() * 1600000) + 400000;
}

function generatePropertyDescription(bedrooms: number, bathrooms: number, sqft: number, city: string): string {
  const features = [
    'updated kitchen', 'hardwood floors', 'granite countertops', 'stainless steel appliances',
    'private backyard', 'attached garage', 'modern fixtures', 'open floor plan',
    'large windows', 'walk-in closets', 'master suite', 'central air conditioning'
  ];

  const randomFeatures = features.sort(() => 0.5 - Math.random()).slice(0, 3);

  return `Beautiful ${bedrooms} bedroom, ${bathrooms} bathroom home in ${city}. This ${sqft} sq ft property features ${randomFeatures.join(', ')}. Perfect for those seeking comfort and style in a prime location.`;
}

// Define interfaces locally since they're not in shared schema
interface PropertySearchCriteria {
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
  [key: string]: any;
}

interface IdxListing {
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
  listingAgent: string;
  listingOffice: string;
}

  private transformIdxProperty(idxProperty: any, index: number): any {
    // Use IDX API standard field names as documented
    const listingId = idxProperty.idxID || idxProperty.listingID || idxProperty.id || `idx-${index}`;

    // Validate required fields
    if (!idxProperty.address || idxProperty.address === 'Address not available') {
      console.log(`[IDX-Official] Filtering out invalid property:`, idxProperty.address || 'No address');
      return null;
    }

    return {
      listingId,
      address: idxProperty.address || 'Address not available',
      city: idxProperty.cityName || idxProperty.city || 'Unknown',
      state: idxProperty.state || idxProperty.stateAbbr || 'Unknown',
      zipCode: idxProperty.zipcode || idxProperty.zipCode || idxProperty.zip || '',
      price: parseFloat(idxProperty.listPrice || idxProperty.price || '0'),
      bedrooms: parseInt(idxProperty.bedrooms || idxProperty.beds || '0'),
      bathrooms: parseFloat(idxProperty.totalBaths || idxProperty.baths || idxProperty.bathrooms || '0'),
      sqft: parseInt(idxProperty.sqFt || idxProperty.squareFeet || idxProperty.livingArea || '0'),
      propertyType: this.mapPropertyType(idxProperty.propType || idxProperty.propertyType || idxProperty.idxPropType),
      images: this.extractImages(idxProperty),
      description: idxProperty.remarksConcat || idxProperty.remarks || idxProperty.description || 'No description available',
      listedDate: idxProperty.listDate || idxProperty.dateAdded || new Date().toISOString().split('T')[0],
      status: idxProperty.status || idxProperty.propStatus || 'Active',
      mlsNumber: idxProperty.mlsID || idxProperty.mlsNumber || undefined,
      lotSize: parseInt(idxProperty.acreage || idxProperty.lotSize || '0') || undefined,
      yearBuilt: parseInt(idxProperty.yearBuilt || '0') || undefined,
      daysOnMarket: parseInt(idxProperty.daysOnMarket || '0') || undefined
    };
  }

  private mapPropertyType(type: string): string {
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
    let images: string[] = [];
    if (item.image && typeof item.image === 'string') {
      images = [item.image];
    } else if (Array.isArray(item.images)) {
      images = item.images;
    } else {
      // Generate placeholder image URLs
      images = [`https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`];
    }
    return images;
  }