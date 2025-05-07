import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from '@/hooks/use-toast';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentConfirmation = () => {
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'error' | 'processing' | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      // Get the query parameters from the URL
      const query = new URLSearchParams(window.location.search);
      const paymentIntentId = query.get('payment_intent');
      const paymentIntentClientSecret = query.get('payment_intent_client_secret');
      const redirectStatus = query.get('redirect_status');

      // If there's no payment intent, we can't check status
      if (!paymentIntentId || !paymentIntentClientSecret) {
        setPaymentStatus('error');
        setPaymentError('Invalid payment information');
        return;
      }

      try {
        // Use Stripe to confirm the payment result
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Could not initialize Stripe');
        }

        if (redirectStatus === 'succeeded') {
          setPaymentStatus('success');
          toast({
            title: 'Payment Successful',
            description: 'Your payment has been processed successfully.',
          });
        } else if (redirectStatus === 'processing') {
          setPaymentStatus('processing');
        } else {
          // Try to retrieve the payment intent directly
          const { paymentIntent, error } = await stripe.retrievePaymentIntent(paymentIntentClientSecret);
          
          if (error) {
            throw new Error(error.message);
          }
          
          if (paymentIntent.status === 'succeeded') {
            setPaymentStatus('success');
            toast({
              title: 'Payment Confirmed',
              description: 'Your payment has been processed successfully.',
            });
          } else if (paymentIntent.status === 'processing') {
            setPaymentStatus('processing');
          } else {
            setPaymentStatus('error');
            setPaymentError(`Payment status: ${paymentIntent.status}`);
          }
        }
      } catch (error: any) {
        setPaymentStatus('error');
        setPaymentError(error.message || 'An error occurred while confirming your payment');
        toast({
          title: 'Payment Error',
          description: error.message || 'There was a problem with your payment',
          variant: 'destructive',
        });
      }
    };

    checkPaymentStatus();
  }, [toast]);

  const renderContent = () => {
    switch (paymentStatus) {
      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-lg mb-8">
              Thank you for your purchase. Your subscription is now active.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={() => setLocation('/how-it-works')} 
                size="lg"
                className="px-8"
              >
                Get Started
              </Button>
              <Button 
                onClick={() => setLocation('/')} 
                variant="outline" 
                size="lg"
              >
                Return to Homepage
              </Button>
            </div>
          </div>
        );
      
      case 'processing':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <div className="animate-spin w-10 h-10 border-4 border-yellow-600 border-t-transparent rounded-full" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Payment Processing</h1>
            <p className="text-lg mb-8">
              Your payment is being processed. This may take a moment.
            </p>
            <Button 
              onClick={() => setLocation('/')} 
              variant="outline" 
              size="lg"
            >
              Return to Homepage
            </Button>
          </div>
        );
      
      case 'error':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
            <p className="text-lg mb-6">
              There was an issue processing your payment.
            </p>
            {paymentError && (
              <p className="text-red-600 mb-8">
                {paymentError}
              </p>
            )}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={() => window.history.back()} 
                size="lg"
                className="px-8"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => setLocation('/')} 
                variant="outline" 
                size="lg"
              >
                Return to Homepage
              </Button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 flex items-center justify-center mb-6">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Verifying Payment</h1>
            <p className="text-lg">
              Please wait while we verify your payment...
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:py-20">
      <div className="bg-card rounded-lg border p-8 md:p-12 shadow-sm">
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentConfirmation;