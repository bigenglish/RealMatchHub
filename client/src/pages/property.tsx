import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import type { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bed, Bath, Move, MapPin, Calendar, Phone, Image } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ContactForm from "@/components/contact-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ["/api/properties", id],
  });
  const [showContactForm, setShowContactForm] = useState(false);

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
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{property.title}</h1>
              <Badge variant="outline">{property.propertyType}</Badge>
            </div>
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
          
          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="pt-4">
              <p className="text-muted-foreground">{property.description}</p>
            </TabsContent>
            
            <TabsContent value="details" className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="font-medium">Property Type</div>
                  <div className="text-muted-foreground">{property.propertyType}</div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Year Built</div>
                  <div className="text-muted-foreground">2010</div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Lot Size</div>
                  <div className="text-muted-foreground">0.25 acres</div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Garage</div>
                  <div className="text-muted-foreground">2 cars</div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Heating/Cooling</div>
                  <div className="text-muted-foreground">Central AC</div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Basement</div>
                  <div className="text-muted-foreground">Finished</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="photos" className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                {property.images.map((image, index) => (
                  <div key={index} className="aspect-video rounded-md overflow-hidden">
                    <img src={image} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                {property.images.length === 1 && (
                  <div className="aspect-video rounded-md overflow-hidden bg-muted flex items-center justify-center">
                    <Image className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
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
              {!showContactForm && (
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={() => setShowContactForm(true)}
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Contact Agent
                </Button>
              )}
            </CardContent>
          </Card>
          
          {showContactForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Contact Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactForm 
                  subject={`Inquiry about: ${property.title}`} 
                  onSuccess={() => setShowContactForm(false)} 
                />
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Financing Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="font-medium">Estimated Monthly Payment</div>
                <div className="text-2xl font-bold text-primary">
                  ${Math.round(property.price * 0.005).toLocaleString()}/month
                </div>
                <div className="text-sm text-muted-foreground">
                  Based on 30-year fixed rate mortgage at 5.5% APR with 20% down payment.
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Get Pre-Qualified
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
