import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ServiceBundle, ServiceOffering } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Link } from "wouter";

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState("bundles");

  // Fetch service bundles
  const { 
    data: bundles = [], 
    isLoading: bundlesLoading,
    error: bundlesError
  } = useQuery<ServiceBundle[]>({
    queryKey: ["/api/marketplace/bundles"],
    enabled: activeTab === "bundles"
  });

  // Fetch all service offerings
  const { 
    data: services = [], 
    isLoading: servicesLoading,
    error: servicesError
  } = useQuery<ServiceOffering[]>({
    queryKey: ["/api/marketplace/services"],
    enabled: activeTab === "services"
  });

  // Fetch service types for filtering
  const { 
    data: serviceTypes = [], 
    isLoading: typesLoading 
  } = useQuery<string[]>({
    queryKey: ["/api/marketplace/service-types"],
    enabled: activeTab === "services"
  });

  // Loading state
  if (
    (activeTab === "bundles" && bundlesLoading) || 
    (activeTab === "services" && (servicesLoading || typesLoading))
  ) {
    return (
      <div className="py-16 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Error state
  if ((activeTab === "bundles" && bundlesError) || (activeTab === "services" && servicesError)) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold mb-2">Error loading marketplace data</h3>
        <p className="text-muted-foreground">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-3">Real Estate Services Marketplace</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover our curated collection of real estate services from trusted providers.
          Choose from bundled packages or individual services based on your needs.
        </p>
      </div>

      <Tabs defaultValue="bundles" className="mb-12" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="bundles">Service Bundles</TabsTrigger>
          <TabsTrigger value="services">Individual Services</TabsTrigger>
        </TabsList>

        <TabsContent value="bundles" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bundles.map((bundle: ServiceBundle) => (
              <Card key={bundle.id} className="overflow-hidden flex flex-col h-full">
                {bundle.featuredImage && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={bundle.featuredImage} 
                      alt={bundle.name} 
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{bundle.name}</CardTitle>
                    {bundle.popularityRank === 1 && (
                      <Badge variant="default" className="bg-gradient-to-r from-orange-500 to-pink-500">
                        Most Popular
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{bundle.description}</CardDescription>
                  {bundle.name === "FREE" && (
                    <ul className="mt-4 space-y-2">
                      <li>• AI-powered property valuation</li>
                      <li>• Communicate, schedule virtual & in-person tours</li>
                      <li>• Listing creation with direct connection to buyers</li>
                      <li>• Market Trend Reports (local market data)</li>
                    </ul>
                  )}
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex justify-between mb-3">
                    <span className="font-semibold text-lg">{bundle.price}</span>
                    {bundle.savings && (
                      <span className="text-green-600 font-medium">Save {bundle.savings}</span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Link href={`/marketplace/bundle/${bundle.id}`}>
                    <Button className="w-full">{bundle.name === "FREE" ? "Free" : "View Bundle Details"}</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="services" className="mt-8">
          <div className="space-y-10">
            {Array.from(new Set(services.map((s: ServiceOffering) => s.serviceType))).map((type) => (
              <div key={type} className="mb-8">
                <h2 className="text-2xl font-bold mb-4">{type}</h2>
                <Separator className="mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services
                    .filter((service: ServiceOffering) => service.serviceType === type)
                    .map((service: ServiceOffering) => (
                      <Card key={service.id} className="overflow-hidden flex flex-col h-full">
                        <CardHeader>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <CardDescription>{service.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold">{service.price}</span>
                            <span className="text-muted-foreground text-sm">
                              {service.estimatedDuration}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            <span>Typical timing: </span>
                            <span>{service.typicalTimingInTransaction}</span>
                          </div>
                          {service.requiredDocuments && service.requiredDocuments.length > 0 && (
                            <div className="mt-3">
                              <span className="text-sm font-medium">Required documents:</span>
                              <ul className="text-sm mt-1 space-y-1 list-disc pl-4">
                                {service.requiredDocuments.map((doc, index) => (
                                  <li key={index}>{doc}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter>
                          <Link href={`/marketplace/service/${service.id}`}>
                            <Button variant="outline" className="w-full">
                              Request Service
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}