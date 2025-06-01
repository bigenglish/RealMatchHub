import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with API key from environment
const apiKey = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

// Initialize with better error handling
try {
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('[chatbot-ai] Gemini AI initialized successfully');
  } else {
    console.warn('[chatbot-ai] GEMINI_API_KEY not found, chatbot will use fallback responses');
  }
} catch (error) {
  console.error('[chatbot-ai] Failed to initialize Gemini AI:', error);
}

export async function generateChatbotResponse(userMessage: string, context?: any): Promise<string> {
  try {
    // Check if AI is available
    if (!genAI || !apiKey) {
      console.warn('[chatbot-ai] AI service not available, using fallback');
      return getFallbackResponse(userMessage);
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create a prompt with context
    const prompt = `You are RealtyAI Assistant, a helpful real estate AI assistant. 

Context: You help users with real estate questions, property searches, market insights, and general real estate guidance.

User message: ${userMessage}

Please provide a helpful, informative response about real estate. Keep it conversational and practical.`;

    // Generate response with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
    });

    const responsePromise = model.generateContent(prompt);

    const result = await Promise.race([responsePromise, timeoutPromise]);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from AI');
    }

    return text;
  } catch (error) {
    console.error('[chatbot-ai] Error generating response:', error);

    // Return a contextual fallback response
    return getFallbackResponse(userMessage);
  }
}

function getFallbackResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();

  if (message.includes('property') || message.includes('house') || message.includes('home')) {
    return "I'd be happy to help you with property questions! While I'm reconnecting to my AI services, you can browse our property listings or contact one of our real estate experts for immediate assistance.";
  }

  if (message.includes('price') || message.includes('cost') || message.includes('market')) {
    return "For current market prices and trends, I recommend speaking with one of our local market experts who can provide the most up-to-date information for your area.";
  }

  if (message.includes('mortgage') || message.includes('loan') || message.includes('financing')) {
    return "For mortgage and financing questions, our financing partners can help you explore your options. You can request a consultation through our services page.";
  }

  return "I'm having trouble connecting to my AI services right now, but I'm here to help! You can browse our property listings, schedule a consultation with an expert, or try asking your question again in a moment.";
}