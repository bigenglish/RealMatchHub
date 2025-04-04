/**
 * Google Gemini API integration using the official SDK
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Interface for term explanation responses
export interface TermExplanation {
  term: string;
  definition: string;
  implications: string;
  example?: string;
  relatedTerms?: string[];
}

/**
 * Explains a legal term from real estate contracts using Google's Gemini model
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
    console.error("[gemini-ai] API key not found!");
    return {
      term,
      definition: "Unable to generate explanation at this time.",
      implications: "API configuration issue. Please check server logs.",
      relatedTerms: []
    };
  }

  try {
    console.log(`[gemini-ai] Explaining legal term: "${term}"`);
    
    // Create and configure the Gemini model
    const genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-1.5-pro-latest which is available in the API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    // Configure safety settings
    const generationConfig = {
      temperature: 0.2,
      topP: 0.8,
      topK: 40,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
    ];

    // Create context-aware prompt for the legal term explanation
    const prompt = `
      You are a legal expert specializing in real estate contracts. I'd like you to explain the term "${term}" 
      as it appears in the context of the following contract text. If the term isn't specifically in the text, 
      explain it generally as it would relate to real estate contracts.
      
      Contract text for context:
      """
      ${contractText.slice(0, 3000)} // Limit context to avoid token limits
      """
      
      Please analyze this term and provide a detailed explanation in JSON format with these fields:
      - term: the term being explained (exactly as provided)
      - definition: a clear, concise explanation of what this term means in real estate contexts
      - implications: what this term means for parties involved in the contract
      - example: (optional) a brief practical example showing how this term works in practice
      - relatedTerms: an array of 3-5 related legal terms that someone might want to understand
      
      Return ONLY the JSON with no preamble or explanation. Ensure your response can be directly parsed as JSON.
    `;

    // Generate content
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    console.log("[gemini-ai] Response:", response);

    // Extract the text from the response
    const generatedText = response.text();
    console.log("[gemini-ai] Generated text:", generatedText.slice(0, 300));

    // Try to parse the JSON response
    try {
      // Remove any non-JSON text that might be in the response
      const jsonStartIndex = generatedText.indexOf('{');
      const jsonEndIndex = generatedText.lastIndexOf('}') + 1;
      
      if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
        const jsonStr = generatedText.slice(jsonStartIndex, jsonEndIndex);
        console.log("[gemini-ai] Extracted JSON:", jsonStr.slice(0, 200));
        
        const parsed = JSON.parse(jsonStr);
        
        // Ensure all required fields are present
        return {
          term: parsed.term || term,
          definition: parsed.definition || "No definition provided",
          implications: parsed.implications || "No implications provided",
          example: parsed.example || undefined,
          relatedTerms: Array.isArray(parsed.relatedTerms) ? parsed.relatedTerms : []
        };
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (parseError) {
      console.error("[gemini-ai] Error parsing JSON response:", parseError);
      console.log("[gemini-ai] Raw response for parsing:", generatedText);
      
      // Attempt to extract information using regex as fallback
      return extractExplanationFromText(generatedText, term);
    }
  } catch (error) {
    console.error("[gemini-ai] Error explaining legal term:", error);
    
    return {
      term,
      definition: "Unable to generate explanation at this time.",
      implications: "Please try again with a different term or contact support if the issue persists.",
      relatedTerms: []
    };
  }
}

/**
 * Fallback function to extract structured information from unstructured text
 * Used when JSON parsing fails
 */
function extractExplanationFromText(text: string, term: string): TermExplanation {
  // Default response
  const result: TermExplanation = {
    term,
    definition: "",
    implications: "",
    relatedTerms: []
  };
  
  // Try to extract definition
  const definitionMatch = text.match(/definition[:\s]+(.*?)(?=implications|example|relatedTerms|$)/si);
  if (definitionMatch && definitionMatch[1]) {
    result.definition = definitionMatch[1].trim();
  } else {
    result.definition = "Definition extraction failed. Please try again.";
  }
  
  // Try to extract implications
  const implicationsMatch = text.match(/implications[:\s]+(.*?)(?=definition|example|relatedTerms|$)/si);
  if (implicationsMatch && implicationsMatch[1]) {
    result.implications = implicationsMatch[1].trim();
  } else {
    result.implications = "Implications extraction failed. Please try again.";
  }
  
  // Try to extract example
  const exampleMatch = text.match(/example[:\s]+(.*?)(?=definition|implications|relatedTerms|$)/si);
  if (exampleMatch && exampleMatch[1]) {
    result.example = exampleMatch[1].trim();
  }
  
  // Try to extract related terms
  const relatedTermsMatch = text.match(/relatedTerms[:\s]+(.*?)(?=definition|implications|example|$)/si);
  if (relatedTermsMatch && relatedTermsMatch[1]) {
    const termsText = relatedTermsMatch[1].trim();
    // Extract terms that might be in various formats (comma-separated, array notation, etc.)
    const terms = termsText.match(/["']([^"']+)["']|[\w\s-]+/g);
    if (terms) {
      result.relatedTerms = terms
        .map(t => t.replace(/["'\[\]\s]+/g, '').trim())
        .filter(t => t && t.length > 0);
    }
  }
  
  return result;
}