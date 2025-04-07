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

// New financing providers table
export const financingProviders = pgTable("financing_providers", {
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
});

export const insertPropertySchema = createInsertSchema(properties).omit({ id: true });
export const insertServiceProviderSchema = createInsertSchema(serviceProviders).omit({ id: true });
export const insertFinancingProviderSchema = createInsertSchema(financingProviders).omit({ id: true });

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;
export type FinancingProvider = typeof financingProviders.$inferSelect;
export type InsertFinancingProvider = z.infer<typeof insertFinancingProviderSchema>;

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

export const financingServiceTypes = [
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
  "Fixed-Rate Loans",
  "Adjustable-Rate Loans"
] as const;
