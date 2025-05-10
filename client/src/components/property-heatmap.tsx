import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, LoadScript, HeatmapLayer, Marker, InfoWindow } from '@react-google-maps/api';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Loader2, Info } from 'lucide-react';

// Default center coordinates (can be adjusted based on user's location)
const DEFAULT_CENTER = { lat: 37.773972, lng: -122.431297 }; // San Francisco
const DEFAULT_ZOOM = 13;

// Map container style
const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '0.5rem',
};

type MarketTrendData = {
  year: number;
  quarter: number;
  neighborhood?: string;
  propertyType?: string;
  averagePrice: number;
  medianPrice: number;
  salesVolume: number;
  daysOnMarket: number;
  percentageChange: number;
};

type PropertyPoint = {
  id: string;
  position: google.maps.LatLngLiteral;
  price: number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: string;
  weight?: number; // For heatmap
};

type HeatmapData = {
  positions: google.maps.LatLngLiteral[];
  options: {
    radius: number;
    opacity: number;
    gradient?: string[];
  };
};

interface PropertyHeatmapProps {
  location?: string;
  zoom?: number;
  data: any; // Add proper type
}

const PropertyHeatmap: React.FC<PropertyHeatmapProps> = ({ location = "Los Angeles, CA", zoom = 12, data }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const [heatmapVisible, setHeatmapVisible] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<PropertyPoint | null>(null);
  const [properties, setProperties] = useState<PropertyPoint[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData>({
    positions: [],
    options: {
      radius: 20,
      opacity: 0.7
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visualizationType, setVisualizationType] = useState<'price' | 'salesVolume' | 'daysOnMarket'>('price');
  const [trendData, setTrendData] = useState<MarketTrendData[]>([]);
  const [viewMode, setViewMode] = useState<'map' | 'trends'>('map');
  const [timeRange, setTimeRange] = useState<[number, number]>([2020, 2025]);
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>('all');
  const [heatmapRadius, setHeatmapRadius] = useState(20);

  // Price range gradient colors
  const priceGradient = [
    'rgba(0, 255, 0, 0)',
    'rgba(0, 255, 0, 1)',
    'rgba(255, 255, 0, 1)',
    'rgba(255, 165, 0, 1)',
    'rgba(255, 0, 0, 1)'
  ];

  // Handle map load event
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
    setIsLoaded(true);
  }, []);

  // Fetch property data
  useEffect(() => {
    const fetchPropertyData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch properties with geo coordinates from our new endpoint
        const response = await apiRequest('GET', '/api/properties-geo?includeIDX=true', null);
        
        if (!response.ok) {
          throw new Error('Failed to fetch property data');
        }
        
        const data = await response.json();
        
        if (!data.listings || data.listings.length === 0) {
          throw new Error('No properties found with geo coordinates');
        }
        
        console.log(`Fetched ${data.listings.length} properties with geo data`);
        
        // Process property data for heatmap
        const propertyPoints: PropertyPoint[] = data.listings.map((property: any) => ({
          id: property.listingId,
          position: {
            lat: property.latitude,
            lng: property.longitude
          },
          price: property.price,
          address: property.address,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          sqft: property.sqft,
          propertyType: property.propertyType,
          weight: normalizeWeight(property.price, 100000, 2000000) // Normalize between min and max price
        }));
        
        setProperties(propertyPoints);
        
        // Generate heatmap data from property points
        const positions = propertyPoints.map(p => ({
          lat: p.position.lat,
          lng: p.position.lng,
          weight: p.weight
        }));
        
        setHeatmapData({
          positions,
          options: {
            radius: heatmapRadius,
            opacity: 0.7,
            gradient: priceGradient
          }
        });

        // Fetch market trend data for all neighborhoods and property types
        const trendResponse = await apiRequest('GET', '/api/market-trends', null);
        if (trendResponse.ok) {
          const trendData = await trendResponse.json();
          console.log(`Fetched ${trendData.length} market trend data points`);
          setTrendData(trendData);
          
          // If we have trend data, reset neighborhood filter to 'all'
          if (trendData.length > 0) {
            setNeighborhoodFilter('all');
          }
        } else {
          console.error('Failed to fetch market trends:', await trendResponse.text());
        }
        
        // Adjust map center if we have properties
        if (propertyPoints.length > 0) {
          setCenter(propertyPoints[0].position);
        }
      } catch (err) {
        console.error('Error fetching property data:', err);
        setError('Failed to load property data. Please try again later.');
        
        // Generate fallback data if in development to show the UI
        if (import.meta.env.DEV) {
          generateDemoData();
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchPropertyData();
  }, [heatmapRadius]);

  // Normalize property price to weight value between 0 and 1
  const normalizeWeight = (price: number, min: number, max: number): number => {
    return Math.min(1, Math.max(0, (price - min) / (max - min)));
  };

  // Generate demo data for development
  const generateDemoData = () => {
    // Generate random properties around San Francisco for demo
    const demoProperties: PropertyPoint[] = [];
    
    for (let i = 0; i < 50; i++) {
      const lat = DEFAULT_CENTER.lat + (Math.random() - 0.5) * 0.1;
      const lng = DEFAULT_CENTER.lng + (Math.random() - 0.5) * 0.1;
      const price = Math.floor(500000 + Math.random() * 1500000);
      
      demoProperties.push({
        id: `demo-${i}`,
        position: { lat, lng },
        price,
        address: `${1000 + i} Demo St, San Francisco, CA`,
        bedrooms: Math.floor(2 + Math.random() * 4),
        bathrooms: Math.floor(2 + Math.random() * 3),
        sqft: Math.floor(1000 + Math.random() * 2000),
        propertyType: Math.random() > 0.5 ? 'Single Family' : 'Condo',
        weight: normalizeWeight(price, 500000, 2000000)
      });
    }
    
    setProperties(demoProperties);
    
    // Generate heatmap data from demo properties
    const positions = demoProperties.map(p => ({
      lat: p.position.lat,
      lng: p.position.lng,
      weight: p.weight
    }));
    
    setHeatmapData({
      positions,
      options: {
        radius: heatmapRadius,
        opacity: 0.7,
        gradient: priceGradient
      }
    });
    
    // Generate demo market trend data
    const demoTrendData: MarketTrendData[] = [];
    let basePrice = 1200000;
    
    for (let year = 2020; year <= 2025; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        // Skip future quarters
        if (year === 2025 && quarter > 1) continue;
        
        const randomChange = (Math.random() - 0.3) * 0.05; // -3% to +2% change
        basePrice = basePrice * (1 + randomChange);
        
        // For each neighborhood, create a trend data point with slight variations
        const neighborhoods = ['Downtown', 'Suburban Heights', 'Westside', 'Eastside', 'Northgate'];
        const propertyTypes = ['Single Family Home', 'Condo', 'Townhouse'];
        
        neighborhoods.forEach((neighborhood, nIndex) => {
          // Each neighborhood has slightly different prices and trends
          const neighborhoodFactor = 1 + (nIndex - 2) * 0.1; // Variation between neighborhoods
          
          propertyTypes.forEach((propertyType, pIndex) => {
            // Each property type has different price levels
            const typeFactor = pIndex === 0 ? 1.2 : pIndex === 1 ? 0.7 : 0.9;
            
            const finalPrice = Math.round(basePrice * neighborhoodFactor * typeFactor);
            
            demoTrendData.push({
              year,
              quarter,
              neighborhood,
              propertyType,
              averagePrice: finalPrice,
              medianPrice: Math.round(finalPrice * 0.9),
              salesVolume: Math.floor(100 + Math.random() * 150),
              daysOnMarket: Math.floor(20 + Math.random() * 40),
              percentageChange: randomChange * 100
            });
          });
        });
      }
    }
    
    setTrendData(demoTrendData);
  };

  // Handle marker click to show info window
  const handleMarkerClick = (property: PropertyPoint) => {
    setSelectedProperty(property);
  };

  // Format price in a readable way
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Fetch neighborhood-specific data when filter changes
  useEffect(() => {
    if (neighborhoodFilter === 'all') {
      // If we're showing all neighborhoods, just use the full dataset
      return;
    }
    
    const fetchNeighborhoodData = async () => {
      try {
        console.log(`Fetching market trends for neighborhood: ${neighborhoodFilter}`);
        const response = await apiRequest('GET', `/api/market-trends?neighborhood=${neighborhoodFilter}`, null);
        
        if (response.ok) {
          const data = await response.json();
          setTrendData(data);
        }
      } catch (err) {
        console.error('Error fetching neighborhood data:', err);
      }
    };
    
    fetchNeighborhoodData();
  }, [neighborhoodFilter]);

  // Calculate dynamic data for the visualized trend data
  const trendChartData = useMemo(() => {
    if (trendData.length === 0) return [];
    
    // Filter by time range
    const filteredData = trendData.filter(
      d => d.year >= timeRange[0] && d.year <= timeRange[1]
    );
    
    // Filter by neighborhood
    const neighborhoodFiltered = neighborhoodFilter === 'all' 
      ? filteredData 
      : filteredData.filter(d => d.neighborhood === neighborhoodFilter || !d.neighborhood);
    
    // Sort by year and quarter
    return neighborhoodFiltered.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.quarter - b.quarter;
    });
  }, [trendData, timeRange, neighborhoodFilter]);

  // Current data value based on visualization type
  const getCurrentValue = (data: MarketTrendData) => {
    switch (visualizationType) {
      case 'price':
        return data.averagePrice;
      case 'salesVolume':
        return data.salesVolume;
      case 'daysOnMarket':
        return data.daysOnMarket;
      default:
        return 0;
    }
  };

  // Label for the current visualization
  const visualizationLabel = useMemo(() => {
    switch (visualizationType) {
      case 'price':
        return 'Average Price';
      case 'salesVolume':
        return 'Sales Volume';
      case 'daysOnMarket':
        return 'Days on Market';
      default:
        return '';
    }
  }, [visualizationType]);

  // Maximum value for the chart
  const maxValue = useMemo(() => {
    if (trendChartData.length === 0) return 0;
    return Math.max(...trendChartData.map(d => getCurrentValue(d))) * 1.1;
  }, [trendChartData, visualizationType]);

  // Update heatmap radius setting
  const handleRadiusChange = (value: number[]) => {
    setHeatmapRadius(value[0]);
  };

  return (
    <div className="property-heatmap-container">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Interactive Property Market Visualization</span>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                onClick={() => setViewMode('map')}
              >
                Map View
              </Button>
              <Button
                variant={viewMode === 'trends' ? 'default' : 'outline'}
                onClick={() => setViewMode('trends')}
              >
                Market Trends
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-[600px]">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading property data...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : (
            <>
              {/* Map View Mode */}
              {viewMode === 'map' && (
                <div>
                  <div className="controls mb-4 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <span>Heatmap:</span>
                      <Button
                        size="sm"
                        variant={heatmapVisible ? 'default' : 'outline'}
                        onClick={() => setHeatmapVisible(!heatmapVisible)}
                      >
                        {heatmapVisible ? 'Hide' : 'Show'}
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span>Radius:</span>
                      <div className="w-32">
                        <Slider 
                          value={[heatmapRadius]} 
                          min={5} 
                          max={50} 
                          step={1}
                          onValueChange={handleRadiusChange}
                        />
                      </div>
                    </div>
                    
                    <Select 
                      value={visualizationType} 
                      onValueChange={(value: any) => setVisualizationType(value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Visualization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Price Heatmap</SelectItem>
                        <SelectItem value="salesVolume">Sales Volume</SelectItem>
                        <SelectItem value="daysOnMarket">Days on Market</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2 ml-auto">
                      <div className="flex h-2 w-36">
                        <div className="h-2 w-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-sm"></div>
                      </div>
                      <div className="flex justify-between w-36 text-xs">
                        <span>Low</span>
                        <span>Medium</span>
                        <span>High</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Google Map */}
                  <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY || ''}>
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={center}
                      zoom={zoomLevel}
                      onLoad={onMapLoad}
                    >
                      {/* Heatmap Layer */}
                      {heatmapVisible && heatmapData.positions.length > 0 && (
                        <HeatmapLayer
                          data={heatmapData.positions.map(position => new google.maps.LatLng(position.lat, position.lng))}
                          options={{
                            radius: heatmapRadius,
                            opacity: 0.7,
                            gradient: priceGradient
                          }}
                        />
                      )}
                      
                      {/* Property Markers */}
                      {properties.map(property => (
                        <Marker
                          key={property.id}
                          position={property.position}
                          onClick={() => handleMarkerClick(property)}
                          icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 7,
                            fillColor: '#4CAF50',
                            fillOpacity: 0.7,
                            strokeWeight: 1,
                            strokeColor: '#fff',
                          }}
                        />
                      ))}
                      
                      {/* Info Window for Selected Property */}
                      {selectedProperty && (
                        <InfoWindow
                          position={selectedProperty.position}
                          onCloseClick={() => setSelectedProperty(null)}
                        >
                          <div className="p-2 max-w-[250px]">
                            <h3 className="font-bold mb-1">{formatPrice(selectedProperty.price)}</h3>
                            <p className="text-sm mb-1">{selectedProperty.address}</p>
                            <p className="text-sm">
                              {selectedProperty.bedrooms} bd | {selectedProperty.bathrooms} ba | {selectedProperty.sqft} sqft
                            </p>
                            <p className="text-sm text-gray-600">{selectedProperty.propertyType}</p>
                          </div>
                        </InfoWindow>
                      )}
                    </GoogleMap>
                  </LoadScript>
                </div>
              )}
              
              {/* Market Trends View Mode */}
              {viewMode === 'trends' && (
                <div>
                  <div className="controls mb-4 flex flex-wrap gap-4 items-center">
                    <Tabs 
                      defaultValue="price" 
                      value={visualizationType}
                      onValueChange={(value: any) => setVisualizationType(value)}
                      className="w-full"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <TabsList className="grid grid-cols-3">
                          <TabsTrigger value="price">Price Trends</TabsTrigger>
                          <TabsTrigger value="salesVolume">Sales Volume</TabsTrigger>
                          <TabsTrigger value="daysOnMarket">Days on Market</TabsTrigger>
                        </TabsList>
                        
                        <Select 
                          value={neighborhoodFilter} 
                          onValueChange={(value: string) => setNeighborhoodFilter(value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Neighborhood" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Neighborhoods</SelectItem>
                            <SelectItem value="Downtown">Downtown</SelectItem>
                            <SelectItem value="Suburban Heights">Suburban Heights</SelectItem>
                            <SelectItem value="Westside">Westside</SelectItem>
                            <SelectItem value="Eastside">Eastside</SelectItem>
                            <SelectItem value="Northgate">Northgate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <TabsContent value="price" className="pt-4">
                        <div className="flex flex-col gap-4">
                          <div className="trend-chart-container h-[400px] relative">
                            {trendChartData.length > 0 ? (
                              <div className="h-full flex items-end">
                                {trendChartData.map((data, index) => (
                                  <div 
                                    key={`${data.year}-${data.quarter}`}
                                    className="trend-bar flex-1 mx-1 flex flex-col items-center justify-end group"
                                  >
                                    <div 
                                      className="w-full bg-olive-600 hover:bg-olive-500 transition-all relative"
                                      style={{ 
                                        height: `${(data.averagePrice / maxValue) * 100}%`,
                                        minHeight: '4px'
                                      }}
                                    >
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {formatPrice(data.averagePrice)}
                                        <div className="text-[10px]">
                                          {data.percentageChange > 0 ? '↑' : '↓'} 
                                          {Math.abs(data.percentageChange).toFixed(1)}%
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-xs mt-1 rotate-45 origin-left whitespace-nowrap">
                                      {`Q${data.quarter} ${data.year}`}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex justify-center items-center h-full">
                                <p>No trend data available</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                              <CardHeader className="py-3">
                                <CardTitle className="text-sm font-medium">Year over Year Change</CardTitle>
                              </CardHeader>
                              <CardContent>
                                {trendChartData.length > 0 && (
                                  <div className="text-2xl font-bold">
                                    {trendChartData[trendChartData.length - 1].percentageChange > 0 ? '+' : ''}
                                    {trendChartData[trendChartData.length - 1].percentageChange.toFixed(1)}%
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                            
                            <Card>
                              <CardHeader className="py-3">
                                <CardTitle className="text-sm font-medium">Median Price</CardTitle>
                              </CardHeader>
                              <CardContent>
                                {trendChartData.length > 0 && (
                                  <div className="text-2xl font-bold">
                                    {formatPrice(trendChartData[trendChartData.length - 1].medianPrice)}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                            
                            <Card>
                              <CardHeader className="py-3">
                                <CardTitle className="text-sm font-medium">Average Days on Market</CardTitle>
                              </CardHeader>
                              <CardContent>
                                {trendChartData.length > 0 && (
                                  <div className="text-2xl font-bold">
                                    {trendChartData[trendChartData.length - 1].daysOnMarket} days
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="salesVolume" className="pt-4">
                        <div className="trend-chart-container h-[400px] relative">
                          {trendChartData.length > 0 ? (
                            <div className="h-full flex items-end">
                              {trendChartData.map((data, index) => (
                                <div 
                                  key={`${data.year}-${data.quarter}`}
                                  className="trend-bar flex-1 mx-1 flex flex-col items-center justify-end group"
                                >
                                  <div 
                                    className="w-full bg-blue-600 hover:bg-blue-500 transition-all relative"
                                    style={{ 
                                      height: `${(data.salesVolume / Math.max(...trendChartData.map(d => d.salesVolume))) * 100}%`,
                                      minHeight: '4px'
                                    }}
                                  >
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                      {data.salesVolume} sales
                                    </div>
                                  </div>
                                  <div className="text-xs mt-1 rotate-45 origin-left whitespace-nowrap">
                                    {`Q${data.quarter} ${data.year}`}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex justify-center items-center h-full">
                              <p>No sales volume data available</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="daysOnMarket" className="pt-4">
                        <div className="trend-chart-container h-[400px] relative">
                          {trendChartData.length > 0 ? (
                            <div className="h-full flex items-end">
                              {trendChartData.map((data, index) => (
                                <div 
                                  key={`${data.year}-${data.quarter}`}
                                  className="trend-bar flex-1 mx-1 flex flex-col items-center justify-end group"
                                >
                                  <div 
                                    className="w-full bg-amber-600 hover:bg-amber-500 transition-all relative"
                                    style={{ 
                                      height: `${(data.daysOnMarket / Math.max(...trendChartData.map(d => d.daysOnMarket))) * 100}%`,
                                      minHeight: '4px'
                                    }}
                                  >
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                      {data.daysOnMarket} days
                                    </div>
                                  </div>
                                  <div className="text-xs mt-1 rotate-45 origin-left whitespace-nowrap">
                                    {`Q${data.quarter} ${data.year}`}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex justify-center items-center h-full">
                              <p>No days on market data available</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                  
                  <div className="mt-4 border-t pt-4">
                    <div className="text-sm text-gray-500 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      <span>
                        Note: This visualization uses historical data to show market trends. Past performance does not guarantee future results.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <Card className="w-full h-[400px] overflow-hidden">
        <iframe
          src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}&q=${encodeURIComponent(location)}&zoom=${zoomLevel}`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </Card>
    </div>
  );
};

export default PropertyHeatmap;