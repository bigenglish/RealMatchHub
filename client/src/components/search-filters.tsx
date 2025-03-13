import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { propertyTypes } from "@shared/schema";

const searchSchema = z.object({
  minPrice: z.string(),
  maxPrice: z.string(),
  beds: z.string(),
  baths: z.string(),
  propertyType: z.string(),
});

type SearchFilters = z.infer<typeof searchSchema>;

interface SearchFiltersProps {
  onFilter: (filters: SearchFilters) => void;
}

export default function SearchFilters({ onFilter }: SearchFiltersProps) {
  const form = useForm<SearchFilters>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      minPrice: "",
      maxPrice: "",
      beds: "",
      baths: "",
      propertyType: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFilter)} className="space-y-4">
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
            name="beds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beds</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Beds" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="baths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Baths</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Baths" {...field} />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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

        <Button type="submit" className="w-full">Apply Filters</Button>
      </form>
    </Form>
  );
}
