import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import type { Property } from "@shared/schema";
import PropertyCard from "@/components/property-card";
import SearchFilters from "@/components/search-filters";
import IdxWidget from "@/components/idx-widget";
import EnhancedIdxWidget from "@/components/enhanced-idx-widget";
import IdxStatus from "@/components/idx-status";
import PropertyQuestionnaire, { UserPreferences } from "@/components/property-questionnaire";
import AIPropertyRecommendations from "@/components/ai-property-recommendations";
import ServiceSelection from "@/components/service-selection";
import CostSummary from "@/components/cost-summary";
import PaymentProcessor from "@/components/payment-processor";
import { ServiceOffering as BaseServiceOffering } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Building, Users, Zap, Video } from 'lucide-react';

// Interface for IDX Broker listings (matching backend response)
interface IdxListing {
  id: number | string;
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  images: string[];
  source: string;
  createdAt: string;
  status: string;
}

// Combined properties response interface
interface CombinedPropertiesResponse {
  yourProperties: Property[];
  idxListings: IdxListing[];
}

// Function to convert IDX listing to Property format with unique ID generation
function convertIdxToProperty(idx: IdxListing, index: number): Property {
  // Generate truly unique ID by combining original ID with index and timestamp
  const originalId = String(idx.id || '');
  const numericId = originalId.replace(/\D/g, '');
  const uniqueId = numericId ? 
    parseInt(`${numericId}${index}`) : 
    parseInt(`${Date.now()}${index}`);

  // Filter out obviously invalid properties
  const isValidProperty = idx.address && 
    !idx.address.includes('ERR404') && 
    idx.price > 100 && // Filter out unrealistic prices
    idx.city && 
    idx.city !== '';

  if (!isValidProperty) {
    console.warn(`[Properties] Filtering out invalid property:`, idx.address);
    return null;
  }

  // Create the property with all required fields matching backend structure
  return {
    id: uniqueId,
    title: idx.title || `${idx.address}, ${idx.city || ''}`,
    description: idx.description || 'No description available',
    price: typeof idx.price === 'number' ? idx.price : 0,
    address: idx.address || 'Address not available',
    city: idx.city || null,
    state: idx.state || null,
    zipCode: idx.zipCode || null,
    latitude: null, // Not provided in IDX listing
    longitude: null, // Not provided in IDX listing
    bedrooms: typeof idx.bedrooms === 'number' ? idx.bedrooms : 0,
    bathrooms: typeof idx.bathrooms === 'number' ? idx.bathrooms : 0,
    sqft: typeof idx.squareFeet === 'number' ? idx.squareFeet : 0, // Updated field name
    propertyType: idx.propertyType || 'Residential',
    images: Array.isArray(idx.images) ? idx.images : [],
    listedDate: idx.createdAt ? idx.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    listingId: originalId || null
  };
}

// Define the interface for service offerings in this component
interface ServiceOffering extends BaseServiceOffering {
  price?: string | number;
}

export default function PropertiesPage() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const mode = searchParams.get('mode');

  // Redirect to seller flow if in sell mode
  useEffect(() => {
    if (mode === 'sell') {
      setLocation('/seller-flow/intent');
      return;
    }
  }, [mode, setLocation]);

  // Build query string from URL parameters for API call
  const buildApiUrl = () => {
    const currentUrl = window.location.href;
    const urlParams = new URLSearchParams(currentUrl.split('?')[1] || '');

    const params = new URLSearchParams();

    // Pass all URL parameters to the API
    urlParams.forEach((value, key) => {
      if (value && value !== 'undefined') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    return queryString ? `/api/properties?${queryString}` : "/api/properties";
  };

  const { data, isLoading, isError } = useQuery<CombinedPropertiesResponse>({
    queryKey: [buildApiUrl()],
  });

  const [activeTab, setActiveTab] = useState<"all" | "your" | "idx">("idx");
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [filteredIdxListings, setFilteredIdxListings] = useState<Property[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false); // No longer show questionnaire by default
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  // Service selection state
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [showCostSummary, setShowCostSummary] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedServices, setSelectedServices] = useState<ServiceOffering[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { toast } = useToast();

  // Extract URL search parameters for filtering (moved before usage)
  const currentUrl = window.location.href;
  const urlParams = new URLSearchParams(currentUrl.split('?')[1] || '');
  const searchFilters = {
    maxPrice: urlParams.get('maxPrice') ? Number(urlParams.get('maxPrice')) : undefined,
    minPrice: urlParams.get('minPrice') ? Number(urlParams.get('minPrice')) : undefined,
    bedrooms: urlParams.get('bedrooms') ? Number(urlParams.get('bedrooms')) : undefined,
    bathrooms: urlParams.get('bathrooms') ? Number(urlParams.get('bathrooms')) : undefined,
    city: urlParams.get('city') || undefined,
    propertyType: urlParams.get('propertyType') || undefined,
  };

  // Prepare the property data with proper deduplication
  const yourProperties = data?.yourProperties || [];
  const rawIdxListings = data?.idxListings || [];

  // Convert and filter IDX listings, removing duplicates and invalid properties
  const convertedListings = rawIdxListings
    .map((listing, index) => convertIdxToProperty(listing, index))
    .filter(Boolean) as Property[];

  // Apply search filters with more lenient filtering since API should handle most filtering
  const seenProperties = new Set<string>();
  const idxListings = convertedListings.filter(property => {
    // First filter out obviously invalid properties
    if (!property || !property.address || property.address.includes('ERR404') || property.price < 1000) {
      console.log(`[Properties] Filtering out invalid property: ${property?.address}`);
      return false;
    }

    // Since we're passing filters to the API, be more lenient with client-side filtering
    // Only apply filters if the API didn't handle them properly

    // Remove duplicates based on a more robust key
    const key = `${property.address?.trim()}-${property.price}-${property.bedrooms}-${property.bathrooms}`;
    if (seenProperties.has(key)) {
      console.log(`[Properties] Duplicate property filtered: ${property.address}`);
      return false;
    }
    seenProperties.add(key);
    return true;
  });

  // Debug logging for more detailed info
  useEffect(() => {
    if (data) {
      console.log("Current URL:", window.location.href);
      console.log("URL search params:", new URLSearchParams(window.location.search).toString());
      console.log("Search filters applied:", searchFilters);
      console.log("Getting display properties for tab:", activeTab, "filtered:", Object.values(searchFilters).some(v => v !== undefined && v !== ''));
      console.log("Total IDX properties after filtering:", idxListings.length);
      console.log("Raw IDX properties before filtering:", convertedListings.length);

      // Log first few properties to see what we're working with
      if (convertedListings.length > 0) {
        console.log("Sample converted properties:", convertedListings.slice(0, 3).map(p => ({
          address: p.address,
          city: p.city,
          price: p.price,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          propertyType: p.propertyType
        })));
      }

      // If we have filters but no results, log why
      if (Object.values(searchFilters).some(v => v !== undefined && v !== '') && idxListings.length === 0 && convertedListings.length > 0) {
        console.log("🔍 No properties match filters. First property details:");
        const firstProp = convertedListings[0];
        console.log("First property:", {
          address: firstProp.address,
          city: firstProp.city,
          price: firstProp.price,
          bedrooms: firstProp.bedrooms,
          bathrooms: firstProp.bathrooms,
          propertyType: firstProp.propertyType
        });
        console.log("Active filters:", {
          city: searchFilters.city,
          minPrice: searchFilters.minPrice,
          maxPrice: searchFilters.maxPrice,
          bedrooms: searchFilters.bedrooms,
          bathrooms: searchFilters.bathrooms,
          propertyType: searchFilters.propertyType
        });
      }
    }
  }, [data, idxListings, activeTab, searchFilters, convertedListings]);

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

  // Handle opening service selection dialog for a specific property
  const handleOpenServiceSelection = (property: Property) => {
    setSelectedProperty(property);
    setShowServiceSelection(true);
  };

  // Handle service selection completion
  const handleServiceSelectionComplete = (services: ServiceOffering[], totalAmount: number) => {
    setSelectedServices(services);
    setTotalCost(totalAmount);
    setShowServiceSelection(false);
    setShowCostSummary(true);
    setShowQuestionnaire(true); // Show questionnaire after service selection
  };

  // Handle service selection cancellation
  const handleServiceSelectionCancel = () => {
    setShowServiceSelection(false);
  };

  // Handle going back from cost summary to service selection
  const handleCostSummaryBack = () => {
    setShowCostSummary(false);
    setShowServiceSelection(true);
  };

  // Handle payment initiation from cost summary
  const handlePayNow = () => {
    setShowCostSummary(false);
    setShowPayment(true);
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    setShowPayment(false);
    toast({
      title: "Payment Successful",
      description: `Your payment for services related to ${selectedProperty?.address} has been processed successfully.`,
      variant: "default",
    });
  };

  // Handle payment cancellation
  const handlePaymentCancel = () => {
    setShowPayment(false);
    setShowCostSummary(true);
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

  // Show questionnaire for both buyers and sellers
  if (showQuestionnaire) {
    return (
      <div className="container mx-auto px-4">
        <PropertyQuestionnaire
          onComplete={handleQuestionnaireComplete}
          onSkip={handleSkipQuestionnaire}
        />
      </div>
    );
  }

  // Filter out properties with missing critical data
  const isValidProperty = (property: any) => {
    if (!property) return false;

    // More lenient validation - just check if we have basic structure
    const hasAddress = property.address && property.address.length > 0;
    const hasPrice = property.price && property.price > 0;
    const hasId = property.id || property.listingId;

    const isValid = hasAddress && hasPrice && hasId;

    if (!isValid) {
      console.log('[Properties] Filtering out invalid property:', {
        address: property.address,
        price: property.price,
        id: property.id || property.listingId
      });
    }

    return isValid;
  };

  return (
    <div className="space-y-8">
      {/* Required IDX Broker markers */}
      <div id="idxStart" style={{ display: 'none' }}></div>
      <div id="idxStop" style={{ display: 'none' }}></div>
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

      {/* Fast Online Application Promo Banner */}
      <Card className="mt-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="flex flex-col md:flex-row items-center justify-between p-6">
          <div className="space-y-2 mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-green-800">Get Pre-Approved Fast</h3>
            <p className="text-green-700">
              Complete our AI-powered mortgage pre-approval application in minutes.
              Upload your documents securely and get instant feedback.
            </p>
          </div>
          <Link href="/fast-online-application">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Start Fast Application
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Property Statistics */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{idxListings.length}</div>
              <div className="text-sm text-gray-600">Available Properties</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                ${idxListings.length > 0 ? Math.round(idxListings.reduce((sum, p) => sum + p.price, 0) / idxListings.length / 1000) : 0}K
              </div>
              <div className="text-sm text-gray-600">Average Price</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">CA</div>
              <div className="text-sm text-gray-600">Market Coverage</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Available Properties Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Available Properties ({idxListings.length})</h2>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Live MLS Data
          </Badge>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {idxListings.map((property, index) => (
            <Card key={`property-${property.id}-${index}`} className="overflow-hidden">
              {property.images && property.images.length > 0 ? (
                <img 
                  src={property.images[0]} 
                  alt={property.title} 
                  className="w-full h-48 object-cover" 
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <Building className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-1">{property.title}</CardTitle>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{property.city}, {property.state}</span>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                  <span className="text-xl font-bold mb-2 sm:mb-0">${property.price.toLocaleString()}</span>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <span className="flex items-center text-sm"><span className="mr-1">🛏️</span> {property.bedrooms}</span>
                    <span className="flex items-center text-sm"><span className="mr-1">🚿</span> {property.bathrooms}</span>
                    <span className="flex items-center text-sm"><span className="mr-1">📏</span> {property.sqft} ft²</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4">
                  <Link href={`/property/${property.id}`} className="w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">View Details</Button>
                  </Link>
                  <Link href={`/property/${property.id}`} className="w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1 w-full sm:w-auto bg-gradient-to-r from-violet-500 to-purple-700 hover:from-violet-600 hover:to-purple-800 text-white"
                    >
                      <Video className="h-4 w-4" />
                      Virtual Tour
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => handleOpenServiceSelection(property)}
                    variant="default" 
                    size="sm"
                    className="flex items-center gap-1 w-full sm:w-auto"
                  >
                    <CreditCard className="h-4 w-4" />
                    Get Services
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Service Selection Dialog */}
      <Dialog open={showServiceSelection} onOpenChange={setShowServiceSelection}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl sm:text-2xl">
            Select Services for {selectedProperty?.address ? (
              <span className="block text-sm sm:text-base mt-1 text-muted-foreground truncate">
                {selectedProperty.address}
              </span>
            ) : null}
          </DialogTitle>
          <DialogDescription>
            Choose the real estate services you need for this property
          </DialogDescription>
          <ServiceSelection 
            onComplete={handleServiceSelectionComplete}
            onCancel={handleServiceSelectionCancel}
            propertyAddress={selectedProperty?.address}
          />
        </DialogContent>
      </Dialog>

      {/* Cost Summary Dialog */}
      <Dialog open={showCostSummary} onOpenChange={setShowCostSummary}>
        <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl sm:text-2xl">Service Cost Summary</DialogTitle>
          <DialogDescription>
            Review your selected services for {selectedProperty?.address ? (
              <span className="font-medium">{selectedProperty.address}</span>
            ) : null}
          </DialogDescription>
          <CostSummary 
            selectedServices={selectedServices}
            totalCost={totalCost}
            onBack={handleCostSummaryBack}
            onPayNow={handlePayNow}
            propertyAddress={selectedProperty?.address}
          />
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl sm:text-2xl">Complete Your Payment</DialogTitle>
          <DialogDescription>
            Please enter your payment details to complete the transaction.
          </DialogDescription>

          <PaymentProcessor
            services={selectedServices}
            totalAmount={totalCost}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}