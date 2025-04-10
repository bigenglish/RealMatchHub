import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ServiceOffering as BaseServiceOffering } from '@shared/schema';

// Extend the ServiceOffering type to include the price field from API
interface ServiceOffering extends BaseServiceOffering {
  price?: string | number;
}

// Default colors for chart segments if service has no defined color
const DEFAULT_COLORS = ['#4ECDC4', '#FF6B6B', '#C5E063', '#662E9B', '#F8C250', '#254B62', '#C7C7C7'];

interface CostSummaryProps {
  selectedServices: ServiceOffering[];
  totalCost: number;
  onBack: () => void;
  onPayNow: () => void;
}

export default function CostSummary({ selectedServices, totalCost, onBack, onPayNow }: CostSummaryProps) {
  // Generate chart data from selected services
  const chartData = selectedServices.map((service, index) => {
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
    
    return {
      name: service.name,
      value: servicePrice,
      color: service.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Services Summary</h2>
        <p className="text-gray-500">Review your selected services before proceeding.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
          <CardDescription>
            {selectedServices.length} service{selectedServices.length !== 1 && 's'} selected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: $${value}`}
                  labelLine={false}
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
                    style={{ backgroundColor: service.color || DEFAULT_COLORS[0] }}
                  />
                  <span>{service.name}</span>
                </div>
                <span className="font-medium">
                  {service.priceDisplay || service.price || (service.minPrice && service.maxPrice ? 
                    `$${((Number(service.minPrice) + Number(service.maxPrice)) / 2).toFixed(0)}` : 
                    '$0')}
                </span>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Grand Total</span>
            <span>${totalCost.toFixed(0)}</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={onPayNow}>Pay Now</Button>
        </CardFooter>
      </Card>
    </div>
  );
}