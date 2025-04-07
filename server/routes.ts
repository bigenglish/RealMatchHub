import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertPropertySchema, insertServiceProviderSchema, insertFinancingProviderSchema } from "@shared/schema";
import { fetchIdxListings, testIdxConnection } from "./idx-broker"; // Import from idx-broker.ts
import {
  predictPropertyPrice,
  generatePropertyDescription,
  getPersonalizedRecommendations,
  generateChatbotResponse,
} from "./vertex-ai"; // Import Vertex AI functions
import { explainLegalTerm } from "./gemini-ai"; // Import Gemini direct API function
import { processDocument, parsePropertyDocument } from "./document-ai"; // Import Document AI functions

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Property routes
  app.get("/api/properties", async (_req, res) => {
    try {
      console.log("[express] Fetching properties from IDX Broker only");
      
      const idxListings = await fetchIdxListings({ limit: 20 }); // Fetch 20 listings from IDX
      console.log(`[express] Fetched ${idxListings.listings.length} listings from IDX Broker`);
      
      // Log some IDX listings for debugging
      if (idxListings.listings.length > 0) {
        console.log("[express] First IDX listing sample:", {
          id: idxListings.listings[0].listingId,
          address: idxListings.listings[0].address,
          type: idxListings.listings[0].propertyType
        });
      }

      // Convert IDX listings to our standard property format for frontend
      const convertedListings = idxListings.listings.map((idx, index) => {
        // Create a unique numeric ID for each IDX listing
        const listingId = idx.listingId || `idx-${index}`;
        const numericId = parseInt(listingId.replace(/\D/g, ''));
        const id = isNaN(numericId) ? 1000 + index : numericId + 1000;
        
        return {
          id,
          title: `${idx.address}, ${idx.city}, ${idx.state}`,
          description: idx.description,
          price: idx.price,
          bedrooms: idx.bedrooms,
          bathrooms: idx.bathrooms,
          squareFeet: idx.sqft,
          address: idx.address,
          city: idx.city,
          state: idx.state,
          zipCode: idx.zipCode,
          propertyType: idx.propertyType,
          images: idx.images || [],
          source: 'idx',
          createdAt: new Date().toISOString(),
          status: 'active'
        };
      });

      // Return only IDX listings, no more combining with local properties
      const response = {
        yourProperties: [], // Empty array since we're only using IDX
        idxListings: convertedListings,
      };

      console.log("[express] Sending response with:", {
        idxListingsCount: convertedListings.length
      });
      
      res.json(response);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Error fetching IDX listings", error: String(error) });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    const id = Number(req.params.id);
    
    try {
      console.log(`[express] Fetching property details for ID: ${id}`);
      
      // All our properties are now from IDX with IDs >= 1000
      if (id >= 1000) {
        // Get IDX listings
        const idxResponse = await fetchIdxListings({ limit: 30 }); // Getting more listings to increase chance of finding the right one
        console.log(`[express] Fetched ${idxResponse.listings.length} IDX listings to search for ID ${id}`);
        
        // We'll need to check various ID formats since we converted them in the API response
        // First, try to derive the original IDX ID
        const originalId = id - 1000;
        const possibleIdFormats = [
          `IDX${originalId}`,
          `idx-${originalId}`,
          `${originalId}`
        ];
        
        console.log(`[express] Looking for listing with possible IDs:`, possibleIdFormats);
        
        // Find the first matching listing
        const idxListing = idxResponse.listings.find(listing => {
          const listingId = listing.listingId || '';
          return possibleIdFormats.some(format => listingId.includes(format));
        });
        
        // As fallback, use the IDX listing at index (id - 1000) if within bounds
        const fallbackListing = originalId < idxResponse.listings.length ? 
          idxResponse.listings[originalId] : null;
        
        const listing = idxListing || fallbackListing;
        
        if (listing) {
          console.log(`[express] Found matching IDX listing: ${listing.address}`);
          
          // Convert the IDX listing to the format expected by the frontend
          const convertedListing = {
            id,
            title: `${listing.address}, ${listing.city}`,
            description: listing.description,
            price: listing.price,
            address: `${listing.address}, ${listing.city}, ${listing.state} ${listing.zipCode}`,
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            squareFeet: listing.sqft,
            city: listing.city,
            state: listing.state,
            zipCode: listing.zipCode,
            propertyType: listing.propertyType,
            images: listing.images || [],
            source: 'idx',
            createdAt: new Date().toISOString(),
            status: 'active'
          };
          
          return res.json(convertedListing);
        } else {
          console.log(`[express] No matching IDX listing found for ID ${id}`);
        }
      }
      
      // If we reach here, the property wasn't found
      return res.status(404).json({ message: "Property not found" });
    } catch (error) {
      console.error(`[express] Error fetching property ${id}:`, error);
      return res.status(500).json({ message: "Error fetching property details" });
    }
  });

  app.post("/api/properties", async (req, res) => {
    try {
      const data = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(data);
      res.status(201).json(property);
    } catch (error) {
      res.status(400).json({ message: "Invalid property data" });
    }
  });

  // Service provider routes
  app.get("/api/service-providers", async (_req, res) => {
    const providers = await storage.getServiceProviders();
    res.json(providers);
  });

  app.get("/api/service-providers/:id", async (req, res) => {
    const provider = await storage.getServiceProvider(Number(req.params.id));
    if (!provider) {
      return res.status(404).json({ message: "Service provider not found" });
    }
    res.json(provider);
  });

  app.get("/api/service-providers/type/:type", async (req, res) => {
    const providers = await storage.getServiceProvidersByType(req.params.type);
    res.json(providers);
  });

  app.post("/api/service-providers", async (req, res) => {
    try {
      const data = insertServiceProviderSchema.parse(req.body);
      const provider = await storage.createServiceProvider(data);
      res.status(201).json(provider);
    } catch (error) {
      res.status(400).json({ message: "Invalid service provider data" });
    }
  });
  
  // Add endpoint to check if IDX API key is configured
  app.get("/api/idx-status", async (_req, res) => {
    try {
      const hasApiKey = !!process.env.IDX_BROKER_API_KEY;
      console.log("[express] /api/idx-status called, hasApiKey =", hasApiKey);
      
      const response = { 
        enabled: hasApiKey,
        message: hasApiKey ? 
          "IDX Broker API is configured and ready to use" : 
          "IDX Broker API key is not configured"
      };
      
      console.log("[express] /api/idx-status response:", response);
      res.json(response);
    } catch (error) {
      console.error("Error checking IDX status:", error);
      res.status(500).json({ message: "Error checking IDX status" });
    }
  });
  
  // Add endpoint to test the IDX API connection
  app.get("/api/idx-test", async (_req, res) => {
    try {
      console.log("[express] /api/idx-test called");
      const connectionResult = await testIdxConnection();
      console.log("[express] /api/idx-test result:", connectionResult);
      res.json(connectionResult);
    } catch (error) {
      console.error("Error testing IDX connection:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error testing IDX connection" 
      });
    }
  });
  
  // Add endpoint to fetch IDX listings
  app.get("/api/idx-listings", async (req, res) => {
    try {
      const limit = Number(req.query.limit) || 10;
      const offset = Number(req.query.offset) || 0;
      const city = req.query.city ? String(req.query.city) : undefined;
      const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
      const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
      const bedrooms = req.query.bedrooms ? Number(req.query.bedrooms) : undefined;
      const bathrooms = req.query.bathrooms ? Number(req.query.bathrooms) : undefined;
      
      const listings = await fetchIdxListings({
        limit,
        offset,
        city,
        minPrice,
        maxPrice,
        bedrooms,
        bathrooms
      });
      
      res.json(listings);
    } catch (error) {
      console.error("Error fetching IDX listings:", error);
      res.status(500).json({ 
        message: "Error fetching IDX listings",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // ----- Vertex AI Integration Routes -----
  
  // Predict property price
  app.post("/api/ai/predict-price", async (req, res) => {
    try {
      const property = req.body;
      console.log("[express] Predicting price for property:", property.id || 'new');
      
      const prediction = await predictPropertyPrice(property);
      res.json(prediction);
    } catch (error) {
      console.error("[express] Error predicting property price:", error);
      res.status(500).json({ 
        message: "Failed to predict property price",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Generate property description
  app.post("/api/ai/generate-description", async (req, res) => {
    try {
      const property = req.body;
      console.log("[express] Generating description for property:", property.id || 'new');
      
      const description = await generatePropertyDescription(property);
      res.json({ description });
    } catch (error) {
      console.error("[express] Error generating property description:", error);
      res.status(500).json({ 
        message: "Failed to generate property description",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get personalized property recommendations
  app.post("/api/ai/recommendations", async (req, res) => {
    try {
      const { preferences } = req.body;
      console.log("[express] Getting recommendations based on preferences:", preferences);
      
      // Get all properties to generate recommendations from
      const properties = await storage.getProperties();
      
      // Get IDX listings if available
      let idxListings: any[] = [];
      if (process.env.IDX_BROKER_API_KEY) {
        try {
          const idxResponse = await fetchIdxListings({});
          idxListings = idxResponse.listings || [];
        } catch (idxError) {
          console.error("[express] Error fetching IDX listings for recommendations:", idxError);
        }
      }
      
      // Combine properties
      const allProperties = [...properties, ...idxListings];
      
      // Get recommendations
      const recommendations = await getPersonalizedRecommendations(preferences, allProperties);
      res.json({ recommendations });
    } catch (error) {
      console.error("[express] Error getting personalized recommendations:", error);
      res.status(500).json({ 
        message: "Failed to get personalized recommendations",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Generate chatbot response
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { query, context } = req.body;
      console.log("[express] Generating chatbot response for query:", query);
      
      const response = await generateChatbotResponse(query, context);
      res.json({ response });
    } catch (error) {
      console.error("[express] Error generating chatbot response:", error);
      res.status(500).json({ 
        message: "Failed to generate chatbot response",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Explain legal term in contract
  app.post("/api/ai/explain-term", async (req, res) => {
    try {
      const { contractText, term } = req.body;
      
      if (!contractText || !term) {
        return res.status(400).json({ 
          message: "Both contractText and term are required" 
        });
      }
      
      console.log(`[express] Explaining legal term: "${term}"`);
      
      const explanation = await explainLegalTerm(contractText, term);
      res.json(explanation);
    } catch (error) {
      console.error("[express] Error explaining legal term:", error);
      res.status(500).json({ 
        message: "Failed to explain legal term",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // ----- Document AI OCR Integration Routes -----
  
  // Configure multer for file uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB max file size
    },
  });
  
  // Process document with OCR
  app.post("/api/ocr/process", upload.single('document'), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No document file uploaded" });
      }
      
      console.log("[express] Processing document:", file.originalname, file.mimetype);
      
      // Default processor ID - you would get this from Google Cloud Console
      // This is a placeholder - user needs to provide their actual processor ID
      const processorId = req.body.processorId || process.env.DOCUMENT_AI_PROCESSOR_ID;
      
      if (!processorId) {
        return res.status(400).json({ 
          message: "Document AI processor ID is required. Please provide it in the request or set DOCUMENT_AI_PROCESSOR_ID environment variable." 
        });
      }
      
      // Process the document with Document AI
      const result = await processDocument(
        file.buffer,
        file.mimetype,
        processorId
      );
      
      res.json(result);
    } catch (error) {
      console.error("[express] Error processing document with OCR:", error);
      res.status(500).json({ 
        message: "Failed to process document",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Parse property document (listings, contracts, etc.)
  app.post("/api/ocr/property-document", upload.single('document'), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No document file uploaded" });
      }
      
      console.log("[express] Processing property document:", file.originalname);
      
      // Default processor ID - you would get this from Google Cloud Console
      const processorId = req.body.processorId || process.env.DOCUMENT_AI_PROCESSOR_ID;
      
      if (!processorId) {
        return res.status(400).json({ 
          message: "Document AI processor ID is required" 
        });
      }
      
      // Parse the property document
      const propertyInfo = await parsePropertyDocument(
        file.buffer,
        file.mimetype,
        processorId
      );
      
      res.json(propertyInfo);
    } catch (error) {
      console.error("[express] Error parsing property document:", error);
      res.status(500).json({ 
        message: "Failed to parse property document",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // ----- Financing Provider Routes -----
  
  // Get all financing providers
  app.get("/api/financing-providers", async (_req, res) => {
    try {
      const providers = await storage.getFinancingProviders();
      console.log(`[express] Fetched ${providers.length} financing providers`);
      res.json(providers);
    } catch (error) {
      console.error("[express] Error fetching financing providers:", error);
      res.status(500).json({ 
        message: "Failed to fetch financing providers",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get a specific financing provider by ID
  app.get("/api/financing-providers/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const provider = await storage.getFinancingProvider(id);
      
      if (!provider) {
        return res.status(404).json({ message: "Financing provider not found" });
      }
      
      console.log(`[express] Fetched financing provider: ${provider.name}`);
      res.json(provider);
    } catch (error) {
      console.error("[express] Error fetching financing provider:", error);
      res.status(500).json({ 
        message: "Failed to fetch financing provider",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get financing providers by service offered
  app.get("/api/financing-providers/service/:service", async (req, res) => {
    try {
      const service = req.params.service;
      const providers = await storage.getFinancingProvidersByService(service);
      
      console.log(`[express] Fetched ${providers.length} financing providers offering ${service}`);
      res.json(providers);
    } catch (error) {
      console.error(`[express] Error fetching financing providers by service ${req.params.service}:`, error);
      res.status(500).json({ 
        message: "Failed to fetch financing providers by service",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Create a new financing provider
  app.post("/api/financing-providers", async (req, res) => {
    try {
      const data = insertFinancingProviderSchema.parse(req.body);
      const provider = await storage.createFinancingProvider(data);
      
      console.log(`[express] Created new financing provider: ${provider.name}`);
      res.status(201).json(provider);
    } catch (error) {
      console.error("[express] Error creating financing provider:", error);
      res.status(400).json({ 
        message: "Invalid financing provider data",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Update a financing provider
  app.patch("/api/financing-providers/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updates = req.body;
      
      const updatedProvider = await storage.updateFinancingProvider(id, updates);
      
      if (!updatedProvider) {
        return res.status(404).json({ message: "Financing provider not found" });
      }
      
      console.log(`[express] Updated financing provider: ${updatedProvider.name}`);
      res.json(updatedProvider);
    } catch (error) {
      console.error("[express] Error updating financing provider:", error);
      res.status(400).json({ 
        message: "Invalid financing provider data",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Delete a financing provider
  app.delete("/api/financing-providers/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteFinancingProvider(id);
      
      if (!success) {
        return res.status(404).json({ message: "Financing provider not found" });
      }
      
      console.log(`[express] Deleted financing provider with ID: ${id}`);
      res.status(204).end();
    } catch (error) {
      console.error("[express] Error deleting financing provider:", error);
      res.status(500).json({ 
        message: "Failed to delete financing provider",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error" });
  });

  return httpServer;
}