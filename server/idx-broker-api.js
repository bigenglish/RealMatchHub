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

// Add a test endpoint for a specific account
router.get('/idx/test', async (req, res) => {
  console.log('[IDX-Broker] Test request with specific account ID');
  
  try {
    // Use account ID from query param or default to 58882 (user-provided ID)
    const accountId = req.query.accountId || '58882';
    
    // Test different API endpoints with the specific account ID
    const testEndpoints = [
      // Direct endpoint with accountId
      `https://api.idxbroker.com/clients/${accountId}/featured`,
      // Legacy v1.7.0 endpoint format
      `https://api.idxbroker.com/clients/featured?clientID=${accountId}`,
      // Properties endpoint for the account
      `https://api.idxbroker.com/clients/${accountId}/properties`,
      // Alternative MLS listings endpoint
      `https://api.idxbroker.com/mls/listings/${accountId}`
    ];
    
    console.log(`[IDX-Broker] Testing multiple endpoints for account ID: ${accountId}`);
    
    const results = [];
    let success = false;
    
    for (const endpoint of testEndpoints) {
      try {
        console.log(`[IDX-Broker] Testing endpoint: ${endpoint}`);
        
        const response = await axios.get(endpoint, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'accesskey': IDX_BROKER_API_KEY,
            'outputtype': 'json'
          },
          timeout: 5000 // 5 second timeout for each request
        });
        
        console.log(`[IDX-Broker] Response from ${endpoint}: Status ${response.status}`);
        
        const result = {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          dataType: typeof response.data,
          hasData: response.status === 200 && (
            (typeof response.data === 'object' && Object.keys(response.data).length > 0) ||
            (Array.isArray(response.data) && response.data.length > 0) ||
            (typeof response.data === 'string' && response.data.length > 10)
          )
        };
        
        // If we get a successful response with data, mark overall test as successful
        if (result.hasData) {
          success = true;
        }
        
        results.push(result);
      } catch (endpointError) {
        console.error(`[IDX-Broker] Error testing endpoint ${endpoint}:`, endpointError.message);
        
        const errorResult = {
          endpoint,
          error: endpointError.message
        };
        
        if (endpointError.response) {
          errorResult.status = endpointError.response.status;
          errorResult.statusText = endpointError.response.statusText;
        }
        
        results.push(errorResult);
      }
    }
    
    // Also test the widget URL for this account
    try {
      console.log(`[IDX-Broker] Testing widget URL for account ${accountId}...`);
      const widgetUrl = `https://idx.diversesolutions.com/scripts/controls.js?accountid=${accountId}&widgetid=widget_1`;
      
      const widgetResponse = await axios.head(widgetUrl, { timeout: 5000 });
      
      console.log(`[IDX-Broker] Widget URL test result: ${widgetResponse.status}`);
      
      results.push({
        endpoint: widgetUrl,
        status: widgetResponse.status,
        statusText: widgetResponse.statusText,
        isWidget: true,
        widgetWorks: widgetResponse.status === 200
      });
      
      if (widgetResponse.status === 200) {
        success = true;
      }
    } catch (widgetError) {
      console.error('[IDX-Broker] Error testing widget URL:', widgetError.message);
      
      const widgetResult = {
        endpoint: `https://idx.diversesolutions.com/scripts/controls.js?accountid=${accountId}&widgetid=widget_1`,
        error: widgetError.message,
        isWidget: true
      };
      
      if (widgetError.response) {
        widgetResult.status = widgetError.response.status;
        widgetResult.statusText = widgetError.response.statusText;
      }
      
      results.push(widgetResult);
    }
    
    res.json({
      success,
      accountId,
      apiKeyValid: !!IDX_BROKER_API_KEY,
      message: success 
        ? `Successfully connected to IDX Broker with account ID ${accountId}` 
        : `Failed to find valid data for account ID ${accountId}`,
      results
    });
  } catch (error) {
    console.error('[IDX-Broker] Error in test:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to test IDX Broker connection',
      message: error.message
    });
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