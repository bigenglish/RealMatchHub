import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import type { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bed, Bath, Move, MapPin, Calendar, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ["/api/properties", id],
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-[400px] w-full" />
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }

  if (!property) {
    return <div>Property not found</div>;
  }

  return (
    <div className="space-y-8">
      <div className="aspect-video overflow-hidden rounded-lg">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full object-cover"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{property.title}</h1>
            <p className="text-2xl font-bold text-primary mt-2">
              ${property.price.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <Bed className="h-5 w-5 mr-2" />
              <span>{property.bedrooms} beds</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-5 w-5 mr-2" />
              <span>{property.bathrooms} baths</span>
            </div>
            <div className="flex items-center">
              <Move className="h-5 w-5 mr-2" />
              <span>{property.sqft} sqft</span>
            </div>
          </div>

          <p className="text-muted-foreground">{property.description}</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              <span>{property.address}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              <span>Listed {new Date(property.listedDate).toLocaleDateString()}</span>
            </div>
            <Button className="w-full" size="lg">
              <Phone className="h-5 w-5 mr-2" />
              Contact Agent
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
