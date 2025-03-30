import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Move, Building2 } from "lucide-react";
import type { Property } from "@shared/schema";
import { Link } from "wouter";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  // Set default fallback image
  const defaultImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";
  
  // Make sure we have an image to display
  const imageUrl = property.images && property.images.length > 0 
    ? property.images[0] 
    : defaultImage;
    
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      // Return today's date if the date is invalid
      return new Date().toLocaleDateString();
    }
  };

  return (
    <Link href={`/property/${property.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <img
          src={imageUrl}
          alt={property.title || "Property listing"}
          className="h-48 w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = defaultImage;
          }}
        />
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
          <p className="text-2xl font-bold text-primary mb-4">
            ${(property.price || 0).toLocaleString()}
          </p>
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {property.description || "No description available."}
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms || 0} beds</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms || 0} baths</span>
            </div>
            <div className="flex items-center">
              <Move className="h-4 w-4 mr-1" />
              <span>{property.sqft || 0} sqft</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <Badge variant="secondary">
            <Building2 className="h-3 w-3 mr-1" />
            {property.propertyType || "Property"}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Listed {formatDate(property.listedDate)}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
