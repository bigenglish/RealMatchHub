import { VertexAI } from '@google-cloud/vertexai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Property } from '../shared/schema';

// Create __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Extended property type with additional fields used in IDX Broker API
export interface IDXProperty extends Partial<Property> {
  city?: string;
  state?: string;
  zipCode?: string;
}

// Initialize Vertex AI with credentials from environment variable
let vertexAi: VertexAI;
let projectId: string;
let location: string;

try {
  // Parse the credentials JSON from environment variable
  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}');
  projectId = credentials.project_id || 'default-project';
  location = 'us-central1'; // Default region for Vertex AI
  
  // Create credentials file from environment variable
  const tempCredentialsPath = path.join(__dirname, 'temp-credentials.json');
  fs.writeFileSync(tempCredentialsPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}');
  
  // Set the environment variable to point to the file
  process.env.GOOGLE_APPLICATION_CREDENTIALS = tempCredentialsPath;
  
  // Initialize Vertex AI
  vertexAi = new VertexAI({
    project: projectId,
    location: location,
  });
  
  console.log(`[express] Vertex AI initialized for project: ${projectId}`);
} catch (error) {
  console.error('[express] Failed to initialize Vertex AI:', error);
}

/**
 * Predicts property price based on its features
 * @param property Property details
 * @returns Predicted price and confidence score
 */
export async function predictPropertyPrice(property: IDXProperty): Promise<{ 
  predictedPrice: number, 
  confidence: number 
}> {
  try {
    if (!vertexAi) {
      throw new Error('Vertex AI not initialized');
    }

    // Generate a prompt for the Gemini model to predict the price
    const prompt = `
      Based on the following property features, predict the market price:
      
      Location: ${property.city}, ${property.state}
      Property Type: ${property.propertyType}
      Bedrooms: ${property.bedrooms}
      Bathrooms: ${property.bathrooms}
      Square Feet: ${property.sqft || 'Unknown'}
      
      Please respond only with a JSON object in this exact format: 
      {"predictedPrice": number, "confidence": number between 0 and 1, "reasoning": "brief explanation"}
    `;

    // Access generative AI model (Gemini)
    const generativeModel = vertexAi.preview.getGenerativeModel({
      model: 'gemini-pro',
    });

    // Generate content
    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    const response = result.response;
    const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{.*\}/s);
    if (!jsonMatch) {
      throw new Error('Failed to parse prediction response');
    }
    
    const prediction = JSON.parse(jsonMatch[0]);
    return {
      predictedPrice: prediction.predictedPrice || property.price || 0,
      confidence: prediction.confidence || 0.7,
    };
  } catch (error) {
    console.error('[express] Error predicting property price:', error);
    // Fallback to the current price or estimated value
    return {
      predictedPrice: property.price || 250000,
      confidence: 0.5,
    };
  }
}

/**
 * Generates an enhanced property description based on features
 * @param property Property details
 * @returns Enhanced marketing description
 */
export async function generatePropertyDescription(property: IDXProperty): Promise<string> {
  try {
    if (!vertexAi) {
      throw new Error('Vertex AI not initialized');
    }

    // Generate a prompt for the Gemini model to create a description
    const prompt = `
      Generate a compelling real estate description for the following property:
      
      Location: ${property.city}, ${property.state}
      Property Type: ${property.propertyType}
      Bedrooms: ${property.bedrooms}
      Bathrooms: ${property.bathrooms}
      Square Feet: ${property.sqft || 'Unknown'}
      Price: $${property.price?.toLocaleString() || 'Unknown'}
      
      The description should be engaging, highlight the property's features, and be around 150 words.
      Do not include the price in the description.
    `;

    // Access generative AI model (Gemini)
    const generativeModel = vertexAi.preview.getGenerativeModel({
      model: 'gemini-pro',
    });

    // Generate content
    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    const response = result.response;
    const description = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return description.trim();
  } catch (error) {
    console.error('[express] Error generating property description:', error);
    // Return the original description or a generic one
    return property.description || 
      'A wonderful property in a desirable location. Contact us for more details.';
  }
}

/**
 * Provides personalized property recommendations based on user preferences
 * @param userPreferences User preferences object
 * @param availableProperties Array of available properties
 * @returns Array of recommended properties with score
 */
export async function getPersonalizedRecommendations(
  userPreferences: {
    location?: string;
    priceRange?: { min: number; max: number };
    bedrooms?: number;
    propertyType?: string;
  },
  availableProperties: (Property | IDXProperty)[]
): Promise<Array<{ property: Property | IDXProperty; score: number }>> {
  try {
    if (!vertexAi) {
      throw new Error('Vertex AI not initialized');
    }

    // For efficiency, we'll do client-side filtering first
    const filteredProperties = availableProperties.filter(property => {
      // Basic filtering based on user preferences
      const locationMatch = !userPreferences.location || 
        property.city?.toLowerCase().includes(userPreferences.location.toLowerCase()) ||
        property.state?.toLowerCase().includes(userPreferences.location.toLowerCase());
      
      const priceMatch = !userPreferences.priceRange || !property.price ||
        (property.price >= userPreferences.priceRange.min && 
         property.price <= userPreferences.priceRange.max);
      
      const bedroomsMatch = !userPreferences.bedrooms || !property.bedrooms ||
        property.bedrooms >= userPreferences.bedrooms;
      
      const typeMatch = !userPreferences.propertyType || 
        property.propertyType === userPreferences.propertyType;
      
      return locationMatch && priceMatch && bedroomsMatch && typeMatch;
    });

    // If we have too many properties, limit to 10 for processing
    const propertiesToRank = filteredProperties.slice(0, 10);
    
    // If we have no properties to rank, return empty array
    if (propertiesToRank.length === 0) {
      return [];
    }

    // Generate a prompt for the Gemini model to rank properties
    const prompt = `
      Rank the following properties based on these user preferences:
      Location preference: ${userPreferences.location || 'Any'}
      Price range: $${userPreferences.priceRange?.min.toLocaleString() || 0} - $${userPreferences.priceRange?.max.toLocaleString() || 'Any'}
      Minimum bedrooms: ${userPreferences.bedrooms || 'Any'}
      Property type: ${userPreferences.propertyType || 'Any'}
      
      Properties:
      ${propertiesToRank.map((p, idx) => `
        Property ${idx + 1}:
        - Location: ${p.city}, ${p.state}
        - Price: $${p.price ? p.price.toLocaleString() : 'N/A'}
        - Bedrooms: ${p.bedrooms || 'N/A'}
        - Bathrooms: ${p.bathrooms || 'N/A'}
        - Type: ${p.propertyType || 'N/A'}
        - Size: ${p.sqft || 'Unknown'} sq ft
      `).join('\n')}
      
      Please rank these properties on a scale from 0 to 100 based on how well they match the user preferences.
      Respond only with a JSON array of objects, with each object containing a property index (1-based) and a score.
      Example format: [{"propertyIndex": 1, "score": 85}, {"propertyIndex": 2, "score": 72}, ...]
    `;

    // Access generative AI model (Gemini)
    const generativeModel = vertexAi.preview.getGenerativeModel({
      model: 'gemini-pro',
    });

    // Generate content
    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    const response = result.response;
    const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract JSON array from response
    const jsonMatch = responseText.match(/\[.*\]/s);
    if (!jsonMatch) {
      throw new Error('Failed to parse recommendation response');
    }
    
    const rankings = JSON.parse(jsonMatch[0]);
    
    // Map rankings back to properties
    return rankings
      .map((ranking: { propertyIndex: number; score: number }) => ({
        property: propertiesToRank[ranking.propertyIndex - 1],
        score: ranking.score
      }))
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score);
  } catch (error) {
    console.error('[express] Error getting personalized recommendations:', error);
    // Fall back to a simple sorting algorithm
    return availableProperties
      .slice(0, 5)
      .map(property => ({ property, score: 70 }));
  }
}

/**
 * Generates a chatbot response based on user query and context
 * @param query User's question
 * @param context Context information (properties, preferences, etc.)
 * @returns Chatbot response
 */
export async function generateChatbotResponse(
  query: string,
  context?: {
    properties?: (Property | IDXProperty)[];
    userPreferences?: any;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }
): Promise<string> {
  try {
    if (!vertexAi) {
      throw new Error('Vertex AI not initialized');
    }

    const history = context?.conversationHistory || [];
    const properties = context?.properties || [];
    const preferences = context?.userPreferences || {};

    // Prepare conversation history for the model
    const chatHistory = [
      // System instructions
      {
        role: 'system',
        parts: [{
          text: `You are a helpful real estate assistant. Answer questions about properties, 
          provide advice on buying/selling homes, and help with real estate inquiries. 
          Be friendly, concise, and informative.`
        }]
      },
      // Previous conversation history (limited to last 5 exchanges)
      ...history.slice(-5).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })),
      // Current query
      { role: 'user', parts: [{ text: query }] }
    ];

    // Add context about available properties if relevant
    let propertyContext = '';
    if (properties.length > 0) {
      propertyContext = `
        Here's information about some available properties:
        ${properties.slice(0, 3).map(p => `
          - ${p.bedrooms || 'N/A'} bed, ${p.bathrooms || 'N/A'} bath ${p.propertyType || 'property'} in ${p.city || 'N/A'}, ${p.state || 'N/A'} for $${p.price ? p.price.toLocaleString() : 'N/A'}
        `).join('\n')}
      `;
    }

    // Access generative AI model (Gemini)
    const generativeModel = vertexAi.preview.getGenerativeModel({
      model: 'gemini-pro',
    });

    // Generate response
    const result = await generativeModel.generateContent({
      contents: [
        ...chatHistory,
        { role: 'system', parts: [{ text: propertyContext }] }
      ],
    });
    
    const response = result.response;
    const chatResponse = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return chatResponse.trim();
  } catch (error) {
    console.error('[express] Error generating chatbot response:', error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
  }
}

/**
 * Explains legal terms in real estate contracts
 * @param contractText The text of the contract containing the term
 * @param term The specific term to explain
 * @returns Detailed explanation of the term in JSON format
 */
export async function explainLegalTerm(
  contractText: string,
  term: string
): Promise<{
  term: string;
  definition: string;
  implications: string;
  example?: string;
  relatedTerms?: string[];
}> {
  try {
    if (!vertexAi) {
      throw new Error('Vertex AI not initialized');
    }

    // Generate a prompt for the Gemini model to explain the legal term
    const prompt = `
      You are a real estate legal expert. Please explain the term "${term}" in the context of the following contract excerpt:
      
      CONTRACT TEXT:
      ${contractText.substring(0, 2000)}... [text truncated for brevity]
      
      Please respond with a JSON object that includes:
      1. A clear definition of "${term}"
      2. Legal implications for the parties involved
      3. A simple example to illustrate the concept (if applicable)
      4. Related terms that might be relevant (if applicable)
      
      Format your response as a valid JSON object with these fields:
      {
        "term": "the exact term",
        "definition": "clear definition",
        "implications": "what this means for the parties involved",
        "example": "simple example if applicable",
        "relatedTerms": ["term1", "term2"]
      }
    `;

    // Access generative AI model (Gemini)
    const generativeModel = vertexAi.preview.getGenerativeModel({
      model: 'gemini-pro',
    });

    // Generate explanation
    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    const response = result.response;
    const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse explanation response');
    }
    
    const explanation = JSON.parse(jsonMatch[0]);
    return {
      term: explanation.term || term,
      definition: explanation.definition || 'Definition not available',
      implications: explanation.implications || 'Implications not specified',
      example: explanation.example,
      relatedTerms: explanation.relatedTerms || []
    };
  } catch (error) {
    console.error('[express] Error explaining legal term:', error);
    
    // If the Vertex AI is not initialized or available, check for authentication
    if (error.message?.includes('credential') || 
        error.message?.includes('authentication') || 
        error.message?.includes('Vertex AI not initialized')) {
      return {
        term: term,
        definition: 'AI service authentication error. Please check your Google Cloud credentials.',
        implications: 'The system requires valid Google Cloud authentication to process requests.',
        relatedTerms: []
      };
    }
    
    // If there's an error parsing the response
    if (error.message?.includes('parse')) {
      return {
        term: term,
        definition: 'Unable to process the AI response for this term.',
        implications: 'The term might be complex or require specialized knowledge.',
        relatedTerms: []
      };
    }
    
    // Default error message
    return {
      term: term,
      definition: 'Unable to generate explanation at this time.',
      implications: 'Please try again with a different term or contact support if the issue persists.',
      relatedTerms: []
    };
  }
}

// Delete the temporary credentials file when the server exits
process.on('exit', () => {
  try {
    const tempCredentialsPath = path.join(__dirname, 'temp-credentials.json');
    if (fs.existsSync(tempCredentialsPath)) {
      fs.unlinkSync(tempCredentialsPath);
    }
  } catch (err) {
    console.error('Error cleaning up temporary credentials:', err);
  }
});

// Clean up on various signals
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
  process.on(signal, () => {
    try {
      const tempCredentialsPath = path.join(__dirname, 'temp-credentials.json');
      if (fs.existsSync(tempCredentialsPath)) {
        fs.unlinkSync(tempCredentialsPath);
      }
    } catch (err) {
      console.error('Error cleaning up temporary credentials:', err);
    }
    process.exit(0);
  });
});