import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Building, MapPin, DollarSign, Bed, Bath, Square, Star, TrendingUp } from 'lucide-react';

interface EnhancedIdxWidgetProps {
  className?: string;
  onSearch?: (filters: any) => void;
}

interface IdxLocationData {
  id: string;
  name: string;
  type: 'city' | 'county' | 'postalcode';
  state: string;
}

interface IdxSearchField {
  field: string;
  label: string;
  type: string;
  options?: string[];
  required?: boolean;
}

interface SearchFilters {
  cityId?: string;
  countyId?: string;
  postalCodeId?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  filterField?: string;
  filterValue?: string;
}

const EnhancedIdxWidget: React.FC<EnhancedIdxWidgetProps> = ({ className, onSearch }) => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch location data
  const { data: cities = [] } = useQuery({
    queryKey: ['idx-cities'],
    queryFn: async () => {
      const response = await fetch('/api/idx-cities');
      if (!response.ok) throw new Error('Failed to fetch cities');
      return response.json() as IdxLocationData[];
    }
  });

  const { data: counties = [] } = useQuery({
    queryKey: ['idx-counties'],
    queryFn: async () => {
      const response = await fetch('/api/idx-counties');
      if (!response.ok) throw new Error('Failed to fetch counties');
      return response.json() as IdxLocationData[];
    }
  });

  const { data: postalCodes = [] } = useQuery({
    queryKey: ['idx-postal-codes'],
    queryFn: async () => {
      const response = await fetch('/api/idx-postal-codes');
      if (!response.ok) throw new Error('Failed to fetch postal codes');
      return response.json() as IdxLocationData[];
    }
  });

  // Fetch dynamic search fields
  const { data: searchFields = [] } = useQuery({
    queryKey: ['idx-search-fields'],
    queryFn: async () => {
      const response = await fetch('/api/idx-search-fields');
      if (!response.ok) throw new Error('Failed to fetch search fields');
      return response.json() as IdxSearchField[];
    }
  });

  // Fetch featured listings
  const { data: featuredListings = [], isLoading: loadingFeatured } = useQuery({
    queryKey: ['idx-featured'],
    queryFn: async () => {
      const response = await fetch('/api/idx-featured?limit=6');
      if (!response.ok) throw new Error('Failed to fetch featured listings');
      const data = await response.json();
      return data.listings || [];
    }
  });

  // Fetch sold/pending listings for market insight
  const { data: soldListings = [], isLoading: loadingSold } = useQuery({
    queryKey: ['idx-sold'],
    queryFn: async () => {
      const response = await fetch('/api/idx-sold-pending?status=sold&limit=5');
      if (!response.ok) throw new Error('Failed to fetch sold listings');
      const data = await response.json();
      return data.listings || [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setFilters(searchFilters);
  }, [searchFilters]);


  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      // First try the search endpoint
      const searchParams = new URLSearchParams({
        limit: "20",
        ...(filters.cityId && { city: filters.cityId }),
        ...(filters.countyId && { countyId: filters.countyId }),
        ...(filters.postalCodeId && { postalCodeId: filters.postalCodeId }),
        ...(filters.minPrice && { minPrice: filters.minPrice.toString() }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice.toString() }),
        ...(filters.bedrooms && { bedrooms: filters.bedrooms.toString() }),
        ...(filters.bathrooms && { bathrooms: filters.bathrooms.toString() }),
        ...(filters.propertyType && { propertyType: filters.propertyType }),
        ...(filters.filterField && { filterField: filters.filterField }),
        ...(filters.filterValue && { filterValue: filters.filterValue })
      });

      console.log('Searching with filters:', filters);

      // Try the idx-search endpoint first
      let response = await fetch(`/api/idx-search?${searchParams}`);

      if (!response.ok) {
        console.log('IDX search endpoint failed, trying regular properties endpoint');
        // Fall back to the regular properties endpoint with filters
        response = await fetch(`/api/properties?${searchParams}`);
      }

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      // Handle different response formats
      let listings = [];
      if (data.listings) {
        listings = data.listings;
      } else if (data.idxListings) {
        listings = data.idxListings;
      } else if (Array.isArray(data)) {
        listings = data;
      }

      setSearchResults(listings);
      setShowResults(true);

      console.log(`Search completed: ${listings.length} properties found`);
    } catch (error) {
      console.error('Search error:', error);
      setError(error instanceof Error ? error.message : 'Search failed');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Enhanced IDX Property Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="search">Advanced Search</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="market">Market Data</TabsTrigger>
            <TabsTrigger value="dynamic">Dynamic Fields</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Location Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Select onValueChange={(value) => setSearchFilters(prev => ({ ...prev, cityId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.slice(0, 50).map(city => (
                      <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">County</label>
                <Select onValueChange={(value) => setSearchFilters(prev => ({ ...prev, countyId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    {counties.slice(0, 50).map(county => (
                      <SelectItem key={county.id} value={county.id}>{county.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Postal Code</label>
                <Select onValueChange={(value) => setSearchFilters(prev => ({ ...prev, postalCodeId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select postal code" />
                  </SelectTrigger>
                  <SelectContent>
                    {postalCodes.slice(0, 50).map(postal => (
                      <SelectItem key={postal.id} value={postal.id}>{postal.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Price</label>
                <Input
                  type="number"
                  placeholder="$0"
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, minPrice: Number(e.target.value) || undefined }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Max Price</label>
                <Input
                  type="number"
                  placeholder="$999,999,999"
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) || undefined }))}
                />
              </div>

              {/* Property Details */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Bedrooms</label>
                <Select onValueChange={(value) => setSearchFilters(prev => ({ ...prev, bedrooms: Number(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <SelectItem key={num} value={String(num)}>{num}+</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bathrooms</label>
                <Select onValueChange={(value) => setSearchFilters(prev => ({ ...prev, bathrooms: Number(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 1.5, 2, 2.5, 3, 3.5, 4, 5].map(num => (
                      <SelectItem key={num} value={String(num)}>{num}+</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Property Type</label>
                <Select onValueChange={(value) => setSearchFilters(prev => ({ ...prev, propertyType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSearch} disabled={isSearching || loading} className="w-full">
              {isSearching || loading ? 'Searching...' : 'Search Properties'}
            </Button>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Search Results ({searchResults.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.slice(0, 6).map((listing) => (
                    <Card key={listing.listingId} className="p-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">{listing.address}</h4>
                        <p className="text-sm text-gray-600">{listing.city}, {listing.state} {listing.zipCode}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-green-600">
                            {formatPrice(listing.price)}
                          </span>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Bed className="h-4 w-4" />
                              {listing.bedrooms}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bath className="h-4 w-4" />
                              {listing.bathrooms}
                            </span>
                            <span className="flex items-center gap-1">
                              <Square className="h-4 w-4" />
                              {listing.sqft?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured" className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Featured Properties
            </h3>

            {loadingFeatured ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredListings.map((listing: any) => (
                  <Card key={listing.listingId} className="p-4 border-yellow-200">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{listing.address}</h4>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Featured
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{listing.city}, {listing.state}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-600">
                          {formatPrice(listing.price)}
                        </span>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            {listing.bedrooms}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath className="h-4 w-4" />
                            {listing.bathrooms}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="market" className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Recent Market Activity
            </h3>

            {loadingSold ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {soldListings.map((listing: any) => (
                  <Card key={listing.listingId} className="p-3 bg-blue-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="font-medium text-sm">{listing.address}</h5>
                        <p className="text-xs text-gray-600">{listing.city}, {listing.state}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-blue-600">
                          {formatPrice(listing.soldPrice || listing.price)}
                        </span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          Sold
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="dynamic" className="space-y-4">
            <h3 className="text-lg font-semibold">Dynamic Search Fields</h3>
            <p className="text-sm text-gray-600">
              These fields are dynamically loaded from the MLS and may vary by region.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchFields.slice(0, 8).map((field) => (
                <div key={field.field} className="space-y-2">
                  <label className="text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {field.type === 'select' && field.options ? (
                    <Select onValueChange={(value) => setSearchFilters(prev => ({ 
                      ...prev, 
                      filterField: field.field,
                      filterValue: value
                    }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={field.type === 'number' ? 'number' : 'text'}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      onChange={(e) => setSearchFilters(prev => ({ 
                        ...prev, 
                        filterField: field.field,
                        filterValue: e.target.value
                      }))}
                    />
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedIdxWidget;