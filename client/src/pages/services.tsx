import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Home, Info, Users, Calendar, MessageSquare, CheckCircle, Building, User, CreditCard } from 'lucide-react';
import AppointmentScheduler, { ServiceExpert } from '@/components/appointment-scheduler';
import ChatProvider from '@/components/chat-provider';
import ServiceSelection from '@/components/service-selection';
import CostSummary from '@/components/cost-summary';
import PaymentProcessor from '@/components/payment-processor';
import { ServiceOffering as BaseServiceOffering } from '@shared/schema';

// Extend the ServiceOffering type to include the price field from API
interface ServiceOffering extends BaseServiceOffering {
  price?: string | number;
}

// Mock user for the demo
const currentUser = {
  id: 101,
  name: 'John Doe',
  email: 'john@example.com',
  type: 'buyer',
};

// Mock service experts
const serviceExperts: ServiceExpert[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    title: 'Senior Real Estate Agent',
    description: 'Specialized in luxury properties with over 10 years of experience',
    services: ['property_tour', 'consultation'],
    rating: 4.9,
    price: 150,
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: 2,
    name: 'Michael Chen',
    title: 'Home Inspector',
    description: 'Certified home inspector with expertise in structural assessments',
    services: ['inspection'],
    rating: 4.8,
    price: 200,
    image: 'https://randomuser.me/api/portraits/men/52.jpg',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    title: 'Mortgage Specialist',
    description: 'Helping clients find the best mortgage rates and terms',
    services: ['mortgage', 'consultation'],
    rating: 4.7,
    price: 125,
    image: 'https://randomuser.me/api/portraits/women/28.jpg',
  },
  {
    id: 4,
    name: 'David Williams',
    title: 'Real Estate Attorney',
    description: 'Specializing in contract review and closing processes',
    services: ['legal'],
    rating: 4.9,
    price: 250,
    image: 'https://randomuser.me/api/portraits/men/39.jpg',
  },
];

// Service categories
const serviceCategories = [
  {
    id: 'property_tours',
    name: 'Property Tours',
    icon: <Building className="h-5 w-5" />,
    description: 'Schedule in-person or virtual tours with expert agents',
    serviceType: 'property_tour',
    experts: serviceExperts.filter(expert => expert.services.includes('property_tour')),
  },
  {
    id: 'consultations',
    name: 'Consultations',
    icon: <Users className="h-5 w-5" />,
    description: 'Get expert advice on buying, selling, or investing in property',
    serviceType: 'consultation',
    experts: serviceExperts.filter(expert => expert.services.includes('consultation')),
  },
  {
    id: 'inspections',
    name: 'Inspections',
    icon: <Info className="h-5 w-5" />,
    description: 'Professional home inspections to identify potential issues',
    serviceType: 'inspection',
    experts: serviceExperts.filter(expert => expert.services.includes('inspection')),
  },
  {
    id: 'legal',
    name: 'Legal Services',
    icon: <CheckCircle className="h-5 w-5" />,
    description: 'Legal expertise for contracts, closing, and title reviews',
    serviceType: 'legal',
    experts: serviceExperts.filter(expert => expert.services.includes('legal')),
  },
  {
    id: 'mortgage',
    name: 'Mortgage Services',
    icon: <Home className="h-5 w-5" />,
    description: 'Mortgage pre-approval and financing consultation',
    serviceType: 'mortgage',
    experts: serviceExperts.filter(expert => expert.services.includes('mortgage')),
  },
];

// Mock property for the demo
const mockProperty = {
  id: 5001,
  address: '123 Main Street, Austin, TX 78701',
  price: 550000,
  beds: 3,
  baths: 2,
  sqft: 1850,
};

export default function Services() {
  const [activeExpert, setActiveExpert] = useState<ServiceExpert | null>(null);
  const [activeServiceType, setActiveServiceType] = useState<string>('');
  const [showAppointment, setShowAppointment] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [showServiceSelection, setShowServiceSelection] = useState<boolean>(false);
  const [showCostSummary, setShowCostSummary] = useState<boolean>(false);
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const [selectedServices, setSelectedServices] = useState<ServiceOffering[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const { toast } = useToast();

  const handleScheduleAppointment = (expert: ServiceExpert, serviceType: string) => {
    setActiveExpert(expert);
    setActiveServiceType(serviceType);
    setShowAppointment(true);
  };

  const handleStartChat = (expert: ServiceExpert) => {
    setActiveExpert(expert);
    setShowChat(true);
  };

  const handleAppointmentComplete = (appointmentId: number) => {
    setShowAppointment(false);
    toast({
      title: 'Appointment Scheduled',
      description: `Your appointment has been scheduled. Appointment ID: #${appointmentId}`,
    });
  };

  const handleChatClose = () => {
    setShowChat(false);
  };
  
  const handleOpenServiceSelection = () => {
    setShowServiceSelection(true);
  };

  const handleServiceSelectionComplete = (services: ServiceOffering[], cost: number) => {
    setSelectedServices(services);
    setTotalCost(cost);
    setShowServiceSelection(false);
    setShowCostSummary(true);
  };

  const handleServiceSelectionCancel = () => {
    setShowServiceSelection(false);
  };

  const handleCostSummaryBack = () => {
    setShowCostSummary(false);
    setShowServiceSelection(true);
  };

  const handlePayNow = () => {
    toast({
      title: "Payment Initiated",
      description: `Processing payment for ${selectedServices.length} services totaling $${totalCost.toFixed(2)}`,
    });
    
    // Show payment dialog
    setShowCostSummary(false);
    setShowPayment(true);
  };
  
  const handlePaymentSuccess = () => {
    setShowPayment(false);
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed successfully. You can now access your purchased services.",
      variant: "default",
    });
  };
  
  const handlePaymentCancel = () => {
    setShowPayment(false);
    setShowCostSummary(true);
  };

  const renderExpertCard = (expert: ServiceExpert, serviceType: string) => (
    <Card key={expert.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
            {expert.image ? (
              <img 
                src={expert.image} 
                alt={expert.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-full w-full p-2 text-gray-500" />
            )}
          </div>
          <div>
            <CardTitle className="text-lg">{expert.name}</CardTitle>
            <CardDescription>{expert.title}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-600 mb-2">{expert.description}</p>
        <div className="flex items-center mb-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <span 
                key={i} 
                className={`text-sm ${i < expert.rating ? 'text-yellow-500' : 'text-gray-300'}`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-500">{expert.rating.toFixed(1)}</span>
        </div>
        <div className="text-sm flex justify-between items-center">
          <span className="text-gray-600">Service fee:</span>
          <Badge variant="secondary">${expert.price.toFixed(2)}/hour</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => handleStartChat(expert)}
        >
          <MessageSquare className="mr-1 h-4 w-4" />
          Chat
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1"
          onClick={() => handleScheduleAppointment(expert, serviceType)}
        >
          <Calendar className="mr-1 h-4 w-4" />
          Schedule
        </Button>
      </CardFooter>
    </Card>
  );

  const filteredCategories = activeTab === 'all' 
    ? serviceCategories 
    : serviceCategories.filter(category => category.id === activeTab);

  return (
    <div className="container py-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Real Estate Services</h1>
          <p className="text-gray-500">
            Connect with top real estate professionals to help with your property journey
          </p>
        </div>
        <div>
          <Button 
            onClick={handleOpenServiceSelection}
            size="lg"
            className="gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Browse Service Packages
          </Button>
        </div>
      </div>

      {/* Fast Online Application Promo Banner */}
      <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="flex flex-col md:flex-row items-center justify-between p-6">
          <div className="space-y-2 mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-green-800">Streamlined Mortgage Application</h3>
            <p className="text-green-700">
              Our AI-powered Fast Online Application streamlines the mortgage process by automatically 
              extracting data from your documents for instant pre-approval.
            </p>
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => window.location.href = '/fast-online-application'}
          >
            Apply Now
          </Button>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Services</TabsTrigger>
          {serviceCategories.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map(category => (
              <div key={category.id} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    {category.icon}
                  </div>
                  <h2 className="text-xl font-semibold">{category.name}</h2>
                </div>
                <p className="text-gray-600">{category.description}</p>
                
                <Separator />
                
                <div className="space-y-4">
                  {category.experts.map(expert => renderExpertCard(expert, category.serviceType))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Appointment Scheduling Dialog */}
      <Dialog open={showAppointment} onOpenChange={setShowAppointment}>
        <DialogContent className="max-w-2xl">
          {activeExpert && (
            <AppointmentScheduler
              userId={currentUser.id}
              userName={currentUser.name}
              propertyId={mockProperty.id}
              propertyAddress={mockProperty.address}
              expertId={activeExpert.id}
              serviceType={activeServiceType}
              onComplete={handleAppointmentComplete}
              onCancel={() => setShowAppointment(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent className="max-w-lg p-0 max-h-[80vh] overflow-hidden">
          {activeExpert && (
            <ChatInterface
              userId={currentUser.id}
              userName={currentUser.name}
              userType="buyer"
              onClose={handleChatClose}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Service Selection Dialog */}
      <Dialog open={showServiceSelection} onOpenChange={setShowServiceSelection}>
        <DialogContent className="max-w-4xl">
          <ServiceSelection 
            onComplete={handleServiceSelectionComplete}
            onCancel={handleServiceSelectionCancel}
          />
        </DialogContent>
      </Dialog>
      
      {/* Cost Summary Dialog */}
      <Dialog open={showCostSummary} onOpenChange={setShowCostSummary}>
        <DialogContent className="max-w-3xl">
          <CostSummary 
            selectedServices={selectedServices}
            totalCost={totalCost}
            onBack={handleCostSummaryBack}
            onPayNow={handlePayNow}
          />
        </DialogContent>
      </Dialog>
      
      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Complete Your Payment</DialogTitle>
          <DialogDescription>
            Please enter your payment details to complete the transaction.
          </DialogDescription>
          
          <PaymentProcessor
            services={selectedServices}
            totalAmount={totalCost}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}