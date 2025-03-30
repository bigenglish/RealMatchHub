import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface IdxWidgetProps {
  widgetId?: string;
  className?: string;
  onSearch?: (filters: SearchFilters) => void;
}

interface SearchFilters {
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  beds?: string;
  baths?: string;
  propertyType?: string;
}

// Search widget component for property search functionality
export default function IdxWidget({ widgetId = "40937", className = "", onSearch }: IdxWidgetProps) {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("10000000");
  const [beds, setBeds] = useState("any");
  const [baths, setBaths] = useState("any");
  const [propertyType, setPropertyType] = useState("any");
  
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
  
  // Load the IDX widget script
  useEffect(() => {
    // Skip if the container is not ready, API status is loading, or API is not enabled
    if (!containerRef.current || isStatusLoading || !isIdxEnabled) {
      return;
    }
    
    try {
      // Create a script element for the IDX widget
      const script = document.createElement('script');
      script.charset = 'UTF-8';
      script.type = 'text/javascript';
      script.id = `idxwidgetsrc-${widgetId}`;
      script.src = `//losangelesforsale.idxbroker.com/idx/mapwidgetjs.php?widgetid=${widgetId}`;
      script.async = true;
      
      // Add the script to the container
      containerRef.current.appendChild(script);
      
      // Function to check if the widget loaded properly
      const checkWidgetLoaded = () => {
        // If after 5 seconds the widget content isn't loaded, show the fallback
        if (containerRef.current && 
            (!containerRef.current.querySelector('.idx-mapwidget') ||
             !containerRef.current.querySelector('.idx-property-search'))) {
          setUseFallback(true);
        } else {
          setWidgetLoaded(true);
        }
      };
      
      // Set a timeout to check if the widget loaded
      const timeoutId = setTimeout(checkWidgetLoaded, 5000);
      
      // Handle errors
      script.onerror = () => {
        console.error("Failed to load IDX widget script");
        setError(true);
        setUseFallback(true);
        clearTimeout(timeoutId);
      };
      
      // Cleanup function
      return () => {
        clearTimeout(timeoutId);
        if (containerRef.current && script.parentNode === containerRef.current) {
          containerRef.current.removeChild(script);
        }
      };
    } catch (err) {
      console.error("Error setting up IDX widget:", err);
      setError(true);
      setUseFallback(true);
    }
  }, [widgetId, isStatusLoading, isIdxEnabled]);
  
  // Handle the form submission (for fallback UI)
  const handleSearch = () => {
    // Build search criteria for display in toast
    const criteria = [];
    
    if (location) criteria.push(`Location: ${location}`);
    if (minPrice !== "0") criteria.push(`Min Price: $${parseInt(minPrice).toLocaleString()}`);
    if (maxPrice !== "10000000") criteria.push(`Max Price: $${parseInt(maxPrice).toLocaleString()}`);
    if (beds !== "any") criteria.push(`Beds: ${beds}+`);
    if (baths !== "any") criteria.push(`Baths: ${baths}+`);
    if (propertyType !== "any") criteria.push(`Type: ${propertyType}`);
    
    // Show search criteria in a toast notification
    toast({
      title: "Property Search",
      description: criteria.length > 0 
        ? `Searching for properties with: ${criteria.join(", ")}`
        : "Searching for all properties",
      duration: 4000,
    });
    
    // Create filters object
    const filters: SearchFilters = {
      location: location || undefined,
      minPrice: minPrice !== "0" ? minPrice : undefined,
      maxPrice: maxPrice !== "10000000" ? maxPrice : undefined,
      beds: beds !== "any" ? beds : undefined,
      baths: baths !== "any" ? baths : undefined,
      propertyType: propertyType !== "any" ? propertyType : undefined
    };
    
    // Pass filters to parent component if onSearch callback is provided
    if (onSearch) {
      onSearch(filters);
    }
    
    // Simulate triggering a search with filters by automatically switching to the IDX tab
    const idxTabTrigger = document.querySelector("[value='idx']") as HTMLElement;
    if (idxTabTrigger) {
      idxTabTrigger.click();
    }
  };
  
  // Show a fallback UI if the widget fails to load, if IDX API is not enabled, or if specified
  if (error || isStatusLoading || !isIdxEnabled || useFallback) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Find Your Dream Home</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                placeholder="City, ZIP, Address, or MLS#" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price-min">Min Price</Label>
                <Select value={minPrice} onValueChange={setMinPrice}>
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
                <Select value={maxPrice} onValueChange={setMaxPrice}>
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
                <Select value={beds} onValueChange={setBeds}>
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
                <Select value={baths} onValueChange={setBaths}>
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
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="house">Single Family Home</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="multi">Multi-Family</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              type="button" 
              className="w-full" 
              onClick={handleSearch}
            >
              Search Properties
            </Button>
            
            <div className="text-center text-xs text-muted-foreground">
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
                  <p>Using our internal search interface for now.</p>
                </>
              ) : useFallback ? (
                <>
                  <p>Using simplified search interface.</p>
                  <p>Powered by IDX Broker</p>
                </>
              ) : (
                <p>Powered by IDX Broker</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Show the IDX widget container for the script to populate
  return (
    <div 
      ref={containerRef} 
      className={`idx-widget-container ${className} ${
        !widgetLoaded ? 'min-h-[300px] flex items-center justify-center' : ''
      }`}
      id={`idx-widget-${widgetId}`}
    >
      {!widgetLoaded && (
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading IDX Widget...</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Loading IDX search widget...</p>
        </div>
      )}
    </div>
  );
}