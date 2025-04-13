import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox"; // Assuming this component exists

export interface SearchFiltersProps {
  onFilterChange: (filters: SearchFilterValues) => void;
  className?: string;
}

export interface SearchFilterValues {
  location?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: string[];
  baths?: string[];
}

export default function SearchFilters({ onFilterChange, className = "" }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilterValues>({
    location: "",
    propertyType: "any",
    minPrice: undefined,
    maxPrice: undefined,
    beds: [],
    baths: [],
  });

  const [price, setPrice] = useState<[number, number]>([0, 1000000]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (value: number[]) => {
    setPrice([value[0], value[1]]);
    setFilters((prev) => ({
      ...prev,
      minPrice: value[0],
      maxPrice: value[1],
    }));
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
    setShowMobileFilters(false);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      location: "",
      propertyType: "any",
      minPrice: undefined,
      maxPrice: undefined,
      beds: [],
      baths: [],
    };
    setFilters(emptyFilters);
    setPrice([0, 1000000]);
    onFilterChange(emptyFilters);
  };

  // Desktop filters layout
  const FiltersContent = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            placeholder="City, neighborhood, or ZIP"
            value={filters.location}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="propertyType">Property Type</Label>
          <Select
            value={filters.propertyType}
            onValueChange={(value) => handleSelectChange("propertyType", value)}
          >
            <SelectTrigger id="propertyType">
              <SelectValue placeholder="Any type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any type</SelectItem>
              <SelectItem value="Single Family">Single Family</SelectItem>
              <SelectItem value="Condo">Condo</SelectItem>
              <SelectItem value="Townhouse">Townhouse</SelectItem>
              <SelectItem value="Multi-family">Multi-family</SelectItem>
              <SelectItem value="Land">Land</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Price Range</Label>
          <span className="text-sm text-muted-foreground">
            ${price[0].toLocaleString()} - ${price[1].toLocaleString()}
          </span>
        </div>
        <Slider
          defaultValue={[0, 1000000]}
          value={price}
          max={2000000}
          step={50000}
          onValueChange={handlePriceChange}
          className="my-4"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Bedrooms</Label>
          <div className="space-y-2">
            {["1", "2", "3", "4", "5+"].map((num) => (
              <div key={`bed-${num}`} className="flex items-center space-x-2">
                <Checkbox
                  id={`bed-${num}`}
                  checked={filters.beds?.includes(num)}
                  onCheckedChange={(checked) => {
                    setFilters(prev => ({
                      ...prev,
                      beds: checked
                        ? [...(prev.beds || []), num]
                        : (prev.beds || []).filter(b => b !== num)
                    }));
                  }}
                />
                <Label htmlFor={`bed-${num}`}>{num} Bedrooms</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Bathrooms</Label>
          <div className="space-y-2">
            {["1", "2", "3", "4+"].map((num) => (
              <div key={`bath-${num}`} className="flex items-center space-x-2">
                <Checkbox
                  id={`bath-${num}`}
                  checked={filters.baths?.includes(num)}
                  onCheckedChange={(checked) => {
                    setFilters(prev => ({
                      ...prev,
                      baths: checked
                        ? [...(prev.baths || []), num]
                        : (prev.baths || []).filter(b => b !== num)
                    }));
                  }}
                />
                <Label htmlFor={`bath-${num}`}>{num} Bathrooms</Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" size="sm" onClick={handleClearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
        <Button onClick={handleApplyFilters}>Apply Filters</Button>
      </div>
    </div>
  );

  return (
    <div className={className}>
      {/* Desktop filters */}
      <div className="hidden md:block p-6 bg-card rounded-lg border shadow-sm">
        <FiltersContent />
      </div>

      {/* Mobile filters */}
      <div className="md:hidden">
        <Popover open={showMobileFilters} onOpenChange={setShowMobileFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] p-4 max-w-md" align="center">
            <FiltersContent />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}