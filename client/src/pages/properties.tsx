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
  
  const { data, isLoading, isError } = useQuery<CombinedPropertiesResponse>({
    queryKey: ["/api/properties"],
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

      {/* Featured Properties Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-6">Featured Properties</h2>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {idxListings.slice(0, 6).map((property) => (
            <Card key={property.id} className="overflow-hidden">
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