import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Spinner } from '@/components/ui/spinner';
import { useToast } from "@/hooks/use-toast";

interface Property {
  listingId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: string;
  description: string;
  images: string[];
}

interface IdxDataResponse {
  success: boolean;
  count: number;
  totalCount: number;
  hasMore: boolean;
  listings: Property[];
}

// Format price to USD
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(price);
};

const IDXDataViewer = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    city: '',
    minPrice: 0,
    maxPrice: 5000000,
    bedrooms: 0,
    bathrooms: 0,
    limit: 20
  });

  // Function to handle filter changes
  const handleFilterChange = (field: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Function to fetch IDX data
  const fetchIdxData = async (): Promise<IdxDataResponse> => {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    if (filters.city) queryParams.append('city', filters.city);
    if (filters.minPrice > 0) queryParams.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice > 0) queryParams.append('maxPrice', filters.maxPrice.toString());
    if (filters.bedrooms > 0) queryParams.append('bedrooms', filters.bedrooms.toString());
    if (filters.bathrooms > 0) queryParams.append('bathrooms', filters.bathrooms.toString());
    if (filters.limit > 0) queryParams.append('limit', filters.limit.toString());
    
    const response = await fetch(`/idx-data?${queryParams.toString()}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch IDX data: ${errorText}`);
    }
    
    return await response.json();
  };
  
  // Use TanStack Query to fetch and cache the data
  const { data, error, isLoading, refetch } = useQuery<IdxDataResponse>({
    queryKey: ['idx-data', filters],
    queryFn: fetchIdxData
  });
  
  // Handle search button click
  const handleSearch = () => {
    refetch();
    toast({
      title: "Searching for properties",
      description: `Looking for properties in ${filters.city || 'all areas'}`,
    });
  };
  
  // Show an error toast if there was an error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading properties",
        description: String(error),
        variant: "destructive"
      });
    }
  }, [error, toast]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">IDX Property Explorer</h1>
      
      {/* Filter section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Property Search</CardTitle>
          <CardDescription>Find your dream property with our advanced search tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                placeholder="Enter city name" 
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Price Range: {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}</Label>
              <div className="pt-6">
                <Slider 
                  defaultValue={[filters.minPrice, filters.maxPrice]} 
                  max={10000000}
                  step={50000}
                  onValueChange={(values) => {
                    handleFilterChange('minPrice', values[0]);
                    handleFilterChange('maxPrice', values[1]);
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Select 
                value={filters.bedrooms.toString()} 
                onValueChange={(value) => handleFilterChange('bedrooms', parseInt(value))}
              >
                <SelectTrigger id="bedrooms">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Select 
                value={filters.bathrooms.toString()} 
                onValueChange={(value) => handleFilterChange('bathrooms', parseInt(value))}
              >
                <SelectTrigger id="bathrooms">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="limit">Results Per Page</Label>
              <Select 
                value={filters.limit.toString()} 
                onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
              >
                <SelectTrigger id="limit">
                  <SelectValue placeholder="20" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSearch} className="w-full md:w-auto">
            Search Properties
          </Button>
        </CardFooter>
      </Card>
      
      {/* Results section */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <Spinner size="lg" />
            <span className="ml-2">Loading properties...</span>
          </div>
        ) : data && data.listings && data.listings.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {data.count} {data.count === 1 ? 'Property' : 'Properties'} Found
                {data.totalCount > data.count && ` (${data.totalCount} total)`}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.listings.map((property) => (
                <Card key={property.listingId} className="overflow-hidden h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img 
                        src={property.images[0]} 
                        alt={property.address}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No image available</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <span className="text-white font-bold text-xl">{formatPrice(property.price)}</span>
                    </div>
                  </div>
                  
                  <CardContent className="flex-grow py-4">
                    <h3 className="text-lg font-bold mb-1 truncate">{property.address}</h3>
                    <p className="text-sm text-gray-500 mb-2">{property.city}, {property.state} {property.zipCode}</p>
                    
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          {property.bedrooms} beds
                        </span>
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {property.bathrooms} baths
                        </span>
                      </div>
                      <span className="text-sm">
                        {property.sqft.toLocaleString()} sqft
                      </span>
                    </div>
                    
                    <p className="text-sm line-clamp-3">{property.description}</p>
                  </CardContent>
                  
                  <CardFooter className="pt-0">
                    <Button variant="outline" className="w-full">View Details</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {data.hasMore && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" onClick={() => handleFilterChange('limit', filters.limit + 20)}>
                  Load More
                </Button>
              </div>
            )}
          </>
        ) : data && data.listings ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No properties found</h3>
            <p className="text-gray-500">Try adjusting your search filters</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default IDXDataViewer;