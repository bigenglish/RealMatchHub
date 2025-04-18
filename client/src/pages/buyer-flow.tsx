import React, { useState } from 'react';
import { useLocation } from 'wouter';
import BuyerWorkflow, { Step } from '@/components/buyer-workflow-fixed';

export default function BuyerFlow() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<Step>('situation');
  const [downPaymentAmount, setDownPaymentAmount] = useState<number>(100000);
  const [needsMortgage, setNeedsMortgage] = useState<boolean>(false);

  const handleStepChange = (step: Step) => {
    setCurrentStep(step);
    
    // Scroll to top on step change
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleComplete = () => {
    // Redirect to properties page
    setLocation('/properties');
  };

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Your Dream Property</h1>
        <p className="text-gray-600">Tell us about you — we'll recommend the right solution.</p>
        <div className="text-sm text-gray-500 mt-2">Step {currentStep === 'situation' ? 1 : currentStep === 'financing' ? 2 : 3} of 3</div>
      </div>

      <BuyerWorkflow 
        currentStep={currentStep}
        onStepChange={handleStepChange}
        onComplete={handleComplete}
        downPaymentAmount={downPaymentAmount}
        setDownPaymentAmount={setDownPaymentAmount}
        needsMortgage={needsMortgage}
        setNeedsMortgage={setNeedsMortgage}
      />

      <div className="text-center mt-6">
        <button 
          onClick={() => setLocation('/properties')}
          className="text-gray-500 text-sm hover:underline"
        >
          Skip and continue to all properties
        </button>
      </div>
    </div>
  );
}