import { FC } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, CheckCircle2, Phone, Mail, MapPin } from "lucide-react";
import { ServiceExpert } from "@shared/schema";

interface ServiceExpertCardProps {
  expert: ServiceExpert;
  compact?: boolean;
}

const ServiceExpertCard: FC<ServiceExpertCardProps> = ({
  expert,
  compact = false,
}) => {
  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex flex-row justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl mb-1 line-clamp-2">
              {expert.name}
            </CardTitle>
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

            {expert.address && (
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Location
                </h4>
                <p className="text-sm text-gray-600">{expert.address}</p>
              </div>
            )}

            {expert.businessHours && (
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-1">Business Hours</h4>
                <p className="text-sm text-gray-600">{expert.businessHours}</p>
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
              <span>{expert.contactPhone}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm">
            Contact
          </Button>
          {expert.website && (
            <Button
              variant="default"
              size="sm"
              className="gap-1"
              onClick={() => window.open(expert.website || '', "_blank")}
            >
              <span>Visit Website</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ServiceExpertCard;