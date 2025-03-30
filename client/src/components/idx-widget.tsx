import { useState } from 'react';
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
export default function IdxWidget({ className = "", onSearch }: IdxWidgetProps) {
  const { toast } = useToast();
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
  
  // Handle the form submission
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
    
    // Apply search filters
    const searchParams = new URLSearchParams();
    if (location) searchParams.set("location", location);
    if (minPrice !== "0") searchParams.set("minPrice", minPrice);
    if (maxPrice !== "10000000") searchParams.set("maxPrice", maxPrice);
    if (beds !== "any") searchParams.set("beds", beds);
    if (baths !== "any") searchParams.set("baths", baths);
    if (propertyType !== "any") searchParams.set("type", propertyType);
    
    // Simulate triggering a search with filters by automatically switching to the IDX tab
    const idxTabTrigger = document.querySelector("[value='idx']") as HTMLElement;
    if (idxTabTrigger) {
      idxTabTrigger.click();
    }
  };
  
  // Render the property search form
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
            Powered by IDX Broker
          </div>
        </div>
      </CardContent>
    </Card>
  );
}