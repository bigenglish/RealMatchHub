import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Polygon, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Search, Home, Building, TreePine, ShoppingBag, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NeighborhoodData {
  id: string;
  name: string;
  paths: google.maps.LatLngLiteral[];
  center: google.maps.LatLngLiteral;
  price: string;
  description: string;
  tags: string[];
}

interface CityData {
  name: string;
  center: google.maps.LatLngLiteral;
  zoom: number;
  neighborhoods: NeighborhoodData[];
}

// Sample data for visualization
const cityData: Record<string, CityData> = {
  'Los Angeles': {
    name: 'Los Angeles',
    center: { lat: 34.052235, lng: -118.243683 },
    zoom: 11,
    neighborhoods: [
      {
        id: 'downtown',
        name: 'Downtown',
        paths: [
          { lat: 34.052235, lng: -118.243683 },
          { lat: 34.062235, lng: -118.243683 },
          { lat: 34.062235, lng: -118.233683 },
          { lat: 34.052235, lng: -118.233683 },
        ],
        center: { lat: 34.057235, lng: -118.238683 },
        price: '$750,000',
        description: 'Urban center with high-rise buildings and vibrant nightlife.',
        tags: ['Urban', 'Walkable', 'Nightlife']
      },
      {
        id: 'hollywood',
        name: 'Hollywood',
        paths: [
          { lat: 34.092235, lng: -118.343683 },
          { lat: 34.102235, lng: -118.343683 },
          { lat: 34.102235, lng: -118.333683 },
          { lat: 34.092235, lng: -118.333683 },
        ],
        center: { lat: 34.097235, lng: -118.338683 },
        price: '$1,200,000',
        description: 'Famous entertainment district with movie studios and tourist attractions.',
        tags: ['Entertainment', 'Tourists', 'Historic']
      },
      {
        id: 'santa-monica',
        name: 'Santa Monica',
        paths: [
          { lat: 34.022235, lng: -118.493683 },
          { lat: 34.032235, lng: -118.493683 },
          { lat: 34.032235, lng: -118.483683 },
          { lat: 34.022235, lng: -118.483683 },
        ],
        center: { lat: 34.027235, lng: -118.488683 },
        price: '$1,800,000',
        description: 'Beach city with pier, shopping, and ocean views.',
        tags: ['Beach', 'Upscale', 'Shopping']
      }
    ]
  },
  'San Francisco': {
    name: 'San Francisco',
    center: { lat: 37.7749, lng: -122.4194 },
    zoom: 12,
    neighborhoods: [
      {
        id: 'soma',
        name: 'SOMA',
        paths: [
          { lat: 37.775, lng: -122.405 },
          { lat: 37.785, lng: -122.405 },
          { lat: 37.785, lng: -122.395 },
          { lat: 37.775, lng: -122.395 },
        ],
        center: { lat: 37.78, lng: -122.4 },
        price: '$1,250,000',
        description: 'South of Market district with tech companies and warehouses converted to lofts.',
        tags: ['Tech', 'Urban', 'Lofts']
      },
      {
        id: 'nob-hill',
        name: 'Nob Hill',
        paths: [
          { lat: 37.79, lng: -122.42 },
          { lat: 37.8, lng: -122.42 },
          { lat: 37.8, lng: -122.41 },
          { lat: 37.79, lng: -122.41 },
        ],
        center: { lat: 37.795, lng: -122.415 },
        price: '$1,900,000',
        description: 'Historic upscale neighborhood with luxury hotels and views.',
        tags: ['Upscale', 'Historic', 'Views']
      }
    ]
  },
  'New York': {
    name: 'New York',
    center: { lat: 40.7128, lng: -74.006 },
    zoom: 12,
    neighborhoods: [
      {
        id: 'upper-east-side',
        name: 'Upper East Side',
        paths: [
          { lat: 40.77, lng: -73.96 },
          { lat: 40.78, lng: -73.96 },
          { lat: 40.78, lng: -73.95 },
          { lat: 40.77, lng: -73.95 },
        ],
        center: { lat: 40.775, lng: -73.955 },
        price: '$2,500,000',
        description: 'Upscale residential area with museums and Central Park access.',
        tags: ['Upscale', 'Cultural', 'Park Access']
      },
      {
        id: 'chelsea',
        name: 'Chelsea',
        paths: [
          { lat: 40.74, lng: -74.01 },
          { lat: 40.75, lng: -74.01 },
          { lat: 40.75, lng: -74.0 },
          { lat: 40.74, lng: -74.0 },
        ],
        center: { lat: 40.745, lng: -74.005 },
        price: '$1,800,000',
        description: 'Trendy district with art galleries, High Line, and food markets.',
        tags: ['Trendy', 'Arts', 'Nightlife']
      }
    ]
  },
  'Miami': {
    name: 'Miami',
    center: { lat: 25.7617, lng: -80.1918 },
    zoom: 12,
    neighborhoods: [
      {
        id: 'south-beach',
        name: 'South Beach',
        paths: [
          { lat: 25.77, lng: -80.14 },
          { lat: 25.78, lng: -80.14 },
          { lat: 25.78, lng: -80.13 },
          { lat: 25.77, lng: -80.13 },
        ],
        center: { lat: 25.775, lng: -80.135 },
        price: '$950,000',
        description: 'Famous beach area with Art Deco architecture and nightlife.',
        tags: ['Beach', 'Nightlife', 'Art Deco']
      },
      {
        id: 'brickell',
        name: 'Brickell',
        paths: [
          { lat: 25.75, lng: -80.2 },
          { lat: 25.76, lng: -80.2 },
          { lat: 25.76, lng: -80.19 },
          { lat: 25.75, lng: -80.19 },
        ],
        center: { lat: 25.755, lng: -80.195 },
        price: '$750,000',
        description: 'Financial district with high-rise luxury condos and restaurants.',
        tags: ['Urban', 'Financial', 'Luxury']
      }
    ]
  }
};

interface CityMapProps {
  cityName: string;
  onNeighborhoodSelect: (neighborhood: NeighborhoodData) => void;
  onBack: () => void;
}

const containerStyle = {
  width: '100%',
  height: '600px',
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  scrollwheel: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

const CityMap: React.FC<CityMapProps> = ({ cityName, onNeighborhoodSelect, onBack }) => {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<NeighborhoodData | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const city = cityData[cityName] || {
    name: cityName,
    center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco if city not found
    zoom: 11,
    neighborhoods: []
  };

  const onMapLoad = useCallback(() => {
    setMapLoaded(true);
  }, []);

  const filteredNeighborhoods = city.neighborhoods.filter(
    neighborhood => neighborhood.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Explore {cityName} Neighborhoods</CardTitle>
              <CardDescription>
                Click on a neighborhood to view details and take our preferences questionnaire
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex items-center gap-2"
            >
              Back to Cities
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search neighborhoods..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {filteredNeighborhoods.map((neighborhood) => (
              <Button
                key={neighborhood.id}
                variant={selectedNeighborhood?.id === neighborhood.id ? "default" : "outline"}
                className={`flex items-center gap-2 ${
                  selectedNeighborhood?.id === neighborhood.id ? 'bg-olive-600' : ''
                }`}
                onClick={() => setSelectedNeighborhood(neighborhood)}
              >
                <MapPin className="h-4 w-4" />
                {neighborhood.name}
              </Button>
            ))}
          </div>

          <div className="rounded-xl overflow-hidden shadow-md">
            <LoadScript
              googleMapsApiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY || ''}
              onLoad={() => console.log('Google Maps script loaded successfully')}
              onError={(error) => console.error('Error loading Google Maps script:', error)}
            >
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={city.center}
                zoom={city.zoom}
                options={mapOptions}
                onLoad={onMapLoad}
              >
                {mapLoaded && (
                  <>
                    {city.neighborhoods.map((neighborhood) => (
                      <React.Fragment key={neighborhood.id}>
                        <Polygon
                          paths={neighborhood.paths}
                          options={{
                            fillColor: selectedNeighborhood?.id === neighborhood.id ? '#34A853' : '#4CAF50',
                            fillOpacity: selectedNeighborhood?.id === neighborhood.id ? 0.5 : 0.2,
                            strokeColor: '#34A853',
                            strokeOpacity: 1,
                            strokeWeight: selectedNeighborhood?.id === neighborhood.id ? 2 : 1,
                            clickable: true
                          }}
                          onClick={() => setSelectedNeighborhood(neighborhood)}
                        />
                        <Marker
                          position={neighborhood.center}
                          onClick={() => setSelectedNeighborhood(neighborhood)}
                          icon={{
                            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#34A853" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                              </svg>
                            `),
                            scaledSize: new window.google.maps.Size(30, 30),
                            anchor: new window.google.maps.Point(15, 30),
                          }}
                        />
                      </React.Fragment>
                    ))}

                    {selectedNeighborhood && (
                      <InfoWindow
                        position={selectedNeighborhood.center}
                        onCloseClick={() => setSelectedNeighborhood(null)}
                      >
                        <div className="p-2 max-w-xs">
                          <h3 className="font-bold text-lg">{selectedNeighborhood.name}</h3>
                          <p className="text-olive-600 font-semibold mb-2">{selectedNeighborhood.price}</p>
                          <p className="text-sm mb-2">{selectedNeighborhood.description}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {selectedNeighborhood.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="bg-olive-50">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button 
                            className="w-full mt-2 bg-olive-600"
                            size="sm"
                            onClick={() => onNeighborhoodSelect(selectedNeighborhood)}
                          >
                            Explore {selectedNeighborhood.name}
                          </Button>
                        </div>
                      </InfoWindow>
                    )}
                  </>
                )}
              </GoogleMap>
            </LoadScript>
          </div>
        </CardContent>
        <CardFooter>
          {selectedNeighborhood ? (
            <div className="w-full">
              <h3 className="font-bold text-xl mb-2">{selectedNeighborhood.name}</h3>
              <p className="mb-4">{selectedNeighborhood.description}</p>
              <Button 
                className="w-full bg-olive-600"
                onClick={() => onNeighborhoodSelect(selectedNeighborhood)}
              >
                Select {selectedNeighborhood.name} & Continue
              </Button>
            </div>
          ) : (
            <p className="text-gray-500">Select a neighborhood on the map to continue</p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default CityMap;