import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { 
  insertPropertySchema, 
  insertServiceProviderSchema, 
  insertServiceExpertSchema,
  insertServiceOfferingSchema,
  insertServiceBundleSchema
} from "@shared/schema";
import { fetchIdxListings, testIdxConnection } from "./idx-broker"; // Import from idx-broker.ts
import {
  predictPropertyPrice,
  generatePropertyDescription,
  getPersonalizedRecommendations,
  generateChatbotResponse,
} from "./vertex-ai"; // Import Vertex AI functions
import { explainLegalTerm } from "./gemini-ai"; // Import Gemini direct API function
import { processDocument, parsePropertyDocument } from "./document-ai"; // Import Document AI functions
import { searchNearbyPlaces, getPlaceDetails, getPlacePhotoUrl, geocodeAddress } from "./google-places"; // Import Google Places API functions
import { processRealEstateQuery } from "./chatbot-ai"; // Import chatbot functions
import { analyzeStyleFromImage, generateStyleProfile, findMatchingProperties, PropertySearchQuery } from "./ai-property-search"; // Import AI property search functions
import { generatePropertyRecommendations } from "./ai-property-recommendations"; // Import AI property recommendations
import { initializeChat } from "./chat-service"; // Import chat service
import { 
  insertAppointmentSchema, 
  insertChatConversationSchema, 
  insertChatParticipantSchema, 
  insertChatMessageSchema 
} from "@shared/chat-schema"; // Import chat schemas
import Stripe from "stripe"; // Import Stripe
import { registerVideoRoutes } from "./video-static"; // Import video routes handler

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Configure multer for file uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB max file size
    },
  });

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

  // Service offerings routes
  app.get("/api/service-offerings", async (_req, res) => {
    try {
      const offerings = await storage.getServiceOfferings();
      res.json(offerings);
    } catch (error) {
      console.error("Error fetching service offerings:", error);
      res.status(500).json({ message: "Error fetching service offerings" });
    }
  });

  app.get("/api/service-offerings/:id", async (req, res) => {
    try {
      const offering = await storage.getServiceOffering(Number(req.params.id));
      if (!offering) {
        return res.status(404).json({ message: "Service offering not found" });
      }
      res.json(offering);
    } catch (error) {
      console.error(`Error fetching service offering ${req.params.id}:`, error);
      res.status(500).json({ message: "Error fetching service offering" });
    }
  });

  app.post("/api/service-offerings", async (req, res) => {
    try {
      const data = insertServiceOfferingSchema.parse(req.body);
      const offering = await storage.createServiceOffering(data);
      res.status(201).json(offering);
    } catch (error) {
      console.error("Error creating service offering:", error);
      res.status(400).json({ message: "Invalid service offering data" });
    }
  });

  // Service bundles routes
  app.get("/api/service-bundles", async (_req, res) => {
    try {
      const bundles = await storage.getServiceBundles();
      res.json(bundles);
    } catch (error) {
      console.error("Error fetching service bundles:", error);
      res.status(500).json({ message: "Error fetching service bundles" });
    }
  });

  app.get("/api/service-bundles/:id", async (req, res) => {
    try {
      const bundle = await storage.getServiceBundle(Number(req.params.id));
      if (!bundle) {
        return res.status(404).json({ message: "Service bundle not found" });
      }
      
      // Get associated services for the bundle
      const services = await storage.getServicesInBundle(bundle.id);
      
      res.json({
        ...bundle,
        services
      });
    } catch (error) {
      console.error(`Error fetching service bundle ${req.params.id}:`, error);
      res.status(500).json({ message: "Error fetching service bundle" });
    }
  });

  app.post("/api/service-bundles", async (req, res) => {
    try {
      const data = insertServiceBundleSchema.parse(req.body);
      const bundle = await storage.createServiceBundle(data);
      res.status(201).json(bundle);
    } catch (error) {
      console.error("Error creating service bundle:", error);
      res.status(400).json({ message: "Invalid service bundle data" });
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
  
  // AI Property Style Search
  app.post("/api/ai/property-style-search", async (req, res) => {
    try {
      const searchQuery: PropertySearchQuery = req.body;
      
      console.log("[express] Performing AI property style search");
      
      if (!searchQuery.stylePreferences) {
        return res.status(400).json({ 
          message: "Style preferences are required for AI property search" 
        });
      }
      
      // Analyze inspiration images if provided
      if (searchQuery.inspirationImages && searchQuery.inspirationImages.length > 0) {
        console.log(`[express] Analyzing ${searchQuery.inspirationImages.length} inspiration images`);
        
        // For multiple images, generate a consolidated style profile
        const styleProfile = await generateStyleProfile(
          searchQuery.inspirationImages,
          searchQuery.stylePreferences.style,
          searchQuery.stylePreferences.features
        );
        
        console.log("[express] Generated style profile:", styleProfile);
      }
      
      // Find matching properties based on style and other requirements
      const matchingProperties = await findMatchingProperties(searchQuery);
      
      console.log(`[express] Found ${matchingProperties.length} matching properties`);
      
      res.json({ 
        matchCount: matchingProperties.length,
        properties: matchingProperties 
      });
    } catch (error) {
      console.error("[express] Error in AI property style search:", error);
      res.status(500).json({ 
        message: "Failed to complete AI property style search",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Smart AI-powered property matching recommendations
  app.post("/api/recommendations", async (req, res) => {
    try {
      const { preferences } = req.body;
      console.log("[express] Generating smart property recommendations based on user preferences");
      
      if (!preferences) {
        return res.status(400).json({ 
          message: "User preferences are required for property recommendations" 
        });
      }
      
      const recommendedProperties = await generatePropertyRecommendations(preferences);
      
      console.log(`[express] Generated ${recommendedProperties.length} AI-powered property recommendations`);
      
      res.json({ 
        count: recommendedProperties.length,
        properties: recommendedProperties 
      });
    } catch (error) {
      console.error("[express] Error generating property recommendations:", error);
      res.status(500).json({ 
        message: "Failed to generate property recommendations",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Analyze Style from Inspiration Image
  app.post("/api/ai/analyze-style", upload.single('image'), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No image file uploaded" });
      }
      
      console.log("[express] Analyzing style from inspiration image:", file.originalname);
      
      // Convert buffer to base64
      const imageBase64 = file.buffer.toString('base64');
      
      // Analyze the image style
      const styleAnalysis = await analyzeStyleFromImage(`data:${file.mimetype};base64,${imageBase64}`);
      
      res.json(styleAnalysis);
    } catch (error) {
      console.error("[express] Error analyzing style from image:", error);
      res.status(500).json({ 
        message: "Failed to analyze style from image",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // ----- Document AI OCR Integration Routes -----
  
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

  // ----- Service Experts Routes -----
  
  // Get all service experts
  app.get("/api/service-experts", async (_req, res) => {
    try {
      const providers = await storage.getServiceExperts();
      console.log(`[express] Fetched ${providers.length} service experts`);
      res.json(providers);
    } catch (error) {
      console.error("[express] Error fetching service experts:", error);
      res.status(500).json({ 
        message: "Failed to fetch service experts",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get a specific service expert by ID
  app.get("/api/service-experts/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const expert = await storage.getServiceExpert(id);
      
      if (!expert) {
        return res.status(404).json({ message: "Service expert not found" });
      }
      
      console.log(`[express] Fetched service expert: ${expert.name}`);
      res.json(expert);
    } catch (error) {
      console.error("[express] Error fetching service expert:", error);
      res.status(500).json({ 
        message: "Failed to fetch service expert",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get service experts by service offered
  app.get("/api/service-experts/service/:service", async (req, res) => {
    try {
      const service = req.params.service;
      const experts = await storage.getServiceExpertsByService(service);
      
      console.log(`[express] Fetched ${experts.length} service experts offering ${service}`);
      res.json(experts);
    } catch (error) {
      console.error(`[express] Error fetching service experts by service ${req.params.service}:`, error);
      res.status(500).json({ 
        message: "Failed to fetch service experts by service",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Create a new service expert
  app.post("/api/service-experts", async (req, res) => {
    try {
      const data = insertServiceExpertSchema.parse(req.body);
      const expert = await storage.createServiceExpert(data);
      
      console.log(`[express] Created new service expert: ${expert.name}`);
      res.status(201).json(expert);
    } catch (error) {
      console.error("[express] Error creating service expert:", error);
      res.status(400).json({ 
        message: "Invalid service expert data",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Update a service expert
  app.patch("/api/service-experts/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updates = req.body;
      
      const updatedExpert = await storage.updateServiceExpert(id, updates);
      
      if (!updatedExpert) {
        return res.status(404).json({ message: "Service expert not found" });
      }
      
      console.log(`[express] Updated service expert: ${updatedExpert.name}`);
      res.json(updatedExpert);
    } catch (error) {
      console.error("[express] Error updating service expert:", error);
      res.status(400).json({ 
        message: "Invalid service expert data",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Delete a service expert
  app.delete("/api/service-experts/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteServiceExpert(id);
      
      if (!success) {
        return res.status(404).json({ message: "Service expert not found" });
      }
      
      console.log(`[express] Deleted service expert with ID: ${id}`);
      res.status(204).end();
    } catch (error) {
      console.error("[express] Error deleting service expert:", error);
      res.status(500).json({ 
        message: "Failed to delete service expert",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // ----- Google Places API Integration Routes -----
  
  // Geocode an address to coordinates - returns lat,lng string
  app.get("/api/places/geocode", async (req, res) => {
    try {
      const address = req.query.address as string;
      
      if (!address) {
        return res.status(400).json({ 
          message: "Address parameter is required" 
        });
      }
      
      console.log(`[express] Geocoding address: "${address}"`);
      const coordinates = await geocodeAddress(address);
      
      if (coordinates) {
        console.log(`[express] Successfully geocoded to: ${coordinates}`);
        res.json({ coordinates, success: true });
      } else {
        console.log(`[express] Failed to geocode address: "${address}"`);
        res.status(400).json({ 
          message: "Could not geocode the provided address",
          success: false
        });
      }
    } catch (error) {
      console.error(`[express] Error geocoding address:`, error);
      res.status(500).json({ 
        message: "Error geocoding address",
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Check if Google Places API key is configured
  // First version of the places status endpoint was removed to avoid duplication
  // The enhanced version that actually tests the API is kept below
  
  // Search for places using Google Places API
  app.get("/api/places/search", async (req, res) => {
    try {
      const query = req.query.query as string;
      const location = req.query.location as string;
      const radius = parseInt(req.query.radius as string) || 10000;
      const category = req.query.category as string;
      
      if (!query || !location) {
        return res.status(400).json({ 
          message: "Query and location parameters are required" 
        });
      }
      
      console.log(`[express] Searching for places with query: ${query}, location: ${location}, radius: ${radius}, category: ${category || 'any'}`);
      
      const places = await searchNearbyPlaces({
        query,
        location,
        radius,
        category
      });
      
      console.log(`[express] Found ${places.length} places matching search criteria`);
      res.json(places);
    } catch (error) {
      console.error("Error searching for places:", error);
      res.status(500).json({ 
        message: "Error searching for places",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get a photo URL for a place
  app.get("/api/places/photo/:photoReference", async (req, res) => {
    try {
      const photoReference = req.params.photoReference;
      const maxWidth = parseInt(req.query.maxWidth as string) || 400;
      
      console.log(`[express] Getting photo URL for reference: ${photoReference}`);
      const photoUrl = getPlacePhotoUrl(photoReference, maxWidth);
      
      if (!photoUrl) {
        return res.status(404).json({ message: "Photo not found" });
      }
      
      res.json({ photoUrl });
    } catch (error) {
      console.error("Error getting place photo URL:", error);
      res.status(500).json({ 
        message: "Error getting place photo URL",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Search service experts from Google Places based on service type
  app.get("/api/places/service-experts/:serviceType", async (req, res) => {
    try {
      const serviceType = req.params.serviceType;
      const location = req.query.location as string || "37.7749,-122.4194"; // Default to San Francisco
      const radius = parseInt(req.query.radius as string) || 10000;
      
      console.log(`[express] Searching for ${serviceType} service experts near ${location}`);
      
      // Map service types to appropriate Google Places search terms
      let searchQuery = serviceType;
      
      switch(serviceType.toLowerCase()) {
        case "mortgage_broker":
          searchQuery = "mortgage broker real estate";
          break;
        case "insurance_agent":
          searchQuery = "home insurance agent";
          break;
        case "real_estate_attorney":
          searchQuery = "real estate attorney lawyer";
          break;
        case "home_inspector":
          searchQuery = "home inspector";
          break;
        case "appraiser":
          searchQuery = "real estate appraiser";
          break;
        case "title_company":
          searchQuery = "title company real estate";
          break;
        default:
          searchQuery = `${serviceType.replace(/_/g, ' ')} real estate`;
      }
      
      const places = await searchNearbyPlaces({
        query: searchQuery,
        location,
        radius
      });
      
      console.log(`[express] Found ${places.length} service experts of type: ${serviceType}`);
      
      res.json(places);
    } catch (error) {
      console.error(`[express] Error searching for service experts of type ${req.params.serviceType}:`, error);
      res.status(500).json({ 
        message: "Error searching for service experts",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Google Places API status endpoint with renamed URL to avoid conflicts with placesId
  app.get("/api/places-status", async (_req, res) => {
    try {
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;
      const hasApiKey = !!apiKey;
      
      console.log("[express] Checking Google Places API status");
      console.log("[express] API key present:", hasApiKey);
      
      if (hasApiKey) {
        console.log("[express] API key first 4 chars:", apiKey!.substring(0, 4) + "...");
        
        // Make a test API call to verify the API key works
        try {
          // Default location: San Francisco City Hall
          const testLocation = "37.7793,-122.4193";
          const testRadius = 1000;
          const testQuery = "cafe";
          
          console.log("[express] Making test API call to Google Places API");
          const testResult = await searchNearbyPlaces({
            query: testQuery,
            location: testLocation,
            radius: testRadius
          });
          
          // Check the specific error that might be in the response
          // Errors like REQUEST_DENIED, INVALID_REQUEST, etc. can be detected this way
          if (Array.isArray(testResult)) {
            console.log("[express] Test API call successful, got", testResult.length, "results");
            res.json({
              enabled: true,
              message: "Google Places API is configured and working",
              results_count: testResult.length
            });
          } else {
            console.log("[express] Test API call failed, didn't get array response");
            res.json({
              enabled: false,
              message: "Google Places API returned unexpected response format"
            });
          }
        } catch (error: any) {
          console.error("[express] Test API call to Google Places failed:", error.message);
          res.json({
            enabled: false,
            message: `Google Places API key is present but failed: ${error.message}`
          });
        }
      } else {
        res.json({
          enabled: false,
          message: "Google Places API key is not configured"
        });
      }
    } catch (error) {
      console.error("[express] Error checking Google Places API status:", error);
      res.status(500).json({ 
        enabled: false,
        message: "Error checking Google Places API status"
      });
    }
  });

  // Get details for a specific place - MUST be placed after all other /api/places/* routes
  app.get("/api/places/:placeId", async (req, res) => {
    try {
      const placeId = req.params.placeId;
      
      console.log(`[express] Fetching details for place ID: ${placeId}`);
      const placeDetails = await getPlaceDetails(placeId);
      
      if (!placeDetails) {
        return res.status(404).json({ message: "Place not found" });
      }
      
      res.json(placeDetails);
    } catch (error) {
      console.error("Error fetching place details:", error);
      res.status(500).json({ 
        message: "Error fetching place details",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error" });
  });

  // Service Bundles Routes
  app.get("/api/service-bundles", async (_req, res) => {
    try {
      const bundles = await storage.getServiceBundles();
      res.json(bundles);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving service bundles", error: String(error) });
    }
  });

  app.get("/api/service-bundles/:id", async (req, res) => {
    try {
      const bundle = await storage.getServiceBundle(parseInt(req.params.id));
      if (!bundle) {
        return res.status(404).json({ message: "Service bundle not found" });
      }
      res.json(bundle);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving service bundle", error: String(error) });
    }
  });

  app.post("/api/service-bundles", async (req, res) => {
    try {
      const bundle = await storage.createServiceBundle(req.body);
      res.status(201).json(bundle);
    } catch (error) {
      res.status(500).json({ message: "Error creating service bundle", error: String(error) });
    }
  });

  // Service Offerings Routes
  app.get("/api/service-offerings", async (_req, res) => {
    try {
      const offerings = await storage.getServiceOfferings();
      res.json(offerings);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving service offerings", error: String(error) });
    }
  });

  app.get("/api/service-offerings/:id", async (req, res) => {
    try {
      const offering = await storage.getServiceOffering(parseInt(req.params.id));
      if (!offering) {
        return res.status(404).json({ message: "Service offering not found" });
      }
      res.json(offering);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving service offering", error: String(error) });
    }
  });

  app.get("/api/service-offerings/type/:type", async (req, res) => {
    try {
      const offerings = await storage.getServiceOfferingsByType(req.params.type);
      res.json(offerings);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving service offerings by type", error: String(error) });
    }
  });

  app.post("/api/service-offerings", async (req, res) => {
    try {
      const offering = await storage.createServiceOffering(req.body);
      res.status(201).json(offering);
    } catch (error) {
      res.status(500).json({ message: "Error creating service offering", error: String(error) });
    }
  });

  // Bundle Services Routes
  app.get("/api/service-bundles/:bundleId/services", async (req, res) => {
    try {
      const services = await storage.getServicesInBundle(parseInt(req.params.bundleId));
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving services in bundle", error: String(error) });
    }
  });

  app.post("/api/service-bundles/:bundleId/services/:serviceId", async (req, res) => {
    try {
      const bundleService = await storage.addServiceToBundle(
        parseInt(req.params.bundleId),
        parseInt(req.params.serviceId)
      );
      res.status(201).json(bundleService);
    } catch (error) {
      res.status(500).json({ message: "Error adding service to bundle", error: String(error) });
    }
  });

  app.delete("/api/service-bundles/:bundleId/services/:serviceId", async (req, res) => {
    try {
      const result = await storage.removeServiceFromBundle(
        parseInt(req.params.bundleId),
        parseInt(req.params.serviceId)
      );
      if (!result) {
        return res.status(404).json({ message: "Service not found in bundle" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error removing service from bundle", error: String(error) });
    }
  });

  // ----- Marketplace Routes -----
  
  // Get all service bundles
  app.get("/api/marketplace/bundles", async (_req, res) => {
    try {
      const bundles = await storage.getServiceBundles();
      res.json(bundles);
    } catch (error) {
      console.error("[express] Error fetching service bundles:", error);
      res.status(500).json({ 
        message: "Failed to fetch service bundles",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get specific service bundle
  app.get("/api/marketplace/bundles/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const bundle = await storage.getServiceBundle(id);
      
      if (!bundle) {
        return res.status(404).json({ message: "Service bundle not found" });
      }
      
      // Get services in the bundle
      const services = await storage.getServicesInBundle(id);
      
      res.json({
        ...bundle,
        services
      });
    } catch (error) {
      console.error(`[express] Error fetching service bundle ${req.params.id}:`, error);
      res.status(500).json({ 
        message: "Failed to fetch service bundle",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get all service offerings
  app.get("/api/marketplace/services", async (req, res) => {
    try {
      const type = req.query.type ? String(req.query.type) : undefined;
      
      // If type is provided, filter by type
      const services = type
        ? await storage.getServiceOfferingsByType(type)
        : await storage.getServiceOfferings();
      
      res.json(services);
    } catch (error) {
      console.error("[express] Error fetching service offerings:", error);
      res.status(500).json({ 
        message: "Failed to fetch service offerings",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get specific service offering
  app.get("/api/marketplace/services/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const service = await storage.getServiceOffering(id);
      
      if (!service) {
        return res.status(404).json({ message: "Service offering not found" });
      }
      
      res.json(service);
    } catch (error) {
      console.error(`[express] Error fetching service offering ${req.params.id}:`, error);
      res.status(500).json({ 
        message: "Failed to fetch service offering",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Create service request
  app.post("/api/marketplace/request", async (req, res) => {
    try {
      const request = req.body;
      const serviceRequest = await storage.createServiceRequest(request);
      res.status(201).json(serviceRequest);
    } catch (error) {
      console.error("[express] Error creating service request:", error);
      res.status(500).json({ 
        message: "Failed to create service request",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get service types
  app.get("/api/marketplace/service-types", async (_req, res) => {
    try {
      const offerings = await storage.getServiceOfferings();
      // Extract unique service types
      const serviceTypes = Array.from(new Set(offerings.map(offering => offering.serviceType)));
      res.json(serviceTypes);
    } catch (error) {
      console.error("[express] Error fetching service types:", error);
      res.status(500).json({ 
        message: "Failed to fetch service types",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Realty.AI Chatbot
  app.post("/api/chatbot", async (req, res) => {
    try {
      const { query, chatHistory } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }
      
      console.log(`[express] Processing chatbot query: "${query}"`);
      
      const response = await processRealEstateQuery(query, chatHistory || []);
      res.json(response);
    } catch (error) {
      console.error("[express] Error with chatbot:", error);
      res.status(500).json({ 
        message: "Error processing chatbot query",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // ----- Property Map Visualization and Market Trends Routes -----
  
  // Get properties with geo data for map visualization
  app.get("/api/properties-geo", async (req, res) => {
    try {
      console.log("[express] Fetching properties with geo data for map visualization");
      
      // Get properties with geo coordinates from storage
      const propertiesWithGeo = await storage.getPropertiesWithGeo();
      
      // If includeIDX query parameter is true, also fetch and include IDX listings with geo data
      const includeIDX = req.query.includeIDX === "true";
      let idxListings: any[] = [];
      
      if (includeIDX && process.env.IDX_BROKER_API_KEY) {
        try {
          console.log("[express] Including IDX listings in geo data");
          const idxResponse = await fetchIdxListings({});
          
          // Geocode the IDX listings (in a real implementation, these would already have coordinates)
          idxListings = idxResponse.listings.map((listing, index) => {
            // Generate some random coordinates near San Francisco for demo purposes
            const latitude = 37.7749 + (Math.random() - 0.5) * 0.1;
            const longitude = -122.4194 + (Math.random() - 0.5) * 0.1;
            
            return {
              listingId: listing.listingId || `idx-${index}`,
              address: listing.address,
              city: listing.city,
              state: listing.state,
              zipCode: listing.zipCode,
              price: listing.price,
              bedrooms: listing.bedrooms,
              bathrooms: listing.bathrooms,
              sqft: listing.sqft,
              propertyType: listing.propertyType,
              latitude,
              longitude,
              images: listing.images || [],
              description: listing.description,
              listedDate: listing.listedDate,
            };
          });
        } catch (idxError) {
          console.error("[express] Error fetching IDX listings for map:", idxError);
        }
      }
      
      // Combine properties
      const allProperties = [...propertiesWithGeo, ...idxListings];
      
      res.json({
        listings: allProperties,
        totalCount: allProperties.length,
        hasMoreListings: false
      });
    } catch (error) {
      console.error("[express] Error fetching geo properties:", error);
      res.status(500).json({ 
        message: "Error fetching properties with geo data",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get market trends data
  app.get("/api/market-trends", async (req, res) => {
    try {
      console.log("[express] Fetching market trends data");
      
      // Get filter parameters
      const year = req.query.year ? Number(req.query.year) : undefined;
      const neighborhood = req.query.neighborhood ? String(req.query.neighborhood) : undefined;
      const propertyType = req.query.propertyType ? String(req.query.propertyType) : undefined;
      
      let trendsData;
      
      // Apply filters if provided
      if (year) {
        trendsData = await storage.getMarketTrendsByYear(year);
      } else {
        trendsData = await storage.getMarketTrendData();
      }
      
      // Filter by neighborhood if provided
      if (neighborhood) {
        trendsData = trendsData.filter(trend => 
          trend.neighborhood === neighborhood || trend.neighborhood === undefined
        );
      }
      
      // Filter by property type if provided
      if (propertyType) {
        trendsData = trendsData.filter(trend => 
          trend.propertyType === propertyType || trend.propertyType === undefined
        );
      }
      
      res.json(trendsData);
    } catch (error) {
      console.error("[express] Error fetching market trends:", error);
      res.status(500).json({ 
        message: "Error fetching market trends data",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get neighborhood statistics
  app.get("/api/neighborhoods", async (req, res) => {
    try {
      console.log("[express] Fetching neighborhood statistics");
      
      // Get all market trend data
      const trendsData = await storage.getMarketTrendData();
      
      // Get unique neighborhoods
      const neighborhoods = Array.from(new Set(
        trendsData.map(trend => trend.neighborhood).filter(Boolean)
      ));
      
      // Calculate stats for each neighborhood
      const stats = neighborhoods.map(neighborhood => {
        // Filter data for this neighborhood
        const neighborhoodData = trendsData.filter(trend => trend.neighborhood === neighborhood);
        
        // Get most recent data point
        const latestData = neighborhoodData.sort((a, b) => {
          // Sort by year and quarter (descending)
          if (a.year !== b.year) return b.year - a.year;
          return b.quarter - a.quarter;
        })[0];
        
        // Calculate averages
        const averagePrice = Math.round(
          neighborhoodData.reduce((sum, trend) => sum + trend.averagePrice, 0) / neighborhoodData.length
        );
        
        const averageDaysOnMarket = Math.round(
          neighborhoodData.reduce((sum, trend) => sum + trend.daysOnMarket, 0) / neighborhoodData.length
        );
        
        return {
          name: neighborhood,
          averagePrice,
          medianPrice: latestData.medianPrice,
          averageDaysOnMarket,
          percentageChange: latestData.percentageChange,
          salesVolume: latestData.salesVolume
        };
      });
      
      res.json(stats);
    } catch (error) {
      console.error("[express] Error fetching neighborhood statistics:", error);
      res.status(500).json({ 
        message: "Error fetching neighborhood statistics",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // AI property recommendations endpoint based on user preferences
  app.post("/api/ai-property-recommendations", async (req, res) => {
    try {
      const userPreferences = req.body;
      
      if (!userPreferences) {
        return res.status(400).json({ error: "User preferences are required" });
      }
      
      console.log("[express] Generating AI property recommendations based on user preferences");
      
      // Generate recommendations
      const recommendedProperties = await generatePropertyRecommendations(userPreferences);
      
      console.log(`[express] Found ${recommendedProperties.length} recommended properties`);
      
      res.json(recommendedProperties);
    } catch (error) {
      console.error("AI property recommendations error:", error);
      res.status(500).json({ 
        error: "Error generating property recommendations", 
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Payment processing with Stripe
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('[express] STRIPE_SECRET_KEY is not set, payment features will not work');
  } else {
    console.log('[express] Stripe integration initialized');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Create payment intent for one-time payments
    app.post("/api/create-payment-intent", async (req, res) => {
      try {
        const { amount, serviceIds, metadata } = req.body;
        
        // Validate amount - must be a number and at least 0.5 for Stripe
        if (!amount || typeof amount !== 'number' || isNaN(amount) || amount < 0.5) {
          return res.status(400).json({ 
            message: "Amount is required and must be at least $0.50",
            error: "Invalid amount"
          });
        }

        console.log(`[express] Creating payment intent for amount: $${amount.toFixed(2)}`);
        
        let enhancedMetadata = metadata || {};
        
        // If service IDs are provided, retrieve service details and include in metadata
        if (serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0) {
          try {
            // Get service details to include in metadata
            const services = await Promise.all(
              serviceIds.map(async (id) => {
                try {
                  const service = await storage.getServiceOffering(Number(id));
                  return service ? {
                    id: service.id,
                    name: service.name,
                    type: service.serviceType
                  } : null;
                } catch (err) {
                  console.error(`[express] Error retrieving service ID ${id}:`, err);
                  return null;
                }
              })
            );
            
            const validServices = services.filter(s => s !== null);
            enhancedMetadata = {
              ...enhancedMetadata,
              services: JSON.stringify(validServices),
              serviceCount: validServices.length
            };
            
            console.log(`[express] Payment for ${validServices.length} services: ${validServices.map(s => s.name).join(', ')}`);
          } catch (err) {
            console.error('[express] Error retrieving service details:', err);
            // Continue with payment intent creation even if service details couldn't be retrieved
          }
        }
        
        try {
          // Create a payment intent
          const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            metadata: enhancedMetadata,
            automatic_payment_methods: {
              enabled: true,
            },
          });
          
          console.log(`[express] Payment intent created: ${paymentIntent.id}`);
          
          res.json({
            clientSecret: paymentIntent.client_secret,
          });
        } catch (stripeError) {
          console.error('[express] Stripe API error:', stripeError);
          
          // Handle specific Stripe errors
          if (stripeError.type === 'StripeCardError') {
            return res.status(400).json({ 
              message: "Payment card error", 
              error: stripeError.message 
            });
          } else if (stripeError.type === 'StripeInvalidRequestError') {
            return res.status(400).json({ 
              message: "Invalid request to payment processor", 
              error: stripeError.message 
            });
          } else {
            // For other types of errors
            return res.status(500).json({ 
              message: "Payment processor error", 
              error: stripeError.message 
            });
          }
        }
      } catch (error) {
        console.error('[express] Error creating payment intent:', error);
        res.status(500).json({ 
          message: "Error creating payment intent", 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Webhook to handle Stripe events
    app.post("/api/stripe-webhook", async (req, res) => {
      const sig = req.headers['stripe-signature'];
      
      // In a production app, we'd implement proper signature verification
      // with a webhook secret, but we're skipping that for this demo
      try {
        const event = req.body;
        
        // Handle different event types
        switch (event.type) {
          case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log(`[express] Payment succeeded: ${paymentIntent.id}`);
            // Here we would update our database, send confirmation emails, etc.
            break;
            
          case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log(`[express] Payment failed: ${failedPayment.id}`);
            // Here we would handle failed payments
            break;
            
          default:
            console.log(`[express] Unhandled Stripe event: ${event.type}`);
        }
        
        res.sendStatus(200);
      } catch (error) {
        console.error('[express] Error handling webhook:', error);
        res.status(400).send(`Webhook Error: ${error.message}`);
      }
    });
  }

  // Initialize chat service
  const wss = initializeChat(httpServer);
  console.log('[express] WebSocket server initialized for chat');
  
  // Chat conversation routes
  app.post("/api/chat/conversations", async (req, res) => {
    try {
      const data = insertChatConversationSchema.parse(req.body);
      const conversation = await storage.createChatConversation(data);
      res.status(201).json(conversation);
    } catch (error) {
      console.error('[express] Error creating chat conversation:', error);
      res.status(400).json({ message: "Invalid conversation data" });
    }
  });
  
  app.get("/api/chat/conversations", async (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      
      if (userId) {
        const conversations = await storage.getChatConversationsByUserId(userId);
        res.json(conversations);
      } else {
        const conversations = await storage.getChatConversations();
        res.json(conversations);
      }
    } catch (error) {
      console.error('[express] Error fetching chat conversations:', error);
      res.status(500).json({ message: "Error fetching conversations" });
    }
  });
  
  app.get("/api/chat/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.getChatConversation(Number(req.params.id));
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error('[express] Error fetching chat conversation:', error);
      res.status(500).json({ message: "Error fetching conversation" });
    }
  });
  
  app.post("/api/chat/participants", async (req, res) => {
    try {
      const data = insertChatParticipantSchema.parse(req.body);
      const participant = await storage.addChatParticipant(data);
      res.status(201).json(participant);
    } catch (error) {
      console.error('[express] Error adding chat participant:', error);
      res.status(400).json({ message: "Invalid participant data" });
    }
  });
  
  app.delete("/api/chat/participants/:conversationId/:userId", async (req, res) => {
    try {
      const conversationId = Number(req.params.conversationId);
      const userId = Number(req.params.userId);
      
      const removed = await storage.removeChatParticipant(conversationId, userId);
      if (!removed) {
        return res.status(404).json({ message: "Participant not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('[express] Error removing chat participant:', error);
      res.status(500).json({ message: "Error removing participant" });
    }
  });
  
  app.get("/api/chat/messages/:conversationId", async (req, res) => {
    try {
      const conversationId = Number(req.params.conversationId);
      const messages = await storage.getChatMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error('[express] Error fetching chat messages:', error);
      res.status(500).json({ message: "Error fetching messages" });
    }
  });
  
  app.post("/api/chat/read/:conversationId/:userId", async (req, res) => {
    try {
      const conversationId = Number(req.params.conversationId);
      const userId = Number(req.params.userId);
      
      await storage.markChatMessagesAsRead(conversationId, userId);
      res.status(204).send();
    } catch (error) {
      console.error('[express] Error marking messages as read:', error);
      res.status(500).json({ message: "Error marking messages as read" });
    }
  });
  
  // Appointment routes
  app.post("/api/appointments", async (req, res) => {
    try {
      // Convert the string date to a Date object
      const appointmentData = {
        ...req.body,
        date: new Date(req.body.date)
      };
      
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      console.error('[express] Error creating appointment:', error);
      res.status(400).json({ message: "Invalid appointment data" });
    }
  });
  
  app.get("/api/appointments", async (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const expertId = req.query.expertId ? Number(req.query.expertId) : undefined;
      const propertyId = req.query.propertyId ? Number(req.query.propertyId) : undefined;
      
      if (userId) {
        const appointments = await storage.getAppointmentsByUser(userId);
        res.json(appointments);
      } else if (expertId) {
        const appointments = await storage.getAppointmentsByExpert(expertId);
        res.json(appointments);
      } else if (propertyId) {
        const appointments = await storage.getAppointmentsByProperty(propertyId);
        res.json(appointments);
      } else {
        res.status(400).json({ message: "Missing filter parameter (userId, expertId, or propertyId)" });
      }
    } catch (error) {
      console.error('[express] Error fetching appointments:', error);
      res.status(500).json({ message: "Error fetching appointments" });
    }
  });
  
  app.get("/api/appointments/:id", async (req, res) => {
    try {
      const appointment = await storage.getAppointment(Number(req.params.id));
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      console.error('[express] Error fetching appointment:', error);
      res.status(500).json({ message: "Error fetching appointment" });
    }
  });
  
  app.patch("/api/appointments/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const appointment = await storage.updateAppointmentStatus(Number(req.params.id), status);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (error) {
      console.error('[express] Error updating appointment status:', error);
      res.status(500).json({ message: "Error updating appointment status" });
    }
  });
  
  // Register custom video serving routes
  registerVideoRoutes(app);
  
  return httpServer;
}