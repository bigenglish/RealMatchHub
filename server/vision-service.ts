import { ImageAnnotatorClient } from '@google-cloud/vision';
import * as fs from 'fs';
import fetch from 'node-fetch';

let visionClient: ImageAnnotatorClient | null = null;

/**
 * Initialize the Google Vision API client
 */
export async function initializeVisionClient() {
  try {
    // Check if Google Cloud credentials are provided
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      console.error('[vision-service] Missing GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable');
      throw new Error('Missing Google Cloud credentials');
    }

    // Create the Vision client from JSON credentials
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    visionClient = new ImageAnnotatorClient({ credentials });

    console.log('[vision-service] Google Vision API client initialized successfully');
    return visionClient;
  } catch (error) {
    console.error('[vision-service] Failed to initialize Google Vision API client:', error);
    throw error;
  }
}

/**
 * Get the Vision API client (initializing if needed)
 */
async function getVisionClient(): Promise<ImageAnnotatorClient> {
  if (!visionClient) {
    return initializeVisionClient();
  }
  return visionClient;
}

/**
 * Analyze an image from a base64 encoded string
 * @param base64Image Base64 encoded image data
 * @returns Analysis results
 */
export async function analyzeImageFromBase64(base64Image: string) {
  try {
    const client = await getVisionClient();
    
    // Remove data URI prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    // Create a buffer from the base64 data
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Run various detection features
    const [labelDetection] = await client.labelDetection(imageBuffer);
    const [landmarkDetection] = await client.landmarkDetection(imageBuffer);
    const [imageProperties] = await client.imageProperties(imageBuffer);
    
    return {
      labelAnnotations: labelDetection?.labelAnnotations || [],
      landmarkAnnotations: landmarkDetection?.landmarkAnnotations || [],
      imagePropertiesAnnotation: imageProperties?.imagePropertiesAnnotation || {}
    };
  } catch (error) {
    console.error('[vision-service] Error analyzing image from base64:', error);
    throw error;
  }
}

/**
 * Analyze an image from a URL
 * @param imageUrl URL of the image
 * @returns Analysis results
 */
export async function analyzeImageFromUrl(imageUrl: string) {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
    }

    // Convert to buffer
    const imageBuffer = await response.buffer();
    
    // Use the Vision API to analyze the image
    const client = await getVisionClient();
    
    // Run various detection features
    const [labelDetection] = await client.labelDetection(imageBuffer);
    const [landmarkDetection] = await client.landmarkDetection(imageBuffer);
    const [imageProperties] = await client.imageProperties(imageBuffer);
    
    return {
      labelAnnotations: labelDetection?.labelAnnotations || [],
      landmarkAnnotations: landmarkDetection?.landmarkAnnotations || [],
      imagePropertiesAnnotation: imageProperties?.imagePropertiesAnnotation || {}
    };
  } catch (error) {
    console.error('[vision-service] Error analyzing image from URL:', error);
    throw error;
  }
}

// Architectural style mapping based on common labels
const architecturalStyleKeywords: Record<string, string[]> = {
  'modern': ['modern', 'contemporary', 'minimalist', 'sleek', 'glass', 'concrete', 'steel'],
  'traditional': ['traditional', 'classic', 'conventional', 'historic'],
  'craftsman': ['craftsman', 'bungalow', 'arts and crafts', 'handcrafted'],
  'mediterranean': ['mediterranean', 'spanish', 'tuscan', 'stucco', 'terracotta'],
  'colonial': ['colonial', 'georgian', 'symmetrical', 'columns'],
  'farmhouse': ['farmhouse', 'rural', 'barn', 'rustic', 'country'],
  'ranch': ['ranch', 'one-story', 'rambler', 'open floor plan'],
  'victorian': ['victorian', 'gothic', 'ornate', 'gingerbread', 'turret'],
  'mid-century': ['mid-century', 'midcentury', 'retro', '1950s', '1960s'],
  'cottage': ['cottage', 'cozy', 'quaint', 'charming'],
  'industrial': ['industrial', 'loft', 'warehouse', 'exposed brick', 'pipes'],
  'art deco': ['art deco', 'geometric', '1920s', '1930s']
};

// Interior style mapping based on common labels
const interiorStyleKeywords: Record<string, string[]> = {
  'modern': ['modern', 'contemporary', 'minimalist', 'clean lines', 'monochromatic'],
  'traditional': ['traditional', 'classic', 'elegant', 'symmetrical', 'formal'],
  'rustic': ['rustic', 'country', 'farmhouse', 'distressed', 'reclaimed wood'],
  'industrial': ['industrial', 'urban', 'warehouse', 'metal', 'exposed brick'],
  'scandinavian': ['scandinavian', 'nordic', 'hygge', 'light colors', 'functional'],
  'coastal': ['coastal', 'beach', 'nautical', 'light blue', 'white'],
  'bohemian': ['bohemian', 'boho', 'eclectic', 'colorful', 'ethnic'],
  'mid-century': ['mid-century', 'retro', 'vintage', '1950s', '1960s'],
  'art deco': ['art deco', 'glamorous', 'luxurious', 'geometric', 'metallic'],
  'transitional': ['transitional', 'balanced', 'mix', 'timeless']
};

// Design features based on common labels
const designFeatureKeywords: Record<string, string[]> = {
  'open concept': ['open concept', 'open floor plan', 'open space', 'flow'],
  'high ceilings': ['high ceilings', 'vaulted ceilings', 'cathedral ceiling', 'tall'],
  'natural light': ['natural light', 'sunlight', 'windows', 'bright', 'airy'],
  'hardwood floors': ['hardwood', 'wood floors', 'wooden floors', 'flooring'],
  'marble': ['marble', 'stone', 'granite', 'quartz'],
  'outdoor living': ['outdoor', 'patio', 'deck', 'terrace', 'balcony', 'garden'],
  'smart home': ['smart home', 'technology', 'automated', 'connected', 'digital'],
  'fireplace': ['fireplace', 'hearth', 'mantel', 'chimney'],
  'kitchen island': ['island', 'kitchen island', 'center island', 'bar'],
  'walk-in closet': ['walk-in', 'closet', 'storage', 'wardrobe'],
  'large windows': ['large windows', 'floor to ceiling windows', 'panoramic', 'view']
};

/**
 * Extract architectural styles from Vision API results
 * @param visionResult The Vision API analysis results
 * @returns Array of matched architectural styles
 */
export function extractArchitecturalStyles(visionResult: any) {
  const styles: string[] = [];
  const labels = visionResult?.labelAnnotations || [];
  
  // Get all label descriptions
  const labelTexts = labels.map((label: { description: string }) => label.description.toLowerCase());
  
  // Check each label against architectural style keywords
  for (const [style, keywords] of Object.entries(architecturalStyleKeywords)) {
    for (const keyword of keywords) {
      if (labelTexts.some((label: string) => label.includes(keyword))) {
        if (!styles.includes(style)) {
          styles.push(style);
        }
        break;
      }
    }
  }
  
  return styles;
}

/**
 * Extract interior design styles from Vision API results
 * @param visionResult The Vision API analysis results
 * @returns Array of matched interior styles
 */
export function extractInteriorStyles(visionResult: any) {
  const styles: string[] = [];
  const labels = visionResult?.labelAnnotations || [];
  
  // Get all label descriptions
  const labelTexts = labels.map((label: { description: string }) => label.description.toLowerCase());
  
  // Check each label against interior style keywords
  for (const [style, keywords] of Object.entries(interiorStyleKeywords)) {
    for (const keyword of keywords) {
      if (labelTexts.some((label: string) => label.includes(keyword))) {
        if (!styles.includes(style)) {
          styles.push(style);
        }
        break;
      }
    }
  }
  
  return styles;
}

/**
 * Extract color scheme from Vision API results
 * @param visionResult The Vision API analysis results
 * @returns Description of the color scheme
 */
export function extractColorScheme(visionResult: any) {
  try {
    const colors = visionResult?.imagePropertiesAnnotation?.dominantColors?.colors || [];
    
    if (colors.length === 0) {
      return '';
    }
    
    // Get the top 3 dominant colors
    const topColors = colors
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 3);
    
    // Convert RGB to color names (simplified version)
    const colorNames = topColors.map((color: any) => {
      const { red, green, blue } = color.color;
      
      // Very basic color naming
      if (red > 200 && green > 200 && blue > 200) return 'white';
      if (red < 50 && green < 50 && blue < 50) return 'black';
      if (red > 200 && green < 100 && blue < 100) return 'red';
      if (red < 100 && green > 150 && blue < 100) return 'green';
      if (red < 100 && green < 100 && blue > 200) return 'blue';
      if (red > 200 && green > 150 && blue < 100) return 'yellow';
      if (red > 200 && green < 100 && blue > 200) return 'pink';
      if (red < 100 && green > 150 && blue > 150) return 'teal';
      if (red > 150 && green > 75 && blue < 75) return 'orange';
      if (red > 100 && green < 100 && blue > 150) return 'purple';
      if (red > 150 && green > 150 && blue < 100) return 'gold';
      if (red > 150 && green > 100 && blue > 150) return 'lavender';
      return 'neutral';
    });
    
    // Generate a description of the color scheme
    const uniqueColors = [...new Set(colorNames)];
    
    if (uniqueColors.length === 1) {
      return `Predominantly ${uniqueColors[0]}`;
    }
    
    if (uniqueColors.length === 2) {
      return `${uniqueColors[0]} and ${uniqueColors[1]}`;
    }
    
    return `${uniqueColors[0]}, ${uniqueColors[1]}, and ${uniqueColors[2]}`;
  } catch (error) {
    console.error('[vision-service] Error extracting color scheme:', error);
    return '';
  }
}

/**
 * Extract design features from Vision API results
 * @param visionResult The Vision API analysis results
 * @returns Array of matched design features
 */
export function extractDesignFeatures(visionResult: any) {
  const features: string[] = [];
  const labels = visionResult?.labelAnnotations || [];
  
  // Get all label descriptions
  const labelTexts = labels.map((label: { description: string }) => label.description.toLowerCase());
  
  // Check each label against design feature keywords
  for (const [feature, keywords] of Object.entries(designFeatureKeywords)) {
    for (const keyword of keywords) {
      if (labelTexts.some((label: string) => label.includes(keyword))) {
        if (!features.includes(feature)) {
          features.push(feature);
        }
        break;
      }
    }
  }
  
  return features;
}