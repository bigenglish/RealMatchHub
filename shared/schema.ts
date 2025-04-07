import { pgTable, text, serial, integer, boolean, jsonb, date } from "drizzle-orm/pg-core";
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
});

export const insertPropertySchema = createInsertSchema(properties).omit({ id: true });
export const insertServiceProviderSchema = createInsertSchema(serviceProviders).omit({ id: true });
export const insertServiceExpertSchema = createInsertSchema(serviceExperts).omit({ id: true });

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;
export type ServiceExpert = typeof serviceExperts.$inferSelect;
export type InsertServiceExpert = z.infer<typeof insertServiceExpertSchema>;

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
