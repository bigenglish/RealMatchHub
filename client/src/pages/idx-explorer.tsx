import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IDXWidget from '@/components/idx-widget';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

/**
 * IDX Explorer page
 * 
 * This page uses the official IDX Broker widget approach, which is more reliable 
 * than direct API calls since IDX Broker's API endpoints can be complex and 
 * subject to changes or account-specific configuration.
 * 
 * The widget approach embeds IDX Broker's officially supported JavaScript, which
 * ensures compatibility and reduces maintenance overhead.
 */
const IdxExplorer: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Realty.AI IDX Explorer</h1>
      
      <Alert className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Property Listings Powered by IDX Broker</AlertTitle>
        <AlertDescription>
          This explorer uses the official IDX Broker widget technology to display the most 
          up-to-date and accurate property listings. The widgets below connect directly to 
          the IDX Broker platform, ensuring you get real-time data.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="featured" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="featured">Featured Listings</TabsTrigger>
          <TabsTrigger value="search">Advanced Search</TabsTrigger>
          <TabsTrigger value="map">Map Search</TabsTrigger>
        </TabsList>
        
        <TabsContent value="featured">
          <IDXWidget 
            title="Featured Properties" 
            widgetId="featured_1" 
          />
        </TabsContent>
        
        <TabsContent value="search">
          <IDXWidget 
            title="Search Properties" 
            widgetId="search_1" 
          />
        </TabsContent>
        
        <TabsContent value="map">
          <IDXWidget 
            title="Map Search" 
            widgetId="map_1" 
          />
        </TabsContent>
      </Tabs>
      
      <div className="mt-10 text-sm text-gray-600">
        <h3 className="font-semibold mb-2">About IDX Broker Integration</h3>
        <p>
          IDX Broker provides MLS property data integration services for real estate websites.
          This integration ensures that property data is always up-to-date and complies with all
          MLS rules and regulations. The IDX Broker service requires an active account and proper
          configuration to display real estate listings from your area's MLS.
        </p>
      </div>
    </div>
  );
};

export default IdxExplorer;