import { useQuery } from "@tanstack/react-query";
import type { ServiceProvider } from "@shared/schema";
import ServiceCard from "@/components/service-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { serviceTypes } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Service Providers</h1>
      
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {providers
                ?.filter((provider) => provider.type === type)
                .map((provider) => (
                  <ServiceCard key={provider.id} provider={provider} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
