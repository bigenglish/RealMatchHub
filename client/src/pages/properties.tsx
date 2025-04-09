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
  const [showQuestionnaire, setShowQuestionnaire] = useState(false); // Changed to false to skip questionnaire
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  // Prepare the property data
  const yourProperties = data?.yourProperties || [];
  const idxListings = data?.idxListings?.map(convertIdxToProperty) || [];
  
  // Debug logging for more detailed info
  useEffect(() => {
    if (data) {
      console.log("Getting display properties for tab:", activeTab, "filtered:", isFiltered);
      console.log("Returning unfiltered IDX properties:", idxListings.length);
    }
  }, [data, idxListings, activeTab, isFiltered]);
  
  // Handle search filters (simplified but kept for reference)
  const handleFilter = (filters: any) => {
    // Just logging filters for debugging purposes
    console.log("Filters received:", filters);
  };
  
  // Handle the completion of the questionnaire
  const handleQuestionnaireComplete = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    setShowQuestionnaire(false);
  };
  
  // Handle skipping the questionnaire
  const handleSkipQuestionnaire = () => {
    setShowQuestionnaire(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Properties</h1>
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
      
      {/* IDX Status Banner */}
      <IdxStatus className="mt-4" />
      
      {/* IDX Broker Widget - Simplified as main content */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-2xl">Search Properties with IDX Broker</CardTitle>
        </CardHeader>
        <CardContent>
          <IdxWidget 
            className="w-full" 
            onSearch={(filters) => {
              console.log("IDX search with filters:", filters);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}