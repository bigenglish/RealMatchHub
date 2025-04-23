import { useEffect, useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function PaymentConfirmation() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Get current URL and extract query parameters
    const query = new URLSearchParams(window.location.search);
    const paymentIntent = query.get('payment_intent');
    const paymentIntentClientSecret = query.get('payment_intent_client_secret');
    const redirectStatus = query.get('redirect_status');
    
    const initialize = async () => {
      if (!paymentIntent || !paymentIntentClientSecret) {
        setStatus('error');
        setMessage('Missing payment information');
        return;
      }
      
      setPaymentIntentId(paymentIntent);
      
      // Check the redirect status from Stripe
      if (redirectStatus === 'succeeded') {
        setStatus('success');
        setMessage('Your payment was successful! Thank you for your purchase.');
        toast({
          title: 'Payment Successful',
          description: 'Thank you for your purchase!',
        });
      } else if (redirectStatus === 'processing') {
        setStatus('success');
        setMessage('Your payment is processing. We\'ll update you when it completes.');
        toast({
          title: 'Payment Processing',
          description: 'Your payment is being processed.',
        });
      } else if (redirectStatus === 'requires_payment_method') {
        setStatus('error');
        setMessage('Your payment was not successful, please try again.');
        toast({
          title: 'Payment Failed',
          description: 'Your payment was not successful, please try again.',
          variant: 'destructive',
        });
      } else {
        setStatus('error');
        setMessage('Something went wrong with your payment. Please try again.');
        toast({
          title: 'Payment Error',
          description: 'Something went wrong with your payment.',
          variant: 'destructive',
        });
      }
    };
    
    initialize();
  }, [toast]);
  
  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-card rounded-lg shadow-lg p-8 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4" />
            <h1 className="text-2xl font-bold">Processing Payment</h1>
            <p className="text-muted-foreground mt-2">Please wait while we confirm your payment...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="flex flex-col items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-green-700">Payment Successful</h1>
            <p className="text-muted-foreground mt-2 mb-6">{message}</p>
            {paymentIntentId && (
              <p className="text-sm text-muted-foreground mb-6">
                Payment ID: {paymentIntentId.slice(0, 8)}...
              </p>
            )}
            <div className="space-y-4 w-full">
              <Button className="w-full" asChild>
                <Link href="/services">Browse More Services</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="flex flex-col items-center justify-center">
            <XCircle className="w-16 h-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold text-destructive">Payment Failed</h1>
            <p className="text-muted-foreground mt-2 mb-6">{message}</p>
            <div className="space-y-4 w-full">
              <Button className="w-full" asChild>
                <Link href="/services">Try Again</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}