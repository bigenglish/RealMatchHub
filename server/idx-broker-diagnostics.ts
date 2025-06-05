// IDX Broker API diagnostics to identify authentication requirements

export async function diagnoseFrontGateApiAccess(): Promise<any> {
  const apiKey = process.env.IDX_BROKER_API_KEY;
  
  if (!apiKey) {
    throw new Error('IDX_BROKER_API_KEY not found');
  }

  // Test multiple IDX Broker API endpoints and authentication methods
  const testEndpoints = [
    // Client API endpoints
    {
      name: 'clients/featured',
      url: 'https://api.idxbroker.com/clients/featured',
      method: 'GET'
    },
    {
      name: 'clients/cities',
      url: 'https://api.idxbroker.com/clients/cities',
      method: 'GET'
    },
    {
      name: 'clients/listings',
      url: 'https://api.idxbroker.com/clients/listings',
      method: 'GET'
    },
    // Partners API endpoints
    {
      name: 'partners/listingssearch',
      url: 'https://api.idxbroker.com/partners/listingssearch',
      method: 'GET'
    },
    {
      name: 'partners/featured',
      url: 'https://api.idxbroker.com/partners/featured',
      method: 'GET'
    },
    // MLS endpoints
    {
      name: 'mls/searchfields',
      url: 'https://api.idxbroker.com/mls/searchfields',
      method: 'GET'
    }
  ];

  const authMethods = [
    // Header-based authentication
    {
      name: 'accesskey-header',
      headers: {
        'accesskey': apiKey,
        'outputtype': 'json',
        'apiversion': '1.4.0'
      }
    },
    // URL parameter authentication
    {
      name: 'accesskey-param',
      params: `accesskey=${apiKey}&outputtype=json`
    },
    // Combined authentication
    {
      name: 'combined-auth',
      headers: {
        'accesskey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      params: `outputtype=json`
    }
  ];

  const results = [];

  for (const endpoint of testEndpoints) {
    for (const auth of authMethods) {
      try {
        const url = auth.params ? `${endpoint.url}?${auth.params}` : endpoint.url;
        const headers = auth.headers || {};

        console.log(`[IDX-Diagnostics] Testing ${endpoint.name} with ${auth.name}`);

        const response = await fetch(url, {
          method: endpoint.method,
          headers
        });

        const responseText = await response.text();
        
        results.push({
          endpoint: endpoint.name,
          authMethod: auth.name,
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          responsePreview: responseText.substring(0, 200),
          isHtml: responseText.includes('<!DOCTYPE'),
          contentType: response.headers.get('content-type')
        });

        // If we get a successful response, log it
        if (response.ok) {
          console.log(`[IDX-Diagnostics] SUCCESS: ${endpoint.name} with ${auth.name}`);
          console.log(`[IDX-Diagnostics] Response: ${responseText.substring(0, 500)}`);
        }

      } catch (error) {
        results.push({
          endpoint: endpoint.name,
          authMethod: auth.name,
          error: error.message,
          success: false
        });
      }
    }
  }

  return {
    apiKeyLength: apiKey.length,
    apiKeyPrefix: apiKey.substring(0, 4),
    totalTests: results.length,
    successfulTests: results.filter(r => r.success).length,
    results: results.filter(r => r.success || r.status !== 406), // Show non-406 errors
    allResults: results
  };
}