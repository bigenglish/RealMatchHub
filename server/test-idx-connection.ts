
import axios from 'axios';

async function testIdxBrokerConnection() {
  const apiKey = '@C1r6rrCR9VuUqT2gs@dU';
  
  console.log('=== IDX Broker API Connection Test ===');
  console.log('API Key:', apiKey.substring(0, 4) + '...');
  console.log('API Key Length:', apiKey.length);
  
  const endpoints = [
    'https://api.idxbroker.com/clients/accountinfo',
    'https://api.idxbroker.com/clients/systemlinks',
    'https://api.idxbroker.com/clients/subdomain',
    'https://api.idxbroker.com/clients/featured'
  ];
  
  const headerFormats = [
    { 'accesskey': apiKey, 'outputtype': 'json' },
    { 'Content-Type': 'application/x-www-form-urlencoded', 'accesskey': apiKey, 'outputtype': 'json' },
    { 'accesskey': apiKey },
    { 'Authorization': `Bearer ${apiKey}` }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\nTesting: ${endpoint}`);
    
    for (let i = 0; i < headerFormats.length; i++) {
      const headers = headerFormats[i];
      console.log(`  Format ${i + 1}: ${Object.keys(headers).join(', ')}`);
      
      try {
        const response = await axios.get(endpoint, {
          headers,
          timeout: 8000,
          validateStatus: () => true
        });
        
        console.log(`    ✅ Status: ${response.status}`);
        console.log(`    📄 Data type: ${typeof response.data}`);
        console.log(`    📊 Data preview: ${JSON.stringify(response.data).substring(0, 100)}...`);
        
        if (response.status === 200 && response.data) {
          console.log(`    🎉 SUCCESS! This combination works.`);
          return { success: true, endpoint, headers, data: response.data };
        }
      } catch (error: any) {
        console.log(`    ❌ Error: ${error.response?.status || error.message}`);
        if (error.response?.data) {
          console.log(`    📄 Error data: ${JSON.stringify(error.response.data).substring(0, 100)}...`);
        }
      }
    }
  }
  
  return { success: false, message: 'No working combination found' };
}

// Run the test
testIdxBrokerConnection()
  .then(result => {
    console.log('\n=== Test Complete ===');
    console.log('Result:', result);
  })
  .catch(error => {
    console.error('Test failed:', error);
  });
