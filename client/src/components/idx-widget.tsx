import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface IdxWidgetProps {
  widgetId?: string;
  className?: string;
}

// Demo component that shows what an IDX Widget would look like
// In a real implementation, this would load from the IDX Broker API
export default function IdxWidget({ className = "" }: IdxWidgetProps) {
  // Define the type for IDX status response
  interface IdxStatusResponse {
    enabled: boolean;
    message: string;
  }
  
  // Check if IDX API is configured
  const { data: idxStatus, isLoading: isStatusLoading } = useQuery<IdxStatusResponse>({
    queryKey: ['/api/idx-status'],
    staleTime: Infinity, // This won't change during the session
  });
  
  // Render the property search form
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Find Your Dream Home</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="City, ZIP, Address, or MLS#" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price-min">Min Price</Label>
              <Select defaultValue="0">
                <SelectTrigger id="price-min">
                  <SelectValue placeholder="No Min" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No Min</SelectItem>
                  <SelectItem value="100000">$100,000</SelectItem>
                  <SelectItem value="200000">$200,000</SelectItem>
                  <SelectItem value="300000">$300,000</SelectItem>
                  <SelectItem value="500000">$500,000</SelectItem>
                  <SelectItem value="750000">$750,000</SelectItem>
                  <SelectItem value="1000000">$1,000,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="price-max">Max Price</Label>
              <Select defaultValue="10000000">
                <SelectTrigger id="price-max">
                  <SelectValue placeholder="No Max" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10000000">No Max</SelectItem>
                  <SelectItem value="200000">$200,000</SelectItem>
                  <SelectItem value="300000">$300,000</SelectItem>
                  <SelectItem value="500000">$500,000</SelectItem>
                  <SelectItem value="750000">$750,000</SelectItem>
                  <SelectItem value="1000000">$1,000,000</SelectItem>
                  <SelectItem value="1500000">$1,500,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="beds">Beds</Label>
              <Select defaultValue="any">
                <SelectTrigger id="beds">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="baths">Baths</Label>
              <Select defaultValue="any">
                <SelectTrigger id="baths">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="type">Home Type</Label>
              <Select defaultValue="any">
                <SelectTrigger id="type">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="multi">Multi-Family</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button type="submit" className="w-full">Search Properties</Button>
          
          <div className="text-center text-xs text-muted-foreground">
            Powered by IDX Broker
          </div>
        </div>
      </CardContent>
    </Card>
  );
}