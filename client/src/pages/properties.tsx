import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import type { Property } from "@shared/schema";
import PropertyCard from "@/components/property-card";
import SearchFilters from "@/components/search-filters";
import IdxWidget from "@/components/idx-widget";
import IdxStatus from "@/components/idx-status";
import PropertyQuestionnaire, { UserPreferences } from "@/components/property-questionnaire";
import AIPropertyRecommendations from "@/components/ai-property-recommendations";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  // Create a safe ID from listingId - handle potential undefined or non-string values
  let id = 9000;
  try {
    if (idx.listingId) {
      // Remove any non-numeric characters and add 1000 to avoid ID conflicts
      const numericPart = idx.listingId.replace(/\D/g, '');
      id = numericPart ? parseInt(numericPart) + 1000 : 9000 + Math.floor(Math.random() * 1000);
    } else {
      id = 9000 + Math.floor(Math.random() * 1000); // Fallback with random ID
    }
  } catch (e) {
    console.error("Error generating ID from listingId:", e);
    id = 9000 + Math.floor(Math.random() * 1000); // Another fallback
  }

  // Create the property with all required fields
  return {
    id,
    title: idx.address ? `${idx.address}, ${idx.city || ''}` : 'Property Listing',
    description: idx.description || 'No description available',
    price: typeof idx.price === 'number' ? idx.price : 0,
    address: idx.address 
      ? `${idx.address}, ${idx.city || ''}, ${idx.state || ''} ${idx.zipCode || ''}`
      : 'Address not available',
    city: idx.city || null,
    state: idx.state || null,
    zipCode: idx.zipCode || null,
    latitude: null, // Not provided in IDX listing
    longitude: null, // Not provided in IDX listing
    bedrooms: typeof idx.bedrooms === 'number' ? idx.bedrooms : 0,
    bathrooms: typeof idx.bathrooms === 'number' ? idx.bathrooms : 0,
    sqft: typeof idx.sqft === 'number' ? idx.sqft : 0,
    propertyType: idx.propertyType || 'Residential',
    images: Array.isArray(idx.images) ? idx.images : [], // Ensure images is always an array
    listedDate: idx.listedDate || new Date().toISOString().split('T')[0],
    listingId: idx.listingId || null
  };
}

export default function PropertiesPage() {
  const { data, isLoading, isError } = useQuery<CombinedPropertiesResponse>({
    queryKey: ["/api/properties"],
  });
  
  const [activeTab, setActiveTab] = useState<"all" | "your" | "idx">("idx");
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [filteredIdxListings, setFilteredIdxListings] = useState<Property[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(true);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

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
  
  // Handle the completion of the questionnaire
  const handleQuestionnaireComplete = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    setShowQuestionnaire(false);
    
    // Apply initial filters based on the questionnaire responses
    const initialFilters: any = {};
    
    if (preferences.budget) {
      initialFilters.minPrice = preferences.budget.min;
      initialFilters.maxPrice = preferences.budget.max;
    }
    
    if (preferences.bedrooms && preferences.bedrooms > 0) {
      initialFilters.minBeds = preferences.bedrooms;
    }
    
    if (preferences.bathrooms && preferences.bathrooms > 0) {
      initialFilters.minBaths = preferences.bathrooms;
    }
    
    if (preferences.propertyType && preferences.propertyType !== "") {
      initialFilters.propertyType = preferences.propertyType;
    }
    
    if (preferences.location && preferences.location !== "") {
      initialFilters.location = preferences.location;
    }
    
    // Apply filters
    handleFilter(initialFilters);
    
    // Set appropriate tab based on intent
    if (preferences.intent === "selling") {
      setActiveTab("your");
    } else {
      setActiveTab("idx");
    }
  };
  
  // Handle skipping the questionnaire
  const handleSkipQuestionnaire = () => {
    setShowQuestionnaire(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Properties</h1>
        <SearchFilters onFilterChange={() => {}} />
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
  
  // Show the questionnaire if it hasn't been completed or skipped
  if (showQuestionnaire) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold">Find Your Dream Property</h1>
        </div>
        
        <PropertyQuestionnaire 
          onComplete={handleQuestionnaireComplete} 
          onSkip={handleSkipQuestionnaire}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Find Your Dream Property</h1>
        <div className="flex items-center gap-4">
          <Link href="/ai-search">
            <Button className="bg-gradient-to-r from-violet-500 to-purple-700 hover:from-violet-600 hover:to-purple-800 text-white">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
                AI-Powered Search
              </span>
            </Button>
          </Link>
        </div>
      </div>
      
      <SearchFilters onFilterChange={handleFilter} />
      
      {/* AI Property Recommendations */}
      {userPreferences && (
        <div className="mb-12">
          <AIPropertyRecommendations 
            userPreferences={userPreferences}
            onViewDetails={(property) => {
              // Navigate to the property details page
              window.location.href = `/property/${property.id}`;
            }}
          />
        </div>
      )}
      
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
      
      {/* Debug info to show property counts */}
      <div className="flex flex-col md:flex-row gap-4 text-sm text-muted-foreground mb-4">
        <div>Your properties: {yourProperties.length}</div>
        <div>IDX properties: {idxListings.length}</div>
        <div>Filtered your properties: {filteredProperties.length}</div>
        <div>Filtered IDX properties: {filteredIdxListings.length}</div>
        <div>Active tab: {activeTab}</div>
        <div>Is filtered: {isFiltered ? 'Yes' : 'No'}</div>
      </div>
      
      <Tabs 
        value={activeTab}
        defaultValue="all" 
        className="mt-8"
        onValueChange={(value) => {
          console.log("Tab changed from", activeTab, "to", value);
          setActiveTab(value as "all" | "your" | "idx");
        }}
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
          {/* Debug info about what we're rendering */}
          <div className="border-2 p-2 mb-4 text-xs overflow-auto max-h-32 bg-muted/20">
            <p>IDX Property Count: {idxListings.length}</p>
            <p>Filtered IDX Property Count: {filteredIdxListings.length}</p>
            <p>First IDX Property: {idxListings.length > 0 ? JSON.stringify(idxListings[0]) : "None"}</p>
            <p>Are we showing IDX properties? {(isFiltered ? filteredIdxListings : idxListings).length > 0 ? "Yes" : "No"}</p>
            <p>Is filtered? {isFiltered ? "Yes" : "No"}</p>
          </div>
          
          {/* Force render the properties directly */}
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">Direct IDX Properties (Debug)</h3>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 border-2 border-dashed p-2">
              {idxListings.slice(0, 3).map((property) => (
                <div key={property.id} className="text-xs p-2 border bg-muted/10">
                  ID: {property.id}, Title: {property.title}
                </div>
              ))}
            </div>
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
