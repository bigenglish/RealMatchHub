
/**
 * Integration with Google's Gemini AI for the real estate chatbot
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with the API key
const API_KEY = process.env.GOOGLE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

// Define the model to use
const modelName = 'gemini-1.5-pro';

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

export interface ChatbotResponse {
  answer: string;
  relatedQuestions?: string[];
}

/**
 * Process a real estate related query using Gemini AI
 * @param query The user's query text
 * @param chatHistory Previous conversation history
 * @returns AI response with answer and optional related questions
 */
export async function processRealEstateQuery(
  query: string,
  chatHistory: ChatMessage[] = []
): Promise<ChatbotResponse> {
  try {
    // Set up the model
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Create the system context as part of the user's message
    const systemContext = `You are an AI assistant for a real estate platform called REALTY.AI. 
    Focus on providing helpful, accurate information about real estate topics, property listings, 
    buying/selling processes, and our services. Our platform offers FREE, BASIC ($1,500), and PREMIUM ($2,500) 
    plans with various levels of support and features.
    
    Key features of our platform:
    - AI-powered property matching and search
    - Document review and explanation
    - Expert consultation services
    - Significant savings compared to traditional agent commissions (typically 5-6%)
    
    Keep responses concise, friendly, and focused on real estate. If you don't know something specific about 
    REALTY.AI's offerings, recommend the user contact our customer support or check the pricing page.
    
    Always suggest ways that REALTY.AI can save the user money compared to traditional real estate services.

    User query: ${query}`;

    // Format the conversation history for the API - ensure first message is from user
    let formattedHistory = chatHistory.map(msg => ({
      role: msg.role === 'bot' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // If there's no history, start with a user message
    if (formattedHistory.length === 0) {
      formattedHistory = [
        { role: 'user', parts: [{ text: systemContext }] }
      ];
    } else {
      // Add the system context to the current query
      formattedHistory.push({ role: 'user', parts: [{ text: systemContext }] });
    }
    
    // Create a chat session with the properly formatted history
    const chat = model.startChat({
      history: formattedHistory.slice(0, -1), // All but the last message
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 500,
      }
    });

    // Send the current message (last item in formatted history)
    const result = await chat.sendMessage(formattedHistory[formattedHistory.length - 1].parts[0].text);
    const response = result.response;
    const text = response.text();
    
    // Generate related questions
    const relatedQuestions = [
      "How much can I save with REALTY.AI compared to traditional agents?",
      "What's included in the BASIC plan?",
      "How does the AI property matching work?",
      "Can I get expert help with contract negotiations?",
      "Do you help with mortgage and financing options?"
    ];
    
    // Pick 3 random related questions
    const randomRelated = relatedQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    return {
      answer: text,
      relatedQuestions: randomRelated
    };
  } catch (error) {
    console.error("Error with Gemini AI chatbot:", error);
    return {
      answer: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment or contact our support team for immediate assistance."
    };
  }
}
