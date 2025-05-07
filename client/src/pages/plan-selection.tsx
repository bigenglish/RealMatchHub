import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import PaymentForm from '../components/payment-form';

// Bundle interface definition
interface Bundle {
  id: number;
  title: string;
  description: string;
  price: number;
  type: 'buyer' | 'seller' | 'agent' | 'provider';
  features: string[];
  highlighted?: boolean;
  priceDisplay?: string;
  recommendedFor?: string;
  services?: Service[];
}

interface Service {
  id: number;
  name: string;
  description: string;
}

const PlanSelection = () => {
  const { user } = useAuth();
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState('buyer');
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: bundles, isLoading: bundlesLoading } = useQuery({
    queryKey: ['/api/service-bundles'],
    select: (data: Bundle[]) => {
      // Group bundles by type
      const groupedBundles = data.reduce((acc, bundle) => {
        const type = bundle.type || 'buyer';
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(bundle);
        return acc;
      }, {} as Record<string, Bundle[]>);
      return groupedBundles;
    }
  });

  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
      setLocation('/auth/login');
      toast({
        title: 'Authentication Required',
        description: 'Please log in to select a plan.',
        variant: 'destructive'
      });
    }
  }, [user, setLocation, toast]);

  const handlePlanSelect = (bundle: Bundle) => {
    setSelectedPlanId(bundle.id);
    
    if (bundle.price === 0) {
      // For free plans, skip payment and redirect to home
      setLocation('/how-it-works');
      toast({
        title: 'Free Plan Selected',
        description: `You've successfully chosen the ${bundle.title} plan.`,
      });
    } else {
      // For paid plans, show payment form
      setShowPaymentForm(true);
    }
  };

  const handlePaymentSuccess = () => {
    toast({
      title: 'Payment Successful',
      description: 'Thank you for your purchase!',
    });
    setLocation('/how-it-works');
  };

  if (bundlesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (showPaymentForm && selectedPlanId) {
    const allBundles = Object.values(bundles || {}).flat();
    const selectedBundle = allBundles.find(b => b.id === selectedPlanId);
    
    if (!selectedBundle) {
      return <div>Plan not found</div>;
    }

    return (
      <div className="max-w-3xl mx-auto p-6">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => setShowPaymentForm(false)}
        >
          ← Back to Plans
        </Button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
          <h2 className="text-2xl font-semibold text-primary mb-1">{selectedBundle.title}</h2>
          <p className="text-xl mb-4">{selectedBundle.priceDisplay || `$${selectedBundle.price}`}</p>
          <p className="text-muted-foreground">{selectedBundle.description}</p>
        </div>
        
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-xl font-medium mb-4">Payment Information</h3>
          <PaymentForm 
            onSuccess={handlePaymentSuccess}
            amount={selectedBundle.price}
            planId={selectedBundle.id}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">Select Your Plan</h1>
      <p className="text-center text-muted-foreground mb-8">
        Choose the perfect plan that fits your real estate needs
      </p>

      <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
          <TabsTrigger value="buyer">Buyer</TabsTrigger>
          <TabsTrigger value="seller">Seller</TabsTrigger>
          <TabsTrigger value="agent">Agent</TabsTrigger>
          <TabsTrigger value="provider">Service Provider</TabsTrigger>
        </TabsList>

        {Object.entries(bundles || {}).map(([type, typeBundles]) => (
          <TabsContent key={type} value={type} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {typeBundles.map((bundle) => (
                <Card 
                  key={bundle.id}
                  className={`flex flex-col ${bundle.highlighted ? 'border-primary shadow-lg' : ''}`}
                >
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {bundle.title}
                    </CardTitle>
                    <CardDescription>{bundle.description}</CardDescription>
                    {bundle.recommendedFor && (
                      <div className="bg-primary/10 text-primary text-sm py-1 px-2 rounded mt-2 inline-block">
                        {bundle.recommendedFor}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="mb-4">
                      <p className="text-3xl font-bold">
                        {bundle.priceDisplay || `$${bundle.price}`}
                      </p>
                    </div>
                    <ul className="space-y-2">
                      {bundle.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => handlePlanSelect(bundle)}
                      variant={bundle.highlighted ? "default" : "outline"}
                    >
                      {bundle.price === 0 ? "Select Free Plan" : "Select Plan"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PlanSelection;