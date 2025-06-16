
# Developer Setup Guide

## IDX Integration Issue

We're experiencing issues with our IDX Broker API integration. The main problems are:

1. **Same properties appearing repeatedly** - not getting real MLS data
2. **API calls returning fallback/demo data** instead of live listings
3. **Possible authentication or endpoint configuration issues**

## Key Files to Review

### IDX Integration Files:
- `server/idx-broker-api-client.ts` - Main API client
- `server/routes.ts` - API endpoints (search for `/api/properties`)
- `server/idx-authentic-fallback.ts` - Fallback data (currently being used)

### Frontend Components:
- `client/src/pages/properties.tsx` - Property listing page
- `client/src/components/property-card.tsx` - Property display

## Setup Instructions

1. **Clone this repository**
2. **Install dependencies**: `npm install`
3. **Environment Setup**: 
   - You'll need to provide your own IDX_BROKER_API_KEY for testing
   - Other API keys (Firebase, Google Cloud) are optional for IDX testing

4. **Run the application**: `npm run dev`

## Current Issue Details

The IDX Broker API should return real MLS listings, but we're consistently getting the same 13 demo properties. The issue appears to be in the API parameter mapping or endpoint selection.

## What We Need

- Review the IDX API implementation
- Identify why real MLS data isn't being returned
- Fix the parameter mapping and endpoint configuration
- Ensure proper error handling and fallback logic

## Testing Endpoints

- `/api/idx-test` - Basic connection test
- `/api/properties` - Main property search (currently showing same results)
- `/api/idx-live-diagnostic` - Comprehensive API diagnostic

## Documentation

IDX Broker API documentation: https://middleware.idxbroker.com/docs/api/
