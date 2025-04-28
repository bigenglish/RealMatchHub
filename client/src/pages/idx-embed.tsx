import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const IDXEmbed: React.FC = () => {
  // This component uses a direct iframe to the IDX Broker listing page
  // This is the simplest and most reliable approach, but allows less customization
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Property Listings</CardTitle>
          <CardDescription>
            Browse available properties in Los Angeles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative rounded overflow-hidden">
            {/* Direct iframe to IDX Broker */}
            <iframe 
              src="https://losangelesforsale.idxbroker.com/idx/map/mapsearch"
              width="100%" 
              height="800" 
              frameBorder="0" 
              scrolling="auto"
              title="IDX Broker Listings"
              className="bg-white rounded shadow-inner"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>About IDX Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This page displays real estate listings directly from IDX Broker. The listings are 
            updated regularly to reflect the current market inventory in Los Angeles.
          </p>
          <p className="mb-4">
            You can search for properties, filter by various criteria, and view detailed information
            about each listing directly within the iframe above.
          </p>
          <p>
            If you have any questions about a specific property or would like to schedule a showing,
            please contact us using the information on our Contact page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default IDXEmbed;