import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Form schema
const paymentFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  onSuccess: () => void;
}

// The wrapper component that provides Stripe Elements context
const PaymentForm = ({ onSuccess }: PaymentFormProps) => {
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Initial form values from the user context
  const defaultValues: Partial<PaymentFormValues> = {
    name: user?.displayName || '',
    email: user?.email || '',
  };
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      setIsLoading(true);
      
      // Create a payment intent
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        amount: 99.99, // This would normally come from the selected plan
        userId: user?.uid,
        email: data.email,
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }
      
      const { clientSecret } = await response.json();
      setClientSecret(clientSecret);
      
    } catch (error) {
      console.error('Payment form error:', error);
      toast({
        title: 'Payment Setup Error',
        description: 'There was a problem setting up the payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {!clientSecret ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Continue to Payment'}
            </Button>
          </form>
        </Form>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <StripePaymentForm onSuccess={onSuccess} />
        </Elements>
      )}
    </div>
  );
};

// The inner component that handles the actual Stripe payment
const StripePaymentForm = ({ onSuccess }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/payment-confirmation',
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: 'Payment Failed',
          description: error.message || 'An error occurred during payment processing.',
          variant: 'destructive',
        });
      } else {
        // Payment succeeded
        toast({
          title: 'Payment Successful',
          description: 'Your payment was processed successfully.',
        });
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast({
        title: 'Payment Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <PaymentElement />
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || !elements || isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </Button>
      
      <p className="text-center text-muted-foreground text-sm mt-4">
        Your payment is secure and encrypted. We don't store your card details.
      </p>
    </form>
  );
};

export default PaymentForm;