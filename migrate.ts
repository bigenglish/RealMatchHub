import { db } from './server/db';
import * as schema from './shared/schema';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Required for Neon Serverless
neonConfig.webSocketConstructor = ws;

// Function to run migrations
async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  console.log('Starting database migration...');

  try {
    // Create a connection to the database
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);

    // Run migrations
    console.log('Running migrations...');
    await db.execute(/*sql*/`
      -- Create communication_logs table if it doesn't exist
      CREATE TABLE IF NOT EXISTS communication_logs (
        id SERIAL PRIMARY KEY,
        property_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        text TEXT NOT NULL,
        attachments JSONB DEFAULT '[]'::jsonb,
        is_read BOOLEAN DEFAULT FALSE,
        message_type TEXT DEFAULT 'text'
      );

      -- Create property_showings table if it doesn't exist
      CREATE TABLE IF NOT EXISTS property_showings (
        id SERIAL PRIMARY KEY,
        property_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        showing_id TEXT NOT NULL UNIQUE,
        date DATE NOT NULL,
        time TEXT NOT NULL,
        address TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Scheduled',
        agent_name TEXT,
        feedback TEXT,
        follow_up_actions JSONB DEFAULT '[]'::jsonb
      );

      -- Create property_offers table if it doesn't exist
      CREATE TABLE IF NOT EXISTS property_offers (
        id SERIAL PRIMARY KEY,
        property_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        offer_id TEXT NOT NULL UNIQUE,
        amount INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        submission_date TIMESTAMP NOT NULL DEFAULT NOW(),
        notes TEXT,
        expert_review_summary TEXT,
        offer_details JSONB DEFAULT '{}'::jsonb
      );

      -- Create property_documents table if it doesn't exist
      CREATE TABLE IF NOT EXISTS property_documents (
        id SERIAL PRIMARY KEY,
        property_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        document_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        url TEXT NOT NULL,
        upload_date TIMESTAMP NOT NULL DEFAULT NOW(),
        uploaded_by TEXT NOT NULL,
        category TEXT DEFAULT 'General',
        is_archived BOOLEAN DEFAULT FALSE
      );

      -- Create transaction_progress table if it doesn't exist
      CREATE TABLE IF NOT EXISTS transaction_progress (
        id SERIAL PRIMARY KEY,
        property_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        current_stage TEXT NOT NULL,
        stages JSONB DEFAULT '[]'::jsonb,
        last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
        estimated_closing_date DATE,
        notes TEXT
      );

      -- Create valuation_time_slots table if it doesn't exist
      CREATE TABLE IF NOT EXISTS valuation_time_slots (
        id SERIAL PRIMARY KEY,
        property_id TEXT NOT NULL,
        date DATE NOT NULL,
        time TEXT NOT NULL,
        is_booked BOOLEAN DEFAULT FALSE,
        booked_by TEXT,
        valuation_agent_id TEXT
      );
    `);

    console.log('Migration completed successfully!');
    await pool.end();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigrations();