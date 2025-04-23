import { useEffect, useState } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ServiceOffering as BaseServiceOffering } from '@shared/schema';
import { InfoIcon } from 'lucide-react';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Extend the ServiceOffering type to include the price field from API
interface ServiceOffering extends BaseServiceOffering {
  price?: string | number;
}

// Load Stripe outside of component to prevent recreating Stripe object on rerenders
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  services: ServiceOffering[];
  totalAmount: number;
}

function CheckoutForm({ onSuccess, onCancel, services, totalAmount }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-confirmation`,
        },
        // Always redirect to our payment confirmation page
        redirect: 'always',
      });

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          toast({
            title: 'Payment Failed',
            description: error.message || 'There was an issue with your payment',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Payment Error',
            description: 'An unexpected error occurred during payment processing',
            variant: 'destructive',
          });
        }
      } else {
        // Payment succeeded
        toast({
          title: 'Payment Successful',
          description: 'Thank you for your purchase!',
        });
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast({
        title: 'Payment Error',
        description: 'An unexpected error occurred during payment processing',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="font-medium text-lg">Payment Summary</div>
        
        <div className="space-y-2">
          {services.map(service => (
            <div key={service.id} className="flex justify-between text-sm">
              <span>{service.name}</span>
              <span>{service.priceDisplay || `$${(typeof service.price === 'string' ? parseFloat(service.price.replace(/[^0-9.]/g, '')) : service.price || 0).toFixed(2)}`}</span>
            </div>
          ))}
        </div>
        
        <Separator />
        
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
      </div>
      
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <InfoIcon size={16} className="mr-2 text-blue-500" />
            Test Mode Payment Information
          </CardTitle>
          <CardDescription>
            Use these test payment details to complete the transaction.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div>
            <span className="font-semibold">Card Number:</span> 4242 4242 4242 4242
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <div>
              <span className="font-semibold">Expiry:</span> Any future date
            </div>
            <div>
              <span className="font-semibold">CVC:</span> Any 3 digits
            </div>
            <div>
              <span className="font-semibold">ZIP:</span> Any 5 digits
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="rounded-lg border p-4">
        <PaymentElement />
      </div>
      
      <Accordion type="single" collapsible className="border rounded-lg">
        <AccordionItem value="help">
          <AccordionTrigger className="px-4">Need help with your payment?</AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              If you're having trouble, please try the following:
            </p>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>Make sure to enter the test card number exactly: 4242 4242 4242 4242</li>
              <li>Enter a future expiration date (e.g., 12/25)</li>
              <li>Use any 3 digits for the CVC code</li>
              <li>Use any 5 digits for the postal code (e.g., 10001)</li>
              <li>If you see "incorrect CVC" errors, try 123</li>
              <li>Refresh the page and try again if the form doesn't respond</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Back
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || !stripe || !elements}
          className="min-w-[120px]"
        >
          {isLoading ? 'Processing...' : `Pay $${totalAmount.toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
}

interface PaymentProcessorProps {
  services: ServiceOffering[];
  totalAmount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentProcessor({ 
  services, 
  totalAmount,
  onSuccess,
  onCancel
}: PaymentProcessorProps) {
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Create PaymentIntent as soon as the component loads
        const serviceIds = services.map(service => service.id);
        
        // Ensure amount is a valid number and meets Stripe's minimum requirement
        // Stripe requires the amount to be at least $0.50 USD
        const minimumAmount = 0.5;
        const safeAmount = typeof totalAmount === 'number' && !isNaN(totalAmount) && totalAmount > 0
          ? Math.max(minimumAmount, totalAmount) 
          : minimumAmount;
        
        console.log(`Creating payment intent for amount: $${safeAmount.toFixed(2)}`);
        
        const response = await apiRequest('POST', '/api/create-payment-intent', { 
          serviceIds,
          amount: safeAmount
        });
        
        // Handle non-OK responses
        if (!response.ok) {
          let errorMessage = 'Failed to create payment intent';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            // If JSON parsing fails, use the default error message
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        
        if (!data.clientSecret) {
          throw new Error('No client secret received from server');
        }
        
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        const errorMessage = error instanceof Error ? error.message : 'Payment setup failed. Please try again later.';
        setError(errorMessage);
        toast({
          title: 'Payment Setup Failed',
          description: errorMessage,
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (services.length > 0 && totalAmount > 0) {
      fetchPaymentIntent();
    } else {
      setIsLoading(false);
      setError('Invalid service selection or amount');
    }
  }, [services, totalAmount, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (error || !clientSecret) {
    return (
      <div className="flex flex-col justify-center items-center h-60 p-4 text-center">
        <div className="text-destructive mb-2 text-xl">
          <span className="inline-block rounded-full bg-destructive/10 p-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </span>
          <h3 className="font-medium">Payment Setup Failed</h3>
        </div>
        <p className="text-muted-foreground mb-4">
          {error || "Unable to initialize payment. Please try again later."}
        </p>
        <Button onClick={onCancel} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm 
        onSuccess={onSuccess}
        onCancel={onCancel}
        services={services}
        totalAmount={totalAmount}
      />
    </Elements>
  );
}