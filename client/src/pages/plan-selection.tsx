import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, Info, ArrowRight } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from '@/components/payment-form';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../lib/firebase-config';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PlanSelection = () => {
  const [match, params] = useRoute('/plan-selection/:type?');
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialPlanType, setInitialPlanType] = useState<string | null>(null);

  // Get the plan type from the URL
  const planType = params?.type || 'buyer';

  useEffect(() => {
    if (params?.type) {
      setInitialPlanType(params.type);
    }
  }, [params]);

  // Pricing plans
  const buyerPlans = [
    {
      id: 'Basic-Buyer',
      name: 'Basic',
      price: 'Free',
      priceValue: 0,
      description: 'Perfect for exploring properties and initial research',
      features: [
        'Property Search',
        'Save Favorites',
        'Market Reports',
        'Basic AI Recommendations'
      ],
      popular: false
    },
    {
      id: 'Standard-Buyer',
      name: 'Standard',
      price: '$199',
      priceValue: 199,
      description: 'Enhanced support for serious property seekers',
      features: [
        'All Basic Features',
        'Priority Customer Support',
        'Advanced AI Property Matching',
        'Neighborhood Analysis',
        'Document Review (up to 2)'
      ],
      popular: true
    },
    {
      id: 'Premium-Buyer',
      name: 'Premium',
      price: '$499',
      priceValue: 499,
      description: 'Full-service support for your property purchase',
      features: [
        'All Standard Features',
        'Dedicated Real Estate Expert',
        'Unlimited Document Reviews',
        'Virtual Property Tours',
        'Negotiation Assistance',
        'Closing Support'
      ],
      popular: false
    }
  ];

  const sellerPlans = [
    {
      id: 'Basic-Seller',
      name: 'Basic',
      price: 'Free',
      priceValue: 0,
      description: 'List your property and receive initial guidance',
      features: [
        'Basic Property Listing',
        'Simple Market Analysis',
        'DIY Sale Guidance',
        'Selling Checklist'
      ],
      popular: false
    },
    {
      id: 'Standard-Seller',
      name: 'Standard',
      price: '$299',
      priceValue: 299,
      description: 'Enhanced support for a smooth selling experience',
      features: [
        'All Basic Features',
        'Premium Property Listing',
        'Professional Photography',
        'Virtual Staging',
        'Basic Marketing Package',
        'Document Review (up to 3)'
      ],
      popular: true
    },
    {
      id: 'Premium-Seller',
      name: 'Premium',
      price: '$799',
      priceValue: 799,
      description: 'Full-service support for maximum sale value',
      features: [
        'All Standard Features',
        'Dedicated Listing Agent',
        'Advanced Marketing Package',
        'Open House Coordination',
        'Offer Evaluation Assistance',
        'Closing Support',
        'Professional Negotiation'
      ],
      popular: false
    }
  ];

  const renterPlans = [
    {
      id: 'Basic-Renter',
      name: 'Basic',
      price: 'Free',
      priceValue: 0,
      description: 'Search rentals and get initial guidance',
      features: [
        'Rental Search',
        'Save Favorites',
        'Basic Neighborhood Info',
        'Rental Application Checklist'
      ],
      popular: false
    },
    {
      id: 'Standard-Renter',
      name: 'Standard',
      price: '$99',
      priceValue: 99,
      description: 'Get additional support for finding the perfect rental',
      features: [
        'All Basic Features',
        'Rental Application Assistance',
        'Document Review',
        'Rental Property Analysis',
        'Neighborhood Insights'
      ],
      popular: true
    },
    {
      id: 'Premium-Renter',
      name: 'Premium',
      price: '$199',
      priceValue: 199,
      description: 'Full-service support for your rental search',
      features: [
        'All Standard Features',
        'Dedicated Rental Agent',
        'Virtual Property Tours',
        'Lease Review',
        'Negotiation Assistance',
        'Moving Coordination'
      ],
      popular: false
    }
  ];

  // Get active plans based on plan type
  const getActivePlans = () => {
    switch (planType) {
      case 'seller':
        return sellerPlans;
      case 'renter':
        return renterPlans;
      default:
        return buyerPlans;
    }
  };

  const activePlans = getActivePlans();

  // Handle plan selection
  const handleSelectPlan = async (planId: string, price: number) => {
    setSelectedPlan(planId);
    
    if (price === 0) {
      // For free plans, just update the user's plan in Firestore
      try {
        setIsLoading(true);
        if (user?.uid) {
          await updateDoc(doc(firestore, 'users', user.uid), {
            selectedPlan: planId,
            planPurchaseDate: Date.now()
          });
          
          toast({
            title: 'Plan Selected',
            description: 'Your free plan has been activated successfully.',
          });
          
          // Redirect to home page or dashboard
          setLocation('/');
        }
      } catch (error) {
        console.error('Error updating free plan:', error);
        toast({
          title: 'Error',
          description: 'Failed to activate free plan. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // For paid plans, create payment intent
      try {
        setIsLoading(true);
        // Create a payment intent on the server
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: price,
            planId: planId,
            userId: user?.uid
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize payment. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Load user's current plan if exists
  useEffect(() => {
    const loadUserPlan = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().selectedPlan) {
            setSelectedPlan(userDoc.data().selectedPlan);
          }
        } catch (error) {
          console.error('Error loading user plan:', error);
        }
      }
    };

    loadUserPlan();
  }, [user]);

  // Handle successful payment
  const handlePaymentSuccess = async () => {
    try {
      if (user?.uid && selectedPlan) {
        // Update the user's plan in Firestore
        await updateDoc(doc(firestore, 'users', user.uid), {
          selectedPlan: selectedPlan,
          planPurchaseDate: Date.now()
        });
        
        toast({
          title: 'Payment Successful',
          description: 'Your plan has been activated successfully.',
        });
        
        // Redirect to home page or dashboard
        setLocation('/');
      }
    } catch (error) {
      console.error('Error updating plan after payment:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Select Your {planType.charAt(0).toUpperCase() + planType.slice(1)} Plan</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that best fits your needs. You can upgrade or downgrade at any time.
          </p>
        </div>
        
        {!clientSecret ? (
          <>
            {/* Plan Type Selector */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex rounded-md shadow-sm bg-white p-1 mb-8">
                <Button
                  variant={planType === 'buyer' ? 'default' : 'outline'}
                  className={`rounded-l-md ${planType === 'buyer' ? 'bg-blue-600 text-white' : ''}`}
                  onClick={() => setLocation('/plan-selection/buyer')}
                >
                  Buyer
                </Button>
                <Button
                  variant={planType === 'seller' ? 'default' : 'outline'}
                  className={planType === 'seller' ? 'bg-blue-600 text-white' : ''}
                  onClick={() => setLocation('/plan-selection/seller')}
                >
                  Seller
                </Button>
                <Button
                  variant={planType === 'renter' ? 'default' : 'outline'}
                  className={`rounded-r-md ${planType === 'renter' ? 'bg-blue-600 text-white' : ''}`}
                  onClick={() => setLocation('/plan-selection/renter')}
                >
                  Renter
                </Button>
              </div>
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {activePlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`${
                    plan.popular ? 'border-blue-500 shadow-xl' : 'border-gray-200'
                  } transition-all duration-300 hover:shadow-lg`}
                >
                  {plan.popular && (
                    <div className="bg-blue-500 text-white text-center py-1 text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{plan.name}</span>
                      <span className="text-2xl font-bold">{plan.price}</span>
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : plan.priceValue === 0 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-gray-800 hover:bg-gray-900'
                      }`}
                      disabled={isLoading}
                      onClick={() => handleSelectPlan(plan.id, plan.priceValue)}
                    >
                      {plan.priceValue === 0 ? 'Get Started Free' : 'Select Plan'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        ) : (
          /* Payment Form */
          <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Purchase</h2>
            <p className="text-gray-600 mb-6 text-center">
              You've selected the <span className="font-semibold">{selectedPlan}</span> plan.
            </p>
            
            <Elements stripe={stripePromise} options={{ clientSecret: clientSecret }}>
              <PaymentForm onSuccess={handlePaymentSuccess} />
            </Elements>
            
            <div className="mt-6 text-center">
              <button 
                className="text-blue-600 hover:underline text-sm"
                onClick={() => setClientSecret(null)}
                disabled={isLoading}
              >
                ← Go back to plan selection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanSelection;