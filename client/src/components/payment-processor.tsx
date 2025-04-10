import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { ArrowRight, CheckCircle, CreditCard, LockKeyhole } from 'lucide-react';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentDetails {
  name: string;
  email: string;
  amount: number;
  metadata?: Record<string, any>;
}

interface PaymentProcessorProps {
  serviceName: string;
  description: string;
  amount: number;
  currency?: string;
  onComplete?: (paymentId: string) => void;
  onCancel?: () => void;
}

// This component handles the Stripe integration and payment form
function CheckoutForm({ 
  amount, 
  serviceName, 
  onComplete, 
  onCancel 
}: {
  amount: number; 
  serviceName: string;
  onComplete?: (paymentId: string) => void;
  onCancel?: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    name: '',
    email: '',
    amount: amount,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    if (error) {
      elements.getElement('card')?.focus();
      return;
    }

    if (!cardComplete) {
      setError('Please complete your card details');
      return;
    }

    if (!paymentDetails.name) {
      setError('Please provide your name');
      return;
    }

    if (!paymentDetails.email) {
      setError('Please provide your email');
      return;
    }

    setProcessing(true);

    try {
      // Create a payment intent on the server
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        amount: paymentDetails.amount,
        metadata: {
          service: serviceName,
          customer_name: paymentDetails.name,
          customer_email: paymentDetails.email,
        }
      });

      const data = await response.json();

      if (!data.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Use client secret to confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: paymentDetails.name,
              email: paymentDetails.email,
            },
          },
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        setPaymentSucceeded(true);
        toast({
          title: "Payment Successful",
          description: `Thank you for your payment of $${(amount / 100).toFixed(2)}`,
        });
        
        if (onComplete) {
          onComplete(paymentIntent.id);
        }
      } else {
        throw new Error(`Payment status: ${paymentIntent.status}`);
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
      toast({
        title: "Payment Failed",
        description: err.message || 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
            autoComplete="name"
            value={paymentDetails.name}
            onChange={handleDetailsChange}
            disabled={paymentSucceeded || processing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            required
            autoComplete="email"
            value={paymentDetails.email}
            onChange={handleDetailsChange}
            disabled={paymentSucceeded || processing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="card-element">Card Details</Label>
          <div className="border rounded-md p-3">
            <CardElement
              id="card-element"
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
              onChange={(e) => {
                setError(e.error ? e.error.message : null);
                setCardComplete(e.complete);
              }}
              disabled={paymentSucceeded || processing}
            />
          </div>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <LockKeyhole className="h-4 w-4 mr-1" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-1">
            <img 
              src="https://cdn.sanity.io/images/kts928pd/production/98564ca376cfd89b14860501c06ab6f2b63f56b8-1000x607.png" 
              alt="Visa" 
              className="h-6" 
            />
            <img 
              src="https://cdn.sanity.io/images/kts928pd/production/326b306ec5c4fb136a9fe29fe08e8a20a82c9a8e-1000x618.png" 
              alt="Mastercard" 
              className="h-6" 
            />
            <img 
              src="https://cdn.sanity.io/images/kts928pd/production/49a69c2800ff1fc3be5c8642dd50d12a2fecac58-1000x287.png" 
              alt="American Express" 
              className="h-6" 
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        {!paymentSucceeded && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={processing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!stripe || processing || paymentSucceeded}
              className="flex-1"
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Processing...
                </span>
              ) : (
                <>Pay ${(amount / 100).toFixed(2)}</>
              )}
            </Button>
          </>
        )}
        {paymentSucceeded && (
          <Button
            type="button"
            onClick={() => onComplete && onComplete('success')}
            className="flex-1"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Continue
          </Button>
        )}
      </div>
    </form>
  );
}

export default function PaymentProcessor({
  serviceName,
  description,
  amount,
  currency = 'USD',
  onComplete,
  onCancel,
}: PaymentProcessorProps) {
  // Calculate amount in cents for Stripe
  const amountInCents = Math.round(amount * 100);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);

  if (paymentSucceeded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            Payment Successful
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Thank you for your payment of ${amount.toFixed(2)}.</p>
          <p className="mt-2">
            A confirmation email has been sent to your email address.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => onComplete && onComplete('success')} className="w-full">
            Continue
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          Payment Details
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Service</span>
            <span className="font-medium">{serviceName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount</span>
            <span className="text-lg font-bold">${amount.toFixed(2)} {currency}</span>
          </div>
        </div>
        <Separator className="my-4" />
        
        <Elements stripe={stripePromise}>
          <CheckoutForm 
            amount={amountInCents}
            serviceName={serviceName}
            onComplete={onComplete}
            onCancel={onCancel}
          />
        </Elements>
      </CardContent>
    </Card>
  );
}