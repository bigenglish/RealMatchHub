import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Check, Camera, Home, Layout, BarChart, Users, Link, Clipboard, FileText, Info } from 'lucide-react';
import { ServiceOffering as BaseServiceOffering } from '@shared/schema';

// Extend the ServiceOffering type to include the price field from API
interface ServiceOffering extends BaseServiceOffering {
  price?: string | number;
}

// Map service types to icons
const serviceIcons: Record<string, React.ReactNode> = {
  'camera': <Camera className="h-5 w-5" />,
  'home': <Home className="h-5 w-5" />,
  'video': <Layout className="h-5 w-5" />,
  'cube': <div className="h-5 w-5 flex items-center justify-center">🧊</div>,
  'bar-chart': <BarChart className="h-5 w-5" />,
  'trending-up': <div className="h-5 w-5 flex items-center justify-center">📈</div>,
  'users': <Users className="h-5 w-5" />,
  'link': <Link className="h-5 w-5" />,
  'clipboard-check': <Clipboard className="h-5 w-5" />,
  'file-text': <FileText className="h-5 w-5" />,
  'default': <Info className="h-5 w-5" />
};

// Color mapping to maintain consistency with pricing display
const serviceColors: Record<string, string> = {
  '#4ECDC4': '#4ECDC4', // Teal
  '#C7C7C7': '#C7C7C7', // Light gray  
  '#FF6B6B': '#FF6B6B', // Red/coral
  '#C5E063': '#C5E063', // Lime green
  '#662E9B': '#662E9B', // Purple
  '#F8C250': '#F8C250', // Yellow/gold
  '#254B62': '#254B62', // Dark blue
  'default': '#CBD5E0' // Default gray
};

// Default colors for chart segments
const CHART_COLORS = ['#4ECDC4', '#FF6B6B', '#C5E063', '#662E9B', '#F8C250', '#254B62', '#C7C7C7'];

interface ServiceSelectionProps {
  onComplete: (selectedServices: ServiceOffering[], totalCost: number) => void;
  onCancel: () => void;
  propertyAddress?: string;
}

export default function ServiceSelection({ onComplete, onCancel, propertyAddress }: ServiceSelectionProps) {
  const [selectedServices, setSelectedServices] = useState<ServiceOffering[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [chartData, setChartData] = useState<Array<{ name: string, value: number, color: string }>>([]);

  // Fetch service offerings
  const { data: serviceOfferings, isLoading } = useQuery({
    queryKey: ['/api/service-offerings'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/service-offerings');
        if (!response.ok) {
          throw new Error('Failed to fetch service offerings');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching service offerings:', error);
        throw error;
      }
    }
  });

  // Calculate the total cost and chart data when selected services change
  useEffect(() => {
    if (selectedServices.length > 0) {
      // Calculate total
      let total = 0;
      const chartItems = selectedServices.map((service, index) => {
        // Extract price from priceDisplay or parse from price field
        let servicePrice = 0;
        if (service.price) {
          // If price is in format "$XXX" or similar
          const priceMatch = String(service.price).match(/\$?([\d,]+)/);
          if (priceMatch && priceMatch[1]) {
            servicePrice = Number(priceMatch[1].replace(/,/g, ''));
          }
        } else if (service.minPrice && service.maxPrice) {
          // If we have min/max price fields
          servicePrice = (Number(service.minPrice) + Number(service.maxPrice)) / 2;
        } else if (service.priceDisplay) {
          // Try to extract from priceDisplay
          const priceMatch = service.priceDisplay.match(/\$?([\d,]+)/);
          if (priceMatch && priceMatch[1]) {
            servicePrice = Number(priceMatch[1].replace(/,/g, ''));
          }
        }
        
        total += servicePrice;
        
        // Use the service's color if defined, otherwise use from our chart colors array
        const color = service.color || CHART_COLORS[index % CHART_COLORS.length];
        
        return {
          name: service.name,
          value: servicePrice,
          color: serviceColors[color] || serviceColors.default
        };
      });
      
      setTotalCost(total);
      setChartData(chartItems);
    } else {
      setTotalCost(0);
      setChartData([]);
    }
  }, [selectedServices]);

  const handleServiceToggle = (service: ServiceOffering) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleContinue = () => {
    onComplete(selectedServices, totalCost);
  };

  // Group services by type for better organization
  const groupedServices = serviceOfferings?.reduce((acc: Record<string, ServiceOffering[]>, service: ServiceOffering) => {
    if (!acc[service.serviceType]) {
      acc[service.serviceType] = [];
    }
    acc[service.serviceType].push(service);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Services</h2>
        {propertyAddress ? (
          <div className="mb-2">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">
              Property: {propertyAddress}
            </Badge>
          </div>
        ) : null}
        <p className="text-gray-500">Choose the services you need for your real estate transaction.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service selection column */}
        <div className="space-y-4">
          {groupedServices && Object.entries(groupedServices).map(([type, services]) => (
            <div key={type} className="space-y-2">
              <h3 className="font-semibold text-lg">{type}</h3>
              
              {services.map(service => (
                <div 
                  key={service.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    selectedServices.some(s => s.id === service.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Checkbox 
                    id={`service-${service.id}`} 
                    checked={selectedServices.some(s => s.id === service.id)}
                    onCheckedChange={() => handleServiceToggle(service)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-full" style={{ backgroundColor: service.color ? `${service.color}30` : '#e2e8f0' }}>
                        {service.icon && serviceIcons[service.icon] ? serviceIcons[service.icon] : serviceIcons.default}
                      </div>
                      <Label 
                        htmlFor={`service-${service.id}`}
                        className="font-medium cursor-pointer flex-1"
                      >
                        {service.name}
                      </Label>
                      <Badge variant="outline">{service.priceDisplay}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 ml-8 mt-1">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Cost summary and chart column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Selection</CardTitle>
              <CardDescription>
                {selectedServices.length === 0 
                  ? 'No services selected yet' 
                  : `${selectedServices.length} service${selectedServices.length > 1 ? 's' : ''} selected`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedServices.length > 0 ? (
                <>
                  <div className="mb-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `$${value}`}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedServices.map(service => (
                      <div key={service.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: service.color || serviceColors.default }}
                          />
                          <span>{service.name}</span>
                        </div>
                        <span>
                          {service.priceDisplay}
                          {service.pricingUnit && <span className="text-sm text-gray-500"> {service.pricingUnit}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between items-center font-bold">
                    <span>Grand Total</span>
                    <span>${totalCost.toFixed(0)}</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <div className="mb-2">Select services to see pricing</div>
                  <div className="w-24 h-24 mx-auto opacity-20">📊</div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={onCancel}>Cancel</Button>
              <Button 
                disabled={selectedServices.length === 0}
                onClick={handleContinue}
              >
                Continue {selectedServices.length > 0 && `($${totalCost.toFixed(0)})`}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}