import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface IDXWidgetProps {
  accountId?: string;
  widgetId?: string;
  title?: string;
}

/**
 * IDX Broker Widget Component
 * 
 * This component integrates the IDX Broker widget directly into our application,
 * which is a more reliable approach than trying to fetch data through API calls.
 * 
 * The widget will display property listings directly from IDX Broker with their
 * built-in search functionality.
 */
export const IDXWidget: React.FC<IDXWidgetProps> = ({
  accountId = 'REALT28704', // Default account ID (should be replaced with your actual IDX account ID)
  widgetId = 'widget_1', // Default widget ID
  title = 'Property Listings'
}) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // Don't re-add the script if it already exists
    if (document.querySelector(`script[src*="${accountId}"]`)) {
      return;
    }

    // Create the IDX Broker script
    const script = document.createElement('script');
    script.src = `https://idx.diversesolutions.com/scripts/controls.js?accountid=${accountId}&widgetid=${widgetId}`;
    script.async = true;
    
    // Log when the script loads successfully or fails
    script.onload = () => {
      console.log('IDX Broker widget script loaded successfully');
    };
    
    script.onerror = (error) => {
      console.error('Error loading IDX Broker widget script:', error);
    };
    
    document.body.appendChild(script);
    scriptRef.current = script;
    
    // Clean up function
    return () => {
      if (scriptRef.current) {
        document.body.removeChild(scriptRef.current);
      }
    };
  }, [accountId, widgetId]);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={widgetRef} className="idx-widget">
          <div id={`IDX-${widgetId}`} className="w-full"></div>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500 mb-4">
            If the listings don't appear above, please check your IDX Broker account configuration.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="mx-auto"
          >
            Refresh Listings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IDXWidget;