import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ChevronsRight, Home, DollarSign, Heart } from 'lucide-react';

export type Step = 'situation' | 'financing' | 'design';

interface BuyerWorkflowProps {
  currentStep: Step;
  onStepChange: (step: Step) => void;
  onComplete: () => void;
  downPaymentAmount?: number;
  setDownPaymentAmount: (amount: number) => void;
  needsMortgage?: boolean;
  setNeedsMortgage: (needs: boolean) => void;
}

export default function BuyerWorkflow({
  currentStep,
  onStepChange,
  onComplete,
  downPaymentAmount = 0,
  setDownPaymentAmount,
  needsMortgage = false,
  setNeedsMortgage
}: BuyerWorkflowProps) {
  const { toast } = useToast();
  const [selection, setSelection] = useState<any>({
    architecturalStyles: [],
    interiorStyles: [],
    amenities: [],
    bedrooms: null,
    bathrooms: null,
    priceRange: { min: 200000, max: 800000 }
  });

  const handleDownPaymentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, '');
    setDownPaymentAmount(Number(value) || 0);
  };

  const handleLoanPreApproval = () => {
    window.location.href = '/fast-online-application';
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'financing':
        onStepChange('situation');
        break;
      case 'design':
        onStepChange('financing');
        break;
      default:
        break;
    }
  };

  const handleStyleToggle = (category: string, style: string) => {
    setSelection((prev: any) => ({
      ...prev,
      [category]: prev[category].includes(style)
        ? prev[category].filter((s: string) => s !== style)
        : [...prev[category], style]
    }));
  };

  if (currentStep === 'situation') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Home className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Tell us about your situation</h2>
          <p className="text-gray-600">Help us understand your housing needs</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Property Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base font-medium">How many bedrooms?</Label>
              <RadioGroup
                value={selection.bedrooms}
                onValueChange={(value) => setSelection({...selection, bedrooms: value})}
                className="grid grid-cols-3 gap-4 mt-2"
              >
                {['Studio', '1', '2', '3', '4', '5+'].map((bedroom) => (
                  <div key={bedroom} className="flex items-center space-x-2">
                    <RadioGroupItem value={bedroom} id={`bed-${bedroom}`} />
                    <Label htmlFor={`bed-${bedroom}`}>{bedroom}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">How many bathrooms?</Label>
              <RadioGroup
                value={selection.bathrooms}
                onValueChange={(value) => setSelection({...selection, bathrooms: value})}
                className="grid grid-cols-3 gap-4 mt-2"
              >
                {['1', '1.5', '2', '2.5', '3', '3+'].map((bathroom) => (
                  <div key={bathroom} className="flex items-center space-x-2">
                    <RadioGroupItem value={bathroom} id={`bath-${bathroom}`} />
                    <Label htmlFor={`bath-${bathroom}`}>{bathroom}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Price Range</Label>
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Min: ${selection.priceRange.min?.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">Max: ${selection.priceRange.max?.toLocaleString()}</span>
                </div>
                <div className="space-y-2">
                  <Input
                    type="range"
                    min={100000}
                    max={2000000}
                    step={50000}
                    value={selection.priceRange.min}
                    onChange={(e) => setSelection({
                      ...selection,
                      priceRange: { ...selection.priceRange, min: Number(e.target.value) }
                    })}
                    className="w-full"
                  />
                  <Input
                    type="range"
                    min={200000}
                    max={2500000}
                    step={50000}
                    value={selection.priceRange.max}
                    onChange={(e) => setSelection({
                      ...selection,
                      priceRange: { ...selection.priceRange, max: Number(e.target.value) }
                    })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => onStepChange('financing')}>
            Next: Financing <ChevronsRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 'financing') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <DollarSign className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Financing Options</h2>
          <p className="text-gray-600">Let's discuss your financing preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mortgage Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mortgage"
                checked={needsMortgage}
                onCheckedChange={setNeedsMortgage}
              />
              <Label htmlFor="mortgage">I need mortgage financing</Label>
            </div>

            {needsMortgage && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="downPayment">Down payment amount</Label>
                  <Input
                    id="downPayment"
                    type="text"
                    value={`$${downPaymentAmount.toLocaleString()}`}
                    onChange={handleDownPaymentChange}
                    placeholder="Enter down payment amount"
                  />
                </div>
                <Button onClick={handleLoanPreApproval} className="w-full">
                  Get Pre-Approved Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>Back</Button>
          <Button onClick={() => onStepChange('design')}>
            Next: Design Preferences <ChevronsRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 'design') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Heart className="mx-auto h-12 w-12 text-pink-600 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Design & Style Preferences</h2>
          <p className="text-gray-600">Tell us about your style preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Architectural Styles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                'Modern', 'Traditional', 'Contemporary', 'Colonial', 
                'Craftsman', 'Mediterranean', 'Victorian', 'Ranch'
              ].map((style) => (
                <div
                  key={style}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selection.architecturalStyles.includes(style)
                      ? 'bg-blue-50 border-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleStyleToggle('architecturalStyles', style)}
                >
                  <div className="text-sm font-medium">{style}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interior Styles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                'Minimalist', 'Rustic', 'Industrial', 'Scandinavian',
                'Bohemian', 'Art Deco', 'Mid-Century', 'Farmhouse'
              ].map((style) => (
                <div
                  key={style}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selection.interiorStyles.includes(style)
                      ? 'bg-blue-50 border-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleStyleToggle('interiorStyles', style)}
                >
                  <div className="text-sm font-medium">{style}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleBack}>Back</Button>
          <Button onClick={() => {
            // Create IDX Broker URL with search parameters based on user selections
            const idxBaseUrl = "https://homesai.idxbroker.com/idx/results/listings?";
            const params = new URLSearchParams();
            
            // Add required IDX parameters for property search
            params.append("idxID", "d025");
            params.append("pt", "1"); // Property Type Residential
            
            // Add price range parameters
            if (selection.priceRange?.min) {
              params.append("lp", selection.priceRange.min.toString()); // Low Price
            }
            if (selection.priceRange?.max) {
              params.append("hp", selection.priceRange.max.toString()); // High Price
            }
            
            // Add default price range if none specified
            if (!selection.priceRange?.min && !selection.priceRange?.max) {
              params.append("lp", "200000"); // Default low price 200K
              params.append("hp", "800000"); // Default high price 800K
            }
            
            if (selection.bedrooms) {
              params.append("beds", selection.bedrooms);
            }
            if (selection.bathrooms) {
              params.append("baths", selection.bathrooms);
            }

            // Add architectural styles if selected
            if (selection.architecturalStyles?.length) {
              params.append("a_style", selection.architecturalStyles.join(","));
            }

            // Add amenities if selected
            if (selection.amenities?.length) {
              selection.amenities.forEach((amenity: string) => {
                params.append("fea", amenity);
              });
            }

            // Create final URL
            const finalUrl = `${idxBaseUrl}${params.toString()}`;
            console.log('Redirecting to IDX Broker:', finalUrl);
            
            // Open in new window to preserve user's place in our app
            window.open(finalUrl, '_blank');
            
            // Also call onComplete to mark workflow as done
            onComplete();
          }}>
            Continue to Properties <ChevronsRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}