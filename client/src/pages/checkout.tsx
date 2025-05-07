import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  clientSecret: string;
  planName: string;
  amount: number;
  planFeatures: string[];
}

const CheckoutForm = ({ clientSecret, planName, amount, planFeatures }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/payment-confirmation",
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Processing",
        description: "Your payment is being processed.",
      });
    }

    setIsProcessing(false);
  }

  // Format plan name for display (remove the -Renter suffix for display)
  const displayPlanName = planName.replace('-Renter', '');
  const isRenterPlan = planName.includes('-Renter');
  const planType = isRenterPlan ? 'Rental' : 'Buyer';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Checkout: {displayPlanName} {planType} Plan</h2>
        <p className="text-muted-foreground">Amount: ${amount.toFixed(2)}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
          <CardDescription>You're purchasing the following {planType.toLowerCase()} plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-lg font-semibold">{displayPlanName} {planType} Plan</div>
            <div className="text-xl font-bold">${amount.toFixed(2)}</div>
            <ul className="list-disc pl-5 pt-2 space-y-1">
              {planFeatures.map((feature, index) => (
                <li key={index} className="text-sm">{feature}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
          <CardDescription>Enter your payment details</CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentElement />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => navigate("/")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isProcessing || !stripe || !elements}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${amount.toFixed(2)}`
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Parse the query parameters to get the plan information
  const query = new URLSearchParams(window.location.search);
  const planName = query.get('plan') || 'Basic';

  // Map plan names to amounts and features
  const planData: Record<string, { amount: number, features: string[] }> = {
    // Buyer Plans
    'Free': { 
      amount: 0,
      features: [
        'Browse all available listings in your area',
        'Save your favorite properties and searches',
        'Access basic search filters (location, price, property type)',
        'Connect with local real estate professionals',
        'Receive basic customer support'
      ]
    },
    'Basic': { 
      amount: 1500,
      features: [
        'All Free features, plus:',
        'Advanced search filters (size, features, amenities, etc.)',
        'Listing activity alerts (new listings, price changes for saved properties)',
        'Save and organize multiple property lists',
        'Access neighborhood insights and data',
        'Priority email support'
      ]
    },
    'Premium': { 
      amount: 3500,
      features: [
        'All Basic features, plus:',
        'Personalized property recommendations based on your criteria',
        'Priority access to new listings before they go public',
        'In-depth market analysis reports for your target areas',
        'Connect with verified buyer specialist agents',
        'Priority phone and email support',
        'Guidance on making competitive offers',
        'Dedicated buyer concierge service',
        'Expert offer negotiation and strategy consultation',
        'Assistance with due diligence checklists and processes',
        'Closing coordination assistance with 2 Expert reviewers'
      ]
    },

    // Renter Plans
    'Free-Renter': { 
      amount: 0,
      features: [
        'Browse all available rental listings in your area',
        'Save your favorite rental properties and searches',
        'Access basic search filters (location, price, property type)',
        'Connect with local property managers/landlords',
        'Receive basic customer support'
      ]
    },
    'Basic-Renter': { 
      amount: 50,
      features: [
        'All Free features, plus:',
        'Advanced search filters (size, features, pet policies, etc.)',
        'Listing activity alerts (new rentals, price changes for saved properties)',
        'Save and organize multiple rental lists',
        'Access neighborhood guides and information',
        'Priority email support'
      ]
    },
    'Premium-Renter': { 
      amount: 100,
      features: [
        'All Basic features, plus:',
        'Personalized rental recommendations based on your criteria',
        'Priority notifications for new rentals matching your needs',
        'Detailed neighborhood insights, including commute times and local amenities',
        'Connect with verified and responsive property managers/landlords',
        'Priority phone and email support',
        'Guidance on preparing strong rental applications',
        'Dedicated rental concierge service'
      ]
    },

    // Seller Plans
    'Free-Seller': { 
      amount: 0,
      features: [
        'Create basic property listings',
        'Connect with potential buyers',
        'Access to basic seller resources and guides',
        'Save your basic property information',
        'Basic customer support'
      ]
    },
    'Basic-Seller': { 
      amount: 2000,
      features: [
        'All Free Seller features, plus:',
        'Advanced search filters',
        'Listing analytics and insights',
        'Featured property listing',
        'Customizable property page',
        'Access to local market reports',
        'Basic customer support'
      ]
    },
    'Premium-Seller': { 
      amount: 3500,
      features: [
        'All Basic Seller features, plus:',
        'Professional photography and staging consultation',
        'Highlighted property listing',
        'Customizable property page with additional media options',
        'Premium marketing services (social media promotion, email marketing)',
        'Access to in-depth market analysis and reports',
        'Advanced analytics and insights',
        'Connect with verified local professionals',
        'Priority customer support',
        'Write up Offer & Negotiation',
        'Handle Negotiations for Repairs and Credits'
      ]
    }
  };

  // Get the plan details or default to Basic
  const { amount, features } = planData[planName] || planData['Basic'];

  useEffect(() => {
    // Skip payment creation for all Free plans
    if (planName === 'Free' || planName === 'Free-Renter' || planName === 'Free-Seller') {
      toast({
        title: "Free Plan Selected",
        description: "You've selected the Free plan. No payment is required.",
      });
      navigate("/");
      return;
    }

    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create PaymentIntent
        const response = await apiRequest('POST', '/api/create-payment-intent', { 
          amount: amount / 100, // Convert from cents to dollars for the API
          planName
        });

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
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        toast({
          title: "Payment Setup Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [planName, amount, toast, navigate]);

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <div className="flex justify-center items-center h-60">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            <p className="text-muted-foreground">Setting up payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !clientSecret) {
    return (
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <div className="space-y-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Payment Setup Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{error || "Unable to initialize payment. Please try again later."}</p>

              <div className="mt-4 bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Common issues:</h4>
                <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                  <li>Missing or invalid payment configuration</li>
                  <li>Temporary service interruption</li>
                  <li>Invalid plan selection</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={() => navigate("/")} variant="outline">
                Return to Home
              </Button>
              <Button onClick={() => window.location.reload()} variant="default">
                Try Again
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Make SURE to wrap the form in <Elements> which provides the stripe context.
  return (
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm 
          clientSecret={clientSecret} 
          planName={planName}
          amount={amount / 100} // Convert from cents to dollars for display
          planFeatures={features}
        />
      </Elements>
    </div>
  );
}