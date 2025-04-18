import { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import SellerWorkflow, { SellerStep } from '@/components/seller-workflow';
import { useToast } from '@/hooks/use-toast';

export default function SellerFlow() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/seller-flow/:step');
  const { toast } = useToast();
  
  // Get initial step from URL if available, otherwise start at 'intent'
  const initialStep = params?.step as SellerStep || 'intent';
  const [currentStep, setCurrentStep] = useState<SellerStep>(initialStep);
  
  const handleStepChange = (step: SellerStep) => {
    setCurrentStep(step);
    // Update URL to reflect current step
    setLocation(`/seller-flow/${step}`, { replace: true });
  };
  
  const handleComplete = () => {
    toast({
      title: "Listing Published",
      description: "Your property listing has been successfully published!",
      variant: "default",
    });
    
    // Redirect to the properties page with a success query param
    setLocation('/properties?published=success');
  };
  
  return (
    <div className="container mx-auto py-8">
      <SellerWorkflow
        currentStep={currentStep}
        onStepChange={handleStepChange}
        onComplete={handleComplete}
      />
    </div>
  );
}