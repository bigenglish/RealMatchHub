import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Home, Check, ChevronsRight, Landmark, Upload,
  Bed, Bath, ImageIcon, Square, Building,
  CheckSquare, MapPin, Calendar, Clock,
  Truck, ArrowUpDown, DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type Step = 'situation' | 'financing' | 'design' | 'properties' | 'services';

interface BuyerWorkflowProps {
  currentStep: Step;
  onStepChange: (step: Step) => void;
  onComplete: () => void;
  isSelling?: boolean;
  downPaymentAmount?: number;
  setDownPaymentAmount: (amount: number) => void;
  needsMortgage?: boolean;
  setNeedsMortgage: (needs: boolean) => void;
}

export default function BuyerWorkflow({
  currentStep,
  onStepChange,
  onComplete,
  isSelling = false,
  downPaymentAmount = 0,
  setDownPaymentAmount,
  needsMortgage = false,
  setNeedsMortgage
}: BuyerWorkflowProps) {
  const { toast } = useToast();
  const [selection, setSelection] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [inspirationUrl, setInspirationUrl] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setUploadedFiles(Array.from(event.target.files));
    }
  };

  const handleAddUrl = () => {
    if (inspirationUrl) {
      // Handle URL addition logic
      setInspirationUrl('');
    }
  };

  const handleDownPaymentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, '');
    setDownPaymentAmount(Number(value) || 0);
  };

  const handleLoanPreApproval = () => {
    window.location.href = '/fast-online-application';
  };

  const renderStepContent = () => {
    if (isSelling) {
      switch (currentStep) {
        case 'situation':
          return (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Tell us about your situation</h2>
              <p className="text-gray-500">Select all that apply to you</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 hover:border-primary cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium">Property Type</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:border-primary cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Square className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium">Size (SF)</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:border-primary cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Bed className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium">Number of Bedrooms</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:border-primary cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Bath className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium">Number of Bathrooms</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:border-primary cursor-pointer">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium">Property Photos/Videos</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:border-primary cursor-pointer">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium">Property Features/Amenities</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:border-primary cursor-pointer">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium">Property Address/Location</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:border-primary cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium">Specific Timeline</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:border-primary cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium">Urgency to Sell</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:border-primary cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium">Relocating</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:border-primary cursor-pointer">
                  <div className="flex items-center gap-3">
                    <ArrowUpDown className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium">Upgrading/Downsizing</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:border-primary cursor-pointer">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium">Financial Reasons</p>
                    </div>
                  </div>
                </Card>
              </div>

              <Button 
                className="w-full md:w-auto"
                onClick={() => onStepChange('preferences')}
              >
                Continue <ChevronsRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="text-center mt-4">
                <button 
                  onClick={onComplete}
                  className="text-gray-500 text-sm hover:underline"
                >
                  Skip and continue to all properties
                </button>
              </div>
            </div>
          );

        case 'preferences':
          return (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Tell us about your design preferences</h2>
              <p className="text-gray-500">Help us understand your style to find properties that match your taste</p>

              <div className="space-y-4">
                <div className="mb-6">
                  <Label className="block text-sm font-medium mb-2">Upload Inspiration Images</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG or WEBP (max 5MB)</p>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <Label className="block text-sm font-medium mb-2">Add Inspiration URLs</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Share links to properties or design inspiration you love"
                      value={inspirationUrl}
                      onChange={(e) => setInspirationUrl(e.target.value)}
                    />
                    <Button variant="secondary" onClick={handleAddUrl}>Add</Button>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Architectural Style</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      'Modern/Contemporary',
                      'Traditional',
                      'Craftsman',
                      'Mediterranean',
                      'Colonial',
                      'Modern Farmhouse',
                      'Ranch',
                      'Victorian'
                    ].map((style) => (
                      <Card 
                        key={style}
                        className="cursor-pointer hover:border-primary transition-colors"
                      >
                        <CardContent className="flex items-center justify-center p-4 text-center">
                          <div>
                            <div className="mx-auto w-10 h-10 flex items-center justify-center mb-2">
                              <Home className="w-6 h-6 text-gray-600" />
                            </div>
                            <div className="text-sm font-medium">{style}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Interior Style</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      'Minimalist',
                      'Contemporary',
                      'Traditional',
                      'Rustic',
                      'Industrial',
                      'Coastal',
                      'Bohemian',
                      'Scandinavian'
                    ].map((style) => (
                      <Card 
                        key={style}
                        className="cursor-pointer hover:border-primary transition-colors"
                      >
                        <CardContent className="flex items-center justify-center p-4 text-center">
                          <div>
                            <div className="mx-auto w-10 h-10 flex items-center justify-center mb-2">
                              <Home className="w-6 h-6 text-gray-600" />
                            </div>
                            <div className="text-sm font-medium">{style}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={onComplete}
                >
                  Continue to Properties <ChevronsRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          );

        default:
          return null;
      }
    } else {
      switch (currentStep) {
        case 'situation':
          return (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Tell us about your situation</h2>
              <p className="text-gray-500">Select all that apply to you</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 hover:border-primary cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium">Property Type</p>
                    </div>
                  </div>
                </Card>
                {/* ...rest of the situation cards... */}
                <Card className="p-4 hover:border-primary cursor-pointer">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium">Financial Reasons</p>
                    </div>
                  </div>
                </Card>
              </div>
              {/* ...rest of the situation section... */}
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
              {/* ...rest of the financing section for needsMortgage... */}
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700" 
                onClick={handleLoanPreApproval}
              >
                Pre-Approve for a Loan Today
              </Button>
              {/* ...rest of the financing section buttons... */}
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Down Payment Amount</h2>
              {/* ...rest of the financing section for !needsMortgage... */}
              <Button 
                className="w-full md:w-auto"
                onClick={() => onStepChange('properties')}
              >
                Continue to Properties <ChevronsRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          );
        case 'properties':
          return (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Tell us about your design preferences</h2>
              <p className="text-gray-500">Help us understand your style to find properties that match your taste</p>
              {/* ...rest of the properties section... */}
              <Button 
                className="w-full"
                onClick={onComplete}
              >
                Browse Properties <ChevronsRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          );
        default:
          return null;
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button 
        onClick={() => window.history.back()}
        className="mb-4 flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      {/* Step indicator */}
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
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'financing' || currentStep === 'preferences'? 'bg-primary text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <p className="mt-2 text-xs text-center">{isSelling ? 'Design Preferences' : 'Financing'}</p>
          </div>

          <div className="flex-1 h-1 bg-gray-200 mx-2"></div>

          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'properties' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
              3
            </div>
            <p className="mt-2 text-xs text-center">Properties</p>
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        {renderStepContent()}
      </div>
    </div>
  );
}