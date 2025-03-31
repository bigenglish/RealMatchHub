import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { Property } from "@shared/schema";
import PropertyCard from "@/components/property-card";
import SearchFilters from "@/components/search-filters";
import IdxWidget from "@/components/idx-widget";
import IdxStatus from "@/components/idx-status";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Interface for IDX Broker listings
interface IdxListing {
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
  images: string[];
  description: string;
  listedDate: string;
}

// Combined properties response interface
interface CombinedPropertiesResponse {
  yourProperties: Property[];
  idxListings: IdxListing[];
}

// Function to convert IDX listing to Property format for display
function convertIdxToProperty(idx: IdxListing): Property {
  return {
    id: parseInt(idx.listingId.replace('IDX', '')) + 1000, // Create unique ID
    title: `${idx.address}, ${idx.city}`,
    description: idx.description,
    price: idx.price,
    address: `${idx.address}, ${idx.city}, ${idx.state} ${idx.zipCode}`,
    bedrooms: idx.bedrooms,
    bathrooms: idx.bathrooms,
    sqft: idx.sqft,
    propertyType: idx.propertyType,
    images: idx.images || [], // Ensure images is always an array
    listedDate: idx.listedDate
  };
}

export default function PropertiesPage() {
  const { data, isLoading, isError } = useQuery<CombinedPropertiesResponse>({
    queryKey: ["/api/properties"],
  });
  
  const [activeTab, setActiveTab] = useState<"all" | "your" | "idx">("all");
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [filteredIdxListings, setFilteredIdxListings] = useState<Property[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);

  // Debug logging - remove after fixing
  useEffect(() => {
    if (data) {
      console.log("Properties data:", data);
      console.log("Your properties count:", (data as CombinedPropertiesResponse).yourProperties.length);
      console.log("IDX listings count:", (data as CombinedPropertiesResponse).idxListings.length);
    }
  }, [data]);

  // Prepare the property data
  const yourProperties = data?.yourProperties || [];
  const idxListings = data?.idxListings?.map(convertIdxToProperty) || [];
  
  // Debug logging for more detailed info
  useEffect(() => {
    if (data) {
      console.log("===== DATA RECEIVED FROM API =====");
      console.log("Raw IDX listings data:", data.idxListings);
      console.log("Processed IDX listings:", idxListings);
      console.log("Active tab:", activeTab);
      console.log("Is filtered:", isFiltered);
    }
  }, [data, idxListings, activeTab, isFiltered]);
  
  // Get all properties for "All" tab
  const allProperties = [...yourProperties, ...idxListings];

  // Handle search filters
  const handleFilter = (filters: any) => {
    if (!data) return;
    
    setIsFiltered(true);
    
    // Filter your properties
    let filtered = [...data.yourProperties];
    if (filters.minPrice) {
      filtered = filtered.filter(property => property.price >= filters.minPrice);
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(property => property.price <= filters.maxPrice);
    }
    if (filters.bedrooms) {
      filtered = filtered.filter(property => property.bedrooms >= filters.bedrooms);
    }
    if (filters.propertyType && filters.propertyType !== "All") {
      filtered = filtered.filter(property => property.propertyType === filters.propertyType);
    }
    setFilteredProperties(filtered);

    // Filter IDX listings
    const convertedIdxListings = data.idxListings.map(convertIdxToProperty);
    let filteredIdx = [...convertedIdxListings];
    if (filters.minPrice) {
      filteredIdx = filteredIdx.filter(property => property.price >= filters.minPrice);
    }
    if (filters.maxPrice) {
      filteredIdx = filteredIdx.filter(property => property.price <= filters.maxPrice);
    }
    if (filters.bedrooms) {
      filteredIdx = filteredIdx.filter(property => property.bedrooms >= filters.bedrooms);
    }
    if (filters.propertyType && filters.propertyType !== "All") {
      filteredIdx = filteredIdx.filter(property => property.propertyType === filters.propertyType);
    }
    setFilteredIdxListings(filteredIdx);
  };

  // Get the properties to display based on active tab and filters
  const getDisplayProperties = () => {
    // Check which tab is active and if filtering is applied
    console.log("Getting display properties for tab:", activeTab, "filtered:", isFiltered);
    
    // Return the appropriate properties based on the active tab and filter state
    if (!isFiltered) {
      switch (activeTab) {
        case "your":
          console.log("Returning unfiltered YOUR properties:", yourProperties.length);
          return yourProperties;
        case "idx":
          console.log("Returning unfiltered IDX properties:", idxListings.length);
          return idxListings;
        case "all":
        default:
          console.log("Returning ALL unfiltered properties:", allProperties.length);
          return allProperties;
      }
    } else {
      switch (activeTab) {
        case "your":
          console.log("Returning filtered YOUR properties:", filteredProperties.length);
          return filteredProperties;
        case "idx":
          console.log("Returning filtered IDX properties:", filteredIdxListings.length);
          return filteredIdxListings;
        case "all":
        default:
          const combined = [...filteredProperties, ...filteredIdxListings];
          console.log("Returning filtered ALL properties:", combined.length);
          return combined;
      }
    }
  };

  const displayProperties = getDisplayProperties();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Properties</h1>
        <SearchFilters onFilter={() => {}} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Find Your Dream Property</h1>
      </div>
      
      <SearchFilters onFilter={handleFilter} />
      
      {/* IDX Status Banner */}
      <IdxStatus className="mt-4" />
      
      {/* IDX Broker Widget */}
      <Card className="mt-8 mb-8">
        <CardHeader>
          <CardTitle>Find More Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <IdxWidget 
            className="w-full" 
            onSearch={(filters) => {
              // Convert IDX Widget filters to the format expected by handleFilter
              const convertedFilters: any = {};
              
              if (filters.minPrice) {
                convertedFilters.minPrice = parseInt(filters.minPrice);
              }
              
              if (filters.maxPrice) {
                convertedFilters.maxPrice = parseInt(filters.maxPrice);
              }
              
              if (filters.beds) {
                convertedFilters.bedrooms = parseInt(filters.beds);
              }
              
              if (filters.propertyType && filters.propertyType !== 'any') {
                // Map the property types to match our schema
                const propertyTypeMap: Record<string, string> = {
                  'house': 'Single Family Home',
                  'condo': 'Condo',
                  'townhouse': 'Townhouse',
                  'multi': 'Multi-Family',
                  'land': 'Land',
                  'apartment': 'Apartment'
                };
                
                convertedFilters.propertyType = propertyTypeMap[filters.propertyType] || 
                  filters.propertyType.charAt(0).toUpperCase() + filters.propertyType.slice(1);
                
                console.log('Property type filter:', filters.propertyType, '→', convertedFilters.propertyType);
              }
              
              // Apply filters
              handleFilter(convertedFilters);
              
              // Switch to IDX tab
              setActiveTab('idx');
            }}
          />
        </CardContent>
      </Card>
      
      <Tabs 
        value={activeTab}
        defaultValue="all" 
        className="mt-8"
        onValueChange={(value) => setActiveTab(value as "all" | "your" | "idx")}
      >
        <TabsList>
          <TabsTrigger value="all">
            All Properties 
            {!isLoading && (
              <Badge variant="secondary" className="ml-2">
                {isFiltered 
                  ? filteredProperties.length + filteredIdxListings.length 
                  : yourProperties.length + idxListings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="your">
            Our Listings
            {!isLoading && (
              <Badge variant="secondary" className="ml-2">
                {isFiltered ? filteredProperties.length : yourProperties.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="idx">
            Partner Listings
            {!isLoading && (
              <Badge variant="secondary" className="ml-2">
                {isFiltered ? filteredIdxListings.length : idxListings.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="pt-6">
          {displayProperties.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold">No properties found</h2>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search filters
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="your" className="pt-6">
          {(isFiltered ? filteredProperties : yourProperties).length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(isFiltered ? filteredProperties : yourProperties).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold">No properties found</h2>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search filters
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="idx" className="pt-6">
          {/* Debugging - we log the properties here */}
          <div className="sr-only" aria-hidden="true">
            {(() => {
              console.log("IDX Tab Content - Rendering properties:", isFiltered ? filteredIdxListings : idxListings);
              return null;
            })()}
          </div>
          {(isFiltered ? filteredIdxListings : idxListings).length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(isFiltered ? filteredIdxListings : idxListings).map((property) => {
                console.log("Rendering IDX property:", property);
                return <PropertyCard key={property.id} property={property} />;
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold">No partner listings found</h2>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search filters or check our direct listings
              </p>
              
              {/* Add IDX Widget specifically in the IDX tab for more visibility */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Try Searching for Properties</h3>
                <IdxWidget 
                  className="w-full" 
                  onSearch={(filters) => {
                    // Convert IDX Widget filters to the format expected by handleFilter
                    const convertedFilters: any = {};
                    
                    if (filters.minPrice) {
                      convertedFilters.minPrice = parseInt(filters.minPrice);
                    }
                    
                    if (filters.maxPrice) {
                      convertedFilters.maxPrice = parseInt(filters.maxPrice);
                    }
                    
                    if (filters.beds) {
                      convertedFilters.bedrooms = parseInt(filters.beds);
                    }
                    
                    if (filters.propertyType && filters.propertyType !== 'any') {
                      // Map the property types to match our schema
                      const propertyTypeMap: Record<string, string> = {
                        'house': 'Single Family Home',
                        'condo': 'Condo',
                        'townhouse': 'Townhouse',
                        'multi': 'Multi-Family',
                        'land': 'Land',
                        'apartment': 'Apartment'
                      };
                      
                      convertedFilters.propertyType = propertyTypeMap[filters.propertyType] || 
                        filters.propertyType.charAt(0).toUpperCase() + filters.propertyType.slice(1);
                      
                      console.log('Property type filter (secondary):', filters.propertyType, '→', convertedFilters.propertyType);
                    }
                    
                    // Apply filters
                    handleFilter(convertedFilters);
                  }}
                />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
