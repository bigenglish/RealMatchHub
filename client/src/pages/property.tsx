import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import type { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, ChevronDown, Video } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Bed, Bath, Move, Image } from "lucide-react";
import VirtualTour from "@/components/virtual-tour";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import BuyerResources from '@/components/buyer-resources'; // Added import


export default function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ["/api/properties", id],
  });
  const [showVirtualTour, setShowVirtualTour] = useState(false);

  // For demo, we'll use a sample video URL
  const virtualTourVideoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const defaultImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-[400px] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Property Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The property you're looking for could not be found.
        </p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const imageUrl = property.images?.[0] || defaultImage;
  const monthlyPayment = property.price ? Math.round(property.price * 0.005) : 0;
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return new Date().toLocaleDateString();
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="relative">
        <div className="aspect-[16/9] overflow-hidden rounded-lg">
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = defaultImage;
            }}
          />
        </div>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {property.images?.slice(1, 5).map((img, i) => (
            <div key={i} className="aspect-[4/3] overflow-hidden rounded-md">
              <img src={img} alt={`View ${i + 2}`} className="w-full h-full object-cover" onError={(e) => {
                e.currentTarget.src = defaultImage;
              }} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h1 className="text-2xl font-semibold">{property.title || 'Unnamed Property'}</h1>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center">
            <Bed className="h-5 w-5 mr-2" />
            <span>{property.bedrooms || 0} Bedrooms</span>
          </div>
          <div className="flex items-center">
            <Bath className="h-5 w-5 mr-2" />
            <span>{property.bathrooms || 0} Bathrooms</span>
          </div>
          <div className="flex items-center">
            <Move className="h-5 w-5 mr-2" />
            <span>{property.sqft || 0} sqft</span>
          </div>
        </div>

        <div className="flex items-center mt-2">
          <MapPin className="h-5 w-5 text-muted-foreground mr-2" />
          <span>{property.address || 'Address not provided'}</span>
        </div>

        <div className="mt-4">
          <div className="text-3xl font-bold">
            ${(property.price || 0).toLocaleString()}
          </div>
        </div>

        {/* Virtual Tour Button */}
        <div className="mt-4">
          <Button 
            onClick={() => setShowVirtualTour(true)}
            variant="outline" 
            className="w-full bg-gradient-to-r from-violet-500 to-purple-700 hover:from-violet-600 hover:to-purple-800 text-white"
          >
            <Video className="mr-2 h-5 w-5" />
            Take Virtual Tour
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <Button variant="default" className="w-full">
            Check Availability
          </Button>
          <Button variant="outline" className="w-full">
            Contact Agent
          </Button>
          <Button variant="outline" className="w-full">
            Share Home
          </Button>
        </div>

        {/* Virtual Tour Dialog */}
        <Dialog open={showVirtualTour} onOpenChange={setShowVirtualTour}>
          <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0">
            <VirtualTour 
              propertyId={Number(id)}
              propertyImages={property.images || [defaultImage]}
              videoUrl={virtualTourVideoUrl}
              onClose={() => setShowVirtualTour(false)}
            />
          </DialogContent>
        </Dialog>

        <Accordion type="single" collapsible className="mt-6">
          <AccordionItem value="open-houses">
            <AccordionTrigger>Open houses</AccordionTrigger>
            <AccordionContent>
              No open houses scheduled
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="property-details">
            <AccordionTrigger>Property details</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p>{property.description}</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <span className="font-medium">Property Type:</span>
                    <span className="ml-2">{property.propertyType}</span>
                  </div>
                  <div>
                    <span className="font-medium">Year Built:</span>
                    <span className="ml-2">2020</span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="monthly-payment">
            <AccordionTrigger>Monthly payment</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Principal & Interest</span>
                  <span>${monthlyPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Property Tax</span>
                  <span>${Math.round(monthlyPayment * 0.2).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>HOA fees</span>
                  <span>${Math.round(monthlyPayment * 0.1).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${Math.round(monthlyPayment * 1.3).toLocaleString()}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="connect-lender">
            <AccordionTrigger>Connect with a lender</AccordionTrigger>
            <AccordionContent>
              Contact our preferred lenders for financing options
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="veterans-benefits">
            <AccordionTrigger>Veterans & military benefits</AccordionTrigger>
            <AccordionContent>
              Learn about VA loans and military benefits
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="property-history">
            <AccordionTrigger>Property history</AccordionTrigger>
            <AccordionContent>
              View property history and past transactions
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="neighborhood">
            <AccordionTrigger>Neighborhood & schools</AccordionTrigger>
            <AccordionContent>
              Explore the local area and nearby schools
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <BuyerResources /> {/* Added BuyerResources component */}
      </div>
    </div>
  );
}