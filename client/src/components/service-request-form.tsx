import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Clock, MapPin, Calendar, Users, Home } from 'lucide-react';

// Validation schema for service request
const serviceRequestSchema = z.object({
  serviceType: z.string().min(1, { message: 'Service type is required' }),
  serviceProviderId: z.string().optional(), // Made optional since we'll find providers on the service-experts page
  propertyZipCode: z.string().optional(), // Made optional for easier navigation
  preferredDate: z.string().optional(), // Made optional for easier navigation
  preferredTime: z.string().optional(), // Made optional for easier navigation
  notes: z.string().optional(),
});

type ServiceRequestFormProps = {
  onSuccess?: () => void;
  propertyId?: number;
  userType: 'buyer' | 'seller';
  defaultZipCode?: string;
  selectedServices?: string[]; // Added prop for selected services
};

export default function ServiceRequestForm({ 
  onSuccess, 
  propertyId, 
  userType, 
  defaultZipCode,
  selectedServices // Use the added prop
}: ServiceRequestFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, navigate] = useLocation(); // Import useLocation hook for navigation

  // Fetch service expert types based on user type (buyer or seller)
  const { data: serviceTypes } = useQuery({
    queryKey: ['/api/service-experts/types', userType],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/service-experts/types?userType=${userType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch service types');
      }
      return response.json();
    },
  });

  // Fetch service providers
  const { data: serviceProviders = [] } = useQuery({
    queryKey: ['/api/service-providers'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/service-providers`);
      if (!response.ok) {
        throw new Error('Failed to fetch service providers');
      }
      return response.json();
    },
  });

  // Initialize form with default values
  const form = useForm<z.infer<typeof serviceRequestSchema>>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      serviceType: '',
      serviceProviderId: '',
      propertyZipCode: defaultZipCode || '',
      preferredDate: '',
      preferredTime: '',
      notes: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof serviceRequestSchema>) => {
    setIsSubmitting(true);
    try {
      // Get the selected service type for redirection
      const serviceType = data.serviceType;
      
      // Navigate directly to service-experts with the selected service type
      navigate(`/service-experts?service=${encodeURIComponent(serviceType)}`);
      
      toast({
        title: 'Connecting to Service Experts',
        description: 'Redirecting you to available service experts in your area.',
      });
      
      // If onSuccess callback is provided, call it
      if (onSuccess) {
        onSuccess();
      }
      
      return; // Skip the API call for now as we're navigating away
      
      /* Preserve the original function logic below in case we need it later
      const response = await apiRequest('POST', '/api/service-requests', {
        ...data,
        propertyId: propertyId,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit service request');
      }

      const result = await response.json();

      toast({
        title: 'Service Request Submitted',
        description: 'Your request has been sent to matching service providers. You will be notified once a provider accepts.',
      });

      if (onSuccess) {
        onSuccess();
      }
      */
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

  // Time slot options for the form
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">Request Service Provider</CardTitle>
        <CardDescription>
          {userType === 'buyer' 
            ? 'Request expert guidance for your home buying journey' 
            : 'Get professional assistance with selling your property'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Service Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a specific service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(selectedServices || serviceTypes || []).map((type: string) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceProviderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Service Provider</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!form.watch("serviceType")}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a service provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {serviceProviders
                        .filter((provider: {type: string}) => provider.type === form.watch("serviceType"))
                        .map((provider: {id: number, name: string, experience: number}) => (
                          <SelectItem key={provider.id} value={provider.id.toString()}>
                            {provider.name} ({provider.experience} years experience)
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="propertyZipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Property ZIP Code</FormLabel>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter property ZIP code" 
                        className="pl-10"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="preferredDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Preferred Date</FormLabel>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          className="pl-10"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Preferred Time</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Special Instructions (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Any additional information the service provider should know"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full bg-olive-600 hover:bg-olive-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Connecting...' : 'Find Matching Service Experts'}
              </Button>
              
              <div className="text-center text-sm text-gray-500">
                By clicking this button, you'll be directed to available service professionals in your area
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}