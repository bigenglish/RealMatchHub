import { useState } from 'react';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Card element styling
const cardStyle = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

interface PaymentFormProps {
  onSuccess?: () => void;
  amount?: number;
  planId?: number;
}

const PaymentFormContent = ({ onSuccess, amount = 99.99, planId }: PaymentFormProps) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!cardComplete) {
      setError('Please complete your card details');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment intent on the server
      const paymentIntentResponse = await apiRequest('POST', '/api/create-payment-intent', {
        amount: amount,
        planId: planId,
        userId: user?.uid || '',
        email: user?.email || ''
      });

      if (!paymentIntentResponse.ok) {
        const errorData = await paymentIntentResponse.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const paymentIntentData = await paymentIntentResponse.json();
      
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm the payment
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        paymentIntentData.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: user?.displayName || 'Unknown',
              email: user?.email || '',
            },
          },
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message || 'Payment confirmation failed');
      }

      if (paymentIntent.status === 'succeeded') {
        toast({
          title: 'Payment Successful!',
          description: 'Your payment has been processed successfully.',
        });
        if (onSuccess) onSuccess();
      } else if (paymentIntent.status === 'processing') {
        toast({
          title: 'Payment Processing',
          description: 'Your payment is being processed. We\'ll update you once it\'s complete.',
        });
        if (onSuccess) onSuccess();
      } else {
        throw new Error(`Payment status: ${paymentIntent.status}`);
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while processing your payment');
      toast({
        title: 'Payment Failed',
        description: error.message || 'There was a problem processing your payment',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="card-element" className="text-sm font-medium">
            Credit or Debit Card
          </label>
          <div className="rounded-md border border-input p-3 shadow-sm">
            <CardElement
              id="card-element"
              options={cardStyle}
              onChange={(e) => {
                setError(e.error ? e.error.message : '');
                setCardComplete(e.complete);
              }}
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || processing || !cardComplete}
      >
        {processing ? (
          <span className="flex items-center">
            <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
            Processing...
          </span>
        ) : (
          `Pay ${amount ? `$${amount.toFixed(2)}` : ''}`
        )}
      </Button>
      
      <p className="text-xs text-center text-muted-foreground">
        Your payment is secured through Stripe's encrypted payment processing.
      </p>
    </form>
  );
};

// Wrapper component that provides Stripe context
const PaymentForm = (props: PaymentFormProps) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};

export default PaymentForm;