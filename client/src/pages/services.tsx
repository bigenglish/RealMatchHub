import { useQuery } from "@tanstack/react-query";
import type { ServiceProvider } from "@shared/schema";
import ServiceCard from "@/components/service-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { serviceTypes } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import PricingComparison from "@/components/pricing-comparison";
import { Separator } from "@/components/ui/separator";

export default function ServicesPage() {
  const { data: providers, isLoading } = useQuery<ServiceProvider[]>({
    queryKey: ["/api/service-providers"],
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Service Providers</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-[200px] w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Pricing Comparison Section */}
      <section className="mb-16">
        <h1 className="text-3xl font-bold mb-6">Pay Your Way</h1>
        <p className="text-lg text-gray-700 mb-8 max-w-3xl">
          Realty.AI offers significant savings compared to traditional real estate commission models. 
          See how our transparent, fixed-rate packages can help you keep more money in your pocket.
        </p>
        
        {/* The pricing comparison component */}
        <PricingComparison />
      </section>
      
      <Separator className="my-12" />
      
      {/* Service Providers Section */}
      <section>
        <h2 className="text-3xl font-bold">Service Providers</h2>
        <p className="text-lg text-gray-700 mt-2 mb-8">
          Connect with our network of vetted service professionals to help with every step of your real estate journey.
        </p>
        
        <Tabs defaultValue={serviceTypes[0]}>
          <TabsList className="w-full justify-start">
            {serviceTypes.map((type) => (
              <TabsTrigger key={type} value={type}>
                {type}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {serviceTypes.map((type) => (
            <TabsContent key={type} value={type}>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                {providers
                  ?.filter((provider) => provider.type === type)
                  .map((provider) => (
                    <ServiceCard key={provider.id} provider={provider} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}
