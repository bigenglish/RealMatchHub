import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Check, X, Clock, Calendar, MapPin, User, FileText, AlertCircle 
} from 'lucide-react';

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
  onDecline,
}: ServiceProviderResponseProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [responseNote, setResponseNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [action, setAction] = useState<'accept' | 'decline' | null>(null);

  // Fetch service request details
  const { data: requestDetails, isLoading, error } = useQuery({
    queryKey: ['/api/service-requests', serviceRequestId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/service-requests/${serviceRequestId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch service request details');
      }
      return response.json();
    },
  });

  const handleResponse = async (accepted: boolean) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest('POST', `/api/service-requests/${serviceRequestId}/response`, {
        providerId,
        accepted,
        responseNote,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit response');
      }

      toast({
        title: accepted ? 'Request Accepted' : 'Request Declined',
        description: accepted 
          ? 'You have accepted this service request. The client has been notified.' 
          : 'You have declined this service request.',
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
      
      if (accepted && onAccept) {
        onAccept();
      } else if (!accepted && onDecline) {
        onDecline();
      }
      
      setOpenDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive-600"></div>
      </div>
    );
  }

  if (error || !requestDetails) {
    return (
      <Card className="w-full border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700">Error</CardTitle>
          <CardDescription className="text-red-600">
            Failed to load service request details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error instanceof Error ? error.message : 'An error occurred'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const details: ServiceRequestDetails = requestDetails;
  const preferredDate = details.preferredDate ? new Date(details.preferredDate) : null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Service Request: {details.serviceType}
            </CardTitle>
            <CardDescription>
              <span className="font-medium">Request Date: </span>
              {new Date(details.requestDate).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge 
            className={`
              ${details.status === 'pending' ? 'bg-orange-100 text-orange-800 hover:bg-orange-100' : ''}
              ${details.status === 'accepted' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
              ${details.status === 'declined' ? 'bg-red-100 text-red-800 hover:bg-red-100' : ''}
              ${details.status === 'completed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
              ${details.status === 'cancelled' ? 'bg-gray-100 text-gray-800 hover:bg-gray-100' : ''}
            `}
          >
            {details.status.charAt(0).toUpperCase() + details.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-olive-600" />
              <div>
                <p className="text-sm text-gray-500">Preferred Date</p>
                <p className="font-medium">
                  {preferredDate ? format(preferredDate, 'MMMM d, yyyy') : 'Not specified'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-olive-600" />
              <div>
                <p className="text-sm text-gray-500">Preferred Time</p>
                <p className="font-medium">{details.preferredTime || 'Not specified'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-olive-600" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">ZIP Code: {details.propertyZipCode}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-olive-600" />
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">{details.userName || 'Client #' + details.userId}</p>
              </div>
            </div>
          </div>

          {details.notes && (
            <div className="pt-2">
              <div className="flex items-start space-x-2">
                <FileText className="h-5 w-5 text-olive-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Special Instructions</p>
                  <p className="font-medium">{details.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {details.status === 'pending' && (
        <CardFooter className="flex flex-col space-y-4">
          <Textarea 
            placeholder="Add a note to the client (optional)"
            value={responseNote}
            onChange={(e) => setResponseNote(e.target.value)}
            className="w-full"
          />
          
          <div className="flex space-x-3 w-full">
            <Button
              variant="outline"
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => {
                setAction('decline');
                setOpenDialog(true);
              }}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" /> Decline
            </Button>
            
            <Button
              className="flex-1 bg-olive-600 hover:bg-olive-700 text-white"
              onClick={() => {
                setAction('accept');
                setOpenDialog(true);
              }}
              disabled={isSubmitting}
            >
              <Check className="w-4 h-4 mr-2" /> Accept
            </Button>
          </div>
        </CardFooter>
      )}

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === 'accept' ? 'Accept Service Request?' : 'Decline Service Request?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === 'accept' 
                ? 'By accepting this request, you are committing to provide the service at the specified time. The client will be notified of your acceptance.'
                : 'Are you sure you want to decline this service request? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleResponse(action === 'accept')}
              className={action === 'accept' ? 'bg-olive-600 hover:bg-olive-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {action === 'accept' ? 'Accept' : 'Decline'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}