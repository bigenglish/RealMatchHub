
import { IdxBrokerAPI } from './idx-broker-comprehensive-fix';

export async function runComprehensiveDiagnostics(): Promise<any> {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    apiKey: {
      present: !!process.env.IDX_BROKER_API_KEY,
      length: process.env.IDX_BROKER_API_KEY?.length || 0,
      format: process.env.IDX_BROKER_API_KEY?.startsWith('a') ? 'Valid' : 'Invalid'
    },
    connectionTest: null as any,
    endpointTests: [] as any[],
    accountInfo: null as any,
    recommendations: [] as string[]
  };

  if (!process.env.IDX_BROKER_API_KEY) {
    diagnostics.recommendations.push('Set IDX_BROKER_API_KEY environment variable');
    return diagnostics;
  }

  try {
    // Test basic connection
    const api = new IdxBrokerAPI();
    const connectionResult = await api.testConnection();
    diagnostics.connectionTest = connectionResult;

    if (connectionResult.success) {
      diagnostics.accountInfo = connectionResult.accountInfo;
      
      // Test specific endpoints
      const endpoints = [
        '/clients/accountinfo',
        '/clients/featured',
        '/clients/listings',
        '/clients/systemlinks',
        '/clients/cities',
        '/clients/counties'
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`Testing endpoint: ${endpoint}`);
          const result = await fetch(`https://api.idxbroker.com${endpoint}`, {
            headers: {
              'accesskey': process.env.IDX_BROKER_API_KEY!,
              'outputtype': 'json',
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 8000
          });

          diagnostics.endpointTests.push({
            endpoint,
            status: result.status,
            success: result.ok,
            contentType: result.headers.get('content-type'),
            hasData: result.ok ? (await result.text()).length > 0 : false
          });
        } catch (error) {
          diagnostics.endpointTests.push({
            endpoint,
            status: 0,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Generate recommendations
      const workingEndpoints = diagnostics.endpointTests.filter(test => test.success);
      const failingEndpoints = diagnostics.endpointTests.filter(test => !test.success);

      if (workingEndpoints.length > 0) {
        diagnostics.recommendations.push(`Working endpoints: ${workingEndpoints.map(e => e.endpoint).join(', ')}`);
      }

      if (failingEndpoints.length > 0) {
        diagnostics.recommendations.push(`Check account permissions for: ${failingEndpoints.map(e => e.endpoint).join(', ')}`);
      }

      if (workingEndpoints.length === 0) {
        diagnostics.recommendations.push('No endpoints working - verify API key and account configuration');
      }
    } else {
      diagnostics.recommendations.push('Basic connection failed - check API key validity');
    }
  } catch (error) {
    diagnostics.connectionTest = {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    diagnostics.recommendations.push('API initialization failed - check environment configuration');
  }

  return diagnostics;
}
