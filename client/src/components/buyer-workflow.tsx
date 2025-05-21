import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Home, Check, ChevronsRight, Landmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type Step = 'situation' | 'financing' | 'design' | 'properties' | 'services';

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
    amenities: []
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
      case 'properties':
        onStepChange('design');
        break;
      case 'services':
        onStepChange('properties');
        break;
      default:
        break;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button 
        onClick={handleBack}
        className="mb-4 flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {['situation', 'financing', 'design', 'properties', 'services'].map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === step ? 'bg-primary text-white' : 'bg-gray-200'
                }`}>
                  {index + 1}
                </div>
                <p className="mt-2 text-xs text-center">
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </p>
              </div>
              {index < 4 && <div className="flex-1 h-1 bg-gray-200 mx-2"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        {currentStep === 'situation' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Tell us about your situation</h2>
            <p className="text-gray-500">Select all that apply to you</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className={`p-4 cursor-pointer hover:border-primary ${selection === 'need_mortgage' ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => setSelection('need_mortgage')}
              >
                <div className="flex items-center gap-3">
                  <Landmark className="h-5 w-5 text-gray-600" />
                  <div className="flex-1">
                    <p className="font-medium">I need a mortgage</p>
                    <p className="text-sm text-gray-500">Get pre-approved today</p>
                  </div>
                  {selection === 'need_mortgage' && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </Card>

              <Card 
                className={`p-4 cursor-pointer hover:border-primary ${selection === 'down_payment' ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => setSelection('down_payment')}
              >
                <div className="flex items-center gap-3">
                  <Home className="h-5 w-5 text-gray-600" />
                  <div className="flex-1">
                    <p className="font-medium">I have a down payment</p>
                    <p className="text-sm text-gray-500">Ready to make an offer</p>
                  </div>
                  {selection === 'down_payment' && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </Card>
            </div>

            <Button 
              className="w-full md:w-auto"
              onClick={() => {
                if (selection) {
                  setNeedsMortgage(selection === 'need_mortgage');
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
        )}

        {currentStep === 'financing' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">
              {needsMortgage ? 'Mortgage Financing Options' : 'Down Payment Amount'}
            </h2>

            {needsMortgage ? (
              <>
                <div className="space-y-4">
                  <Card className="p-6">
                    <h3 className="text-lg font-medium mb-2">Get Pre-Approved Today</h3>
                    <p className="text-gray-600 mb-4">
                      Complete our fast online application to get matched with the right mortgage options for you.
                    </p>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700" 
                      onClick={handleLoanPreApproval}
                    >
                      Start Pre-Approval
                    </Button>
                  </Card>
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => onStepChange('situation')}
                  >
                    Back
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => onStepChange('design')}
                  >
                    Skip Pre-Approval <ChevronsRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <Label>Enter your down payment amount</Label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <Input
                        type="text"
                        className="pl-7 pr-12"
                        value={downPaymentAmount.toLocaleString()}
                        onChange={handleDownPaymentChange}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full md:w-auto"
                  onClick={() => onStepChange('design')}
                >
                  Continue <ChevronsRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )}

        {currentStep === 'design' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Design Preferences</h2>
            <p className="text-gray-500">Help us understand your style</p>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Architectural Style</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    'Modern',
                    'Traditional',
                    'Craftsman',
                    'Colonial',
                    'Mediterranean',
                    'Ranch',
                    'Victorian',
                    'Contemporary'
                  ].map((style) => (
                    <Card 
                      key={style}
                      className={`cursor-pointer hover:border-primary transition-colors ${
                        selection.architecturalStyles.includes(style) ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => {
                        setSelection(prev => ({
                          ...prev,
                          architecturalStyles: prev.architecturalStyles.includes(style)
                            ? prev.architecturalStyles.filter(s => s !== style)
                            : [...prev.architecturalStyles, style]
                        }));
                      }}
                    >
                      <CardContent className="flex items-center justify-center p-4 text-center">
                        <p className="text-sm font-medium">{style}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Interior Style</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    'Minimalist',
                    'Modern',
                    'Traditional',
                    'Industrial',
                    'Rustic',
                    'Coastal',
                    'Bohemian',
                    'Scandinavian'
                  ].map((style) => (
                    <Card 
                      key={style}
                      className={`cursor-pointer hover:border-primary transition-colors ${
                        selection.interiorStyles.includes(style) ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => {
                        setSelection(prev => ({
                          ...prev,
                          interiorStyles: prev.interiorStyles.includes(style)
                            ? prev.interiorStyles.filter(s => s !== style)
                            : [...prev.interiorStyles, style]
                        }));
                      }}
                    >
                      <CardContent className="flex items-center justify-center p-4 text-center">
                        <p className="text-sm font-medium">{style}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <Button 
              className="w-full md:w-auto"
              onClick={() => onStepChange('properties')}
            >
              Continue to Properties <ChevronsRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {currentStep === 'properties' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Property Preferences</h2>
            <p className="text-gray-500">Select the amenities that matter most to you</p>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <Label>Bedrooms</Label>
                  <Select 
                    onValueChange={(value) => setSelection(prev => ({...prev, bedrooms: parseInt(value)}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bedrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1+ Bedrooms</SelectItem>
                      <SelectItem value="2">2+ Bedrooms</SelectItem>
                      <SelectItem value="3">3+ Bedrooms</SelectItem>
                      <SelectItem value="4">4+ Bedrooms</SelectItem>
                      <SelectItem value="5">5+ Bedrooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Bathrooms</Label>
                  <Select
                    onValueChange={(value) => setSelection(prev => ({...prev, bathrooms: parseFloat(value)}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bathrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1+ Bathrooms</SelectItem>
                      <SelectItem value="1.5">1.5+ Bathrooms</SelectItem>
                      <SelectItem value="2">2+ Bathrooms</SelectItem>
                      <SelectItem value="2.5">2.5+ Bathrooms</SelectItem>
                      <SelectItem value="3">3+ Bathrooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Price Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      className="w-1/2"
                      onChange={(e) => setSelection(prev => ({
                        ...prev, 
                        priceRange: {...prev.priceRange, min: parseInt(e.target.value)}
                      }))}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      className="w-1/2"
                      onChange={(e) => setSelection(prev => ({
                        ...prev,
                        priceRange: {...prev.priceRange, max: parseInt(e.target.value)}
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Must-Have Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    'Garage',
                    'Pool',
                    'Garden',
                    'Basement',
                    'Modern Kitchen',
                    'Home Office',
                    'Smart Home',
                    'Security System',
                    'Solar Panels'
                  ].map((amenity) => (
                    <Card 
                      key={amenity}
                      className={`cursor-pointer hover:border-primary transition-colors ${
                        selection.amenities.includes(amenity) ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => {
                        setSelection(prev => ({
                          ...prev,
                          amenities: prev.amenities.includes(amenity)
                            ? prev.amenities.filter(a => a !== amenity)
                            : [...prev.amenities, amenity]
                        }));
                      }}
                    >
                      <CardContent className="flex items-center justify-center p-4 text-center">
                        <p className="text-sm font-medium">{amenity}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <Button 
              className="w-full md:w-auto"
              onClick={() => onStepChange('services')}
            >
              Continue to Services <ChevronsRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {currentStep === 'services' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Additional Services</h2>
            <p className="text-gray-500">Select any additional services you may need</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Home Inspection',
                'Moving Services',
                'Home Insurance',
                'Legal Services',
                'Home Warranty',
                'Property Management'
              ].map((service) => (
                <Card 
                  key={service}
                  className="p-4 cursor-pointer hover:border-primary"
                  onClick={() => {
                    // Handle service selection
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium">{service}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button 
              className="w-full"
              onClick={onComplete}
            >
              Complete & View Properties <ChevronsRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}