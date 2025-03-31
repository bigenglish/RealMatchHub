import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema, insertServiceProviderSchema } from "@shared/schema";
import { fetchIdxListings, testIdxConnection } from "./idx-broker"; // Import from idx-broker.ts

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Property routes
  app.get("/api/properties", async (_req, res) => {
    try {
      console.log("[express] Fetching properties from storage and IDX Broker");
      const properties = await storage.getProperties();
      console.log(`[express] Fetched ${properties.length} properties from local storage`);
      
      const idxListings = await fetchIdxListings({ limit: 10 }); // Fetch 10 listings from IDX
      console.log(`[express] Fetched ${idxListings.listings.length} listings from IDX Broker`);
      
      // Log the first property and first IDX listing for debugging
      if (properties.length > 0) {
        console.log("[express] First property sample:", {
          id: properties[0].id,
          title: properties[0].title,
          type: properties[0].propertyType
        });
      }
      
      if (idxListings.listings.length > 0) {
        console.log("[express] First IDX listing sample:", {
          id: idxListings.listings[0].listingId,
          address: idxListings.listings[0].address,
          type: idxListings.listings[0].propertyType
        });
      }

      // Combine your properties with IDX listings
      const combinedProperties = {
        yourProperties: properties,
        idxListings: idxListings.listings, // IDX returns "listings" array
      };

      console.log("[express] Sending combined response with:", {
        yourPropertiesCount: properties.length,
        idxListingsCount: idxListings.listings.length
      });
      
      res.json(combinedProperties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    const id = Number(req.params.id);
    
    // Check if this is a regular property from our database
    const property = await storage.getProperty(id);
    if (property) {
      return res.json(property);
    }
    
    // If not found in our database, check if it's an IDX listing
    // IDX listings use IDs starting from 1000 (as we convert them in the frontend)
    if (id >= 1000) {
      try {
        // Get all IDX listings
        const idxResponse = await fetchIdxListings({ limit: 10 });
        
        // Convert IDX ID format back to the original format
        const idxId = `IDX${id - 1000}`;
        
        // Find matching IDX listing
        const idxListing = idxResponse.listings.find(listing => listing.listingId === idxId);
        
        if (idxListing) {
          // Convert the IDX listing to the format expected by the frontend
          const convertedListing = {
            id,
            title: `${idxListing.address}, ${idxListing.city}`,
            description: idxListing.description,
            price: idxListing.price,
            address: `${idxListing.address}, ${idxListing.city}, ${idxListing.state} ${idxListing.zipCode}`,
            bedrooms: idxListing.bedrooms,
            bathrooms: idxListing.bathrooms,
            sqft: idxListing.sqft,
            propertyType: idxListing.propertyType,
            images: idxListing.images || [],
            listedDate: idxListing.listedDate
          };
          
          return res.json(convertedListing);
        }
      } catch (error) {
        console.error("Error fetching IDX listing:", error);
      }
    }
    
    // If we reach here, the property wasn't found
    return res.status(404).json({ message: "Property not found" });
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

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error" });
  });

  return httpServer;
}