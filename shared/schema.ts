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

export const insertPropertySchema = createInsertSchema(properties).omit({ id: true });
export const insertServiceProviderSchema = createInsertSchema(serviceProviders).omit({ id: true });

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;

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
