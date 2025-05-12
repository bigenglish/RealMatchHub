import { pgTable, text, serial, integer, boolean, jsonb, date, timestamp, real, numeric, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  address: text("address").notNull(),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  sqft: integer("sqft").notNull(),
  propertyType: text("property_type").notNull(),
  images: text("images").array().notNull(),
  listedDate: date("listed_date").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  listingId: text("listing_id"), // External listing ID from IDX Broker
});

// Market trends data for real estate market analysis
export const marketTrends = pgTable("market_trends", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  quarter: integer("quarter").notNull(),
  neighborhood: text("neighborhood"),
  averagePrice: integer("average_price").notNull(),
  medianPrice: integer("median_price").notNull(),
  salesVolume: integer("sales_volume").notNull(),
  daysOnMarket: integer("days_on_market").notNull(),
  percentageChange: real("percentage_change").notNull(),
  propertyType: text("property_type"),
});

export const serviceProviders = pgTable("service_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  experience: integer("experience").notNull(),
  rating: integer("rating"),
  contact: text("contact").notNull(),
});

// Service experts table (renamed from financingProviders)
export const serviceExperts = pgTable("service_experts", {
  id: serial("id").primaryKey(),
  providerId: text("provider_id").notNull().unique(), // Unique ID for the provider
  name: text("name").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  website: text("website"),
  description: text("description").notNull(),
  servicesOffered: text("services_offered").array().notNull(), // Array of services
  areasServed: text("areas_served").array().notNull(), // Array of areas
  logoUrl: text("logo_url"),
  rating: integer("rating"),
  verified: boolean("verified").default(false),
  specialOffers: text("special_offers").array(),
  userType: text("user_type").default("vendor"), // vendor, admin, etc.
  businessHours: text("business_hours"),
  address: text("address"),
  placeId: text("place_id"), // Google Places ID if applicable
  serviceType: text("service_type").notNull(), // Type of service expert (Mortgage Lender, Home Inspector, etc.)
  location: text("location"), // Latitude,longitude
  serviceArea: integer("service_area"), // Service radius in miles
  availabilityJson: jsonb("availability"), // Availability schedule as JSON
});

// Service bundles table
export const serviceBundles = pgTable("service_bundles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(), // Changed to text to support formatted pricing like "As low as $1,500"
  savings: text("savings"), // Changed to optional to support empty strings
  popularityRank: integer("popularity_rank"),
  featuredImage: text("featured_image"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  features: text("features").array(), // Added for the feature list of each bundle
});

// Service offerings table (individual services)
export const serviceOfferings = pgTable("service_offerings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  serviceType: text("service_type").notNull(), // Corresponds to expertTypes
  minPrice: numeric("min_price").notNull(),
  maxPrice: numeric("max_price").notNull(),
  priceDisplay: text("price_display").notNull(), // e.g. "$200-$400"
  color: text("color"), // For UI color coding
  icon: text("icon"), // Icon name or path
  estimatedDuration: text("estimated_duration").notNull(),
  requiredDocuments: text("required_documents").array(),
  typicalTimingInTransaction: text("typical_timing").notNull(), // e.g. "Before listing", "Before closing", etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  pricingUnit: text("pricing_unit"), // e.g. "per session", "per connection", etc.
});

// Bundle-service relationship table (many-to-many)
export const bundleServices = pgTable("bundle_services", {
  id: serial("id").primaryKey(),
  bundleId: integer("bundle_id").notNull().references(() => serviceBundles.id),
  serviceId: integer("service_id").notNull().references(() => serviceOfferings.id),
});

// Service requests table
export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  serviceExpertId: integer("service_expert_id").notNull().references(() => serviceExperts.id),
  serviceType: text("service_type").notNull(),
  requestDate: timestamp("request_date").defaultNow().notNull(),
  preferredDate: timestamp("preferred_date"),
  preferredTime: text("preferred_time"),
  propertyZipCode: text("property_zip_code"),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  propertyId: integer("property_id").references(() => properties.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userNotified: boolean("user_notified").default(false),
  providerNotified: boolean("provider_notified").default(false),
});

export const insertPropertySchema = createInsertSchema(properties).omit({ id: true });
export const insertServiceProviderSchema = createInsertSchema(serviceProviders).omit({ id: true });
export const insertServiceExpertSchema = createInsertSchema(serviceExperts).omit({ id: true });
export const insertServiceBundleSchema = createInsertSchema(serviceBundles).omit({ id: true, createdAt: true });
export const insertServiceOfferingSchema = createInsertSchema(serviceOfferings).omit({ id: true, createdAt: true });
export const insertBundleServiceSchema = createInsertSchema(bundleServices).omit({ id: true });
export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({ id: true, requestDate: true, createdAt: true });
export const insertMarketTrendSchema = createInsertSchema(marketTrends).omit({ id: true });

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;
export type ServiceExpert = typeof serviceExperts.$inferSelect;
export type InsertServiceExpert = z.infer<typeof insertServiceExpertSchema>;
export type ServiceBundle = typeof serviceBundles.$inferSelect;
export type InsertServiceBundle = z.infer<typeof insertServiceBundleSchema>;
export type ServiceOffering = typeof serviceOfferings.$inferSelect;
export type InsertServiceOffering = z.infer<typeof insertServiceOfferingSchema>;
export type BundleService = typeof bundleServices.$inferSelect;
export type InsertBundleService = z.infer<typeof insertBundleServiceSchema>;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type MarketTrend = typeof marketTrends.$inferSelect;
export type InsertMarketTrend = z.infer<typeof insertMarketTrendSchema>;

// Type for property with geo information
export interface PropertyWithGeo {
  listingId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: string;
  latitude: number;
  longitude: number;
  images: string[];
  description: string;
  listedDate: string;
}

// Type for map visualization data
export interface PropertyMapData {
  listings: PropertyWithGeo[];
  totalCount: number;
  hasMoreListings: boolean;
}

// Type for market trend data
export interface MarketTrendData {
  year: number;
  quarter: number;
  neighborhood?: string;
  averagePrice: number;
  medianPrice: number;
  salesVolume: number;
  daysOnMarket: number;
  percentageChange: number;
  propertyType?: string;
}

// Service availability type (stored as JSON)
export interface ServiceAvailability {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
  available: boolean;
}

export const propertyTypes = [
  "Single Family Home",
  "Condo",
  "Townhouse",
  "Apartment",
  "Multi-Family",
  "Land",
] as const;

export const serviceTypes = [
  "Real Estate Agent",
  "Property Inspector",
  "Mortgage Broker",
  "Property Lawyer",
  "Interior Designer",
] as const;

export const expertServiceTypes = [
  // Financing Services
  "Mortgages",
  "Refinancing",
  "Home Equity Loans",
  "Construction Loans",
  "Bridge Loans",
  "FHA Loans",
  "VA Loans", 
  "USDA Loans",
  "Jumbo Loans",
  "Conventional Loans",
  // Real Estate Services
  "Real Estate Agent",
  "Property Inspector",
  "Real Estate Attorney",
  "Title Company",
  "Home Insurance",
  // Home Services
  "Home Renovation",
  "Moving Services",
  "Landscaping",
  "Interior Design",
  "Home Cleaning"
] as const;

// Expert service categories (types of experts)
export const expertTypes = [
  "Mortgage Lender",
  "Home Inspector",
  "Real Estate Attorney",
  "Title Company",
  "Insurance Agent",
  "Real Estate Agent",
  "Home Renovation Contractor",
  "Moving Company",
  "Appraiser",
  "Property Manager",
  "Interior Designer"
] as const;

// Transaction stages for service timing
export const transactionStages = [
  "Pre-Listing",
  "During Listing",
  "Under Contract",
  "Pre-Closing",
  "Closing",
  "Post-Closing"
] as const;

// Service request statuses
export const requestStatuses = [
  "pending",
  "accepted",
  "declined",
  "completed",
  "cancelled"
] as const;

// CMA (Comparative Market Analysis) tables
export const cmaReports = pgTable("cma_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  reportDate: timestamp("report_date").defaultNow().notNull(),
  zipCode: text("zip_code").notNull(),
  propertyType: text("property_type").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  sqft: integer("sqft").notNull(),
  estimatedValue: integer("estimated_value").notNull(),
  confidenceScore: real("confidence_score").notNull(), // 0-1 score
  status: text("status").default("generated").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  reportUrl: text("report_url"), // URL to PDF report if generated
  pricingTier: text("pricing_tier").default("basic").notNull(), // basic, premium, etc.
});

export const cmaComparables = pgTable("cma_comparables", {
  id: serial("id").primaryKey(),
  cmaReportId: integer("cma_report_id").notNull().references(() => cmaReports.id),
  propertyId: integer("property_id").references(() => properties.id),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  salePrice: integer("sale_price").notNull(),
  saleDate: date("sale_date").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  sqft: integer("sqft").notNull(),
  pricePerSqft: real("price_per_sqft").notNull(),
  yearBuilt: integer("year_built"),
  lotSize: integer("lot_size"),
  distanceFromSubject: real("distance_from_subject"), // in miles
  adjustedPrice: integer("adjusted_price"), // after adjustments
  similarity: real("similarity"), // 0-1 score of how similar to subject
  imageUrl: text("image_url"),
});

export const cmaMarketInsights = pgTable("cma_market_insights", {
  id: serial("id").primaryKey(),
  cmaReportId: integer("cma_report_id").notNull().references(() => cmaReports.id),
  insightType: text("insight_type").notNull(), // price_trend, inventory, etc.
  insightTitle: text("insight_title").notNull(),
  insightDescription: text("insight_description").notNull(),
  insightData: jsonb("insight_data"), // JSON data for charts/visualizations
  importance: integer("importance").default(1), // 1-5 score for sorting
});

export const cmaPricingAdjustments = pgTable("cma_pricing_adjustments", {
  id: serial("id").primaryKey(),
  cmaReportId: integer("cma_report_id").notNull().references(() => cmaReports.id),
  adjustmentFactor: text("adjustment_factor").notNull(), // "bedroom", "bathroom", "sqft", etc.
  adjustmentValue: integer("adjustment_value").notNull(), // dollar amount per unit
  adjustmentDirection: text("adjustment_direction").notNull(), // "positive" or "negative"
  adjustmentDescription: text("adjustment_description").notNull(),
});

export const insertCmaReportSchema = createInsertSchema(cmaReports).omit({ 
  id: true, 
  reportDate: true, 
  lastUpdated: true
});
export const insertCmaComparableSchema = createInsertSchema(cmaComparables).omit({ id: true });
export const insertCmaMarketInsightSchema = createInsertSchema(cmaMarketInsights).omit({ id: true });
export const insertCmaPricingAdjustmentSchema = createInsertSchema(cmaPricingAdjustments).omit({ id: true });

export type CmaReport = typeof cmaReports.$inferSelect;
export type InsertCmaReport = z.infer<typeof insertCmaReportSchema>;
export type CmaComparable = typeof cmaComparables.$inferSelect;
export type InsertCmaComparable = z.infer<typeof insertCmaComparableSchema>;
export type CmaMarketInsight = typeof cmaMarketInsights.$inferSelect;
export type InsertCmaMarketInsight = z.infer<typeof insertCmaMarketInsightSchema>;
export type CmaPricingAdjustment = typeof cmaPricingAdjustments.$inferSelect;
export type InsertCmaPricingAdjustment = z.infer<typeof insertCmaPricingAdjustmentSchema>;
