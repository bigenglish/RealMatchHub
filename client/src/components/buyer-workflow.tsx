import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Check, ChevronsRight, Home, Landmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type Step = 'situation' | 'financing' | 'properties' | 'application';

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
  const [selection, setSelection] = useState<string | null>(null);

  // Helper to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Handle down payment change
  const handleDownPaymentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, '');
    setDownPaymentAmount(Number(value) || 0);
  };

  // Handler for loan pre-approval
  const handleLoanPreApproval = () => {
    // Navigate to Fast Online Application
    window.location.href = '/fast-online-application';
  };

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'situation':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Tell us about your situation</h2>
            <p className="text-gray-500">Select all that apply to you</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className={`cursor-pointer border-2 ${selection === 'down_payment' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                onClick={() => setSelection('down_payment')}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`rounded-full flex items-center justify-center w-10 h-10 ${selection === 'down_payment' ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                    <Home className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Down Payment Amount</p>
                    <p className="text-sm text-gray-500">I have money saved for a down payment</p>
                  </div>
                  {selection === 'down_payment' && <Check className="ml-auto text-primary h-5 w-5" />}
                </CardContent>
              </Card>
              
              <Card className={`cursor-pointer border-2 ${selection === 'need_mortgage' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                onClick={() => setSelection('need_mortgage')}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`rounded-full flex items-center justify-center w-10 h-10 ${selection === 'need_mortgage' ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Need Mortgage Financing</p>
                    <p className="text-sm text-gray-500">I need to apply for mortgage financing</p>
                  </div>
                  {selection === 'need_mortgage' && <Check className="ml-auto text-primary h-5 w-5" />}
                </CardContent>
              </Card>
            </div>
            
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
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>First-Time Homebuyer Programs</span>
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
                    <span>Multiple lender comparison</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Custom rate quotes</span>
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
                className="flex-1 bg-green-600 hover:bg-green-700" 
                onClick={handleLoanPreApproval}
              >
                Pre-Approve for a Loan Today
              </Button>
              
              <Button 
                className="flex-1" 
                variant="outline"
                onClick={() => onStepChange('properties')}
              >
                Skip and Continue to Properties
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
            
            <div className="pt-4">
              <Button 
                className="w-full md:w-auto"
                onClick={() => onStepChange('properties')}
              >
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
            
            <Button 
              className="w-full"
              onClick={onComplete}
            >
              Browse All Properties <ChevronsRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
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
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'financing' ? 'bg-primary text-white' : currentStep === 'properties' || currentStep === 'application' ? 'bg-gray-200' : 'bg-gray-100 text-gray-400'}`}>
              2
            </div>
            <p className="mt-2 text-xs text-center">Financing</p>
          </div>
          
          <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
          
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'properties' || currentStep === 'application' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
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