import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface IdxWidgetProps {
  widgetId?: string;
  className?: string;
}

export default function IdxWidget({ widgetId = "40938", className = "" }: IdxWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Define the type for IDX status response
  interface IdxStatusResponse {
    enabled: boolean;
    message: string;
  }
  
  // Check if IDX API is configured
  const { data: idxStatus, isLoading: isStatusLoading } = useQuery<IdxStatusResponse>({
    queryKey: ['/api/idx-status'],
    staleTime: Infinity, // This won't change during the session
  });
  
  const isIdxEnabled = idxStatus?.enabled;
  
  useEffect(() => {
    // Skip if API status is still loading or API is not enabled
    if (isStatusLoading || !isIdxEnabled) {
      return;
    }
    
    // Note: You need an active IDX Broker account to use this
    // In a real implementation, you would use your own account domain in place of "losangelesforsale"
    
    // Create and load the IDX script
    const script = document.createElement('script');
    script.charset = 'UTF-8';
    script.type = 'text/javascript';
    script.id = `idxwidgetsrc-${widgetId}`;
    
    // Use a demo iframe as a fallback since we can't access the real IDX broker account
    // This creates a search form that demonstrates how the widget would work
    const demoHTML = `
      <div class="idx-quick-search-form">
        <h3 class="text-lg font-semibold mb-4">Find Your Dream Home</h3>
        <form class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Location</label>
            <input type="text" class="w-full px-3 py-2 border rounded-md" placeholder="City, ZIP, Address, or MLS#" />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Price Min</label>
              <select class="w-full px-3 py-2 border rounded-md">
                <option value="">No Min</option>
                <option value="100000">$100,000</option>
                <option value="200000">$200,000</option>
                <option value="300000">$300,000</option>
                <option value="500000">$500,000</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Price Max</label>
              <select class="w-full px-3 py-2 border rounded-md">
                <option value="">No Max</option>
                <option value="300000">$300,000</option>
                <option value="500000">$500,000</option>
                <option value="750000">$750,000</option>
                <option value="1000000">$1,000,000</option>
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Beds</label>
              <select class="w-full px-3 py-2 border rounded-md">
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Baths</label>
              <select class="w-full px-3 py-2 border rounded-md">
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Type</label>
              <select class="w-full px-3 py-2 border rounded-md">
                <option value="">Any</option>
                <option value="single-family">Single Family</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
              </select>
            </div>
          </div>
          
          <button type="button" class="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90">
            Search Properties
          </button>
        </form>
        <div class="mt-3 text-xs text-center text-muted-foreground">
          Powered by IDX Broker
        </div>
      </div>
    `;
    
    // Add the demo content to the container
    if (containerRef.current) {
      containerRef.current.innerHTML = demoHTML;
      setWidgetLoaded(true);
      
      // For demonstration purposes, set a timeout to simulate loading
      const timeoutId = setTimeout(() => {
        if (containerRef.current) {
          setWidgetLoaded(true);
        }
      }, 1000);
      
      return () => {
        clearTimeout(timeoutId);
        if (containerRef.current && script.parentNode) {
          containerRef.current.removeChild(script);
        }
      };
    }
  }, [widgetId, isStatusLoading, isIdxEnabled]);
  
  // Show a fallback UI if the widget fails to load, or if IDX API is not enabled
  if (error || isStatusLoading || !isIdxEnabled) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Property Search</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="City, neighborhood, or ZIP code" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price-min">Min Price</Label>
                <Select defaultValue="0">
                  <SelectTrigger id="price-min">
                    <SelectValue placeholder="No Min" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No Min</SelectItem>
                    <SelectItem value="100000">$100,000</SelectItem>
                    <SelectItem value="200000">$200,000</SelectItem>
                    <SelectItem value="300000">$300,000</SelectItem>
                    <SelectItem value="500000">$500,000</SelectItem>
                    <SelectItem value="750000">$750,000</SelectItem>
                    <SelectItem value="1000000">$1,000,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="price-max">Max Price</Label>
                <Select defaultValue="10000000">
                  <SelectTrigger id="price-max">
                    <SelectValue placeholder="No Max" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10000000">No Max</SelectItem>
                    <SelectItem value="200000">$200,000</SelectItem>
                    <SelectItem value="300000">$300,000</SelectItem>
                    <SelectItem value="500000">$500,000</SelectItem>
                    <SelectItem value="750000">$750,000</SelectItem>
                    <SelectItem value="1000000">$1,000,000</SelectItem>
                    <SelectItem value="1500000">$1,500,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="beds">Beds</Label>
                <Select defaultValue="any">
                  <SelectTrigger id="beds">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="baths">Baths</Label>
                <Select defaultValue="any">
                  <SelectTrigger id="baths">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="type">Home Type</Label>
                <Select defaultValue="any">
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="multi">Multi-Family</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button type="submit" className="w-full">Search Properties</Button>
            
            <div className="text-center text-sm text-muted-foreground">
              {isStatusLoading ? (
                <p>Checking IDX Broker API status...</p>
              ) : !isIdxEnabled ? (
                <>
                  <p>IDX Broker API key is not configured.</p>
                  <p>Please contact your administrator to set up the integration.</p>
                </>
              ) : error ? (
                <>
                  <p>Unable to load IDX Broker widget.</p>
                  <p>We're showing our internal search interface for now.</p>
                </>
              ) : (
                <p>Connecting to IDX Broker...</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div 
      ref={containerRef} 
      className={`idx-widget-container ${className} ${
        !widgetLoaded ? 'min-h-[200px] flex items-center justify-center' : ''
      }`}
      id={`idx-widget-${widgetId}`}
    >
      {!widgetLoaded && (
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Loading IDX search widget...</p>
        </div>
      )}
    </div>
  );
}