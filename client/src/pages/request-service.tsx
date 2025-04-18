import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import ServiceRequestForm from '@/components/service-request-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function RequestService() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/request-service');
  const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');
  
  // Get the user type from URL query parameter
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const type = query.get('type');
    
    if (type === 'buyer' || type === 'seller') {
      setUserType(type);
    }
  }, []);
  
  // Handle successful service request submission
  const handleSuccess = () => {
    // Redirect based on user type
    if (userType === 'buyer') {
      navigate('/properties');
    } else {
      navigate('/dashboard');
    }
  };
  
  return (
    <div className="container mx-auto py-16 px-4">
      <Button 
        variant="ghost" 
        className="flex items-center mb-6" 
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Request Professional Services</h1>
        <p className="text-gray-600">
          {userType === 'buyer' 
            ? 'Get expert assistance for your home buying journey' 
            : 'Connect with professionals to help sell your property'}
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <ServiceRequestForm 
          userType={userType} 
          onSuccess={handleSuccess}
        />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            All of our service providers are licensed professionals who have been vetted and approved by our team.
          </p>
        </div>
      </div>
    </div>
  );
}