import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { propertyTypes } from "@shared/schema";
import { RefreshCw, Search } from "lucide-react";

const searchSchema = z.object({
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  propertyType: z.string().optional(),
});

type SearchFilters = z.infer<typeof searchSchema>;

interface SearchFiltersProps {
  onFilter: (filters: any) => void;
}

// Convert form data to the correct types for filtering
function prepareFilters(data: SearchFilters) {
  return {
    minPrice: data.minPrice ? parseFloat(data.minPrice) : undefined,
    maxPrice: data.maxPrice ? parseFloat(data.maxPrice) : undefined,
    bedrooms: data.bedrooms ? parseInt(data.bedrooms) : undefined,
    bathrooms: data.bathrooms ? parseFloat(data.bathrooms) : undefined,
    propertyType: data.propertyType && data.propertyType !== "All" ? data.propertyType : undefined,
  };
}

export default function SearchFilters({ onFilter }: SearchFiltersProps) {
  const form = useForm<SearchFilters>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      bathrooms: "",
      propertyType: "All",
    },
  });

  const handleSubmit = (data: SearchFilters) => {
    const processedFilters = prepareFilters(data);
    onFilter(processedFilters);
  };

  const handleReset = () => {
    form.reset({
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      bathrooms: "",
      propertyType: "All",
    });
    
    // Submit with empty filters
    onFilter({});
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 border rounded-lg p-4 bg-background">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <FormField
            control={form.control}
            name="minPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Min Price" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Max Price" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bedrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bedrooms</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Bedrooms" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bathrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bathrooms</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Bathrooms" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || "All"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem key="all" value="All">
                      All Types
                    </SelectItem>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            Search Properties
          </Button>
          <Button type="button" variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}
