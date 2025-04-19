import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure neon to use the WebSocket constructor
neonConfig.webSocketConstructor = ws;

// Check if we have a database URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Please make sure you have a PostgreSQL database configured.");
}

// Create a connection pool
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create a Drizzle client with our schema
export const db = drizzle(pool, { schema });

// Export the schema as well
export { schema };