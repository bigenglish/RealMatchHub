import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LockClosedIcon } from 'lucide-react';

interface PaymentFormProps {
  onSuccess: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin, // Backup return URL in case the flow is interrupted
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'An error occurred with your payment');
        toast({
          title: 'Payment Failed',
          description: error.message || 'Your payment could not be processed. Please try again.',
          variant: 'destructive',
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: 'Payment Successful',
          description: 'Your payment has been processed successfully!',
        });
        onSuccess();
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An unexpected error occurred');
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <PaymentElement options={{ 
          layout: { 
            type: 'tabs',
            defaultCollapsed: false 
          }
        }} />
      </div>

      {errorMessage && (
        <div className="text-red-500 bg-red-50 p-3 rounded-md text-sm mb-4">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <LockClosedIcon className="h-4 w-4 mr-1" />
          Secure payment
        </div>
        <Button 
          type="submit" 
          disabled={!stripe || !elements || isLoading}
          className="bg-blue-600 hover:bg-blue-700 px-6"
        >
          {isLoading ? 'Processing...' : 'Complete Payment'}
        </Button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        By completing this purchase, you agree to our 
        <a href="/terms" className="text-blue-600 hover:underline mx-1">Terms of Service</a> 
        and acknowledge our 
        <a href="/privacy" className="text-blue-600 hover:underline mx-1">Privacy Policy</a>.
      </div>
    </form>
  );
};

export default PaymentForm;