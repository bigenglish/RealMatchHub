import { useQuery } from "@tanstack/react-query";
import type { Property } from "@shared/schema";
import PropertyCard from "@/components/property-card";
import SearchFilters from "@/components/search-filters";
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertiesPage() {
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Properties</h1>
        <SearchFilters onFilter={() => {}} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Properties</h1>
      <SearchFilters onFilter={() => {}} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties?.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
