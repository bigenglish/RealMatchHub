import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Property } from "@shared/schema";
import { Link } from "wouter";
import { Home, Bed, Bath, ArrowUpRight } from "lucide-react";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  // Calculate image URL for the property
  const imageUrl = property.images && property.images.length > 0 
    ? property.images[0] 
    : "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80";
  
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="aspect-video w-full overflow-hidden relative">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <Badge className="absolute top-2 right-2">{property.propertyType}</Badge>
      </div>
      
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="line-clamp-1">{property.title}</CardTitle>
          <div className="text-lg font-semibold text-primary">
            {typeof property.price === 'number' 
              ? `$${property.price.toLocaleString()}` 
              : property.price}
          </div>
          <CardDescription className="line-clamp-2">
            {property.address}, {property.city}, {property.state} {property.zipCode}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center">
            <Home className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{property.sqft} sqft</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Link href={`/property/${property.id}`}>
          <Button className="w-full">
            View Property <ArrowUpRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}