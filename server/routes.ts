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

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error" });
  });

  return httpServer;
}