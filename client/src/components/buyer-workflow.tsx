
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Home, Check, ChevronsRight, Landmark,
  Square, Bed, Bath, ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type Step = 'situation' | 'financing' | 'design' | 'properties' | 'application' | 'service';

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
    propertyIntent: 'rent',
    budgetAmount: 3000,
    bedrooms: '',
    bathrooms: '',
    homeTypes: [],
    exactMatchBedrooms: false
  });

  // Handle down payment change
  const handleDownPaymentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, '');
    setDownPaymentAmount(Number(value) || 0);
  };

  // Handler for loan pre-approval
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
      case 'properties':
        onStepChange('design');
        break;
      case 'service':
        onStepChange('properties');
        break;
      default:
        break;
    }
  };

  const handleAmenitySelection = (amenityLabel: string) => {
    setSelection(prev => {
      const currentAmenities = prev.amenities || [];
      const updatedAmenities = currentAmenities.includes(amenityLabel)
        ? currentAmenities.filter((a: string) => a !== amenityLabel)
        : [...currentAmenities, amenityLabel];

      return {
        ...prev,
        amenities: updatedAmenities
      };
    });
  };

  const handleArchitecturalStyleSelection = (styleId: string) => {
    setSelection(prev => {
      const currentStyles = prev.architecturalStyles || [];
      const newStyles = currentStyles.includes(styleId)
        ? currentStyles.filter((s: string) => s !== styleId)
        : [...currentStyles, styleId];

      return {
        ...prev,
        architecturalStyles: newStyles
      };
    });
  };

  const handleInteriorStyleSelection = (styleId: string) => {
    setSelection(prev => {
      const currentStyles = prev.interiorStyles || [];
      const newStyles = currentStyles.includes(styleId)
        ? currentStyles.filter((s: string) => s !== styleId)
        : [...currentStyles, styleId];

      return {
        ...prev,
        interiorStyles: newStyles
      };
    });
  };

  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 'situation':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Tell us about your situation</h2>
            <p className="text-gray-500">Select one of the options below to continue</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer border-2 ${selection === 'down_payment' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                onClick={() => setSelection('down_payment')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full flex items-center justify-center w-10 h-10 ${selection === 'down_payment' ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                      <Home className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">I Have a Down Payment</p>
                      <p className="text-sm text-gray-500">I have money saved for a down payment</p>
                    </div>
                    {selection === 'down_payment' && <Check className="ml-auto text-primary h-5 w-5" />}
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer border-2 ${selection === 'need_mortgage' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                onClick={() => setSelection('need_mortgage')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full flex items-center justify-center w-10 h-10 ${selection === 'need_mortgage' ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                      <Landmark className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Need Mortgage Financing</p>
                      <p className="text-sm text-gray-500">I need to apply for mortgage financing</p>
                    </div>
                    {selection === 'need_mortgage' && <Check className="ml-auto text-primary h-5 w-5" />}
                  </div>
                </CardContent>
              </Card>
            </div>

            {selection === 'down_payment' && (
              <div className="mt-4 p-4 border rounded-lg">
                <Label className="block mb-2">Adjust your down payment amount</Label>
                <div className="space-y-4">
                  <input
                    type="range"
                    min={0}
                    max={500000}
                    step={5000}
                    value={downPaymentAmount}
                    onChange={(e) => setDownPaymentAmount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>$0</span>
                    <span>${downPaymentAmount.toLocaleString()}</span>
                    <span>$500,000</span>
                  </div>
                </div>
              </div>
            )}

            <Button 
              className="w-full md:w-auto"
              onClick={() => {
                if (selection === 'down_payment') {
                  setNeedsMortgage(false);
                  onStepChange('financing');
                } else if (selection === 'need_mortgage') {
                  setNeedsMortgage(true);
                  onStepChange('financing');
                } else {
                  toast({
                    title: "Selection Required",
                    description: "Please select one of the options to continue.",
                    variant: "destructive"
                  });
                }
              }}
            >
              Continue <ChevronsRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case 'financing':
        return needsMortgage ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Mortgage Financing Options</h2>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Available Options:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Conventional Loans (3-20% down)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>FHA Loans (3.5% down)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>VA Loans (0% down for veterans)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Jumbo Loans (10-20% down)</span>
                </li>
              </ul>
            </div>

            <Card className="border-2 border-green-100 bg-green-50">
              <CardContent className="p-4">
                <h3 className="font-medium text-green-800 mb-2">Quick Pre-Approval Process:</h3>
                <ul className="space-y-1 text-sm text-green-700">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Fast online application</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Soft credit check</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Pre-approval letter in 24hrs</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex flex-col md:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700" 
                onClick={handleLoanPreApproval}
              >
                Pre-Approve for a Loan Today
              </Button>

              <Button 
                className="flex-1" 
                variant="outline"
                onClick={() => onStepChange('design')}
              >
                Skip and Continue to Design Preferences
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Down Payment Amount</h2>

            <div className="space-y-3">
              <Label htmlFor="downPayment">Adjust your down payment amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input 
                  id="downPayment"
                  className="pl-8"
                  value={downPaymentAmount.toLocaleString()}
                  onChange={handleDownPaymentChange}
                />
              </div>
            </div>

            <RadioGroup defaultValue="conventional">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="conventional" id="conventional" />
                <Label htmlFor="conventional">Conventional purchase (cash)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partial" id="partial" />
                <Label htmlFor="partial">I may need additional financing</Label>
              </div>
            </RadioGroup>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button 
                className="w-full md:w-auto"
                onClick={() => onStepChange('design')}
              >
                Continue to Design Preferences <ChevronsRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 'design':
        return (
          <div className="space-y-8">
            {/* Property Basics Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Property Basics</h3>
              <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                {/* Rent or Buy Toggle */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Looking to</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={selection.propertyIntent === 'rent' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelection({...selection, propertyIntent: 'rent'})}
                    >
                      Rent
                    </Button>
                    <Button
                      type="button"
                      variant={selection.propertyIntent === 'buy' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelection({...selection, propertyIntent: 'buy'})}
                    >
                      Buy
                    </Button>
                  </div>
                </div>

                {/* Budget Slider */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    {selection.propertyIntent === 'rent' ? 'Monthly Rent Budget' : 'Purchase Budget'}
                  </Label>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min={selection.propertyIntent === 'rent' ? 1000 : 100000}
                      max={selection.propertyIntent === 'rent' ? 10000 : 2000000}
                      step={selection.propertyIntent === 'rent' ? 100 : 10000}
                      value={selection.budgetAmount || (selection.propertyIntent === 'rent' ? 3000 : 500000)}
                      onChange={(e) => setSelection({...selection, budgetAmount: Number(e.target.value)})}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>${selection.propertyIntent === 'rent' ? '1,000' : '100K'}</span>
                      <span className="font-medium text-primary">
                        ${(selection.budgetAmount || (selection.propertyIntent === 'rent' ? 3000 : 500000)).toLocaleString()}
                        {selection.propertyIntent === 'rent' ? '/month' : ''}
                      </span>
                      <span>${selection.propertyIntent === 'rent' ? '10,000' : '2M'}</span>
                    </div>
                  </div>
                </div>

                {/* Bedrooms */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Number of Bedrooms</Label>
                  <div className="flex gap-2 flex-wrap">
                    {['Studio', '1', '2', '3', '4', '5+'].map((bedroom) => (
                      <Button
                        key={bedroom}
                        type="button"
                        variant={selection.bedrooms === bedroom ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelection({...selection, bedrooms: bedroom})}
                        className="min-w-[60px]"
                      >
                        {bedroom}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      id="exact-match-bedrooms"
                      checked={selection.exactMatchBedrooms || false}
                      onChange={(e) => setSelection({...selection, exactMatchBedrooms: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="exact-match-bedrooms" className="text-sm">Use exact match</Label>
                  </div>
                </div>

                {/* Bathrooms */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Number of Bathrooms</Label>
                  <div className="flex gap-2 flex-wrap">
                    {['Any', '1+', '1.5+', '2+', '3+', '4+'].map((bathroom) => (
                      <Button
                        key={bathroom}
                        type="button"
                        variant={selection.bathrooms === bathroom ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelection({...selection, bathrooms: bathroom})}
                        className="min-w-[60px]"
                      >
                        {bathroom}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Home Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Home Type</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="deselect-all-home-types"
                        checked={!selection.homeTypes || selection.homeTypes.length === 0}
                        onChange={() => setSelection({...selection, homeTypes: []})}
                        className="rounded text-blue-600"
                      />
                      <Label htmlFor="deselect-all-home-types" className="text-sm text-blue-600 font-medium">Deselect All</Label>
                    </div>
                    
                    {['Houses', 'Apartments/Condos/Co-ops', 'Townhomes'].map((homeType) => (
                      <div key={homeType} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`home-type-${homeType}`}
                          checked={selection.homeTypes?.includes(homeType) || false}
                          onChange={(e) => {
                            const currentTypes = selection.homeTypes || [];
                            const updatedTypes = e.target.checked
                              ? [...currentTypes, homeType]
                              : currentTypes.filter(type => type !== homeType);
                            setSelection({...selection, homeTypes: updatedTypes});
                          }}
                          className="rounded text-blue-600"
                        />
                        <Label htmlFor={`home-type-${homeType}`} className="text-sm">{homeType}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4">Architectural Style (Select all that apply)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: "modern", label: "Modern/Contemporary", icon: Square },
                { id: "traditional", label: "Traditional", icon: Home },
                { id: "craftsman", label: "Craftsman", icon: Home },
                { id: "mediterranean", label: "Mediterranean", icon: Home },
                { id: "colonial", label: "Colonial", icon: ImageIcon },
                { id: "farmhouse", label: "Modern Farmhouse", icon: Home },
                { id: "ranch", label: "Ranch", icon: Home },
                { id: "victorian", label: "Victorian", icon: ImageIcon }
              ].map((style) => (
                <div
                  key={style.id}
                  onClick={() => handleArchitecturalStyleSelection(style.id)}
                  className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all ${
                    selection.architecturalStyles?.includes(style.id)
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    {<style.icon className="h-6 w-6 text-primary" />}
                  </div>
                  <p className="text-sm font-medium">{style.label}</p>
                  {selection.architecturalStyles?.includes(style.id) && (
                    <Check className="h-4 w-4 text-primary mx-auto mt-2" />
                  )}
                </div>
              ))}
            </div>

            <h2 className="text-xl font-semibold mb-4">Interior Style (Select all that apply)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: "minimalist", label: "Minimalist", icon: Square },
                { id: "contemporary", label: "Contemporary", icon: Bed },
                { id: "traditional", label: "Traditional", icon: Home },
                { id: "rustic", label: "Rustic", icon: Home },
                { id: "industrial", label: "Industrial", icon: Square },
                { id: "coastal", label: "Coastal", icon: Home },
                { id: "bohemian", label: "Bohemian", icon: ImageIcon },
                { id: "scandinavian", label: "Scandinavian", icon: Square }
              ].map((style) => (
                <div
                  key={style.id}
                  onClick={() => handleInteriorStyleSelection(style.id)}
                  className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all ${
                    selection.interiorStyles?.includes(style.id)
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    {<style.icon className="h-6 w-6 text-primary" />}
                  </div>
                  <p className="text-sm font-medium">{style.label}</p>
                  {selection.interiorStyles?.includes(style.id) && (
                    <Check className="h-4 w-4 text-primary mx-auto mt-2" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button onClick={() => {
                // Create IDX Broker URL with search parameters based on user selections
                const idxBaseUrl = "https://homesai.idxbroker.com/idx/results/listings?";
                const params = new URLSearchParams();

                // Add property basics if filled
                if (selection.propertyIntent && selection.budgetAmount) {
                  if (selection.propertyIntent === 'rent') {
                    params.append("rent_max", selection.budgetAmount.toString());
                  } else {
                    params.append("pt", "1"); // Property type for sale
                    params.append("hp", selection.budgetAmount.toString()); // High price
                  }
                }
                if (selection.bedrooms && selection.bedrooms !== 'Studio') {
                  if (selection.bedrooms === '5+') {
                    params.append("bd", "5");
                  } else {
                    params.append("bd", selection.bedrooms);
                  }
                }
                if (selection.bathrooms && selection.bathrooms !== 'Any') {
                  // Convert bathroom format (e.g., "2+" to "2")
                  const bathValue = selection.bathrooms.replace('+', '');
                  params.append("tb", bathValue);
                }
                if (selection.homeTypes?.length) {
                  // Map home types to IDX property type codes
                  const typeMapping: { [key: string]: string } = {
                    'Houses': 'SFR',
                    'Apartments/Condos/Co-ops': 'CONDO',
                    'Townhomes': 'TWNHS'
                  };
                  const idxTypes = selection.homeTypes.map(type => typeMapping[type]).filter(Boolean);
                  if (idxTypes.length > 0) {
                    params.append("pt", idxTypes.join(','));
                  }
                }

                // Add architectural styles if selected
                if (selection.architecturalStyles?.length) {
                  params.append("style", selection.architecturalStyles.join(","));
                }

                // Add interior styles if selected
                if (selection.interiorStyles?.length) {
                  params.append("interior", selection.interiorStyles.join(","));
                }

                // Add amenities if selected
                if (selection.amenities?.length) {
                  selection.amenities.forEach((amenity: string) => {
                    params.append("fea", amenity);
                  });
                }

                // Redirect to IDX Broker with search parameters
                window.location.href = idxBaseUrl + params.toString();
              }}>
                Continue to Properties <ChevronsRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 'properties':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">View Available Properties</h2>
            <p className="text-gray-500">Browse properties that match your criteria</p>

            <div className="flex flex-col space-y-4">
              <Button 
                className="w-full"
                onClick={onComplete}
              >
                Browse All Properties <ChevronsRight className="ml-2 h-4 w-4" />
              </Button>

              <Button 
                variant="outline" 
                className="w-full border-primary text-primary"
                onClick={() => onStepChange('service')}
              >
                Request Professional Services <ChevronsRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handleBack}>Back</Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'situation' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <p className="mt-2 text-xs text-center">Your Situation</p>
          </div>

          <div className="flex-1 h-1 bg-gray-200 mx-2"></div>

          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'financing' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
              2
            </div>
            <p className="mt-2 text-xs text-center">Financing</p>
          </div>

          <div className="flex-1 h-1 bg-gray-200 mx-2"></div>

          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'design' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
              3
            </div>
            <p className="mt-2 text-xs text-center">Design Preferences</p>
          </div>

          <div className="flex-1 h-1 bg-gray-200 mx-2"></div>

          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'properties' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
              4
            </div>
            <p className="mt-2 text-xs text-center">Properties</p>
          </div>

          <div className="flex-1 h-1 bg-gray-200 mx-2"></div>

          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'service' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
              5
            </div>
            <p className="mt-2 text-xs text-center">Services</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        {renderStepContent()}
      </div>
    </div>
  );
}
