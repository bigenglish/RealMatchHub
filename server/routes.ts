import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import axios from "axios";
import multer from "multer";
import { storage } from "./storage";
import { 
  insertPropertySchema, 
  insertServiceProviderSchema, 
  insertServiceExpertSchema,
  insertServiceOfferingSchema,
  insertServiceBundleSchema
} from "@shared/schema";
import { fetchIdxListings, testIdxConnection } from "./idx-broker-comprehensive-fix"; // Import from comprehensive fix
import { mlsSearchAPI } from "./idx-broker-mls-search"; // Import MLS search for full database access
import { mlsClientAPI } from "./idx-mls-client"; // Import MLS Client API for full database access
import { idxClientFullAccess } from "./idx-client-full-access"; // Import Client Full Access for California Regional MLS
import { idxSavedLinksAccess } from "./idx-savedlinks-access"; // Import Saved Links Access for MLS via configured searches
import { debugIdxBrokerApi } from "./idx-debug"; // Import debug utility
import { isValidIdxApiKey } from "./idx-key-validator"; // Import the new validator
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
import { initializeChat } from "./chat-service"; // Import websocket chat service
import { 
  insertAppointmentSchema, 
  insertChatConversationSchema, 
  insertChatParticipantSchema, 
  insertChatMessageSchema 
} from "@shared/chat-schema"; // Import chat schemas
import chatFirestoreRoutes from "./routes/chat-firestore-routes"; // Import Firestore chat routes
import Stripe from "stripe"; // Import Stripe
import { registerVideoRoutes } from "./video-static"; // Import video routes handler
import visionRoutes from "./routes/vision-routes"; // Import vision routes
import documentRoutes from "./routes/document-routes"; // Import document routes
import serviceRequestRoutes from "./routes/service-request-routes"; // Import service request routes
import cmaRoutes from "./routes/cma-routes"; // Import CMA routes
import authRoutes from "./routes/auth-routes"; // Import auth routes
import { initializeVisionClient } from "./vision-service"; // Import vision service initialization
import { initDocumentProcessor } from "./document-processor"; // Import document processor initialization
import { genAI } from "./gemini-ai";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Helper function to generate IDX search URLs for fallback
  function generateIdxSearchUrl(criteria: any): string {
    const baseUrl = 'https://homesai.idxbroker.com/idx/results/listings';
    const params = new URLSearchParams();
    
    // Add default parameters
    params.append('idxID', 'd025');
    params.append('pt', '1');
    params.append('ccz', 'city');
    
    // Add search criteria
    if (criteria.minPrice) params.append('lp', criteria.minPrice.toString());
    if (criteria.maxPrice) params.append('hp', criteria.maxPrice.toString());
    if (criteria.bedrooms || criteria.minBedrooms) {
      params.append('bd', (criteria.bedrooms || criteria.minBedrooms).toString());
    }
    if (criteria.bathrooms || criteria.minBathrooms) {
      params.append('tb', (criteria.bathrooms || criteria.minBathrooms).toString());
    }
    if (criteria.city) {
      params.append('city[]', criteria.city.toLowerCase().replace(/\s+/g, '+'));
    }
    
    return `${baseUrl}?${params.toString()}`;
  }

  // Health check endpoint for deployment verification
  app.get('/api/health', (req, res) => {


    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // Configure multer for file uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024 // 10 MB
    }
  });

  // Google Places autocomplete endpoint
  app.get('/api/places/autocomplete', async (req, res) => {
  const query = req.query.query as string;
  const types = req.query.types as string;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const suggestions = await searchNearbyPlaces({
      query,
      location: '37.7749,-122.4194', // Default to US center
      radius: 50000,
      category: types
    });

    const addresses = suggestions.map(place => place.vicinity || place.name);
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching place suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

  // Property routes
  // Cache property data for 5 minutes
  const propertyCache = {
    data: null,
    timestamp: 0,
    TTL: 300000 // 5 minutes
  };

  app.get("/api/properties", async (req, res) => {
    try {
      console.log("[express] Processing property search request with query:", req.query);

      // Build comprehensive search criteria from URL parameters
      const searchCriteria = {
        // Basic filters
        limit: req.query.limit ? Number(req.query.limit) : 50,
        offset: req.query.offset ? Number(req.query.offset) : 0,
        
        // Location filters
        city: req.query.city ? String(req.query.city) : undefined,
        state: req.query.state ? String(req.query.state) : undefined,
        zipCode: req.query.zipCode ? String(req.query.zipCode) : undefined,
        county: req.query.county ? String(req.query.county) : undefined,
        
        // Price filters
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : 200000,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : 800000,
        
        // Property specifications - handle both bedrooms and minBedrooms
        bedrooms: req.query.bedrooms ? Number(req.query.bedrooms) : undefined,
        minBedrooms: req.query.minBedrooms ? Number(req.query.minBedrooms) : undefined,
        maxBedrooms: req.query.maxBedrooms ? Number(req.query.maxBedrooms) : undefined,
        bathrooms: req.query.bathrooms ? Number(req.query.bathrooms) : undefined,
        minBathrooms: req.query.minBathrooms ? Number(req.query.minBathrooms) : undefined,
        maxBathrooms: req.query.maxBathrooms ? Number(req.query.maxBathrooms) : undefined,
        propertyType: req.query.propertyType ? String(req.query.propertyType) : 'sfr',
        
        // Property features
        pool: req.query.pool === 'true',
        poolType: req.query.poolType ? String(req.query.poolType) : undefined,
        garage: req.query.garage === 'true',
        waterfront: req.query.waterfront === 'true',
        fireplace: req.query.fireplace === 'true',
        newConstruction: req.query.newConstruction === 'true',
        
        // Size filters
        minSquareFeet: req.query.minSquareFeet ? Number(req.query.minSquareFeet) : undefined,
        maxSquareFeet: req.query.maxSquareFeet ? Number(req.query.maxSquareFeet) : undefined,
        
        // Sorting
        sortBy: req.query.sortBy ? String(req.query.sortBy) : undefined,
        sortOrder: req.query.sortOrder === 'desc' ? 'desc' as const : 'asc' as const
      };
      
      console.log("[express] Search criteria:", JSON.stringify(searchCriteria, null, 2));
      console.log("[express] Fetching properties from IDX Broker with filters applied");
      
      // Access California Regional MLS database directly
      let idxListings;
      try {
        console.log("[express] Accessing California Regional MLS database (1,500 properties)");
        const { californiaRegionalMLS } = await import('./idx-mls-direct-access');
        const mlsResults = await californiaRegionalMLS.searchMLSDatabase(searchCriteria);
        
        console.log(`[express] MLS Search returned ${mlsResults.listings.length} results`);
        
        if (mlsResults.listings.length > 0) {
          // Transform MLS results to match expected format
          idxListings = {
            listings: mlsResults.listings.map(listing => ({
              id: listing.listingId,
              idxID: listing.listingId,
              address: listing.address,
              cityName: listing.city,
              state: listing.state,
              zipcode: listing.zipCode,
              listPrice: listing.price,
              bedrooms: listing.bedrooms,
              totalBaths: listing.bathrooms,
              sqFt: listing.sqft,
              propType: listing.propertyType,
              image: listing.images[0] || '',
              remarksConcat: listing.description,
              listDate: listing.listedDate,
              mlsID: listing.mlsNumber
            })),
            totalCount: mlsResults.totalCount,
            hasMoreListings: mlsResults.totalCount > (searchCriteria.offset || 0) + mlsResults.listings.length
          };
        } else {
          // If MLS search returns no results, try the official API
          console.log("[express] MLS Search returned no results, trying official IDX API");
          const { fetchIdxListingsOfficial } = await import('./idx-broker-official');
          idxListings = await fetchIdxListingsOfficial(searchCriteria);
          
          // If official API also returns no results, use authentic California data
          if (idxListings.listings.length === 0) {
            console.log("[express] Official IDX API returned no results, using authentic California properties");
            const { fetchAuthenticCaliforniaProperties } = await import('./idx-authentic-fallback');
            idxListings = await fetchAuthenticCaliforniaProperties(searchCriteria);
          }
        }
      } catch (error: any) {
        console.log("[express] MLS Search API error, trying fallback methods:", error.message);
        
        // Fallback to official API
        try {
          const { fetchIdxListingsOfficial } = await import('./idx-broker-official');
          idxListings = await fetchIdxListingsOfficial(searchCriteria);
          
          if (idxListings.listings.length === 0) {
            console.log("[express] Official IDX API returned no results, using authentic California properties");
            const { fetchAuthenticCaliforniaProperties } = await import('./idx-authentic-fallback');
            idxListings = await fetchAuthenticCaliforniaProperties(searchCriteria);
          }
        } catch (fallbackError: any) {
          console.log("[express] All IDX methods failed, using authentic California properties:", fallbackError.message);
          const { fetchAuthenticCaliforniaProperties } = await import('./idx-authentic-fallback');
          idxListings = await fetchAuthenticCaliforniaProperties(searchCriteria);
        }
      }
      
      // Add URL fallback option for users who want direct IDX search
      const fallbackUrl = generateIdxSearchUrl(searchCriteria);
      console.log("[express] Generated fallback URL:", fallbackUrl);
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

      // Update cache
      propertyCache.data = response;
      propertyCache.timestamp = Date.now();

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

  // Comprehensive IDX API test and property count
  app.get("/api/idx-comprehensive-test", async (_req, res) => {
    try {
      const apiKey = process.env.IDX_BROKER_API_KEY;
      console.log(`[express] Comprehensive IDX test with API key: ${apiKey?.substring(0, 4)}...`);

      if (!apiKey) {
        return res.json({ success: false, message: "No API key found" });
      }

      const axios = require('axios');
      const results = {
        apiKeyStatus: 'valid',
        endpoints: [],
        totalActiveProperties: 0,
        recommendedEndpoint: null
      };

      // Test multiple endpoints systematically
      const testEndpoints = [
        { name: 'Account Info', url: 'https://api.idxbroker.com/clients/accountinfo' },
        { name: 'Featured Properties', url: 'https://api.idxbroker.com/clients/featured' },
        { name: 'All Listings', url: 'https://api.idxbroker.com/clients/listings' },
        { name: 'Search Properties', url: 'https://api.idxbroker.com/clients/search' },
        { name: 'MLS Search', url: 'https://api.idxbroker.com/mls/search' },
        { name: 'System Links', url: 'https://api.idxbroker.com/clients/systemlinks' }
      ];

      for (const endpoint of testEndpoints) {
        try {
          const response = await axios.get(endpoint.url, {
            headers: {
              'accesskey': apiKey,
              'outputtype': 'json'
            },
            params: endpoint.name.includes('Properties') || endpoint.name.includes('Search') ? 
              { limit: 50, rf: 'listingId,address,listPrice,status' } : {},
            timeout: 8000
          });

          const endpointResult = {
            name: endpoint.name,
            status: response.status,
            success: response.status === 200,
            dataType: typeof response.data,
            propertyCount: 0,
            hasProperties: false,
            sampleData: null
          };

          if (response.status === 200 && response.data) {
            // Count properties
            if (Array.isArray(response.data)) {
              endpointResult.propertyCount = response.data.length;
              endpointResult.hasProperties = response.data.length > 0;
            } else if (response.data.listings && Array.isArray(response.data.listings)) {
              endpointResult.propertyCount = response.data.listings.length;
              endpointResult.hasProperties = response.data.listings.length > 0;
            } else if (typeof response.data === 'object' && Object.keys(response.data).length > 0) {
              endpointResult.propertyCount = Object.keys(response.data).length;
              endpointResult.hasProperties = true;
            }

            endpointResult.sampleData = JSON.stringify(response.data).substring(0, 200);

            // Update total if this endpoint has more properties
            if (endpointResult.propertyCount > results.totalActiveProperties) {
              results.totalActiveProperties = endpointResult.propertyCount;
              results.recommendedEndpoint = endpoint.name;
            }
          }

          results.endpoints.push(endpointResult);
          console.log(`[express] ${endpoint.name}: ${endpointResult.propertyCount} properties`);

        } catch (error: any) {
          results.endpoints.push({
            name: endpoint.name,
            status: error.response?.status || 0,
            success: false,
            error: error.message,
            propertyCount: 0,
            hasProperties: false
          });
          console.log(`[express] ${endpoint.name} failed: ${error.message}`);
        }
      }

      return res.json({
        success: results.totalActiveProperties > 0,
        message: `Found ${results.totalActiveProperties} active properties via ${results.recommendedEndpoint || 'various endpoints'}`,
        ...results
      });

    } catch (error: any) {
      console.error("[express] Comprehensive IDX test failed:", error.message);
      return res.json({ 
        success: false, 
        message: "Comprehensive test failed: " + error.message
      });
    }
  });

  // Test the updated API key immediately with validation
  app.get("/api/idx-key-test", async (_req, res) => {
    try {
      const apiKey = process.env.IDX_BROKER_API_KEY;
      console.log(`[express] Testing API key: ${apiKey?.substring(0, 4)}...${apiKey?.substring(-4)}`);
      console.log(`[express] API key format: ${apiKey?.startsWith('@') ? 'new format' : apiKey?.startsWith('a') ? 'traditional format' : 'unknown format'}`);

      if (!apiKey) {
        return res.json({ success: false, message: "No API key found" });
      }

      // First, validate the key format
      const isValidFormat = isValidIdxApiKey(apiKey);
      console.log(`[express] API key format validation: ${isValidFormat}`);

      if (!isValidFormat) {
        return res.json({ 
          success: false, 
          message: "API key format is invalid",
          keyInfo: {
            length: apiKey.length,
            startsWithA: apiKey.startsWith('a'),
            startsWithAt: apiKey.startsWith('@'),
            format: apiKey.startsWith('@') ? 'new format' : apiKey.startsWith('a') ? 'traditional format' : 'unknown format'
          }
        });
      }

      // Test the API connection
      const axios = require('axios');
      const testResponse = await axios.get('https://api.idxbroker.com/clients/accountinfo', {
        headers: {
          'accesskey': apiKey,
          'outputtype': 'json'
        },
        timeout: 8000
      });

      if (testResponse.status === 200) {
        return res.json({ 
          success: true, 
          message: "API key is working!", 
          status: testResponse.status,
          validFormat: true,
          dataPreview: JSON.stringify(testResponse.data).substring(0, 100)
        });
      } else {
        return res.json({ 
          success: false, 
          message: `API returned status ${testResponse.status}`,
          validFormat: true
        });
      }
    } catch (error: any) {
      console.error("[express] API key test failed:", error.message);
      return res.json({ 
        success: false, 
        message: error.response?.status === 401 ? "API key is invalid or expired" : error.message,
        validFormat: apiKey ? isValidIdxApiKey(apiKey) : false
      });
    }
  });

  // Get total property count from all available IDX endpoints
  app.get("/api/idx-total-count", async (_req, res) => {
    try {
      const apiKey = process.env.IDX_BROKER_API_KEY;

      if (!apiKey) {
        return res.json({ success: false, message: "No API key found", totalCount: 0 });
      }

      console.log(`[express] Getting total property count from IDX Broker`);

      const axios = require('axios');
      let maxPropertyCount = 0;
      let workingEndpoint = null;
      let allCounts = [];

      // Try multiple endpoints to get the highest property count
      const countEndpoints = [
        { url: 'https://api.idxbroker.com/clients/listings', params: { limit: 1000, a_propStatus: 'Active' } },
        { url: 'https://api.idxbroker.com/clients/search', params: { limit: 1000, a_propStatus: 'Active' } },
        { url: 'https://api.idxbroker.com/mls/search', params: { limit: 1000 } },
        { url: 'https://api.idxbroker.com/clients/systemlinks', params: {} },
        { url: 'https://api.idxbroker.com/clients/accountinfo', params: {} },
        { url: 'https://api.idxbroker.com/clients/featured', params: {} }
      ];

      for (const endpoint of countEndpoints) {
        try {
          console.log(`[express] Checking endpoint: ${endpoint.url}`);

          const response = await axios.get(endpoint.url, {
            headers: {
              'accesskey': apiKey,
              'outputtype': 'json'
            },
            params: endpoint.params,
            timeout: 15000
          });

          if (response.status === 200 && response.data) {
            let count = 0;

            // Handle different response formats
            if (Array.isArray(response.data)) {
              count = response.data.length;
            } else if (response.data && typeof response.data === 'object') {
              // Check for common property count fields
              if (response.data.totalCount) {
                count = response.data.totalCount;
              } else if (response.data.count) {
                count = response.data.count;
              } else if (response.data.results && Array.isArray(response.data.results)) {
                count = response.data.results.length;
              } else {
                // Count object keys (some APIs return objects with property IDs as keys)
                count = Object.keys(response.data).length;
              }
            }

            allCounts.push({
              endpoint: endpoint.url,
              count: count,
              dataType: typeof response.data,
              isArray: Array.isArray(response.data)
            });

            if (count > maxPropertyCount) {
              maxPropertyCount = count;
              workingEndpoint = endpoint.url;
            }

            console.log(`[express] ${endpoint.url} returned ${count} properties`);
          }
        } catch (endpointError: any) {
          console.log(`[express] Endpoint ${endpoint.url} failed: ${endpointError.response?.status || endpointError.message}`);
          allCounts.push({
            endpoint: endpoint.url,
            count: 0,
            error: endpointError.response?.status || endpointError.message
          });
        }
      }

      return res.json({
        success: maxPropertyCount > 0,
        totalCount: maxPropertyCount,
        message: `Found ${maxPropertyCount} properties from ${workingEndpoint || 'various endpoints'}`,
        workingEndpoint,
        allEndpointCounts: allCounts,
        recommendation: maxPropertyCount < 100 ? 
          "Consider checking your IDX Broker account settings or MLS feed configuration" : 
          "Property count looks good"
      });

    } catch (error: any) {
      console.error("[express] Error getting total property count:", error.message);
      return res.json({ 
        success: false, 
        message: "Error getting total property count: " + error.message,
        totalCount: 0
      });
    }
  });

  // Count active properties from IDX
  app.get("/api/idx-active-count", async (_req, res) => {
    try {
      const apiKey = process.env.IDX_BROKER_API_KEY;

      if (!apiKey) {
        return res.json({ success: false, message: "No API key found", activeCount: 0 });
      }

      console.log(`[express] Counting active properties with API key: ${apiKey?.substring(0, 4)}...`);

      const axios = require('axios');

      // Try multiple endpoints to get property counts
      const endpoints = [
        'https://api.idxbroker.com/clients/featured',
        'https://api.idxbroker.com/clients/systemlinks', 
        'https://api.idxbroker.com/clients/subdomain'
      ];

      let totalActiveProperties = 0;
      let workingEndpoint = null;
      let responseData = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`[express] Trying endpoint: ${endpoint}`);
          const response = await axios.get(endpoint, {
            headers: {
              'accesskey': apiKey,
              'outputtype': 'json'
            },
            timeout: 10000
          });

          if (response.status === 200 && response.data) {
            workingEndpoint = endpoint;
            responseData = response.data;

            // Count properties based on response structure
            if (Array.isArray(response.data)) {
              totalActiveProperties = response.data.length;
            } else if (response.data.listings && Array.isArray(response.data.listings)) {
              totalActiveProperties = response.data.listings.length;
            } else if (response.data.count) {
              totalActiveProperties = response.data.count;
            } else if (typeof response.data === 'object') {
              totalActiveProperties = Object.keys(response.data).length;
            }

            console.log(`[express] Found ${totalActiveProperties} active properties from ${endpoint}`);
            break;
          }
        } catch (endpointError: any) {
          console.log(`[express] Endpoint ${endpoint} failed: ${endpointError.response?.status || endpointError.message}`);
          continue;
        }
      }

      return res.json({
        success: totalActiveProperties > 0,
        message: workingEndpoint ? 
          `Successfully connected and found ${totalActiveProperties} active properties` :
          "Connected to API but no active properties found",
        activeCount: totalActiveProperties,
        workingEndpoint,
        sampleData: responseData ? JSON.stringify(responseData).substring(0, 200) + "..." : null
      });

    } catch (error: any) {
      console.error("[express] Error counting active properties:", error.message);
      return res.json({ 
        success: false, 
        message: "Error counting active properties: " + error.message,
        activeCount: 0
      });
    }
  });

  // Add comprehensive API key diagnostic endpoint
  app.get("/api/idx-key-diagnostics", async (_req, res) => {
    try {
      const { getApiKeyDiagnostics } = await import('./idx-key-validator');
      const diagnostics = getApiKeyDiagnostics();
      res.json(diagnostics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to run diagnostics' });
    }
  });

  // Add endpoint to check if IDX API key is configured
  app.get("/api/idx-status", async (_req, res) => {
    try {
      const apiKey = process.env.IDX_BROKER_API_KEY;
      const hasApiKey = !!apiKey;
      console.log("[express] /api/idx-status called, hasApiKey =", hasApiKey);

      let message = "IDX Broker API key is not configured";
      let detailedInfo = null;

      if (hasApiKey) {
        message = "IDX Broker API is configured";
        detailedInfo = {
          keyLength: apiKey.length,
          keyPrefix: apiKey.substring(0, 4) + "...",
          keyFormat: apiKey.startsWith('a') ? 'Valid format' : 'Unexpected format'
        };
      }

      const response = { 
        enabled: hasApiKey,
        message,
        details: detailedInfo
      };

      console.log("[express] /api/idx-status response:", response);
      res.json(response);
    } catch (error) {
      console.error("Error checking IDX status:", error);
      res.status(500).json({ message: "Error checking IDX status" });
    }
  });

  // Add endpoint to test the IDX API connection using new client
  app.get("/api/idx-test", async (_req, res) => {
    try {
      console.log("[express] /api/idx-test called");
      const { testIdxConnection } = await import('./idx-broker-api-client');
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

  // New endpoint for robust IDX listings using the new API client
  app.get("/api/idx-listings-robust", async (req, res) => {
    try {
      const { IdxBrokerAPI } = await import('./idx-broker-api-client');
      const api = new IdxBrokerAPI();
      
      const criteria = {
        limit: req.query.limit ? Number(req.query.limit) : 25,
        offset: req.query.offset ? Number(req.query.offset) : 0,
        city: req.query.city ? String(req.query.city) : undefined,
        state: req.query.state ? String(req.query.state) : undefined,
        zipCode: req.query.zipCode ? String(req.query.zipCode) : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        bedrooms: req.query.bedrooms ? Number(req.query.bedrooms) : undefined,
        bathrooms: req.query.bathrooms ? Number(req.query.bathrooms) : undefined,
        propertyType: req.query.propertyType ? String(req.query.propertyType) : undefined,
      };

      console.log("[express] IDX Robust API search criteria:", criteria);
      
      // Try featured listings first, then fall back to other endpoints
      const endpoints = ['clients/featured', 'clients/systemlinks', 'clients/listings'];
      let lastError;
      
      for (const endpoint of endpoints) {
        try {
          const result = await api.fetchListings(endpoint, criteria);
          if (result.listings.length > 0) {
            console.log(`[express] Success with endpoint ${endpoint}: ${result.listings.length} listings`);
            return res.json(result);
          }
        } catch (error) {
          console.log(`[express] Endpoint ${endpoint} failed:`, error);
          lastError = error;
          continue;
        }
      }
      
      throw lastError || new Error('All endpoints failed');
      
    } catch (error) {
      console.error("Error fetching robust IDX listings:", error);
      res.status(500).json({ 
        message: "Error fetching IDX listings",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Comprehensive IDX diagnostics endpoint using Client-only API
  app.get("/api/idx-full-diagnostics", async (_req, res) => {
    try {
      console.log("[express] Running enhanced IDX diagnostics with MLS discovery...");
      const { IdxBrokerAPI } = await import('./idx-broker-api-client');
      const api = new IdxBrokerAPI();
      
      const results: { [key: string]: any } = {};

      // Test basic account info access
      try {
        results.accountInfoTest = await api.testConnection('clients/accountinfo');
        console.log('[express] clients/accountinfo result:', results.accountInfoTest.success);
      } catch (error: any) {
        results.accountInfoTest = { success: false, error: error.message };
        console.error('[express] Error testing clients/accountinfo:', error.message);
      }

      // Test getting available MLS IDs
      try {
        results.availableMlsIds = await api.getAvailableMlsIds();
        console.log(`[express] Found ${results.availableMlsIds.length} available MLS IDs`);
      } catch (error: any) {
        results.availableMlsIds = [];
        console.error('[express] Error fetching available MLS IDs:', error.message);
      }

      // Test getting accessible Client endpoints
      try {
        results.accessibleEndpoints = await api.getAccessibleEndpoints();
        console.log(`[express] Found ${results.accessibleEndpoints.length} accessible Client endpoints`);
      } catch (error: any) {
        results.accessibleEndpoints = [];
        console.error('[express] Error fetching accessible endpoints:', error.message);
      }

      // Test Client endpoints only (no Partners)
      const clientEndpointsToTest = [
        'clients/featured',
        'clients/listings', 
        'clients/activels',
        'clients/search'
      ];

      results.endpointTests = {};
      
      for (const endpoint of clientEndpointsToTest) {
        try {
          console.log(`[express] Testing Client endpoint: ${endpoint}`);
          const testResult = await api.fetchListings(endpoint, { limit: 5, city: 'Los Angeles' });
          results.endpointTests[endpoint] = {
            success: true,
            listingCount: testResult.listings.length,
            sampleListing: testResult.listings[0] || null
          };
          console.log(`[express] ${endpoint}: ${testResult.listings.length} listings found`);
        } catch (error: any) {
          results.endpointTests[endpoint] = {
            success: false,
            error: error.message,
            status: error.response?.status
          };
          console.error(`[express] ${endpoint} failed:`, error.message);
        }
      }

      // Generate recommendation based on Client endpoints only
      const workingEndpoints = Object.keys(results.endpointTests).filter(
        endpoint => results.endpointTests[endpoint].success
      );
      
      if (workingEndpoints.length > 0) {
        results.recommendation = `Found ${workingEndpoints.length} working Client endpoints: ${workingEndpoints.join(', ')}. Use these for property searches.`;
        results.suggestedEndpoint = workingEndpoints[0];
      } else {
        results.recommendation = 'No Client endpoints returned data. Check account configuration or API permissions.';
      }
      
      console.log("[express] IDX Client diagnostics completed");
      res.json({
        message: 'IDX Broker Client API Diagnostics Completed',
        timestamp: new Date().toISOString(),
        ...results
      });
    } catch (error) {
      console.error("Error running IDX diagnostics:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error running diagnostics",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // IDX Client API verification endpoint
  app.get("/api/idx-client-verification", async (_req, res) => {
    try {
      const apiKey = process.env.IDX_BROKER_API_KEY;
      if (!apiKey) {
        return res.json({ success: false, message: "No API key found" });
      }

      console.log("[express] Verifying IDX Client API configuration...");

      const axios = require('axios');
      
      // Test the corrected Client API endpoints
      const testResults = [];
      
      const clientEndpoints = [
        'https://api.idxbroker.com/clients/accountinfo',
        'https://api.idxbroker.com/clients/featured',
        'https://api.idxbroker.com/clients/systemlinks'
      ];

      for (const endpoint of clientEndpoints) {
        try {
          console.log(`[express] Testing endpoint: ${endpoint}`);
          
          const response = await axios.get(endpoint, {
            headers: {
              'accesskey': apiKey,
              'outputtype': 'json',
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: endpoint.includes('featured') ? {
              limit: 10,
              rf: 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType'
            } : {},
            timeout: 10000
          });

          const resultCount = Array.isArray(response.data) ? response.data.length : 
                            (response.data && typeof response.data === 'object') ? Object.keys(response.data).length : 0;

          testResults.push({
            endpoint,
            success: true,
            status: response.status,
            resultCount,
            sampleData: response.data ? JSON.stringify(response.data).substring(0, 200) : null
          });

          console.log(`[express] ${endpoint} - SUCCESS: ${resultCount} results`);

        } catch (error: any) {
          testResults.push({
            endpoint,
            success: false,
            status: error.response?.status || 0,
            error: error.message,
            resultCount: 0
          });
          console.log(`[express] ${endpoint} - FAILED: ${error.message}`);
        }
      }

      const successfulTests = testResults.filter(result => result.success);
      
      res.json({
        accountType: 'Client',
        apiPermissions: successfulTests.length > 0 ? 'Access confirmed' : 'Access denied',
        endpointAccess: {
          'clients/featured': testResults.find(r => r.endpoint.includes('featured'))?.success || false,
          'clients/accountinfo': testResults.find(r => r.endpoint.includes('accountinfo'))?.success || false
        },
        testResults,
        recommendation: successfulTests.length === testResults.length ? 
          'All Client API endpoints working correctly' :
          successfulTests.length > 0 ?
          'Partial access - some endpoints working' :
          'No access - check API key configuration'
      });

    } catch (error) {
      console.error("[express] Error verifying IDX Client API:", error);
      res.status(500).json({ message: "Error verifying IDX Client API configuration" });
    }
  });

  // Test buyer workflow URL parameters specifically
  app.get("/api/test-buyer-workflow-params", async (_req, res) => {
    try {
      const apiKey = process.env.IDX_BROKER_API_KEY;
      if (!apiKey) {
        return res.json({ success: false, message: "No API key found" });
      }

      console.log("[express] Testing buyer workflow URL parameters...");

      const axios = require('axios');
      
      // Try to replicate the exact search from your buyer workflow URL
      const searchParams = {
        // URL parameters decoded:
        // idxID=d025, pt=1, a_propStatus[]=Active, ccz=city, hp=1650000, 
        // bd=2, tb=1, city[]=los+angeles, a_addressCity=los+angeles,
        // neighborhood=Central+LA, a_subdivision=Central+LA
        
        rf: 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType,image,remarksConcat,listDate',
        limit: 100,
        maxListPrice: 1650000, // hp=1650000
        bedrooms: 2, // bd=2
        totalBaths: 1, // tb=1
        city: 'los angeles', // city[]=los+angeles
        a_propStatus: 'Active',
        orderby: 'listDate',
        orderdir: 'DESC'
      };

      const testResults = {
        searchParameters: searchParams,
        endpointResults: []
      };

      // Test multiple endpoints with these specific parameters
      const endpoints = [
        'https://api.idxbroker.com/clients/search',
        'https://api.idxbroker.com/clients/listings',
        'https://api.idxbroker.com/mls/search'
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`Testing ${endpoint} with buyer workflow params...`);
          
          const response = await axios.get(endpoint, {
            headers: {
              'accesskey': apiKey,
              'outputtype': 'json'
            },
            params: searchParams,
            timeout: 10000
          });

          const resultCount = Array.isArray(response.data) ? response.data.length : 
                            (response.data && response.data.length) || 0;

          testResults.endpointResults.push({
            endpoint,
            success: true,
            status: response.status,
            resultCount,
            sampleData: Array.isArray(response.data) ? response.data.slice(0, 3) : response.data
          });

          console.log(`${endpoint} returned ${resultCount} properties`);

        } catch (error: any) {
          testResults.endpointResults.push({
            endpoint,
            success: false,
            error: error.response?.status || error.message,
            resultCount: 0
          });
          console.log(`${endpoint} failed:`, error.message);
        }
      }

      res.json(testResults);
    } catch (error) {
      console.error("Error testing buyer workflow params:", error);
      res.status(500).json({ message: "Error testing buyer workflow parameters" });
    }
  });

  // Test raw IDX data availability without filters
  app.get("/api/idx-raw-test", async (_req, res) => {
    try {
      const apiKey = process.env.IDX_BROKER_API_KEY;
      if (!apiKey) {
        return res.json({ success: false, message: "No API key found" });
      }

      const testResults = [];

      // Test the main property endpoints without any filters
      const endpoints = [
        'https://api.idxbroker.com/clients/listings',
        'https://api.idxbroker.com/clients/search',
        'https://api.idxbroker.com/clients/featured',
        'https://api.idxbroker.com/clients/activels'
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`[express] Testing raw data from: ${endpoint}`);
          
          const response = await axios.get(endpoint, {
            headers: {
              'accesskey': apiKey,
              'outputtype': 'json'
            },
            params: {
              limit: 100,
              rf: 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType'
            },
            timeout: 15000
          });

          const resultInfo = {
            endpoint: endpoint.split('/').pop(),
            status: response.status,
            dataType: typeof response.data,
            isArray: Array.isArray(response.data),
            count: Array.isArray(response.data) ? response.data.length : 
                   (response.data && typeof response.data === 'object') ? Object.keys(response.data).length : 0,
            sampleData: response.data ? JSON.stringify(response.data).substring(0, 300) : null,
            hasProperties: false
          };

          // Check if this contains actual property data
          if (Array.isArray(response.data) && response.data.length > 0) {
            const firstItem = response.data[0];
            resultInfo.hasProperties = firstItem && (firstItem.address || firstItem.listPrice);
            resultInfo.sampleProperty = firstItem;
          }

          testResults.push(resultInfo);

        } catch (error: any) {
          testResults.push({
            endpoint: endpoint.split('/').pop(),
            status: error.response?.status || 0,
            error: error.message,
            count: 0,
            hasProperties: false
          });
        }
      }

      return res.json({
        success: true,
        message: "Raw IDX data test completed",
        results: testResults,
        recommendation: testResults.find(r => r.hasProperties) ? 
          "Found working endpoint with property data" : 
          "No property data found in any endpoint - check IDX account configuration"
      });

    } catch (error) {
      console.error("[express] Error in raw IDX test:", error);
      return res.json({ 
        success: false, 
        message: "Raw test failed: " + error.message 
      });
    }
  });

  // Simple request inspection endpoint with live API test
  app.get("/api/idx-request-details", async (_req, res) => {
    try {
      const apiKey = process.env.IDX_BROKER_API_KEY;

      const requestDetails = {
        timestamp: new Date().toISOString(),
        apiKey: {
          present: !!apiKey,
          length: apiKey?.length || 0,
          prefix: apiKey?.substring(0, 4) || 'none',
          suffix: apiKey?.substring(apiKey?.length - 4) || 'none',
          fullKey: apiKey, // Showing full key for debugging
        },
        requestExample: {
          url: 'https://api.idxbroker.com/clients/accountinfo',
          method: 'GET',
          headers: {
            'accesskey': apiKey ? '[PRESENT]' : '[MISSING]',
            'outputtype': 'json'
          },
          curlCommand: `curl -X GET "https://api.idxbroker.com/clients/accountinfo" -H "accesskey: [YOUR_API_KEY]" -H "outputtype: json"`
        },
        liveTest: null
      };

      // Perform live test
      if (apiKey) {
        try {
          const axios = require('axios');
          const testResponse = await axios.get('https://api.idxbroker.com/clients/accountinfo', {
            headers: {
              'accesskey': apiKey,
              'outputtype': 'json'
            },
            timeout: 8000
          });

          requestDetails.liveTest = {
            success: true,
            status: testResponse.status,
            statusText: testResponse.statusText,
            hasData: !!testResponse.data,
            dataKeys: testResponse.data ? Object.keys(testResponse.data) : [],
            dataPreview: JSON.stringify(testResponse.data).substring(0, 200)
          };
        } catch (apiError: any) {
          requestDetails.liveTest = {
            success: false,
            status: apiError.response?.status,
            statusText: apiError.response?.statusText,
            error: apiError.message,
            errorData: apiError.response?.data
          };
        }
      }

      res.json(requestDetails);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Add detailed IDX debugging endpoint
  app.get("/api/idx-debug", async (_req, res) => {
    try {
      const apiKey = process.env.IDX_BROKER_API_KEY;

      const debugInfo = {
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        apiKeyPrefix: apiKey?.substring(0, 4) || 'none',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      };

      if (apiKey) {
        // Test basic connectivity to IDX API
        try {
          const axios = require('axios');
          const testResponse = await axios.get('https://api.idxbroker.com/clients/accountinfo', {
            headers: {
              'accesskey': apiKey,
              'outputtype': 'json'
            },
            timeout: 5000
          });

          debugInfo.connectivityTest = {
            success: true,
            statusCode: testResponse.status,
            hasData: !!testResponse.data
          };
        } catch (testError: any) {
          debugInfo.connectivityTest = {
            success: false,
            error: testError.response?.status || testError.message,
            statusCode: testError.response?.status,
            errorData: testError.response?.data
          };
        }
      }

      console.log("[express] IDX Debug Info:", debugInfo);
      res.json(debugInfo);
    } catch (error) {
      console.error("Error in IDX debug:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error debugging IDX connection" 
      });
    }
  });

  // Comprehensive IDX debugging endpoint with request/response capture
  app.get("/api/idx-full-debug", async (_req, res) => {
    try {
      console.log("[express] Running comprehensive IDX debug...");

      const apiKey = process.env.IDX_BROKER_API_KEY;
      const debugResults: any = {
        timestamp: new Date().toISOString(),
        apiKeyInfo: {
          hasKey: !!apiKey,
          length: apiKey?.length || 0,
          prefix: apiKey?.substring(0, 4) || 'none',
          validFormat: apiKey?.startsWith('a') || false,
          keyFormat: apiKey?.startsWith('@') ? 'new format' : apiKey?.startsWith('a') ? 'traditional format' : 'unknown format'
        },
        testResults: []
      };

      if (!apiKey) {
        return res.json({
          success: false,
          message: "No API key found",
          debugResults
        });
      }

      // Test different endpoints with captured requests/responses
      const endpoints = [
        'https://api.idxbroker.com/clients/accountinfo',
        'https://api.idxbroker.com/clients/systemlinks', 
        'https://api.idxbroker.com/clients/subdomain',
        'https://api.idxbroker.com/clients/featured',
        'https://api.idxbroker.com/clients/cities'
      ];

      const headerVariations = [
        { 'accesskey': apiKey, 'outputtype': 'json' },
        { 'Content-Type': 'application/x-www-form-urlencoded', 'accesskey': apiKey, 'outputtype': 'json' },
        { 'accesskey': apiKey },
        { 'Authorization': `Bearer ${apiKey}` }
      ];

      for (let endpointIndex = 0; endpointIndex < endpoints.length; endpointIndex++) {
        const endpoint = endpoints[endpointIndex];

        for (let headerIndex = 0; headerIndex < headerVariations.length; headerIndex++) {
          const headers = headerVariations[headerIndex];

          const testResult: any = {
            endpoint,
            headerVariation: headerIndex + 1,
            request: {
              url: endpoint,
              method: 'GET',
              headers: headers
            },
            response: null,
            success: false,
            error: null
          };

          try {
            const axios = require('axios');
            console.log(`Testing: ${endpoint} with headers:`, Object.keys(headers));

            const response = await axios.get(endpoint, {
              headers,
              timeout: 8000,
              validateStatus: () => true // Don't throw on HTTP errors
            });

            testResult.response = {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
              dataType: typeof response.data,
              dataLength: JSON.stringify(response.data || {}).length,
              dataPreview: JSON.stringify(response.data || {}).substring(0, 500),
              fullData: response.data // Include full response for debugging
            };

            testResult.success = response.status === 200;

            if (response.status === 200 && response.data) {
              console.log(`✅ SUCCESS: ${endpoint}`);
              // Found working combination, can break here if desired
            } else {
              console.log(`❌ Failed: ${endpoint} - Status ${response.status}`);
            }

          } catch (error: any) {
            console.log(`❌ Error: ${endpoint} -`, error.message);
            testResult.error = {
              message: error.message,
              code: error.code,
              status: error.response?.status,
              statusText: error.response?.statusText,
              responseData: error.response?.data
            };
          }

          debugResults.testResults.push(testResult);
        }
      }

      res.json({
        success: true,
        message: "IDX API debugging completed",
        debugResults
      });

    } catch (error) {
      console.error("Error in comprehensive IDX debug:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error running comprehensive IDX debug",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // MLS Field Coverage Analysis endpoint
  app.get("/api/idx-field-analysis", async (_req, res) => {
    try {
      const apiKey = process.env.IDX_BROKER_API_KEY;
      if (!apiKey) {
        return res.json({ success: false, message: "No API key found" });
      }

      console.log("[express] Analyzing MLS field coverage...");

      const axios = require('axios');
      
      // Get sample properties to analyze field coverage
      const response = await axios.get('https://api.idxbroker.com/clients/listings', {
        headers: {
          'accesskey': apiKey,
          'outputtype': 'json'
        },
        params: {
          rf: 'idxID,address,cityName,state,zipcode,listPrice,bedrooms,totalBaths,sqFt,propType,image,remarksConcat,listDate,yearBuilt,lotSize,parkingSpaces,garage,basement,fireplace,pool,waterfront,stories,mlsNumber,daysOnMarket,pricePerSqFt,heating,cooling,roofType,exteriorFeatures,interiorFeatures,appliances,flooring,securityFeatures,communityFeatures,utilities,taxAmount,hoaFee,subdivision,schoolDistrict,elementarySchool,middleSchool,highSchool,propertyCondition,architecturalStyle,newConstruction,foreclosure,shortSale,ownerFinancing,leaseOption,virtualTour,walkScore,transitScore,bikeScore',
          limit: 50
        },
        timeout: 15000
      });

      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        return res.json({
          success: false,
          message: "No sample data available for field analysis"
        });
      }

      const sampleProperties = response.data;
      const totalFields = {
        // Core fields
        'listingId': 0, 'address': 0, 'city': 0, 'state': 0, 'zipCode': 0,
        'price': 0, 'bedrooms': 0, 'bathrooms': 0, 'sqft': 0, 'propertyType': 0,
        'images': 0, 'description': 0, 'listedDate': 0,
        
        // Enhanced MLS fields
        'yearBuilt': 0, 'lotSize': 0, 'parkingSpaces': 0, 'garage': 0,
        'basement': 0, 'fireplace': 0, 'pool': 0, 'waterfront': 0,
        'stories': 0, 'mlsNumber': 0, 'daysOnMarket': 0, 'pricePerSqFt': 0,
        'heating': 0, 'cooling': 0, 'roofType': 0, 'exteriorFeatures': 0,
        'interiorFeatures': 0, 'appliances': 0, 'flooring': 0,
        'securityFeatures': 0, 'communityFeatures': 0, 'utilities': 0,
        'taxAmount': 0, 'hoaFee': 0, 'subdivision': 0, 'schoolDistrict': 0,
        'elementarySchool': 0, 'middleSchool': 0, 'highSchool': 0,
        'propertyCondition': 0, 'architecturalStyle': 0, 'newConstruction': 0,
        'foreclosure': 0, 'shortSale': 0, 'ownerFinancing': 0,
        'leaseOption': 0, 'virtualTour': 0, 'walkScore': 0,
        'transitScore': 0, 'bikeScore': 0
      };

      // Analyze field coverage
      sampleProperties.forEach(property => {
        Object.keys(totalFields).forEach(field => {
          const mappedField = getPropertyFieldMapping(field);
          if (property[mappedField] !== undefined && property[mappedField] !== null && property[mappedField] !== '') {
            totalFields[field]++;
          }
        });
      });

      const fieldCoverage = Object.entries(totalFields).map(([field, count]) => ({
        field,
        coverage: Math.round((count / sampleProperties.length) * 100),
        available: count > 0,
        priority: getFieldPriority(field)
      })).sort((a, b) => b.coverage - a.coverage);

      const highCoverageFields = fieldCoverage.filter(f => f.coverage >= 40);
      const totalCoverageScore = Math.round(
        highCoverageFields.length / fieldCoverage.length * 100
      );

      res.json({
        success: true,
        analysis: {
          totalProperties: sampleProperties.length,
          totalFields: fieldCoverage.length,
          highCoverageFields: highCoverageFields.length,
          coverageScore: totalCoverageScore,
          fieldDetails: fieldCoverage,
          recommendation: totalCoverageScore >= 50 ? 
            "Excellent MLS field coverage for advanced property matching" :
            totalCoverageScore >= 30 ?
            "Good MLS field coverage, some advanced features may be limited" :
            "Basic MLS field coverage, consider upgrading IDX plan for more fields"
        }
      });

    } catch (error) {
      console.error("[express] Error analyzing MLS field coverage:", error);
      res.status(500).json({
        success: false,
        message: "Error analyzing MLS field coverage",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  function getPropertyFieldMapping(field: string): string {
    const fieldMap: { [key: string]: string } = {
      'listingId': 'idxID',
      'address': 'address', 
      'city': 'cityName',
      'state': 'state',
      'zipCode': 'zipcode',
      'price': 'listPrice',
      'bedrooms': 'bedrooms',
      'bathrooms': 'totalBaths',
      'sqft': 'sqFt',
      'propertyType': 'propType',
      'images': 'image',
      'description': 'remarksConcat',
      'listedDate': 'listDate'
    };
    return fieldMap[field] || field;
  }

  function getFieldPriority(field: string): 'high' | 'medium' | 'low' {
    const highPriority = ['garage', 'securityFeatures', 'pool', 'fireplace', 'yearBuilt', 'lotSize'];
    const mediumPriority = ['heating', 'cooling', 'parkingSpaces', 'stories', 'taxAmount', 'hoaFee'];
    
    if (highPriority.includes(field)) return 'high';
    if (mediumPriority.includes(field)) return 'medium';
    return 'low';
  }

  // Enhanced IDX listings endpoint with advanced parameters
  app.get("/api/idx-listings", async (req, res) => {
    try {
      const limit = Number(req.query.limit) || 10;
      const offset = Number(req.query.offset) || 0;
      const city = req.query.city ? String(req.query.city) : undefined;
      const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
      const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
      const bedrooms = req.query.bedrooms ? Number(req.query.bedrooms) : undefined;
      const bathrooms = req.query.bathrooms ? Number(req.query.bathrooms) : undefined;
      const propertyType = req.query.propertyType ? String(req.query.propertyType) : undefined;
      const sqft_min = req.query.sqft_min ? Number(req.query.sqft_min) : undefined;
      const sqft_max = req.query.sqft_max ? Number(req.query.sqft_max) : undefined;

      const { fetchIdxListings: fetchIdxListingsHomesAI } = await import('./idx-homesai-fixed');
      
      // Build comprehensive search criteria from query parameters
      const searchCriteria = {
        limit,
        offset,
        city,
        state: req.query.state ? String(req.query.state) : undefined,
        zipCode: req.query.zipCode ? String(req.query.zipCode) : undefined,
        county: req.query.county ? String(req.query.county) : undefined,
        neighborhood: req.query.neighborhood ? String(req.query.neighborhood) : undefined,
        minPrice,
        maxPrice,
        bedrooms,
        minBedrooms: req.query.minBedrooms ? Number(req.query.minBedrooms) : undefined,
        maxBedrooms: req.query.maxBedrooms ? Number(req.query.maxBedrooms) : undefined,
        bathrooms,
        minBathrooms: req.query.minBathrooms ? Number(req.query.minBathrooms) : undefined,
        maxBathrooms: req.query.maxBathrooms ? Number(req.query.maxBathrooms) : undefined,
        propertyType,
        minSquareFeet: sqft_min,
        maxSquareFeet: sqft_max,
        minLotSize: req.query.minLotSize ? Number(req.query.minLotSize) : undefined,
        maxLotSize: req.query.maxLotSize ? Number(req.query.maxLotSize) : undefined,
        minAcres: req.query.minAcres ? Number(req.query.minAcres) : undefined,
        maxAcres: req.query.maxAcres ? Number(req.query.maxAcres) : undefined,
        garage: req.query.garage === 'true',
        parking: req.query.parking ? Number(req.query.parking) : undefined,
        pool: req.query.pool === 'true',
        poolType: req.query.poolType ? String(req.query.poolType) : undefined,
        waterfront: req.query.waterfront === 'true',
        fireplace: req.query.fireplace === 'true',
        basement: req.query.basement === 'true',
        yearBuilt: req.query.yearBuilt ? Number(req.query.yearBuilt) : undefined,
        minYearBuilt: req.query.minYearBuilt ? Number(req.query.minYearBuilt) : undefined,
        maxYearBuilt: req.query.maxYearBuilt ? Number(req.query.maxYearBuilt) : undefined,
        stories: req.query.stories ? Number(req.query.stories) : undefined,
        architectural: req.query.architectural ? String(req.query.architectural) : undefined,
        status: req.query.status ? String(req.query.status) : undefined,
        maxDaysOnMarket: req.query.maxDaysOnMarket ? Number(req.query.maxDaysOnMarket) : undefined,
        newConstruction: req.query.newConstruction === 'true',
        hoa: req.query.hoa === 'true',
        maxHOA: req.query.maxHOA ? Number(req.query.maxHOA) : undefined,
        maxTaxAmount: req.query.maxTaxAmount ? Number(req.query.maxTaxAmount) : undefined,
        rental: req.query.rental === 'true',
        seniorCommunity: req.query.seniorCommunity === 'true',
        wheelchair: req.query.wheelchair === 'true',
        energyEfficient: req.query.energyEfficient === 'true',
        solar: req.query.solar === 'true',
        greenCertified: req.query.greenCertified === 'true',
        schoolDistrict: req.query.schoolDistrict ? String(req.query.schoolDistrict) : undefined,
        elementarySchool: req.query.elementarySchool ? String(req.query.elementarySchool) : undefined,
        middleSchool: req.query.middleSchool ? String(req.query.middleSchool) : undefined,
        highSchool: req.query.highSchool ? String(req.query.highSchool) : undefined,
        sortBy: req.query.sortBy ? String(req.query.sortBy) : undefined,
        sortOrder: req.query.sortOrder === 'desc' ? 'desc' : 'asc'
      };
      
      const listings = await fetchIdxListingsHomesAI(searchCriteria);

      res.json(listings);
    } catch (error) {
      console.error("Error fetching IDX listings:", error);
      res.status(500).json({ 
        message: "Error fetching IDX listings",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Featured properties endpoint
  app.get("/api/idx-featured", async (req, res) => {
    try {
      const limit = Number(req.query.limit) || 10;

      const { fetchIdxFeaturedListings } = await import('./idx-broker');
      const featuredListings = await fetchIdxFeaturedListings(limit);

      res.json({
        listings: featuredListings,
        totalCount: featuredListings.length,
        hasMoreListings: false
      });
    } catch (error) {
      console.error("Error fetching featured listings:", error);
      res.status(500).json({ 
        message: "Error fetching featured listings",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Sold/pending properties endpoint
  app.get("/api/idx-sold-pending", async (req, res) => {
    try {
      const status = req.query.status as 'sold' | 'pending' || 'sold';
      const limit = Number(req.query.limit) || 10;

      const { fetchIdxSoldPendingListings } = await import('./idx-broker');
      const soldPendingListings = await fetchIdxSoldPendingListings(status, limit);

      res.json({
        listings: soldPendingListings,
        totalCount: soldPendingListings.length,
        hasMoreListings: false
      });
    } catch (error) {
      console.error("Error fetching sold/pending listings:", error);
      res.status(500).json({ 
        message: "Error fetching sold/pending listings",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Cities endpoint
  app.get("/api/idx-cities", async (req, res) => {
    try {
      const { fetchIdxCities } = await import('./idx-broker');
      const cities = await fetchIdxCities();

      res.json(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({ 
        message: "Error fetching cities",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Counties endpoint
  app.get("/api/idx-counties", async (req, res) => {
    try {
      const { fetchIdxCounties } = await import('./idx-broker');
      const counties = await fetchIdxCounties();

      res.json(counties);
    } catch (error) {
      console.error("Error fetching counties:", error);
      res.status(500).json({ 
        message: "Error fetching counties",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Postal codes endpoint
  app.get("/api/idx-postal-codes", async (req, res) => {
    try {
      const { fetchIdxPostalCodes } = await import('./idx-broker');
      const postalCodes = await fetchIdxPostalCodes();

      res.json(postalCodes);
    } catch (error) {
      console.error("Error fetching postal codes:", error);
      res.status(500).json({ 
        message: "Error fetching postal codes",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Search fields endpoint for dynamic form building
  app.get("/api/idx-search-fields", async (req, res) => {
    try {
      const { fetchIdxSearchFields } = await import('./idx-broker');
      const searchFields = await fetchIdxSearchFields();

      res.json(searchFields);
    } catch (error) {
      console.error("Error fetching search fields:", error);
      res.status(500).json({ 
        message: "Error fetching search fields",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Advanced property search endpoint
  app.get("/api/idx-search", async (req, res) => {
    try {
      const {
        limit = 10,
        offset = 0,
        cityId,
        countyId,
        postalCodeId,
        minPrice,
        maxPrice,
        bedrooms,
        bathrooms,
        propertyType,
        filterField,
        filterValue,
        orderBy = 'listDate',
        orderDir = 'DESC'
      } = req.query;

      const { searchIdxProperties } = await import('./idx-broker');
      const searchResults = await searchIdxProperties({
        limit: Number(limit),
        offset: Number(offset),
        cityId: cityId ? String(cityId) : undefined,
        countyId: countyId ? String(countyId) : undefined,
        postalCodeId: postalCodeId ? String(postalCodeId) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        bathrooms: bathrooms ? Number(bathrooms) : undefined,
        propertyType: propertyType ? String(propertyType) : undefined,
        filterField: filterField ? String(filterField) : undefined,
        filterValue: filterValue ? String(filterValue) : undefined,
        orderBy: String(orderBy),
        orderDir: orderDir as 'ASC' | 'DESC'
      });

      res.json(searchResults);
    } catch (error) {
      console.error("Error searching properties:", error);
      res.status(500).json({ 
        message: "Error searching properties",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Comprehensive IDX verification endpoint
  app.get("/api/verify-idx-integration", async (_req, res) => {
    try {
      const { verifyIdxIntegration } = await import('./test-idx-verification');
      const results = await verifyIdxIntegration();
      res.json(results);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Direct IDX API diagnostic with live test
  app.get("/api/idx-live-diagnostic", async (_req, res) => {
    try {
      const apiKey = process.env.IDX_BROKER_API_KEY;
      console.log(`[express] Running live IDX diagnostic with API key: ${apiKey?.substring(0, 8)}...`);

      if (!apiKey) {
        return res.json({ success: false, message: "No API key found" });
      }

      const axios = require('axios');
      const results = [];

      // Test the exact endpoints your IDX account uses
      const testEndpoints = [
        {
          name: 'Account Info',
          url: 'https://api.idxbroker.com/clients/accountinfo',
          params: {}
        },
        {
          name: 'All Listings (No Limit)',
          url: 'https://api.idxbroker.com/clients/listings',
          params: { outputtype: 'json' }
        },
        {
          name: 'All Listings (1000 Limit)',
          url: 'https://api.idxbroker.com/clients/listings',
          params: { limit: 1000, outputtype: 'json' }
        },
        {
          name: 'Search Endpoint',
          url: 'https://api.idxbroker.com/clients/search',
          params: { limit: 1000, outputtype: 'json' }
        },
        {
          name: 'System Links',
          url: 'https://api.idxbroker.com/clients/systemlinks',
          params: { outputtype: 'json' }
        }
      ];

      for (const endpoint of testEndpoints) {
        try {
          const response = await axios.get(endpoint.url, {
            headers: {
              'accesskey': apiKey,
              'outputtype': 'json',
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: endpoint.params,
            timeout: 30000
          });

          let propertyCount = 0;
          let sampleListing = null;

          if (response.status === 200 && response.data) {
            if (Array.isArray(response.data)) {
              propertyCount = response.data.length;
              sampleListing = response.data[0];
            } else if (response.data.listings && Array.isArray(response.data.listings)) {
              propertyCount = response.data.listings.length;
              sampleListing = response.data.listings[0];
            } else if (typeof response.data === 'object') {
              const keys = Object.keys(response.data);
              propertyCount = keys.length;
              if (keys.length > 0) {
                sampleListing = response.data[keys[0]];
              }
            }
          }

          results.push({
            endpoint: endpoint.name,
            url: endpoint.url,
            status: response.status,
            propertyCount,
            sampleListing: sampleListing ? {
              id: sampleListing.idxID || sampleListing.listingId || 'unknown',
              address: sampleListing.address || 'unknown',
              city: sampleListing.cityName || sampleListing.city || 'unknown',
              price: sampleListing.listPrice || sampleListing.price || 0
            } : null,
            success: response.status === 200 && propertyCount > 0
          });

          console.log(`[express] ${endpoint.name}: ${propertyCount} properties found`);

        } catch (error: any) {
          results.push({
            endpoint: endpoint.name,
            url: endpoint.url,
            status: error.response?.status || 0,
            error: error.message,
            propertyCount: 0,
            success: false
          });
          console.log(`[express] ${endpoint.name} failed: ${error.message}`);
        }
      }

      // Find the endpoint with the most properties
      const bestResult = results.reduce((best, current) => 
        current.propertyCount > best.propertyCount ? current : best, 
        { propertyCount: 0 }
      );

      return res.json({
        success: bestResult.propertyCount > 0,
        apiKeyStatus: 'valid',
        bestEndpoint: bestResult,
        totalFound: bestResult.propertyCount,
        sampleListingUrl: bestResult.sampleListing ? 
          `https://your-repl-url.replit.dev/api/properties/${bestResult.sampleListing.id}` : null,
        allResults: results,
        recommendation: bestResult.propertyCount < 100 ? 
          "Low property count detected. Check IDX account configuration." :
          bestResult.propertyCount < 1000 ?
          "Moderate property count. May have API limits." :
          "Good property count. API is working correctly."
      });

    } catch (error: any) {
      console.error("[express] Live IDX diagnostic failed:", error.message);
      return res.json({ 
        success: false, 
        message: "Diagnostic failed: " + error.message 
      });
    }
  });

  // Add endpoint to get property counts by state
  app.get("/api/properties/state-counts", async (req, res) => {
    try {
      console.log("[express] Fetching property counts by state");

      // Get IDX listings
      const idxResponse = await fetchIdxListings({ limit: 100 }); // Get more listings for better count

      // Count properties by state
      const stateCounts: { [key: string]: number } = {};

      idxResponse.listings.forEach(listing => {
        const state = listing.state || 'Unknown';
        stateCounts[state] = (stateCounts[state] || 0) + 1;
      });

      // Also include local database properties if any
      const localProperties = await storage.getProperties();
      localProperties.forEach(property => {
        const state = property.state || 'Unknown';
        stateCounts[state] = (stateCounts[state] || 0) + 1;
      });

      // Convert to array format for easier consumption
      const stateCountsArray = Object.entries(stateCounts)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count); // Sort by count descending

      console.log("[express] State counts:", stateCountsArray);

      res.json({
        totalProperties: idxResponse.listings.length + localProperties.length,
        stateCounts: stateCountsArray,
        stateCountsObject: stateCounts
      });
    } catch (error) {
      console.error("[express] Error fetching state counts:", error);
      res.status(500).json({ 
        message: "Error fetching property state counts",
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

  // Combined service experts endpoint with optional service filter
  app.get("/api/service-experts/:service?", async (req, res) => {
    try {
      const service = req.params.service;
      const experts = service ? 
        await storage.getServiceExpertsByService(service) :
        await storage.getServiceExperts();

      console.log(`[express] Fetched ${experts.length} service experts${service ? ` for ${service}` : ''}`);
      res.json(experts);
    } catch (error) {
      console.error("[express] Error fetching service experts:", error);
      res.status(500).json({ 
        message: "Failed to fetch service experts",
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
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal server error";

    // Only log 500 errors since they indicate server issues
    if (status >= 500) {
      console.error(`[express] Server error (${status}):`, err);
    }

    res.status(status).json({ 
      status,
      message,
      timestamp: new Date().toISOString()
    });
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
  app.post("/api/property/description-suggestions", async (req, res) => {
  try {
    const { features, propertyType, location } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Write an engaging property description for a ${propertyType} with the following features:
    ${features.join(", ")}
    Location: ${location || "Not specified"}

    Keep it professional, highlight key features, and make it appealing to potential buyers.
    Format the response as a single paragraph, approximately 100-150 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    res.json({ 
      suggestion: response.text(),
      success: true 
    });
  } catch (error) {
    console.error("[express] Error generating description:", error);
    res.status(500).json({ 
      error: "Failed to generate description",
      success: false 
    });
  }
});

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
  app.get("/api/neighborhood-stats", async (req, res) => {
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

  // Get neighborhoods for a city
  app.get("/api/neighborhoods", async (req, res) => {
    try {
      const { city } = req.query;

      if (!city || typeof city !== 'string') {
        return res.status(400).json({ error: "City parameter is required" });
      }

      console.log(`[express] Fetching neighborhoods for city: ${city}`);

      // Use Google Places API to search for neighborhoods
      const { searchNearbyPlaces, geocodeAddress } = await import('./google-places');

      // First geocode the city to get coordinates
      const coordinates = await geocodeAddress(`${city}, CA, USA`);

      if (!coordinates) {
        console.log(`[express] Could not geocode city: ${city}`);
        return res.json([]);
      }

      console.log(`[express] City coordinates: ${coordinates}`);

      // Search for multiple types of locations within the city
      const searchQueries = [
        `neighborhoods in ${city}`,
        `districts in ${city}`,
        `areas in ${city}`,
        `communities in ${city}`
      ];

      let allPlaces: any[] = [];

      // Try multiple search approaches
      for (const query of searchQueries) {
        try {
          const places = await searchNearbyPlaces({
            query,
            location: coordinates,
            radius: 25000, // 25km radius - more focused
            category: 'neighborhood'
          });
          allPlaces = [...allPlaces, ...places];
        } catch (error) {
          console.log(`[express] Search failed for query: ${query}`);
        }
      }

      // Also try locality-based search
      try {
        const localityPlaces = await searchNearbyPlaces({
          query: city,
          location: coordinates,
          radius: 30000,
          category: 'sublocality'
        });
        allPlaces = [...allPlaces, ...localityPlaces];
      } catch (error) {
        console.log(`[express] Locality search failed`);
      }

      // Extract and filter neighborhood names
      const neighborhoods = allPlaces
        .filter(place => {
          // More comprehensive filtering for neighborhood types
          const relevantTypes = [
            'neighborhood', 'sublocality', 'sublocality_level_1', 
            'sublocality_level_2', 'political', 'locality'
          ];
          return place.types && place.types.some(type => relevantTypes.includes(type));
        })
        .map(place => place.name)
        .filter((name, index, array) => {
          // Remove duplicates and filter out the city name itself
          return array.indexOf(name) === index && 
                 name.toLowerCase() !== city.toLowerCase() &&
                 !name.toLowerCase().includes('county') &&
                 !name.toLowerCase().includes('state');
        })
        .sort()
        .slice(0, 15); // Increase limit to 15 neighborhoods

      // If we don't have enough from Google Places, add some known Los Angeles neighborhoods
      if (city.toLowerCase().includes('los angeles') && neighborhoods.length < 10) {
        const knownLANeighborhoods = [
          'Beverly Hills', 'Hollywood', 'Santa Monica', 'West Hollywood', 
          'Malibu', 'Manhattan Beach', 'Hermosa Beach', 'Redondo Beach',
          'Venice', 'Brentwood', 'Westwood', 'Century City', 'Culver City',
          'Marina del Rey', 'El Segundo', 'Inglewood', 'Hawthorne',
          'Torrance', 'Palos Verdes', 'San Pedro', 'Long Beach',
          'Pasadena', 'Glendale', 'Burbank', 'Studio City', 'Sherman Oaks',
          'Van Nuys', 'North Hollywood', 'Woodland Hills', 'Calabasas',
          'Hidden Hills', 'Encino', 'Tarzana', 'Reseda'
        ];

        // Add known neighborhoods that aren't already in our list
        knownLANeighborhoods.forEach(neighborhood => {
          if (!neighborhoods.some(n => n.toLowerCase() === neighborhood.toLowerCase())) {
            neighborhoods.push(neighborhood);
          }
        });

        // Limit to 20 total neighborhoods
        neighborhoods.splice(20);
      }

      console.log(`[express] Found ${neighborhoods.length} neighborhoods for ${city}:`, neighborhoods);

      res.json(neighborhoods);
    } catch (error) {
      console.error("[express] Error fetching neighborhoods:", error);
      res.status(500).json({ 
        message: "Error fetching neighborhoods",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get property counts by state from IDX Broker
  app.get("/api/idx-property-counts", async (req, res) => {
    try {
      // This would require IDX Broker API access - placeholder for now
      const states = [
        { state: 'California', count: 15420 },
        { state: 'Texas', count: 12800 },
        { state: 'Florida', count: 9650 },
        { state: 'New York', count: 8200 },
        { state: 'Arizona', count: 6500 }
      ];

      res.json(states);
    } catch (error) {
      console.error("[express] Error fetching IDX property counts:", error);
      res.status(500).json({ error: "Failed to fetch property counts" });
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
        console.log('[express] Payment intent request received:', req.body);
        const { amount, serviceIds, metadata } = req.body;

        // Enhanced validation with specific error messages
        if (!amount) {
          console.warn('[express] Missing amount in payment intent request');
          return res.status(400).json({ 
            message: "Amount is required to process payment",
            error: "Missing amount",
            code: "missing_amount"
          });
        }

        if (typeof amount !== 'number' || isNaN(amount)) {
          console.warn(`[express] Invalid amount type in payment intent request: ${typeof amount}`);
          return res.status(400).json({ 
            message: "Amount must be a valid number",
            error: "Invalid amount format",
            code: "invalid_amount_format"
          });
        }

        if (amount < 0.5) {
          console.warn(`[express] Amount too small in payment intent request: ${amount}`);
          return res.status(400).json({ 
            message: "Amount must be at least $0.50",
            error: "Amount below minimum",
            code: "amount_below_minimum"
          });
        }

        console.log(`[express] Creating payment intent for amount: $${amount.toFixed(2)}`);

        let enhancedMetadata = metadata || {};
        let validServices = [];

        // If service IDs are provided, retrieve service details and include in metadata
        if (serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0) {
          try {
            // Get service details to include in metadata
            const services = await Promise.all(
              serviceIds.map(async (id) => {
                try {
                  const service = await storage.getServiceOffering(Number(id));
                  if (!service) {
                    console.warn(`[express] Service ID ${id} not found`);
                    return null;
                  }
                  return {
                    id: service.id,
                    name: service.name,
                    type: service.serviceType,
                    price: service.price
                  };
                } catch (err) {
                  console.error(`[express] Error retrieving service ID ${id}:`, err);
                  return null;
                }
              })
            );

            validServices = services.filter(s => s !== null);

            if (validServices.length === 0) {
              console.warn('[express] No valid services found for payment intent');
            } else {
              enhancedMetadata = {
                ...enhancedMetadata,
                services: JSON.stringify(validServices),
                serviceCount: validServices.length
              };
              console.log(`[express] Payment for ${validServices.length} services: ${validServices.map(s => s.name).join(', ')}`);
            }
          } catch (err) {
            console.error('[express] Error retrieving service details:', err);
            // Continue with payment intent creation even if service details couldn't be retrieved
          }
        } else {
          console.log('[express] No service IDs provided for payment intent');
        }

        try {
          // Create the paymentintent with detailed parameters
          const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            metadata: {
              ...enhancedMetadata,
              environment: process.env.NODE_ENV || 'development',
              source: 'realty-ai-platform',
              created_at: new Date().toISOString()
            },
            automatic_payment_methods: {
              enabled: true,
            },
            description: `Payment for ${validServices.length > 0 
              ? validServices.map(s => s.name).join(', ') 
              : 'Realty.AI services'}`
          });

          console.log(`[express] Payment intent created successfully: ${paymentIntent.id}`);

          res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount / 100, // Convert back from cents
            currency: paymentIntent.currency
          });
        } catch (stripeError) {
          console.error('[express] Stripe API error:', stripeError);

          // Enhanced error handling for Stripe errors
          if (stripeError.type === 'StripeCardError') {
            return res.status(400).json({ 
              message: "There was an issue with your payment card", 
              error: stripeError.message,
              code: stripeError.code || 'card_error'
            });
          } else if (stripeError.type === 'StripeInvalidRequestError') {
            return res.status(400).json({ 
              message: "Invalid payment request", 
              error: stripeError.message,
              code: stripeError.code || 'invalid_request'
            });
          } else if (stripeError.type === 'StripeAuthenticationError') {
            console.error('[express] Stripe authentication error - API key may be invalid');
            return res.status(500).json({ 
              message: "Payment service authentication error", 
              error: "Unable to authenticate with payment service",
              code: 'auth_error'
            });
          } else if (stripeError.type === 'StripeRateLimitError') {
            return res.status(429).json({ 
              message: "Too many payment requests", 
              error: "Please wait a moment and try again",
              code: 'rate_limit'
            });
          } else if (stripeError.type === 'StripeConnectionError') {
            return res.status(503).json({ 
              message: "Payment service connection error", 
              error: "Unable to connect to payment service",
              code: 'connection_error'
            });
          } else {
            // For other types of errors
            return res.status(500).json({ 
              message: "Payment processor error", 
              error: stripeError.message,
              code: stripeError.code || 'unknown_error'
            });
          }
        }
      } catch (error) {
        console.error('[express] Error creating payment intent:', error);
        return res.status(500).json({
          message: 'Internal server error processing payment',
          error: error instanceof Error ? error.message : 'Unknown error',
          code: 'server_error'
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

  // Initialize WebSocket chat service (legacy)
  const wss = initializeChat(httpServer);
  console.log('[express] WebSocket server initialized for chat');

  // Register Firestore chat routes
  app.use('/api/chat', chatFirestoreRoutes);
  console.log('[express] Firestore chat routes registered');

  // Legacy Chat conversation routes (will be migrated to Firestore)
  app.post("/api/legacy-chat/conversations", async (req, res) => {
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

  // Initialize Vision API and register vision routes
  try {
    await initializeVisionClient();
    app.use("/api/vision", visionRoutes);

    // Initialize Document AI processor and register document routes
    console.log("[express] Initializing Document AI processor");
    const documentProcessorInitialized = await initDocumentProcessor();
    if (documentProcessorInitialized) {
      console.log("[express] Document AI processor initialized successfully");
      app.use("/api/documents", documentRoutes);
      console.log("[express] Document routes registered");
    } else {
      console.error("[express] Failed to initialize Document AI processor, document routes will not be available");
    }
    console.log("[express] Google Vision API routes registered");

    // Register service request routes
    app.use("/api", serviceRequestRoutes);
    console.log("[express] Service request routes registered");

    // Register CMA routes
    app.use("/api/cma", cmaRoutes);
    console.log("[express] CMA routes registered");

    // Register Auth routes
    app.use("/api/auth", authRoutes);
    console.log("[express] Auth routes registered");
  } catch (error) {
    console.error("[express] Failed to initialize Google Vision API:", error);
  }

  // AI Chatbot endpoint
  app.post("/api/chatbot", async (req, res) => {
    try {
      const { message, context } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      console.log('[express] Chatbot request:', { message: message.substring(0, 100) });

      const response = await generateChatbotResponse(message, context);

      console.log('[express] Chatbot response generated successfully');
      res.json({ response, status: 'success' });
    } catch (error) {
      console.error('[express] Chatbot error:', error);

      // Always return a user-friendly response, never expose internal errors
      const fallbackResponse = "I'm having trouble connecting right now. Please try again in a moment or reach out to our customer support for assistance.";

      res.json({ 
        response: fallbackResponse, 
        status: 'fallback',
        error: 'AI service temporarily unavailable'
      });
    }
  });

  // Server is started in server/index.ts - removed duplicate listen call

  return httpServer;
}