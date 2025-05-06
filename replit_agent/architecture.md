# Architecture Overview

## 1. Overview

This repository contains a real estate platform that combines traditional real estate features with AI-powered capabilities. The application is built with a modern stack, featuring a React frontend and a Node.js Express backend. The platform leverages various Google Cloud services for AI functionality, including Gemini AI, Document AI, Vision AI, and Vertex AI.

The application offers property listings, real estate services, document processing, market analysis, and various AI-powered features such as property recommendations, style matching, and legal term explanations.

## 2. System Architecture

The system follows a client-server architecture with a clear separation between the frontend and backend:

### 2.1 Frontend Architecture

- Built with React and TypeScript
- Uses Vite as the build tool and development server
- Styling with Tailwind CSS
- Component library based on Radix UI primitives with a custom shadcn/ui implementation
- Client-side routing with Wouter (lightweight React router)
- State management via React Query for server state and React context for client state

### 2.2 Backend Architecture

- Node.js Express server with TypeScript
- API-first design with RESTful endpoints
- WebSocket support for real-time features (chat)
- Server-side rendered React with Vite's SSR capabilities
- File upload handling with Multer

### 2.3 Database Architecture

- PostgreSQL database (via Neon serverless)
- Drizzle ORM for type-safe database access
- Schema-based migrations
- PostgreSQL-specific features (JSONB, arrays)

### 2.4 Authentication & Authorization

- Firebase Authentication integration
- Role-based access control (user, vendor, admin)
- JWT token-based authentication

## 3. Key Components

### 3.1 Frontend Components

- **Property Search & Listings**: Traditional and AI-powered search for properties
- **Service Marketplace**: Platform for real estate service providers
- **Document Management**: Upload, processing, and management of real estate documents
- **Chat & Communication**: Real-time messaging between users
- **Appointment Scheduling**: Calendar-based appointment booking system
- **Interactive Workflows**: Guided buyer and seller flows

### 3.2 Backend Services

- **AI Service Layer**: Integrations with Google's AI services
  - **Gemini AI**: For chatbot, property descriptions, legal term explanations
  - **Document AI**: For processing and extracting data from real estate documents
  - **Vision AI**: For analyzing property images and style preferences
  - **Vertex AI**: For advanced property recommendations

- **IDX Broker Integration**: Integration with IDX Broker for real estate listings
- **Google Places API**: For location-based services
- **Chat Service**: WebSocket-based real-time communication
- **Communication Service**: Handles property showings, offers, documents, and messages
- **Storage Service**: Manages various data storage operations

### 3.3 Database Schema

The database schema is organized around several core entities:

- **Properties**: Real estate listings with details like price, location, features
- **ServiceProviders**: Companies offering real estate services
- **ServiceExperts**: Individual professionals providing specialized services
- **MarketTrends**: Market analysis data for different regions
- **Chat-related**: Conversations, messages, participants
- **Property Communication**: Showings, offers, documents, valuation slots

## 4. Data Flow

### 4.1 Client-Server Communication

- REST API for most operations
- WebSockets for real-time features (chat)
- React Query for data fetching, caching, and state management
- File uploads via multipart/form-data for documents and images

### 4.2 AI Processing Flow

1. Client sends data (text, images, documents) to the server
2. Server processes with appropriate AI service:
   - Text → Gemini AI
   - Images → Vision AI
   - Documents → Document AI
   - Advanced predictions → Vertex AI
3. AI results are processed, transformed, and returned to the client
4. Client displays results and allows user interaction

### 4.3 Real Estate Process Flows

- **Buyer Flow**: Search → View → Schedule → Offer → Purchase
- **Seller Flow**: Valuation → Listing → Showings → Offers → Sale
- **Service Provider Flow**: List Services → Appointments → Deliver → Bill

## 5. External Dependencies

### 5.1 Google Cloud Services

- **Gemini AI**: For natural language understanding and generation
- **Document AI**: For document processing and extraction
- **Vision AI**: For image analysis
- **Vertex AI**: For advanced AI models
- **Cloud Storage**: For file storage

### 5.2 Third-Party Services

- **Firebase**: For authentication and possibly Firestore for chat data
- **Neon Database**: Serverless PostgreSQL
- **IDX Broker**: Real estate listing API
- **FullCalendar**: For appointment scheduling
- **Stripe**: For payment processing (imported but may not be fully implemented)

### 5.3 Development Dependencies

- **Vite**: Build tool and development server
- **TypeScript**: Type checking
- **ESBuild**: For server-side bundling
- **Tailwind CSS**: Utility-first CSS framework
- **Drizzle**: SQL ORM and migration toolkit

## 6. Deployment Strategy

The application is configured for deployment to:

- **Replit**: Development environment with built-in hosting
- **Google Cloud Run**: Containerized serverless deployment

The deployment process includes:

1. Building the client-side assets with Vite
2. Bundling the server code with ESBuild
3. Combining the output into a single deployable package
4. Running database migrations
5. Starting the Node.js server

The project is set up to handle different environments (development, production) with appropriate configuration for each.

## 7. Key Architectural Decisions

### 7.1 Monorepo Approach

**Decision**: Use a monorepo structure with shared types between frontend and backend.

**Rationale**: This approach allows for type-safety across the entire application stack and simplified deployment. The shared schema definitions ensure consistency between the client and server.

### 7.2 AI-First Design

**Decision**: Integrate multiple AI services as core features rather than add-ons.

**Rationale**: AI capabilities are central to the platform's value proposition, providing enhanced search, document processing, and personalization. This differentiates the platform from traditional real estate sites.

### 7.3 Serverless Database

**Decision**: Use Neon's serverless PostgreSQL over traditional database hosting.

**Rationale**: Serverless databases offer better scaling characteristics and lower operational overhead. The PostgreSQL compatibility ensures a mature feature set while gaining serverless benefits.

### 7.4 Client-Side Framework Choices

**Decision**: Use React with Vite, Tailwind CSS, and shadcn/ui components.

**Rationale**: This combination provides excellent developer experience, performance, and maintainability. Vite offers fast development and optimized builds, while Tailwind and shadcn/ui enable rapid UI development with consistent styling.

### 7.5 API Architecture

**Decision**: RESTful API with React Query for data fetching.

**Rationale**: This approach provides a clean separation of concerns, is familiar to developers, and works well with the React ecosystem. React Query handles caching, background updates, and optimistic UI updates.

### 7.6 Real-Time Features

**Decision**: WebSockets for chat and real-time updates.

**Rationale**: WebSockets provide the low-latency, bidirectional communication necessary for features like chat. This approach offers better user experience than polling while being more resource-efficient.