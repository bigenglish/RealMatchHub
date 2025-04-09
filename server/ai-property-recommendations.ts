import axios from 'axios';
import { storage } from './storage';
import { Property } from '../shared/schema';
import { UserPreferences } from '../client/src/components/property-questionnaire';

// Import Gemini API
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Function to get a Google Gemini client
function getGoogleGeminiClient() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_GEMINI_API_KEY is not configured");
    return null;
  }
  
  return new GoogleGenerativeAI(apiKey);
}

type PropertyWithScore = Property & {
  aiMatchScore: number;
  aiMatchReason: string;
};

export async function generatePropertyRecommendations(
  preferences: UserPreferences
): Promise<PropertyWithScore[]> {
  try {
    // 1. Get all available properties
    const allProperties = await getAllProperties();
    
    if (!allProperties || allProperties.length === 0) {
      console.warn('No properties available for AI recommendations.');
      return [];
    }
    
    // 2. Filter properties based on basic criteria (location, bedrooms, etc.)
    const filteredProperties = filterPropertiesByBasicCriteria(allProperties, preferences);
    
    if (filteredProperties.length === 0) {
      console.warn('No properties match basic criteria for recommendations.');
      return [];
    }
    
    // 3. Generate AI match scores and reasons
    const scoredProperties = await scorePropertiesWithAI(filteredProperties, preferences);
    
    // 4. Sort by AI match score (descending)
    scoredProperties.sort((a, b) => b.aiMatchScore - a.aiMatchScore);
    
    // 5. Return top recommendations (up to 6)
    return scoredProperties.slice(0, 6);
  } catch (error) {
    console.error('Error generating property recommendations:', error);
    throw new Error('Failed to generate property recommendations');
  }
}

async function getAllProperties(): Promise<Property[]> {
  try {
    // Get properties from storage
    const yourProperties = storage.getProperties();
    
    // Get IDX properties
    const idxProperties = await getIDXProperties();
    
    // Combine and return all properties
    return [...yourProperties, ...idxProperties];
  } catch (error) {
    console.error('Error getting all properties:', error);
    return [];
  }
}

async function getIDXProperties(): Promise<Property[]> {
  try {
    // We don't actually have IDX properties in storage yet, so this is a fallback
    // In a real implementation, we would fetch this from the IDX API or a database
    
    // Return an empty array or a sample property if needed
    return [];
  } catch (error) {
    console.error('Error getting IDX properties:', error);
    return [];
  }
}

function filterPropertiesByBasicCriteria(
  properties: Property[],
  preferences: UserPreferences
): Property[] {
  return properties.filter(property => {
    // Filter by location (if specified)
    if (preferences.location && property.city && property.address &&
        !property.city.toLowerCase().includes(preferences.location.toLowerCase()) && 
        !property.address.toLowerCase().includes(preferences.location.toLowerCase())) {
      return false;
    }
    
    // Filter by property type (if specified)
    if (preferences.propertyType && 
        property.propertyType.toLowerCase() !== preferences.propertyType.toLowerCase()) {
      return false;
    }
    
    // Filter by bedrooms (if specified)
    if (preferences.bedrooms && preferences.bedrooms > 0 && property.bedrooms < preferences.bedrooms) {
      return false;
    }

    // Filter by bathrooms (if specified) 
    if (preferences.bathrooms && preferences.bathrooms > 0 && property.bathrooms < preferences.bathrooms) {
      return false;
    }
    
    // Filter by budget (if specified)
    if (preferences.budget?.max && property.price > preferences.budget.max) {
      return false;
    }
    
    if (preferences.budget?.min && property.price < preferences.budget.min) {
      return false;
    }
    
    // Property passes all filters
    return true;
  });
}

async function scorePropertiesWithAI(
  properties: Property[],
  preferences: UserPreferences
): Promise<PropertyWithScore[]> {
  // If no inspiration photos, use rule-based scoring
  if (!preferences.inspirationPhotos || preferences.inspirationPhotos.length === 0) {
    return scorePropertiesRuleBased(properties, preferences);
  }
  
  try {
    // Use Google Gemini AI to analyze the properties and inspiration photos
    return await scorePropertiesWithGeminiAI(properties, preferences);
  } catch (error) {
    console.error('Error using Gemini AI for scoring:', error);
    // Fallback to rule-based scoring
    return scorePropertiesRuleBased(properties, preferences);
  }
}

function scorePropertiesRuleBased(
  properties: Property[],
  preferences: UserPreferences
): PropertyWithScore[] {
  return properties.map(property => {
    let score = 70; // Base score
    let matchReasons: string[] = [];
    
    // Score based on location match
    if (preferences.location && property.city && property.address && 
        (property.city.toLowerCase().includes(preferences.location.toLowerCase()) || 
         property.address.toLowerCase().includes(preferences.location.toLowerCase()))) {
      score += 5;
      matchReasons.push(`Located in your desired area (${preferences.location})`);
    }
    
    // Score based on property type match
    if (preferences.propertyType && 
        property.propertyType.toLowerCase() === preferences.propertyType.toLowerCase()) {
      score += 5;
      matchReasons.push(`Your preferred property type (${preferences.propertyType})`);
    }
    
    // Score based on bedrooms match
    if (preferences.bedrooms && property.bedrooms >= preferences.bedrooms) {
      score += 5;
      matchReasons.push(`Has ${property.bedrooms} bedrooms (you wanted ${preferences.bedrooms}+)`);
    }
    
    // Score based on bathrooms match
    if (preferences.bathrooms && property.bathrooms >= preferences.bathrooms) {
      score += 5;
      matchReasons.push(`Has ${property.bathrooms} bathrooms (you wanted ${preferences.bathrooms}+)`);
    }
    
    // Price match bonus
    if (preferences.budget) {
      const midBudget = (preferences.budget.min + preferences.budget.max) / 2;
      const priceDifference = Math.abs(property.price - midBudget) / midBudget;
      
      if (priceDifference < 0.1) { // Within 10% of mid budget
        score += 10;
        matchReasons.push('Price aligns perfectly with your budget');
      } else if (priceDifference < 0.2) { // Within 20% of mid budget
        score += 5;
        matchReasons.push('Price is close to your budget');
      }
    }
    
    // Cap score at 100
    score = Math.min(score, 100);
    
    // Generate match reason text
    let matchReason = matchReasons.length > 0 
      ? matchReasons.slice(0, 2).join('. ') 
      : 'Matches your general search criteria';
    
    return {
      ...property,
      aiMatchScore: Math.round(score),
      aiMatchReason: matchReason
    };
  });
}

async function scorePropertiesWithGeminiAI(
  properties: Property[],
  preferences: UserPreferences
): Promise<PropertyWithScore[]> {
  const gemini = getGoogleGeminiClient();
  
  if (!gemini) {
    console.warn('Gemini AI client not available, falling back to rule-based scoring');
    return scorePropertiesRuleBased(properties, preferences);
  }
  
  const model = 'gemini-pro-vision';
  const resultsPromises = properties.map(async (property) => {
    try {
      // Prepare the prompt
      const propertyDetails = `
        Property: ${property.title}
        Address: ${property.address}, ${property.city}, ${property.state}
        Type: ${property.propertyType}
        Price: $${property.price.toLocaleString()}
        Bedrooms: ${property.bedrooms}
        Bathrooms: ${property.bathrooms}
        Size: ${property.sqft} sq ft
        Description: ${property.description || 'No description available'}
      `;
      
      // User preferences
      const userPrefs = `
        User wants: ${preferences.intent === 'buying' ? 'To buy a property' : 
                     preferences.intent === 'selling' ? 'To sell a property' : 'To buy and sell properties'}
        Location preference: ${preferences.location || 'Any'}
        Property type preference: ${preferences.propertyType || 'Any'}
        Bedrooms needed: ${preferences.bedrooms || 'Any'}
        Bathrooms needed: ${preferences.bathrooms || 'Any'}
        Budget range: ${preferences.budget ? `$${preferences.budget.min.toLocaleString()} - $${preferences.budget.max.toLocaleString()}` : 'Not specified'}
        Timeline: ${preferences.timeframe || 'Not specified'}
      `;
      
      // Take only the first inspiration photo to avoid hitting token limits
      const inspirationPhoto = preferences.inspirationPhotos && preferences.inspirationPhotos.length > 0 
        ? preferences.inspirationPhotos[0] 
        : null;
      
      // Combine into final prompt
      const promptText = `
        I'm going to show you a property listing and details about what a user is looking for in a home, including their style preferences.
        
        ${propertyDetails}
        
        Here are the user's preferences:
        ${userPrefs}
        
        ${inspirationPhoto ? "I'm also showing you an inspiration photo that represents the user's style preferences." : ""}
        
        Based on this information, please:
        1. Analyze how well this property matches the user's requirements.
        2. If an inspiration photo is provided, analyze how well the property's style might match their preferences.
        3. Rate the overall match on a scale of 0-100 (higher is better).
        4. Provide 1-2 specific reasons why this property would be a good match.
        
        Format your response as a JSON object with the following structure:
        {
          "matchScore": number,
          "matchReason": "string"
        }
      `;
      
      // Create the content parts array - this format is compatible with Google Generative AI SDK
      const parts = [];
      
      // Add text prompt
      parts.push({ text: promptText });
      
      // Add inspiration photo if available
      if (inspirationPhoto) {
        try {
          // Extract base64 data
          const base64Data = inspirationPhoto.split(',')[1];
          
          // Add as a file part in the format supported by the Gemini API
          // Note: The exact format will depend on the specific Google Generative AI SDK version
          parts.push({ 
            text: 'Inspiration photo:',
            // The imageData field would be populated differently based on SDK
            // For example, some SDKs may use fileData, or pass as a separate parameter
          });
        } catch (photoError) {
          console.warn('Error processing inspiration photo:', photoError);
        }
      }
      
      // Add property image if available
      if (property.images && property.images.length > 0) {
        try {
          // For now, we'll just mention the image URL in the prompt
          parts.push({ 
            text: `Property image URL: ${property.images[0]}`
          });
          
          // Note: In production, you would fetch and process the image:
          // const imageResponse = await axios.get(property.images[0], { responseType: 'arraybuffer' });
          // const base64 = Buffer.from(imageResponse.data).toString('base64');
          // Then add it as a file part in the format supported by the Gemini API
        } catch (imageError) {
          console.warn('Could not process property image for AI analysis:', imageError);
        }
      }
      
      // Call Gemini API
      const result = await gemini.generateContent({
        contents: [{ role: 'user', parts: parts }],
      });
      
      const response = result.response;
      const responseText = response.text();
      
      // Parse the JSON response
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON object found in response');
        }
        
        const jsonResponse = JSON.parse(jsonMatch[0]);
        
        return {
          ...property,
          aiMatchScore: Math.min(Math.max(Math.round(jsonResponse.matchScore), 0), 100),
          aiMatchReason: jsonResponse.matchReason
        };
      } catch (jsonError) {
        console.error('Error parsing Gemini response as JSON:', jsonError, responseText);
        
        // Extract score and reason using regex as fallback
        const scoreMatch = responseText.match(/(\d+)\/100|matchScore["\s:]+(\d+)/i);
        const score = scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2]) : 70;
        
        const reasonMatch = responseText.match(/matchReason["\s:]+["']([^"']+)["']/i);
        let reason = reasonMatch ? reasonMatch[1] : 'Matches your search criteria';
        
        if (!reasonMatch) {
          // Try to extract a sentence about why it's a good match
          const sentenceMatch = responseText.match(/would be a good match[:\s]+([^\.]+)/i);
          if (sentenceMatch) {
            reason = sentenceMatch[1].trim();
          }
        }
        
        return {
          ...property,
          aiMatchScore: Math.min(Math.max(Math.round(score), 0), 100),
          aiMatchReason: reason
        };
      }
    } catch (error) {
      console.error('Error scoring property with Gemini:', error);
      
      // Fallback scoring for this property
      const ruleBased = scorePropertiesRuleBased([property], preferences)[0];
      return ruleBased;
    }
  });
  
  return Promise.all(resultsPromises);
}