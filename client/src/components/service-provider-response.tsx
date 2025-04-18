import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, CheckCircle, User, Phone, Mail, FileText } from 'lucide-react';

type ServiceRequestDetails = {
  id: number;
  userId: number;
  serviceExpertId: number;
  serviceType: string;
  requestDate: string;
  preferredDate: string;
  preferredTime: string;
  propertyZipCode: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  notes?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
};

type ServiceProviderResponseProps = {
  serviceRequestId: number;
  providerId: number;
  onAccept?: () => void;
  onDecline?: () => void;
};

export default function ServiceProviderResponse({
  serviceRequestId,
  providerId,
  onAccept,
  onDecline
}: ServiceProviderResponseProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [requestDetails, setRequestDetails] = useState<ServiceRequestDetails | null>(null);
  
  useEffect(() => {
    async function fetchRequestDetails() {
      try {
        const response = await apiRequest('GET', `/api/service-requests/${serviceRequestId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch service request details');
        }
        
        const data = await response.json();
        setRequestDetails(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load request details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchRequestDetails();
  }, [serviceRequestId, toast]);
  
  const handleAction = async (action: 'accepted' | 'declined') => {
    setActionLoading(true);
    try {
      const response = await apiRequest('PATCH', `/api/service-requests/${serviceRequestId}/status`, {
        status: action,
        notes: action === 'accepted' 
          ? 'Request accepted. The service provider will contact you soon.' 
          : 'Request declined. Please choose another service provider.'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action === 'accepted' ? 'accept' : 'decline'} request`);
      }
      
      toast({
        title: action === 'accepted' ? 'Request Accepted' : 'Request Declined',
        description: action === 'accepted' 
          ? 'You have accepted this service request. The client will be notified.' 
          : 'You have declined this service request.',
      });
      
      if (action === 'accepted' && onAccept) {
        onAccept();
      } else if (action === 'declined' && onDecline) {
        onDecline();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process your action',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!requestDetails) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-gray-500">Service request not found or has been removed.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const details: ServiceRequestDetails = requestDetails;
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };
  
  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold">{details.serviceType} Request</CardTitle>
            <CardDescription>
              Request #{details.id} - Received on {new Date(details.requestDate).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge className={statusColors[details.status]}>
            {details.status.charAt(0).toUpperCase() + details.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* Client Information Section (if available) */}
        {(details.userName || details.userEmail || details.userPhone) && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center text-gray-800">
              <User className="h-5 w-5 mr-2 text-primary" /> Client Information
            </h3>
            <div className="pl-7 space-y-1">
              {details.userName && <p className="text-gray-700"><span className="font-medium">Name:</span> {details.userName}</p>}
              {details.userEmail && (
                <p className="text-gray-700 flex items-center">
                  <Mail className="h-4 w-4 mr-1 text-gray-500" /> 
                  <a href={`mailto:${details.userEmail}`} className="text-primary underline">
                    {details.userEmail}
                  </a>
                </p>
              )}
              {details.userPhone && (
                <p className="text-gray-700 flex items-center">
                  <Phone className="h-4 w-4 mr-1 text-gray-500" /> 
                  <a href={`tel:${details.userPhone}`} className="text-primary underline">
                    {details.userPhone}
                  </a>
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Schedule Information */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center text-gray-800">
            <Calendar className="h-5 w-5 mr-2 text-primary" /> Schedule
          </h3>
          <div className="pl-7 space-y-1">
            <p className="text-gray-700 flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-gray-500" /> 
              {new Date(details.preferredDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
            <p className="text-gray-700 flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-500" /> 
              {details.preferredTime}
            </p>
          </div>
        </div>
        
        {/* Location Information */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center text-gray-800">
            <MapPin className="h-5 w-5 mr-2 text-primary" /> Location
          </h3>
          <div className="pl-7">
            <p className="text-gray-700">
              Property ZIP Code: <span className="font-medium">{details.propertyZipCode}</span>
            </p>
          </div>
        </div>
        
        {/* Notes Section */}
        {details.notes && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center text-gray-800">
              <FileText className="h-5 w-5 mr-2 text-primary" /> Notes
            </h3>
            <div className="pl-7 bg-gray-50 p-3 rounded-md">
              <p className="text-gray-700">{details.notes}</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-3 pt-2 pb-6">
        {details.status === 'pending' && (
          <>
            <Button 
              onClick={() => handleAction('accepted')} 
              disabled={actionLoading} 
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Processing
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" /> Accept Request
                </div>
              )}
            </Button>
            <Button 
              onClick={() => handleAction('declined')} 
              disabled={actionLoading} 
              variant="outline" 
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            >
              Decline
            </Button>
          </>
        )}
        
        {details.status === 'accepted' && (
          <Button 
            onClick={() => handleAction('completed')} 
            disabled={actionLoading} 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {actionLoading ? 'Processing...' : 'Mark as Completed'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}