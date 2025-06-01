
import axios from 'axios';

/**
 * Comprehensive IDX Broker API debugging utility
 */
export async function debugIdxBrokerApi(): Promise<void> {
  const apiKey = process.env.IDX_BROKER_API_KEY;
  
  console.log('\n=== IDX Broker API Debug Report ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Environment:', process.env.NODE_ENV || 'development');
  
  if (!apiKey) {
    console.log('❌ No IDX_BROKER_API_KEY found in environment variables');
    return;
  }
  
  console.log('✅ API Key found');
  console.log('📊 API Key length:', apiKey.length);
  console.log('📊 API Key prefix:', apiKey.substring(0, 4) + '...');
  console.log('📊 Starts with "a":', apiKey.startsWith('a'));
  
  // Test different endpoints with different header combinations
  const endpoints = [
    'https://api.idxbroker.com/clients/accountinfo',
    'https://api.idxbroker.com/clients/systemlinks',
    'https://api.idxbroker.com/clients/subdomain'
  ];
  
  const headerVariations = [
    { 'accesskey': apiKey, 'outputtype': 'json' },
    { 'accesskey': apiKey },
    { 'Content-Type': 'application/x-www-form-urlencoded', 'accesskey': apiKey },
    { 'Authorization': `Bearer ${apiKey}` }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n🔍 Testing endpoint: ${endpoint}`);
    
    for (let i = 0; i < headerVariations.length; i++) {
      const headers = headerVariations[i];
      console.log(`  📝 Header variation ${i + 1}:`, Object.keys(headers).join(', '));
      
      try {
        const response = await axios.get(endpoint, {
          headers,
          timeout: 5000
        });
        
        console.log(`  ✅ Success! Status: ${response.status}`);
        console.log(`  📄 Response type:`, typeof response.data);
        console.log(`  📊 Response size:`, JSON.stringify(response.data).length, 'characters');
        
        if (response.data && typeof response.data === 'object') {
          console.log(`  🔑 Response keys:`, Object.keys(response.data).slice(0, 5).join(', '));
        }
        
        // Found a working combination, stop testing this endpoint
        break;
        
      } catch (error: any) {
        if (error.response) {
          console.log(`  ❌ HTTP ${error.response.status}: ${error.response.statusText}`);
          if (error.response.data) {
            console.log(`  📄 Error data:`, JSON.stringify(error.response.data).substring(0, 200));
          }
        } else if (error.request) {
          console.log(`  ❌ Network error:`, error.message);
        } else {
          console.log(`  ❌ Request error:`, error.message);
        }
      }
    }
  }
  
  console.log('\n=== End Debug Report ===\n');
}
