import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { expertServiceTypes, expertTypes, ServiceExpert, InsertServiceExpert } from "@shared/schema";
import ServiceExpertCard from "@/components/service-expert-card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Info, MapPin, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";

// Define interfaces for Google Places API responses
interface PlaceSearchResult {
  place_id: string;
  name: string;
  vicinity: string;
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  business_status?: string;
}

interface PlacesAPIStatus {
  enabled: boolean;
  message: string;
}

// Convert Google Places result to ServiceExpert format
const convertPlaceToServiceExpert = (place: PlaceSearchResult, serviceType: string): InsertServiceExpert => {
  // Map place types to service offerings
  const getServiceOfferings = (types: string[], serviceType: string): string[] => {
    const baseServices: string[] = [];
    
    // Add service type specific offerings
    switch(serviceType) {
      case "Mortgage Lender":
        baseServices.push("Mortgages", "Refinancing", "Home Equity Loans");
        break;
      case "Home Inspector":
        baseServices.push("Property Inspector");
        break;
      case "Real Estate Attorney":
        baseServices.push("Real Estate Attorney");
        break;
      case "Title Company":
        baseServices.push("Title Company");
        break;
      case "Insurance Agent":
        baseServices.push("Home Insurance");
        break;
      case "Real Estate Agent":
        baseServices.push("Real Estate Agent");
        break;
    }
    
    return baseServices;
  };
  
  // Extract photo URL if available
  const logoUrl = place.photos && place.photos.length > 0
    ? `/api/places/photo/${place.photos[0].photo_reference}`
    : undefined;
  
  return {
    providerId: place.place_id,
    name: place.name,
    contactName: place.name,
    contactEmail: "contact@example.com", // Placeholder - Places API doesn't include email
    contactPhone: "Contact for details", // Placeholder - Full details require additional API call
    website: undefined, // Requires details API call
    description: `Located at ${place.vicinity}. ${place.types.join(", ")}`,
    servicesOffered: getServiceOfferings(place.types, serviceType),
    areasServed: [place.vicinity.split(',').pop()?.trim() || "Local Area"],
    logoUrl,
    rating: place.rating ? Math.round(place.rating) : undefined,
    verified: false,
    specialOffers: undefined,
    userType: "vendor",
    businessHours: undefined, // Requires details API call
    address: place.vicinity,
    placeId: place.place_id,
    serviceType
  };
};

const ServiceExpertsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [expertTypeFilter, setExpertTypeFilter] = useState("all");
  const [location, setLocation] = useState("37.7749,-122.4194"); // Default to San Francisco
  const [locationInput, setLocationInput] = useState("San Francisco, CA");
  const [locationName, setLocationName] = useState("San Francisco, CA");
  const [useGooglePlaces, setUseGooglePlaces] = useState(false); // Default to false until confirmed
  const [googlePlacesStatus, setGooglePlacesStatus] = useState<PlacesAPIStatus | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Check if Google Places API is enabled
  useEffect(() => {
    const checkGooglePlacesStatus = async () => {
      try {
        console.log("Checking Google Places API status...");
        const response = await fetch('/api/places-status'); // Updated to use the new endpoint name
        
        if (response.ok) {
          const status = await response.json();
          console.log("Google Places API status response:", status);
          setGooglePlacesStatus(status);
          
          // Only set to enabled if we actually got a successful status AND results
          const isEnabled = status.enabled && (status.results_count > 0);
          setUseGooglePlaces(isEnabled);
          
          if (isEnabled) {
            console.log("Google Places API is enabled and working, will use real data");
          } else if (status.enabled) {
            console.log("Google Places API is enabled but returned no results, will use sample data");
          } else {
            console.log("Google Places API is disabled or not working, will use sample data");
            console.log("Reason:", status.message);
          }
        } else {
          console.warn("Could not check Google Places API status, response not OK:", response.status);
          setUseGooglePlaces(false);
          setGooglePlacesStatus({
            enabled: false,
            message: `Google Places API is not available (HTTP ${response.status})`
          });
        }
      } catch (error) {
        console.error("Error checking Google Places API status:", error);
        setUseGooglePlaces(false);
        setGooglePlacesStatus({
          enabled: false,
          message: "Google Places API could not be contacted due to a network error"
        });
      }
    };
    
    // Always try to check the API status
    checkGooglePlacesStatus();
  }, []);

  // Geocode an address to coordinates
  const geocodeAddress = async (address: string) => {
    if (!address) return;
    
    setIsGeocoding(true);
    try {
      console.log(`Geocoding address: ${address}`);
      const response = await fetch(`/api/places/geocode?address=${encodeURIComponent(address)}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.coordinates) {
          console.log(`Successfully geocoded address to: ${data.coordinates}`);
          setLocation(data.coordinates);
          setLocationName(address); // Use the entered address as the location name
          return data.coordinates;
        } else {
          console.error("Geocoding failed:", data.message);
          return null;
        }
      } else {
        console.error("Error response from geocoding endpoint:", response.status);
        return null;
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      return null;
    } finally {
      setIsGeocoding(false);
    }
  };
  
  // Try to get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude},${longitude}`);
          setLocationInput("Current Location");
          
          // We'll keep using the default location name
          // since we can't do reverse geocoding without the API key
          console.log("Using location coordinates:", latitude, longitude);
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

  // Fetch local service experts from our database
  const { data: localServiceExperts = [], isLoading: isLoadingLocal } = useQuery<ServiceExpert[]>({
    queryKey: ["/api/service-experts"]
    // We want to fetch these regardless of Google Places API status
  });

  // Fetch service experts from Google Places API based on expertTypeFilter
  const { data: googlePlacesExperts = [], isLoading: isLoadingGooglePlaces } = useQuery({
    queryKey: ["/api/places/service-experts", expertTypeFilter, location],
    queryFn: async () => {
      if (!useGooglePlaces || expertTypeFilter === "all") {
        console.log("Not using Google Places API or querying 'all' experts - returning empty array");
        return [] as PlaceSearchResult[];
      }
      
      // Convert expertType to a format suitable for Google Places API
      let serviceTypeParam = expertTypeFilter.toLowerCase().replace(/ /g, '_');
      console.log(`Searching for service experts of type: ${serviceTypeParam} at location: ${location}`);
      
      try {
        const apiUrl = `/api/places/service-experts/${serviceTypeParam}?location=${location}`;
        console.log(`Making API request to: ${apiUrl}`);
        
        const results = await apiRequest<PlaceSearchResult[]>(apiUrl);
        console.log(`Received ${results?.length || 0} results from Google Places API`);
        
        if (!results || results.length === 0) {
          console.log("No results from Google Places API - will fall back to local data");
        }
        
        return results;
      } catch (error) {
        console.error("Error fetching service experts from Google Places:", error);
        console.log("Error occurred - will fall back to local data");
        return [] as PlaceSearchResult[];
      }
    },
    enabled: useGooglePlaces && !!location && expertTypeFilter !== "all",
    // Always retry in case of API failures
    retry: 1,
    retryDelay: 1000
  });

  // Convert Google Places results to ServiceExpert format
  const convertedPlacesExperts: ServiceExpert[] = Array.isArray(googlePlacesExperts) 
    ? googlePlacesExperts.map((place: PlaceSearchResult, index: number) => {
        const expert = convertPlaceToServiceExpert(place, expertTypeFilter);
        return {
          ...expert,
          id: 10000 + index, // Assign high IDs to avoid conflicts with local experts
        } as ServiceExpert;
      })
    : [];

  // Combine local and Google Places experts
  const allExperts = useGooglePlaces 
    ? (convertedPlacesExperts.length > 0 
        ? convertedPlacesExperts  // Use Google Places data if available
        : localServiceExperts)    // Fall back to local data if no Google Places results
    : localServiceExperts;        // Use local data if Google Places is disabled
    
  // Log which data source we're using
  useEffect(() => {
    if (useGooglePlaces) {
      if (convertedPlacesExperts.length > 0) {
        console.log("Using Google Places data:", convertedPlacesExperts.length, "experts found");
      } else {
        console.log("No Google Places experts found, falling back to local data:", localServiceExperts.length, "experts");
      }
    } else {
      console.log("Google Places API disabled, using local data:", localServiceExperts.length, "experts");
    }
  }, [useGooglePlaces, convertedPlacesExperts.length, localServiceExperts.length]);

  // Filter service experts based on search term, active tab, and expert type
  const filteredExperts = allExperts.filter((expert: ServiceExpert) => {
    const matchesSearch =
      searchTerm === "" ||
      expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expert.servicesOffered && expert.servicesOffered.some((service: string) =>
        service.toLowerCase().includes(searchTerm.toLowerCase())
      ));

    const matchesTab =
      activeTab === "all" ||
      (expert.servicesOffered && expert.servicesOffered.includes(activeTab));

    // If using Google Places, we're already filtering by expert type on the server
    const matchesExpertType = useGooglePlaces ? true :
      expertTypeFilter === "all" ||
      expert.serviceType === expertTypeFilter;

    return matchesSearch && matchesTab && matchesExpertType;
  });

  // Loading state
  const isLoading = useGooglePlaces ? isLoadingGooglePlaces : isLoadingLocal;

  return (
    <>
      <Helmet>
        <title>Service Experts | Real Estate Platform</title>
      </Helmet>

      <Container>
        <div className="py-8">
          <h1 className="text-4xl font-bold mb-2">Real Estate Service Experts</h1>
          <p className="text-xl text-gray-600 mb-4">
            Connect with top professionals to help you with every aspect of your real estate journey.
          </p>
          
          {/* Location indicator */}
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>Showing results near {locationName}</span>
          </div>
          
          {/* Google Places API Status Alert */}
          {googlePlacesStatus && !googlePlacesStatus.enabled && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Using Sample Service Expert Data</AlertTitle>
              <AlertDescription>
                {googlePlacesStatus.message}. The application is currently showing sample service expert data. When properly configured with a valid Google Places API key, this section will show real service providers from your area.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Show info alert if enabled but no results */}
          {googlePlacesStatus && googlePlacesStatus.enabled && convertedPlacesExperts.length === 0 && !isLoadingGooglePlaces && (
            <Alert className="mb-6" variant="default">
              <Info className="h-4 w-4" />
              <AlertTitle>How to Find Local Service Experts</AlertTitle>
              <AlertDescription>
                <p className="mb-2 font-medium">Follow these steps to find service experts in your area:</p>
                <ol className="list-decimal ml-5 mb-2">
                  <li>Enter your city or zip code in the "Location" field (e.g., "90210" or "Los Angeles, CA")</li>
                  <li>Click "Search Location" to find experts near you</li>
                  <li>Select a specific service type (like "Title Company" or "Home Inspector") from the dropdown</li>
                </ol>
                <p className="text-sm italic">Google Places will search for real businesses in your selected location</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Location Input and Search/Filter Controls */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Location Input */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Enter city, ZIP code or address (e.g., 90210, Los Angeles, CA)"
                  className="pl-8"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                />
              </div>
              <Button 
                variant="default" 
                onClick={() => geocodeAddress(locationInput)}
                disabled={isGeocoding || !locationInput}
                className="whitespace-nowrap"
              >
                <Search className="mr-2 h-4 w-4" />
                {isGeocoding ? "Searching..." : "Search Location"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const { latitude, longitude } = position.coords;
                        setLocation(`${latitude},${longitude}`);
                        setLocationInput("Current Location");
                        setLocationName("Current Location");
                        console.log("Using current location:", latitude, longitude);
                      },
                      (error) => {
                        console.error("Error getting user location:", error);
                      }
                    );
                  }
                }}
                className="whitespace-nowrap"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Use Current Location
              </Button>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search by name, service, or description"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-64">
                <Select value={expertTypeFilter} onValueChange={setExpertTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by expert type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Expert Types</SelectItem>
                    {expertTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 flex flex-wrap">
              <TabsTrigger value="all">All Services</TabsTrigger>
              {expertServiceTypes.map((type) => (
                <TabsTrigger key={type} value={type}>
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <p>Loading service experts near {locationName}...</p>
                </div>
              ) : filteredExperts?.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">No service experts found</h3>
                  <p className="text-gray-500 mt-2">
                    Try adjusting your search, filters, or location to find what you're looking for.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredExperts.map((expert: ServiceExpert) => (
                    <ServiceExpertCard
                      key={expert.id}
                      expert={expert}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <Separator className="my-12" />

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Need Help Finding the Right Expert?</h2>
            <p className="mb-6">
              Our concierge service can help you find the perfect professional for your unique real estate needs.
            </p>
            <Button size="lg">Request Personalized Matching</Button>
          </div>
        </div>
      </Container>
    </>
  );
};

export default ServiceExpertsPage;