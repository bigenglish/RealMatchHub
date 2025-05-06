# Realty.AI Project - Developer Onboarding Guide

## Welcome!

This guide will help you get started with the Realty.AI project, which aims to revolutionize real estate by providing users with AI-powered insights, personalized property recommendations, and seamless connections to real estate services. Your initial tasks will focus on code cleanup, vetting existing features, and suggesting potential enhancements.

## Project Access and Setup (Replit)

1. **Accept Collaboration Invite:** You should have received an invitation to collaborate on the Realty.AI Replit project. Please accept it.
2. **Explore the Replit Environment:**
   * Familiarize yourself with the Replit editor:
       * **File Explorer (Left Sidebar):** Navigate project files.
       * **Code Editor (Center):** View and edit code.
       * **Console (Bottom):** View server logs and output.
       * **Preview Window (Right):** See the running application.
   * Replit automatically saves your work.
3. **Key Files to Explore:** 
   * `server/routes.ts`: Backend API route definitions (Express.js).
   * `server/idx-broker-api.js`: Handles IDX Broker API interactions.
   * `server/vertex-ai.ts`: Handles Vertex AI integration (Google Cloud).
   * `shared/schema.ts`: Defines the database schema and data models (drizzle-orm, zod).
   * `server/storage.ts`: Defines data access logic (IStorage interface).
   * `client/src/pages/idx-data-viewer.tsx`: Frontend component for displaying IDX broker listings.
   * `client/src/components/chat-interface.tsx`: Chat functionality implementation.
4. **Running the Application:**
   * Click the green "Run" button in the Replit editor to start the "Start application" workflow.
   * The backend server will start in the Console.
   * The frontend will be accessible in the Preview Window or the provided external URL.

## Project Overview

Realty.AI combines real estate functionality with cutting-edge AI. Key features include:

* **Property Listings:** Displaying properties from IDX Broker.
* **AI-Driven Insights:** Providing property price predictions, automated descriptions, and personalized recommendations.
* **Service Requests:** Facilitating connections with service providers (inspectors, mortgage brokers, etc.).
* **Chat:** Enabling real-time communication between users and agents.
* **Property Search:** Allowing users to search for properties based on various criteria, including AI-driven style analysis.

## Backend Implementation

The backend is built with Node.js and Express.js.

### Key Files and Structure

* `server/index.ts`: Main server entry point.
* `server/routes.ts`: Defines all API routes and middleware.
* `server/`: Contains backend logic, organized into modules:
    * `idx-broker-api.js`: Handles IDX Broker API calls to fetch property listings.
    * `vertex-ai.ts`: Integrates with Google Cloud's Vertex AI for AI features.
    * `gemini-ai.ts`: Integrates with Gemini AI for tasks like explaining legal terms.
    * `document-ai.ts`: For document processing using Google Document AI.
    * `vision-service.ts`: Integrates with Google Vision API for image analysis.
    * `chat-service.ts`: Handles real-time chat functionality.
    * `ai-property-search.ts`: Implements AI-powered property search based on image analysis.
    * `ai-property-recommendations.ts`: Provides AI-driven property recommendations.
    * `google-places.ts`: Integrates with the Google Places API for location-based services.
    * `routes/`: Directory containing modularized route handlers.

### Important Backend Technologies

* **Node.js & Express.js:** Backend runtime and framework.
* **TypeScript:** Strongly-typed JavaScript.
* **drizzle-orm:** ORM (Object-Relational Mapper) for PostgreSQL.
* **zod:** Schema declaration and validation library.
* **Firebase Admin SDK:** For authentication and Firestore database.
* **Google Cloud Services:** Vertex AI, Gemini AI, Document AI, Vision API.
* **WebSockets:** For real-time communication (chat).

### Important Routes and Functionality

* `/api/idx-data`: Fetches property listings from IDX Broker.
* `/api/properties`: CRUD operations for property data.
* `/api/ai/predict-price`: Predicts property prices using Vertex AI.
* `/api/ai/generate-description`: Generates property descriptions with AI.
* `/api/documents`: Handles document processing using Document AI.
* `/api/places`: Integrates with the Google Places API for searching nearby places.
* `/api/chat`: Handles chat-related functionality.
* `/api/service-requests`: Manages service requests (scheduling appointments with service providers).
* `/api/healthcheck`: Endpoint for server health monitoring.

### Data Model (shared/schema.ts)

The database schema is defined using `drizzle-orm`. Key tables include:

* `properties`: Stores property information (address, price, bedrooms, etc.).
* `marketTrends`: Stores data for analyzing real estate market trends.
* `serviceProviders`: Stores information about service providers.
* `serviceExperts`: Stores information about individual experts providing services.
* `appointments`: Stores information about scheduled appointments.

### Data Access (server/storage.ts)

The `IStorage` interface defines how the backend interacts with the database, providing methods for operations on all major entities in the system.

## Frontend Implementation

The frontend is built using React with TypeScript and Vite.

### Key Frontend Files/Directories

* `client/src/App.tsx`: Main application component with routing.
* `client/src/pages/`: Contains page components:
  * `client/src/pages/idx-data-viewer.tsx`: Displays IDX Broker listings.
  * `client/src/pages/idx-implementation-selector.tsx`: Testing different IDX integration approaches.
  * `client/src/pages/service-experts.tsx`: Page for displaying service experts.
* `client/src/components/`: Contains reusable components:
  * `client/src/components/chat-interface.tsx`: User interface for chat functionality.
  * `client/src/components/service-request-form.tsx`: Form for requesting services.
  * `client/src/components/seller-workflow.tsx`: Guided workflow for sellers.

### Frontend Technologies

* **React**: JavaScript library for building user interfaces.
* **TypeScript**: Strongly-typed JavaScript.
* **Tailwind CSS**: Utility-first CSS framework for styling.
* **Vite**: Build tool and development server.
* **Wouter**: Lightweight router for React applications.
* **React Query**: For data fetching, caching, and state management.
* **Firebase**: For authentication and real-time database.

## Environment Variables and Secrets

The application relies on several environment variables:

* `DATABASE_URL`: PostgreSQL connection string.
* `IDX_BROKER_API_KEY`: API key for IDX Broker integration.
* `GOOGLE_PLACES_API_KEY`: API key for Google Places integration.
* `GOOGLE_GEMINI_API_KEY`: API key for Google Gemini AI.
* `GOOGLE_APPLICATION_CREDENTIALS_JSON`: JSON credentials for Google Cloud services.
* `STRIPE_SECRET_KEY`: Secret key for Stripe payment integration.
* `VITE_STRIPE_PUBLIC_KEY`: Public key for Stripe payment integration on the frontend.
* `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`: Firebase configuration for authentication.

## Initial Developer Tasks

1. **Familiarization:**
   * Carefully read this `README.md` to understand the project's goals, architecture, and technologies.
   * Explore the Replit environment and the key files mentioned above.
   * Run the application to see it in action.

2. **Code Review and Cleanup:**
   * **Goal:** Improve code quality and maintainability.
   * **Actions:**
       * Read the code in all key files, paying attention to code style, naming, comments, and error handling.
       * Identify areas for refactoring (simplification, modularization).
       * Add comments to explain complex logic, especially in AI-related code.
       * Ensure consistent formatting and coding conventions.

3. **Feature Vetting:**
   * **Goal:** Thoroughly test and verify the functionality of existing features.
   * **Actions:**
       * **IDX Broker Integration:**
           * Examine `server/idx-broker-api.js` and related endpoints in `server/routes.ts`.
           * Verify that live listings are displayed correctly on the frontend.
           * **Specific Issue to Investigate:** "Investigate why only test data is showing and not live listings. Check API key configuration, API endpoints, and data mapping."
       * **AI Capabilities:**
           * Examine `server/vertex-ai.ts`, `server/gemini-ai.ts`, and related routes.
           * Test the frontend UI for AI features.
       * **WebSocket Functionality:**
           * Test the chat interface and WebSocket connection for real-time communication.
       * **Service Request Flow:**
           * Verify the service request form submission process.
       * Document any bugs or unexpected behavior in a clear and concise manner.

4. **Feature Suggestions and Improvements:**
   * **Goal:** Propose enhancements to existing features and suggest new features.
   * **Actions:**
       * Consider improvements to user experience (UI/UX), performance (optimization), AI accuracy (model tuning), IDX Broker integration (filtering, sorting), etc.
       * Document your suggestions with clear explanations of their benefits.

## Recent Improvements

* Fixed IDX Broker integration by properly mounting routes in Express application.
* Created a dedicated `/idx-data` endpoint for direct access to IDX Broker listings.
* Fixed WebSocket connection issues in the chat interface.
* Enhanced the service request form with better navigation and optional fields.
* Implemented server keep-alive mechanism with healthcheck endpoint to prevent timeouts.

## Running the Project

1. The project uses a workflow named "Start application" that runs `npm run dev`.
2. This starts an Express server for the backend and a Vite server for the frontend.
3. After making edits, restart the workflow to see your changes.

## Communication and Collaboration

* Use the Replit chat to communicate questions, progress, and findings.
* Use Replit's branching features for code management if working on larger changes.
* Follow the established coding style and conventions.

## Contact Information

For questions or clarification, please contact the project administrator through Replit chat.
