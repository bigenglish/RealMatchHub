import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

// Configure environment variables
dotenv.config();

const router = express.Router();

const IDX_BROKER_API_KEY = process.env.IDX_BROKER_API_KEY;
// Updated to match the API documentation - IDX Broker API endpoints
const IDX_BROKER_BASE_URL = 'https://api.idxbroker.com/clients/featured';

// Log the configuration
console.log('[IDX-Broker] API Key exists:', !!IDX_BROKER_API_KEY);
console.log('[IDX-Broker] Base URL:', IDX_BROKER_BASE_URL);

// Add a status endpoint for troubleshooting
router.get('/idx/status', async (req, res) => {
  console.log('[IDX-Broker] Status check requested');
  
  try {
    let apiResponse = null;
    
    if (IDX_BROKER_API_KEY) {
      try {
        // Test a simple API call to check connectivity
        console.log('[IDX-Broker] Testing API connectivity...');
        const response = await axios.get(IDX_BROKER_BASE_URL, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'accesskey': IDX_BROKER_API_KEY,
            'outputtype': 'json'
          }
        });
        
        console.log('[IDX-Broker] Test API response status:', response.status);
        apiResponse = {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers['content-type'],
          dataType: typeof response.data,
          dataSize: JSON.stringify(response.data).length,
          data: response.data
        };
      } catch (apiError) {
        console.error('[IDX-Broker] Error testing API connectivity:', apiError.message);
        if (apiError.response) {
          apiResponse = {
            status: apiError.response.status,
            statusText: apiError.response.statusText,
            error: apiError.message
          };
        } else {
          apiResponse = {
            error: apiError.message
          };
        }
      }
    }
    
    res.json({
      apiKey: !!IDX_BROKER_API_KEY,
      apiBaseUrl: IDX_BROKER_BASE_URL,
      apiResponse
    });
  } catch (error) {
    console.error('[IDX-Broker] Error in status check:', error);
    res.status(500).json({ error: 'Failed to check IDX Broker status' });
  }
});

// Endpoint to fetch featured listings
router.get('/idx/listings/featured', async (req, res) => {
  console.log('[IDX-Broker] Received request for featured listings');
  
  if (!IDX_BROKER_API_KEY) {
    console.error('[IDX-Broker] API Key not configured');
    return res.status(500).json({ error: 'IDX Broker API Key not configured.' });
  }
  
  try {
    console.log(`[IDX-Broker] Fetching featured listings from ${IDX_BROKER_BASE_URL}`);
    
    const response = await axios.get(IDX_BROKER_BASE_URL, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accesskey': IDX_BROKER_API_KEY,
        'outputtype': 'json'
      }
    });
    
    console.log('[IDX-Broker] API response status:', response.status);
    console.log('[IDX-Broker] Response data type:', typeof response.data);
    
    // If we got data but no results, create a dummy response for testing
    if (!response.data || !Array.isArray(response.data.properties)) {
      console.log('[IDX-Broker] Response data structure:', JSON.stringify(response.data).substring(0, 200) + '...');
      
      // Return the actual response even if it doesn't match expected format
      return res.json({
        success: true,
        results: response.data && Array.isArray(response.data) ? response.data : [],
        raw: response.data
      });
    }
    
    res.json({
      success: true,
      results: response.data.properties || []
    });
  } catch (error) {
    console.error('[IDX-Broker] Error fetching featured listings:', error.message);
    if (error.response) {
      console.error('[IDX-Broker] Response status:', error.response.status);
      console.error('[IDX-Broker] Response headers:', error.response.headers);
      console.error('[IDX-Broker] Response data:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to retrieve featured listings.', details: error.message });
  }
});

// Endpoint to search listings
router.get('/idx/listings/search', async (req, res) => {
  console.log('[IDX-Broker] Received search request with query:', req.query);
  
  if (!IDX_BROKER_API_KEY) {
    console.error('[IDX-Broker] API Key not configured');
    return res.status(500).json({ error: 'IDX Broker API Key not configured.' });
  }
  
  try {
    const searchParams = new URLSearchParams();
    
    // Add any query parameters from the request
    Object.entries(req.query).forEach(([key, value]) => {
      if (value) searchParams.append(key, value.toString());
    });
    
    searchParams.append('outputtype', 'json');

    const searchUrl = `${IDX_BROKER_BASE_URL}/search`;
    console.log(`[IDX-Broker] Searching at ${searchUrl} with params: ${searchParams.toString()}`);

    const response = await axios.get(searchUrl, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accesskey': IDX_BROKER_API_KEY,
      },
      params: searchParams
    });
    
    console.log('[IDX-Broker] Search response status:', response.status);
    
    // If we got data but no results, create a dummy response for testing
    if (!response.data || !Array.isArray(response.data.properties)) {
      console.log('[IDX-Broker] Search response data structure:', JSON.stringify(response.data).substring(0, 200) + '...');
      
      return res.json({
        success: true,
        results: response.data && Array.isArray(response.data) ? response.data : [],
        raw: response.data
      });
    }
    
    res.json({
      success: true,
      results: response.data.properties || []
    });
  } catch (error) {
    console.error('[IDX-Broker] Error fetching search results:', error.message);
    if (error.response) {
      console.error('[IDX-Broker] Response status:', error.response.status);
      console.error('[IDX-Broker] Response headers:', error.response.headers);
      console.error('[IDX-Broker] Response data:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to retrieve MLS listings.', details: error.message });
  }
});

export const idxBrokerRoutes = router;