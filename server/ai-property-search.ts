/**
 * AI-powered property search service
 * Processes user's style preferences and practical requirements to find matching properties
 */

import { VertexAI } from '@google-cloud/vertexai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { storage } from './storage';
import { calculateCommuteTime } from './google-places';

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// Define types for property search
export interface PropertySearchQuery {
  inspirationImages?: string[]; // Base64 encoded images
  stylePreferences: {
    style: string;
    features: string[];
  };
  keywords?: string; // Added keyword search capabilities
  locationPreferences: {
    location: string;
    commuteDestination?: string;
    maxCommuteTime?: number;
    transportationMode?: 'car' | 'transit' | 'bike' | 'walk';
  };
  propertyRequirements: {
    minPrice?: number;
    maxPrice?: number;
    propertyType?: string;
    minBedrooms?: number;
    minBathrooms?: number;
    minSquareFeet?: number;
  };
}

export interface PropertyMatch {
  id: string;
  title: string;
  price: number;
  address: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  description: string;
  styleMatch: number; // Match percentage
  commuteTime?: number; // In minutes
  features: string[];
}

/**
 * Analyzes an inspiration image to extract style attributes
 * @param imageBase64 Base64 encoded image
 * @returns Object containing style attributes
 */
export async function analyzeStyleFromImage(imageBase64: string): Promise<any> {
  try {
    // Remove data URL prefix if present
    const base64Content = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    // Create a multimodal model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    // Prepare the image parts for the multimodal request
    const imageParts = [
      {
        inlineData: {
          data: base64Content,
          mimeType: 'image/jpeg',
        },
      },
    ];

    // Generate content with the multimodal model
    const result = await model.generateContent([
      'Analyze this image of a home and extract the following architectural and design elements:\n' +
      '1. Architectural style (e.g., modern, traditional, farmhouse, etc.)\n' +
      '2. Exterior features (e.g., type of siding, roof style, windows)\n' +
      '3. Color palette\n' +
      '4. Notable design elements\n' +
      'Return the information in JSON format with these keys: style, exteriorFeatures, colorPalette, notableElements',
      ...imageParts,
    ]);

    const response = await result.response;
    const responseText = response.text();

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const styleData = JSON.parse(jsonMatch[0]);
        return styleData;
      } catch (parseError) {
        console.error('Failed to parse JSON from Gemini response:', parseError);

        // Fallback: extract key information from text
        return extractStyleDataFromText(responseText);
      }
    } else {
      console.error('Could not find JSON in Gemini response');
      return extractStyleDataFromText(responseText);
    }
  } catch (error) {
    console.error('Error analyzing image with Gemini:', error);
    throw new Error('Failed to analyze home style from image');
  }
}

/**
 * Extract structured style data from unstructured text response
 */
function extractStyleDataFromText(text: string): any {
  const styleData: any = {
    style: '',
    exteriorFeatures: [],
    colorPalette: [],
    notableElements: []
  };

  // Extract architectural style
  const styleMatch = text.match(/style:?\s*([^,\n.]+)/i);
  if (styleMatch) {
    styleData.style = styleMatch[1].trim();
  }

  // Extract exterior features
  const exteriorMatch = text.match(/exterior features:?\s*([^\n.]+)/i);
  if (exteriorMatch) {
    styleData.exteriorFeatures = exteriorMatch[1]
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  // Extract color palette
  const colorMatch = text.match(/color palette:?\s*([^\n.]+)/i);
  if (colorMatch) {
    styleData.colorPalette = colorMatch[1]
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  // Extract notable elements
  const elementsMatch = text.match(/notable elements:?\s*([^\n.]+)/i);
  if (elementsMatch) {
    styleData.notableElements = elementsMatch[1]
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  return styleData;
}

/**
 * Generates a style profile based on multiple inspiration images and explicit preferences
 * @param images Array of base64 encoded images
 * @param explicitStyle User's explicitly stated style preference
 * @param features User's selected features
 * @returns Consolidated style profile
 */
export async function generateStyleProfile(
  images: string[] = [], 
  explicitStyle: string = '',
  features: string[] = []
): Promise<any> {
  try {
    // Analyze all provided images
    const imageAnalysisPromises = images.map(img => analyzeStyleFromImage(img));
    const imageAnalysisResults = await Promise.all(imageAnalysisPromises);

    // Consolidate results from multiple images
    const consolidatedProfile = {
      primaryStyle: explicitStyle || mostCommonElement(imageAnalysisResults.map(r => r.style)),
      exteriorFeatures: uniqueElements(imageAnalysisResults.flatMap(r => r.exteriorFeatures || [])),
      colorPalette: uniqueElements(imageAnalysisResults.flatMap(r => r.colorPalette || [])),
      notableElements: uniqueElements(imageAnalysisResults.flatMap(r => r.notableElements || [])),
      mustHaveFeatures: features
    };

    return consolidatedProfile;
  } catch (error) {
    console.error('Error generating style profile:', error);
    throw new Error('Failed to generate style profile from inspiration images');
  }
}

/**
 * Find most common element in an array
 */
function mostCommonElement(arr: string[]): string {
  if (!arr.length) return '';

  const counts = arr.reduce((acc: Record<string, number>, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * Get unique elements from an array
 */
function uniqueElements(arr: string[]): string[] {
  return [...new Set(arr)];
}

/**
 * Search for properties matching the user's style profile and requirements
 * @param query User's search query
 * @returns Array of matching properties
 */
export async function findMatchingProperties(query: PropertySearchQuery): Promise<PropertyMatch[]> {
  try {
    // Generate style profile from inspiration images and explicit preferences
    const styleProfile = await generateStyleProfile(
      query.inspirationImages,
      query.stylePreferences.style,
      query.stylePreferences.features
    );

    // For demo purposes, use static property data from storage
    // In a real implementation, this would query a database or external API
    const allProperties = storage.getProperties();

    // Filter and score properties based on style match and requirements
    const matchedProperties = allProperties
      .filter((property: { [key: string]: any }) => {
        // Apply basic filters (price, beds, baths, etc.)
        if (query.propertyRequirements.minPrice && property.price < query.propertyRequirements.minPrice) {
          return false;
        }
        if (query.propertyRequirements.maxPrice && property.price > query.propertyRequirements.maxPrice) {
          return false;
        }
        if (query.propertyRequirements.minBedrooms && property.bedrooms < query.propertyRequirements.minBedrooms) {
          return false;
        }
        if (query.propertyRequirements.minBathrooms && property.bathrooms < query.propertyRequirements.minBathrooms) {
          return false;
        }
        if (query.propertyRequirements.propertyType && 
            property.propertyType !== query.propertyRequirements.propertyType) {
          return false;
        }

        // Apply keyword search if provided
        if (query.keywords && query.keywords.trim().length > 0) {
          const keywords = query.keywords.toLowerCase().trim().split(/\s+/);
          const propertyText = [
            property.title, 
            property.description, 
            property.address,
            property.city,
            property.state,
            property.propertyType,
            ...(property.features || [])
          ].filter(Boolean).join(' ').toLowerCase();

          // Check if all keywords appear in the property text
          const keywordMatches = keywords.filter(keyword => propertyText.includes(keyword));
          if (keywordMatches.length === 0) {
            return false;
          }
        }

        // Could add location filter here with geocoding
        return true;
      })
      .map(property => {
        // Calculate style match score (0-100)
        const styleMatchScore = calculateStyleMatch(styleProfile, property);

        // Calculate commute time if destination provided
        let commuteTime;
        if (query.locationPreferences.commuteDestination) {
          commuteTime = estimateCommuteTime(
            property.location,
            query.locationPreferences.commuteDestination,
            query.locationPreferences.transportationMode || 'car'
          );
        }

        return {
          ...property,
          styleMatch: styleMatchScore,
          commuteTime
        } as PropertyMatch;
      })
      .filter(async (property: { [key: string]: any }) => {
        // Filter by commute time if specified
        if (query.locationPreferences.maxCommuteTime && property.commuteTime) {
          return property.commuteTime <= query.locationPreferences.maxCommuteTime;
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by style match score (descending)
        return b.styleMatch - a.styleMatch;
      })
      .slice(0, 10); // Limit to top 10 matches

    return matchedProperties;
  } catch (error) {
    console.error('Error finding matching properties:', error);
    throw new Error('Failed to find matching properties');
  }
}

/**
 * Calculate style match score between a style profile and a property
 * @param styleProfile User's consolidated style profile
 * @param property Property to evaluate
 * @returns Match score from 0-100
 */
function calculateStyleMatch(styleProfile: any, property: any): number {
  // In a real implementation, this would be a more sophisticated algorithm
  // that compares multiple aspects of style and features

  let score = 0;
  const maxScore = 100;

  // Match primary style (30% of score)
  if (property.style && styleProfile.primaryStyle && 
      property.style.toLowerCase().includes(styleProfile.primaryStyle.toLowerCase())) {
    score += 30;
  }

  // Match features (50% of score)
  const userFeatures = styleProfile.mustHaveFeatures || [];
  if (userFeatures.length > 0 && property.features) {
    const matchedFeatures = userFeatures.filter((feature: string) => 
      property.features.some((f: string) => 
        f.toLowerCase().includes(feature.toLowerCase())
      )
    );

    score += Math.min(50, (matchedFeatures.length / userFeatures.length) * 50);
  } else {
    // If no specific features requested, give partial points
    score += 25;
  }

  // Match exterior elements and color palette (20% of score)
  const exteriorMatches = (styleProfile.exteriorFeatures || []).filter((feature: string) =>
    property.description.toLowerCase().includes(feature.toLowerCase())
  );

  const colorMatches = (styleProfile.colorPalette || []).filter((color: string) =>
    property.description.toLowerCase().includes(color.toLowerCase())
  );

  const elementsScore = 10 * (
    exteriorMatches.length / Math.max(1, styleProfile.exteriorFeatures?.length || 1) +
    colorMatches.length / Math.max(1, styleProfile.colorPalette?.length || 1)
  );

  score += Math.min(20, elementsScore);

  // Ensure score is between 0-100
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Estimate commute time between two locations
 * @param origin Property location
 * @param destination Work/school location
 * @param mode Transportation mode
 * @returns Estimated commute time in minutes
 */
async function estimateCommuteTime(
  origin: string,
  destination: string,
  mode: 'car' | 'transit' | 'bike' | 'walk'
): Promise<number> {
  try {
    console.log(`[ai-property-search] Calculating commute time from "${origin}" to "${destination}"`);

    // Convert our transportation modes to Google Maps API format
    const googleMapsMode = mode === 'car' ? 'driving' :
                          mode === 'transit' ? 'transit' :
                          mode === 'bike' ? 'bicycling' : 'walking';

    // Call the Google Places API to get commute time
    const commuteData = await calculateCommuteTime(
      origin,
      destination,
      googleMapsMode as 'driving' | 'transit' | 'bicycling' | 'walking'
    );

    if (commuteData) {
      // Convert seconds to minutes and round
      return Math.round(commuteData.durationValue / 60);
    }

    throw new Error('Failed to calculate commute time');
  } catch (error) {
    console.error('[ai-property-search] Error estimating commute time:', error);

    // Fall back to approximation if API call fails
    console.log('[ai-property-search] Using fallback commute time calculation');
    const baseTime = Math.floor(Math.random() * 20) + 10; // 10-30 minutes base time

    switch (mode) {
      case 'car':
        return baseTime;
      case 'transit':
        return baseTime * 1.5;
      case 'bike':
        return baseTime * 2;
      case 'walk':
        return baseTime * 4;
      default:
        return baseTime;
    }
  }
}