/**
 * Simplified Google Gemini API integration
 * Using the simplified endpoint that doesn't require specifying model names
 */

import axios from 'axios';

// Interface for term explanation responses
export interface TermExplanation {
  term: string;
  definition: string;
  implications: string;
  example?: string;
  relatedTerms?: string[];
}

/**
 * Explains a legal term from real estate contracts using Google's Gemini API
 * @param contractText The text of the contract containing the term
 * @param term The specific term to explain
 * @returns Detailed explanation of the term
 */
export async function explainLegalTerm(
  contractText: string,
  term: string
): Promise<TermExplanation> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("[simple-gemini] API key not found!");
    return {
      term,
      definition: "Unable to generate explanation at this time.",
      implications: "API configuration issue. Please check server logs.",
      relatedTerms: []
    };
  }

  try {
    console.log(`[simple-gemini] Explaining legal term: "${term}"`);
    
    // Create context-aware prompt for the legal term explanation
    const prompt = `
      You are a legal expert specializing in real estate contracts. Please explain the term "${term}" 
      as it appears in the context of the following contract text. If the term isn't specifically in the text, 
      explain it generally as it would relate to real estate contracts.
      
      Contract text for context:
      """
      ${contractText.slice(0, 2000)} 
      """
      
      Please format your response as JSON with these fields:
      {
        "term": "${term}",
        "definition": "clear explanation of what this term means in real estate contexts",
        "implications": "what this term means for parties involved in the contract",
        "example": "a brief practical example showing how this term works in practice",
        "relatedTerms": ["term1", "term2", "term3"]
      }
      
      Respond with ONLY the JSON data, no other text.
    `;

    // Use the simplified API endpoint
    const response = await axios.post(
      'https://api.gemini.ai/v1/query',
      { query: prompt },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 10000
      }
    );

    console.log("[simple-gemini] Raw API response:", JSON.stringify(response.data).slice(0, 300));
    
    // Try to parse the response
    if (response.data && response.data.response) {
      try {
        // Extract JSON from the response text
        const text = response.data.response;
        const jsonStartIndex = text.indexOf('{');
        const jsonEndIndex = text.lastIndexOf('}') + 1;
        
        if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
          const jsonStr = text.slice(jsonStartIndex, jsonEndIndex);
          const parsed = JSON.parse(jsonStr);
          
          return {
            term: parsed.term || term,
            definition: parsed.definition || "No definition provided",
            implications: parsed.implications || "No implications provided",
            example: parsed.example,
            relatedTerms: Array.isArray(parsed.relatedTerms) ? parsed.relatedTerms : []
          };
        }
      } catch (parseError) {
        console.error("[simple-gemini] Error parsing JSON response:", parseError);
        console.log("[simple-gemini] Raw response:", response.data.response);
      }
    }
    
    // If we couldn't parse JSON or the structure is unexpected, fall back to a raw text approach
    if (response.data && response.data.response) {
      const text = response.data.response;
      
      return {
        term,
        definition: extractSection(text, "Definition", 500),
        implications: extractSection(text, "Implications", 500),
        example: extractSection(text, "Example", 300),
        relatedTerms: extractRelatedTerms(text)
      };
    }
    
    throw new Error("Unexpected API response format");
    
  } catch (error) {
    console.error("[simple-gemini] Error explaining legal term:", error);
    if (axios.isAxiosError(error)) {
      console.error("[simple-gemini] API Error details:", error.response?.data);
    }
    
    return {
      term,
      definition: "Unable to generate explanation at this time.",
      implications: "Please try again with a different term or contact support if the issue persists.",
      relatedTerms: []
    };
  }
}

/**
 * Extracts a section of text after a given heading
 */
function extractSection(text: string, heading: string, maxLength: number): string {
  const pattern = new RegExp(`${heading}[:\\s]+(.*?)(?=\\n\\s*[A-Z][a-zA-Z]*[:\\s]|$)`, 'is');
  const match = text.match(pattern);
  
  if (match && match[1]) {
    return match[1].trim().slice(0, maxLength);
  }
  
  return `No ${heading.toLowerCase()} information available`;
}

/**
 * Extracts related terms from text
 */
function extractRelatedTerms(text: string): string[] {
  // Try to find a section with "Related Terms"
  const pattern = /Related\s+Terms[:\s]+(.*?)(?=\n\s*[A-Z][a-zA-Z]*[:\s]|$)/is;
  const match = text.match(pattern);
  
  if (match && match[1]) {
    // Extract anything that looks like a term (words or phrases)
    const terms = match[1].match(/[A-Z][A-Za-z\s-]{2,25}/g) || [];
    return terms.slice(0, 5).map(term => term.trim());
  }
  
  // If we can't find an explicit Related Terms section, look for capitalized phrases
  // that might be legal terms throughout the text
  const capitalizedPhrases = text.match(/[A-Z][A-Za-z\s-]{2,25}/g) || [];
  const uniqueTerms = [...new Set(capitalizedPhrases)].filter(
    term => term.length > 3 && !/^(Definition|Example|Implications|Related)/i.test(term)
  );
  
  return uniqueTerms.slice(0, 5);
}