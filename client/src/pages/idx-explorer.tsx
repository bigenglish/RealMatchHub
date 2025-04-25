import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

interface Property {
  id?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  description?: string;
  images?: string[];
  propertyType?: string;
}

const IdxExplorer: React.FC = () => {
  const [featuredListings, setFeaturedListings] = useState<Property[]>([]);
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [beds, setBeds] = useState('');

  useEffect(() => {
    // Fetch featured listings when component mounts
    fetchFeaturedListings();
  }, []);

  const fetchFeaturedListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('GET', '/api/idx/listings/featured');
      const data = await response.json();
      console.log('Featured listings data:', data);
      if (data.results && Array.isArray(data.results)) {
        setFeaturedListings(data.results);
      } else {
        setError('Invalid response format from IDX API');
      }
    } catch (err) {
      console.error('Error fetching featured listings:', err);
      setError('Failed to load featured listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const searchListings = async () => {
    if (!city && !beds) {
      setError('Please enter at least one search criteria');
      return;
    }

    setSearchLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (beds) params.append('beds', beds);
      
      const response = await apiRequest('GET', `/api/idx/listings/search?${params.toString()}`);
      const data = await response.json();
      console.log('Search results data:', data);
      
      if (data.results && Array.isArray(data.results)) {
        setSearchResults(data.results);
      } else {
        if (data.error) {
          setError(`IDX API Error: ${data.error}`);
        } else {
          setSearchResults([]);
        }
      }
    } catch (err) {
      console.error('Error searching listings:', err);
      setError('Failed to search listings. Please try again later.');
    } finally {
      setSearchLoading(false);
    }
  };

  const renderPropertyCard = (property: Property, index: number) => {
    return (
      <Card key={property.id || index} className="mb-4">
        <CardHeader>
          <CardTitle>{property.address}</CardTitle>
          <CardDescription>
            {property.city}, {property.state} {property.zipCode}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {property.images && property.images.length > 0 && (
            <div className="w-full h-48 overflow-hidden mb-4 rounded-md">
              <img 
                src={property.images[0]} 
                alt={`Property at ${property.address}`} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div>
              <p className="text-sm font-medium">Price</p>
              <p className="text-lg">${property.price?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Beds</p>
              <p className="text-lg">{property.bedrooms}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Baths</p>
              <p className="text-lg">{property.bathrooms}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 line-clamp-3">{property.description}</p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="outline">View Details</Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Realty.AI IDX Explorer</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">Search Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input 
              id="city" 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name"
            />
          </div>
          <div>
            <Label htmlFor="beds">Minimum Beds</Label>
            <Input 
              id="beds" 
              type="number" 
              value={beds} 
              onChange={(e) => setBeds(e.target.value)}
              placeholder="Enter minimum beds"
            />
          </div>
        </div>
        <Button 
          onClick={searchListings} 
          disabled={searchLoading}
          className="w-full"
        >
          {searchLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            'Search'
          )}
        </Button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((property, index) => renderPropertyCard(property, index))}
          </div>
        </div>
      )}

      {/* Featured Listings */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Featured Listings
          {loading && <Loader2 className="ml-2 inline-block h-4 w-4 animate-spin" />}
        </h2>
        
        {featuredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredListings.map((property, index) => renderPropertyCard(property, index))}
          </div>
        ) : !loading ? (
          <p className="text-gray-500">No featured listings available.</p>
        ) : null}
      </div>
    </div>
  );
};

export default IdxExplorer;