import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const IDXWidgetDirect: React.FC = () => {
  useEffect(() => {
    // This is the most direct approach - create and append the script exactly as provided by IDX Broker
    const script = document.createElement('script');
    script.charset = 'UTF-8';
    script.type = 'text/javascript';
    script.id = 'idxwidgetsrc-40942';
    script.src = '//losangelesforsale.idxbroker.com/idx/mapwidgetjs.php?widgetid=40942';
    script.async = true;
    
    // Append to the document body
    document.body.appendChild(script);
    
    // Clean up
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

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
          <div className="relative rounded overflow-hidden bg-white p-4 min-h-[800px]">
            {/* The div where IDX widget will be rendered */}
            <div id="IDX-mapWidget-40942"></div>
            
            {/* Loading indicator that disappears when widget loads */}
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90" id="loading-overlay">
              <div className="text-center">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-700">Loading property listings...</p>
              </div>
            </div>
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
            about each listing directly within the widget above.
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

export default IDXWidgetDirect;