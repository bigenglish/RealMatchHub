import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const IDXDirect: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadIDXScript = () => {
      try {
        // Get the iframe element
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentWindow || !iframe.contentDocument) {
          console.error('Could not access iframe contentWindow document.');
          return;
        }

        // Write the complete HTML with the IDX script directly embedded
        iframe.contentDocument.open();
        iframe.contentDocument.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>IDX Broker Listings</title>
              <style>
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; overflow: hidden; }
                .idx-container { width: 100%; min-height: 800px; }
                #IDX-main { width: 100% !important; }
              </style>
              
              <!-- Directly embed the IDX Broker widget script -->
              <script charset="UTF-8" type="text/javascript" id="idxwidgetsrc-40942" src="//losangelesforsale.idxbroker.com/idx/mapwidgetjs.php?widgetid=40942"></script>
            </head>
            <body>
              <div id="IDX-mapWidget-40942"></div>
            </body>
          </html>
        `);
        iframe.contentDocument.close();
        
        console.log('IDX HTML with embedded script loaded');
        
        // Hide loading overlay after a delay
        setTimeout(() => {
          const loadingOverlay = document.getElementById('loading-overlay');
          if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
          }
        }, 3000);
      } catch (error) {
        console.error('Error loading IDX iframe content:', error);
      }
    };

    loadIDXScript();
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
          <div className="relative rounded overflow-hidden">
            <iframe 
              ref={iframeRef}
              id="idxFrame" 
              width="100%" 
              height="800" 
              frameBorder="0" 
              scrolling="auto"
              title="IDX Broker Listings"
              className="bg-white rounded shadow-inner"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80" id="loading-overlay">
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

export default IDXDirect;