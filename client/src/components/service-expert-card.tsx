import { FC, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, CheckCircle2, Phone, Mail, MapPin, Map, Info } from "lucide-react";
import { ServiceExpert } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ServiceExpertCardProps {
  expert: ServiceExpert;
  compact?: boolean;
}

interface PlaceDetails {
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: {
    weekday_text: string[];
  };
  reviews?: Array<{
    text: string;
    rating: number;
    author_name: string;
  }>;
}

const ServiceExpertCard: FC<ServiceExpertCardProps> = ({
  expert,
  compact = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Only fetch place details if it's a Google Places result and when details are requested
  const isGooglePlace = !!expert.placeId;
  const { data: placeDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: [`/api/places/${expert.placeId}`],
    queryFn: async () => {
      if (!expert.placeId) return {} as PlaceDetails;
      try {
        return await apiRequest<PlaceDetails>(`/api/places/${expert.placeId}`);
      } catch (error) {
        console.error("Error fetching place details:", error);
        return {} as PlaceDetails;
      }
    },
    enabled: isGooglePlace && showDetails,
  });
  
  // Format business hours from place details
  const formattedBusinessHours = placeDetails?.opening_hours?.weekday_text 
    ? placeDetails.opening_hours.weekday_text.join('\n')
    : expert.businessHours;

  // Get contact phone from place details if available
  const contactPhone = placeDetails?.formatted_phone_number || expert.contactPhone;
  
  // Get website from place details if available
  const website = placeDetails?.website || expert.website;

  // Determine if this is a Google Places result
  const googleBadge = isGooglePlace && (
    <Badge variant="outline" className="text-xs bg-white">
      <img src="https://developers.google.com/static/maps/documentation/images/google_logo_red.png" 
           alt="Google" className="h-3 mr-1" />
      Places
    </Badge>
  );

  return (
    <Card className={cn(
      "h-full flex flex-col overflow-hidden transition-all",
      "hover:shadow-md",
      isGooglePlace && "border-blue-100"
    )}>
      <CardHeader className="pb-2">
        <div className="flex flex-row justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <CardTitle className="text-xl line-clamp-2 mr-2">
                {expert.name}
              </CardTitle>
              {googleBadge}
            </div>
            <div className="text-sm text-gray-500">{expert.serviceType}</div>
            <div className="flex flex-row items-center gap-2 text-gray-500 mb-1">
              {expert.verified && (
                <span className="inline-flex items-center text-sm font-medium text-green-500">
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  Verified
                </span>
              )}
              {expert.rating && (
                <div className="flex items-center text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span>{expert.rating}</span>
                </div>
              )}
            </div>
          </div>

          {expert.logoUrl && (
            <div className="ml-4">
              <div className="w-16 h-16 bg-white rounded-md overflow-hidden border flex items-center justify-center">
                <img
                  src={expert.logoUrl}
                  alt={`${expert.name} logo`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>
        <CardDescription className="line-clamp-2">
          {expert.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        {!compact && (
          <>
            {expert.servicesOffered && expert.servicesOffered.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-1">Services Offered</h4>
                <div className="flex flex-wrap gap-1">
                  {expert.servicesOffered.map((service) => (
                    <Badge key={service} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {expert.areasServed && expert.areasServed.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-1">Areas Served</h4>
                <div className="flex flex-wrap gap-1">
                  {expert.areasServed.map((area) => (
                    <Badge key={area} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {expert.address && (
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Location
                </h4>
                <p className="text-sm text-gray-600">{expert.address}</p>
                {isGooglePlace && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="h-auto p-0 text-xs"
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(expert.name)}&query_place_id=${expert.placeId}`, '_blank')}
                  >
                    <Map className="h-3 w-3 mr-1" /> View on Google Maps
                  </Button>
                )}
              </div>
            )}

            {showDetails && formattedBusinessHours && (
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-1">Business Hours</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">{formattedBusinessHours}</p>
              </div>
            )}

            {expert.specialOffers && expert.specialOffers.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-1">Special Offers</h4>
                <ul className="text-sm pl-5 list-disc text-gray-600">
                  {expert.specialOffers.map((offer, index) => (
                    <li key={index}>{offer}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <div className="mt-2">
          <h4 className="text-sm font-medium mb-1">Contact Information</h4>
          <div className="text-sm text-gray-600">
            <p>{expert.contactName}</p>
            <div className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              <span>{expert.contactEmail}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              <span>{contactPhone}</span>
            </div>
          </div>
        </div>
        
        {isGooglePlace && (
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs" 
              onClick={() => setShowDetails(!showDetails)}
            >
              <Info className="h-3.5 w-3.5 mr-1" />
              {showDetails ? "Hide" : "Show"} Details
              {isLoadingDetails && " (Loading...)"}
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex justify-between w-full">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = `mailto:${expert.contactEmail}?subject=Inquiry about your services`}
          >
            Contact
          </Button>
          {(website || isGooglePlace) && (
            <Button
              variant="default"
              size="sm"
              className="gap-1"
              onClick={() => {
                if (website) {
                  window.open(website, "_blank");
                } else if (isGooglePlace) {
                  window.open(`https://www.google.com/maps/place/?q=place_id:${expert.placeId}`, "_blank");
                }
              }}
            >
              <span>Visit {website ? 'Website' : 'Listing'}</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ServiceExpertCard;