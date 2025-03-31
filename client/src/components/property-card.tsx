import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Move, Building2 } from "lucide-react";
import type { Property } from "@shared/schema";
import { Link } from "wouter";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  // Log the property being rendered for debugging
  console.log("PropertyCard rendering property:", {
    id: property.id,
    title: property.title,
    type: property.propertyType
  });
  
  // Set default fallback image
  const defaultImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";
  
  // Make sure we have an image to display - with extensive error handling
  let imageUrl = defaultImage;
  try {
    if (property.images && Array.isArray(property.images) && property.images.length > 0) {
      // Check for valid image URL in the first image
      const firstImage = property.images[0];
      if (typeof firstImage === 'string' && firstImage.trim() !== '') {
        imageUrl = firstImage;
      }
    }
  } catch (e) {
    console.error("Error processing property images:", e);
  }
  
  // Format date with fallback
  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleDateString();
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return new Date().toLocaleDateString();
      }
      return date.toLocaleDateString();
    } catch (e) {
      console.error("Invalid date format:", dateString, e);
      return new Date().toLocaleDateString();
    }
  };
  
  // Property data normalization to handle different field names from IDX
  const propertyData = {
    id: property.id,
    title: property.title || 'Property Listing',
    price: property.price || 0,
    description: property.description || 'No description available',
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    sqft: property.sqft || 0,
    propertyType: property.propertyType || 'Residential',
    listedDate: property.listedDate || ''
  };
  
  // TypeScript workaround for properties that might exist in IDX data but not in our type
  const anyProperty = property as any;
  if (anyProperty.squareFeet && !propertyData.sqft) {
    propertyData.sqft = anyProperty.squareFeet;
  }
  if (anyProperty.createdAt && !propertyData.listedDate) {
    propertyData.listedDate = anyProperty.createdAt;
  }

  return (
    <Link href={`/property/${propertyData.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative">
          <img
            src={imageUrl}
            alt={propertyData.title}
            className="h-48 w-full object-cover"
            onError={(e) => {
              console.log("Image failed to load:", imageUrl);
              e.currentTarget.src = defaultImage;
            }}
          />
          {anyProperty.source === 'idx' && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-primary text-white">IDX</Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2">{propertyData.title}</h3>
          <p className="text-2xl font-bold text-primary mb-4">
            ${propertyData.price.toLocaleString()}
          </p>
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {propertyData.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{propertyData.bedrooms} beds</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{propertyData.bathrooms} baths</span>
            </div>
            <div className="flex items-center">
              <Move className="h-4 w-4 mr-1" />
              <span>{propertyData.sqft} sqft</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <Badge variant="secondary">
            <Building2 className="h-3 w-3 mr-1" />
            {propertyData.propertyType}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Listed {formatDate(propertyData.listedDate)}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
