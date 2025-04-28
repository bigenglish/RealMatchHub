import React from 'react';
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const IDXImplementationSelector: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">IDX Broker Integration Options</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Direct Widget Script</CardTitle>
            <CardDescription>
              The most direct approach: Embeds the IDX Broker widget script directly into the page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This approach uses React's useEffect to load the IDX Broker script directly into the page,
              exactly as specified in the IDX Broker documentation.
            </p>
            <Button asChild className="w-full">
              <Link href="/idx-widget-direct">View Implementation</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Iframe Direct Integration</CardTitle>
            <CardDescription>
              Direct iframe to the IDX Broker map search page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This approach uses a direct iframe to the IDX Broker map search page, bypassing
              any script loading issues.
            </p>
            <Button asChild className="w-full">
              <Link href="/idx-embed">View Implementation</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Iframe with Embedded Script</CardTitle>
            <CardDescription>
              Creates an iframe with the IDX widget script embedded in its content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This approach creates an iframe and injects the IDX widget script directly
              into the iframe's content document.
            </p>
            <Button asChild className="w-full">
              <Link href="/idx-direct">View Implementation</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Proxy Script Integration</CardTitle>
            <CardDescription>
              Fetches the IDX script via our backend and injects it into an iframe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This approach fetches the IDX widget script from our backend proxy and 
              injects it into an iframe's content document.
            </p>
            <Button asChild className="w-full">
              <Link href="/idx-iframe">View Implementation</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>API-Based Implementation</CardTitle>
            <CardDescription>
              Uses the IDX Broker API to fetch listings directly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This approach uses the IDX Broker API to fetch listings and displays them
              in our own custom UI. Includes API diagnostics.
            </p>
            <Button asChild className="w-full">
              <Link href="/idx-explorer">View Implementation</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Tools</CardTitle>
            <CardDescription>
              Tools to diagnose and fix IDX Broker integration issues.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This page provides diagnostic tools and tests for the IDX Broker integration,
              including API connectivity tests and script loading diagnostics.
            </p>
            <Button asChild className="w-full">
              <Link href="/idx-troubleshoot">View Implementation</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Pure HTML Implementation</CardTitle>
            <CardDescription>
              Static HTML page with embedded IDX widget script.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This is a pure HTML implementation with the IDX widget script embedded
              directly, with no React or other frameworks involved.
            </p>
            <Button asChild className="w-full">
              <a href="/idx-widget.html" target="_blank" rel="noopener noreferrer">
                View Implementation
              </a>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>External IDX Page</CardTitle>
            <CardDescription>
              Direct link to the IDX Broker listings page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This opens the IDX Broker listings page directly in a new tab,
              providing the full IDX Broker experience.
            </p>
            <Button asChild className="w-full">
              <a href="https://losangelesforsale.idxbroker.com/idx/map/mapsearch" target="_blank" rel="noopener noreferrer">
                Open IDX Broker Page
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IDXImplementationSelector;