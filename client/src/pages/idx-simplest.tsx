import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const IDXSimplest: React.FC = () => {
  useEffect(() => {
    // Direct script embedding without any middleware
    const script = document.createElement('script');
    script.charset = 'UTF-8';
    script.type = 'text/javascript';
    script.id = 'idxwidgetsrc-40942';
    script.src = '//losangelesforsale.idxbroker.com/idx/mapwidgetjs.php?widgetid=40942';
    document.body.appendChild(script);
    
    // Clean up function
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
          <CardTitle>Property Listings - Direct Script Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This page demonstrates the simplest possible integration with IDX Broker listings.
            The script is embedded directly in the page without any middleware or iframe.
          </p>
          
          {/* This is the target div for the IDX widget */}
          <div 
            id="IDX-mapWidget-40942" 
            className="min-h-[800px] border rounded-md bg-white p-4 relative"
          >
            {/* Loading indicator */}
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-700">Loading property listings...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IDXSimplest;