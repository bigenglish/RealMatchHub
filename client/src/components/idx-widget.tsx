import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
export default function IdxWidget({ widgetId = "40942", className = "", onSearch }: IdxWidgetProps) {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState<"fallback" | "native">("fallback");
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
  
  // For the IDX Widget tab, we'll use direct HTML injection with the script
  useEffect(() => {
    if (activeTab === "native" && containerRef.current) {
      // Clear any existing content in the container
      containerRef.current.innerHTML = "";
      
      // Create the iframe to isolate the IDX widget (helps avoid cross-origin issues)
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '600px';
      iframe.style.border = 'none';
      iframe.title = 'IDX Broker Widget';
      iframe.id = 'idx-widget-iframe';
      
      // Add iframe to the DOM
      containerRef.current.appendChild(iframe);
      
      // Access the iframe document and write the IDX widget script
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        // Write a basic HTML document with the IDX script
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>IDX Broker Widget</title>
            <style>
              body { margin: 0; padding: 0; font-family: sans-serif; }
              .loading { 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 400px; 
                text-align: center; 
              }
              .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          </head>
          <body>
            <div id="idx-widget-container">
              <div class="loading">
                <div>
                  <div class="spinner"></div>
                  <p>Loading IDX Broker Widget...</p>
                </div>
              </div>
            </div>
            
            <!-- Exact IDX Broker Widget Script -->
            <script charset="UTF-8" type="text/javascript" id="idxwidgetsrc-40942" src="//losangelesforsale.idxbroker.com/idx/mapwidgetjs.php?widgetid=40942"></script>
          </body>
          </html>
        `);
        iframeDoc.close();
      }
      
      // Clean up function
      return () => {
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
      };
    }
  }, [activeTab]);
  
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
  
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "fallback" | "native")} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Find Your Dream Home</h3>
            <TabsList>
              <TabsTrigger value="fallback">Custom Search</TabsTrigger>
              <TabsTrigger value="native">IDX Widget</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="fallback" className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="native">
            <div 
              ref={containerRef} 
              className="min-h-[600px] w-full"
            >
              {/* The IDX widget iframe will be injected here by the useEffect */}
              <div className="text-sm text-muted-foreground">
                <p>If the IDX widget does not load, please note:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Some browsers block 3rd-party content in iframes</li>
                  <li>The IDX widget requires direct website integration</li>
                  <li>You may need to view this on your live website</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="text-center text-xs text-muted-foreground mt-4">
          Powered by IDX Broker
        </div>
      </CardContent>
    </Card>
  );
}