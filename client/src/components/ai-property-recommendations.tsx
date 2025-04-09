import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Home, Building, ArrowRight, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { UserPreferences } from './property-questionnaire';
import { useToast } from '@/hooks/use-toast';

export interface Property {
  id: number | string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: string;
  images: string[];
  listedDate: string;
  listingId: string | null;
  aiMatchScore?: number;
  aiMatchReason?: string;
}

interface AIPropertyRecommendationsProps {
  userPreferences: UserPreferences;
  onViewDetails: (property: Property) => void;
}

export default function AIPropertyRecommendations({ 
  userPreferences, 
  onViewDetails 
}: AIPropertyRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiRequest('POST', '/api/ai-property-recommendations', userPreferences);
        
        if (!response.ok) {
          throw new Error('Failed to fetch property recommendations');
        }
        
        const data = await response.json();
        // The API returns the recommendations directly as an array
        setRecommendations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Unable to generate AI recommendations at this time. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to generate AI property recommendations.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (userPreferences) {
      fetchRecommendations();
    }
  }, [userPreferences, toast]);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <h3 className="text-xl font-semibold text-center">
          Our AI is analyzing your preferences
        </h3>
        <p className="text-muted-foreground text-center mt-2">
          Finding properties that match your style and requirements...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
          <p>{error}</p>
        </div>
        <Button>View All Properties</Button>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="py-12 text-center">
        <h3 className="text-xl font-semibold mb-4">No matching properties found</h3>
        <p className="text-muted-foreground mb-6">
          We couldn't find properties that match your specific preferences.
          Try adjusting your search criteria or browse all available properties.
        </p>
        <Button>View All Properties</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">AI-Powered Recommendations</h2>
        </div>
        <p className="text-muted-foreground">
          Based on your preferences and style inspiration, we found these properties for you
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((property) => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            onViewDetails={onViewDetails} 
          />
        ))}
      </div>
    </div>
  );
}

interface PropertyCardProps {
  property: Property;
  onViewDetails: (property: Property) => void;
}

function PropertyCard({ property, onViewDetails }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className="relative aspect-[16/9]">
        <img 
          src={property.images[0] || 'https://placehold.co/800x450?text=No+Image'} 
          alt={property.title}
          className="w-full h-full object-cover"
        />
        {property.aiMatchScore && (
          <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
            {property.aiMatchScore}% Match
          </div>
        )}
      </div>
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold truncate">{property.title}</h3>
          <p className="text-primary font-bold text-lg">${property.price.toLocaleString()}</p>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <div className="flex items-center">
            <span className="font-medium">{property.bedrooms}</span>
            <span className="mx-1">bed</span>
          </div>
          <span className="mx-2">•</span>
          <div className="flex items-center">
            <span className="font-medium">{property.bathrooms}</span>
            <span className="mx-1">bath</span>
          </div>
          <span className="mx-2">•</span>
          <div className="flex items-center">
            <span className="font-medium">{property.sqft.toLocaleString()}</span>
            <span className="mx-1">sqft</span>
          </div>
        </div>
        
        {property.aiMatchReason && (
          <div className="bg-primary/5 p-3 rounded-md">
            <p className="text-sm">
              <span className="font-semibold text-primary">AI Match: </span>
              {property.aiMatchReason}
            </p>
          </div>
        )}
        
        <Button 
          variant="outline" 
          className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
          onClick={() => onViewDetails(property)}
        >
          View Details
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}