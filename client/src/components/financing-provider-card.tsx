import { FC } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, CheckCircle2 } from "lucide-react";
import { FinancingProvider } from "@shared/schema";

interface FinancingProviderCardProps {
  provider: FinancingProvider;
  compact?: boolean;
}

const FinancingProviderCard: FC<FinancingProviderCardProps> = ({
  provider,
  compact = false,
}) => {
  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex flex-row justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl mb-1 line-clamp-2">
              {provider.name}
            </CardTitle>
            <div className="flex flex-row items-center gap-2 text-gray-500 mb-1">
              {provider.verified && (
                <span className="inline-flex items-center text-sm font-medium text-green-500">
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  Verified
                </span>
              )}
              {provider.rating && (
                <div className="flex items-center text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span>{provider.rating}</span>
                </div>
              )}
            </div>
          </div>

          {provider.logoUrl && (
            <div className="ml-4">
              <div className="w-16 h-16 bg-white rounded-md overflow-hidden border flex items-center justify-center">
                <img
                  src={provider.logoUrl}
                  alt={`${provider.name} logo`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>
        <CardDescription className="line-clamp-2">
          {provider.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        {!compact && (
          <>
            <div className="mb-3">
              <h4 className="text-sm font-medium mb-1">Services Offered</h4>
              <div className="flex flex-wrap gap-1">
                {provider.servicesOffered.map((service) => (
                  <Badge key={service} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <h4 className="text-sm font-medium mb-1">Areas Served</h4>
              <div className="flex flex-wrap gap-1">
                {provider.areasServed.map((area) => (
                  <Badge key={area} variant="outline" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>

            {provider.specialOffers && provider.specialOffers.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-1">Special Offers</h4>
                <ul className="text-sm pl-5 list-disc text-gray-600">
                  {provider.specialOffers.map((offer, index) => (
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
            <p>{provider.contactName}</p>
            <p>{provider.contactEmail}</p>
            <p>{provider.contactPhone}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm">
            Contact
          </Button>
          {provider.website && (
            <Button
              variant="default"
              size="sm"
              className="gap-1"
              onClick={() => window.open(provider.website || '', "_blank")}
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

export default FinancingProviderCard;