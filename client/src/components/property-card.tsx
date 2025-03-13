import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Move, Building2 } from "lucide-react";
import type { Property } from "@shared/schema";
import { Link } from "wouter";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/property/${property.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <img
          src={property.images[0]}
          alt={property.title}
          className="h-48 w-full object-cover"
        />
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
          <p className="text-2xl font-bold text-primary mb-4">
            ${property.price.toLocaleString()}
          </p>
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {property.description}
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms} beds</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms} baths</span>
            </div>
            <div className="flex items-center">
              <Move className="h-4 w-4 mr-1" />
              <span>{property.sqft} sqft</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <Badge variant="secondary">
            <Building2 className="h-3 w-3 mr-1" />
            {property.propertyType}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Listed {new Date(property.listedDate).toLocaleDateString()}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
