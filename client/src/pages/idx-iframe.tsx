import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const IDXIframe: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadIDXScript = async () => {
      try {
        // Get the iframe element
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentWindow || !iframe.contentDocument) {
          console.error('Could not access iframe contentWindow document.');
          return;
        }

        // Initialize the iframe document with basic HTML structure
        iframe.contentDocument.open();
        iframe.contentDocument.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>IDX Broker Listings</title>
              <style>
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                .idx-container { width: 100%; height: 100%; }
              </style>
            </head>
            <body>
              <div class="idx-container" id="idx-container"></div>
            </body>
          </html>
        `);
        iframe.contentDocument.close();

        // Fetch the IDX script content from our proxy endpoint
        const response = await fetch('/api/get-idx-script');
        if (!response.ok) {
          throw new Error(`Failed to fetch IDX script: ${response.statusText}`);
        }
        
        const scriptContent = await response.text();
        
        // Create a script element and inject the fetched content
        const scriptElement = iframe.contentDocument.createElement('script');
        scriptElement.id = 'idxwidgetsrc-40942';
        scriptElement.type = 'text/javascript';
        scriptElement.charset = 'UTF-8';
        scriptElement.text = scriptContent;
        
        // Add the script to the iframe's head
        iframe.contentDocument.head.appendChild(scriptElement);
        
        console.log('IDX script loaded successfully');
      } catch (error) {
        console.error('Error loading IDX script:', error);
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
            Browse available properties from IDX Broker
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
              scrolling="yes"
              title="IDX Broker Listings"
              className="bg-white rounded shadow-inner"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" id="loading-overlay">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
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
            updated regularly to reflect the current market inventory.
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

export default IDXIframe;