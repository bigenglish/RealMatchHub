
// Quick IDX verification script
import { fetchIdxListings } from './idx-broker';

async function verifyIdxIntegration() {
  console.log('🔍 Testing IDX Broker integration...');
  
  try {
    // Test basic listing fetch
    const result = await fetchIdxListings({ limit: 100 });
    
    console.log(`✅ Successfully fetched ${result.listings.length} listings`);
    console.log(`📊 Total count: ${result.totalCount}`);
    console.log(`🔄 Has more listings: ${result.hasMoreListings}`);
    
    if (result.listings.length > 0) {
      const sample = result.listings[0];
      console.log(`📍 Sample listing: ${sample.address}, ${sample.city} - $${sample.price?.toLocaleString()}`);
      
      // Check for enhanced MLS fields
      const enhancedFields = ['garage', 'pool', 'fireplace', 'basement', 'yearBuilt', 'lotSize'];
      const availableFields = enhancedFields.filter(field => sample[field] !== undefined && sample[field] !== null);
      console.log(`🏠 Enhanced fields available: ${availableFields.join(', ')}`);
    }
    
    // Test with filters
    const filteredResult = await fetchIdxListings({
      limit: 50,
      city: 'Los Angeles',
      minPrice: 500000,
      maxPrice: 1500000,
      bedrooms: 3,
      garage: true,
      pool: true
    });
    
    console.log(`🎯 Filtered search (LA, $500K-$1.5M, 3BR, garage, pool): ${filteredResult.listings.length} listings`);
    
    return {
      success: true,
      totalListings: result.totalCount,
      sampleListing: result.listings[0],
      filteredCount: filteredResult.listings.length
    };
    
  } catch (error) {
    console.error('❌ IDX integration test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run if called directly
if (require.main === module) {
  verifyIdxIntegration().then(result => {
    console.log('\n📋 Final Results:', result);
    process.exit(result.success ? 0 : 1);
  });
}

export { verifyIdxIntegration };
