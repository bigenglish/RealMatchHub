import React, { useState, useEffect } from 'react';
import { format, addDays, isToday, isTomorrow, isAfter, differenceInCalendarDays } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ServiceExpert } from '@shared/schema';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { 
  Select, 
  SelectContent, 
  SelectGroup,
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock, MapPin, Users, Check, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Types
interface AppointmentSchedulerProps {
  userId: number;
  userName: string;
  propertyId?: number;
  propertyAddress?: string;
  expertId?: number;
  serviceType: string;
  onComplete: (appointmentId: number) => void;
  onCancel: () => void;
}

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
];

const expertSpecializations = {
  'property_tour': ['In-person Tour', 'Virtual Tour', 'Open House'],
  'consultation': ['Buyer Consultation', 'Seller Consultation', 'Investment Strategy'],
  'inspection': ['Pre-listing Inspection', 'Buyer Inspection', 'Specialized Inspection'],
  'mortgage': ['Loan Pre-qualification', 'Refinancing Options', 'Rate Consultation'],
  'legal': ['Contract Review', 'Transaction Closing', 'Title Search'],
  'home_improvement': ['Renovation Consultation', 'Staging Consultation', 'Interior Design']
};

// Form schema
const appointmentFormSchema = z.object({
  date: z.date({
    required_error: "Please select a date.",
  }),
  timeSlot: z.string({
    required_error: "Please select a time slot.",
  }),
  expertId: z.number({
    required_error: "Please select a service expert.",
  }),
  subType: z.string({
    required_error: "Please select an appointment type.",
  }),
  notes: z.string().optional(),
  location: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export default function AppointmentScheduler({
  userId,
  userName,
  propertyId,
  propertyAddress,
  expertId: initialExpertId,
  serviceType,
  onComplete,
  onCancel
}: AppointmentSchedulerProps) {
  const [step, setStep] = useState(1);
  const [experts, setExperts] = useState<ServiceExpert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<ServiceExpert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      date: addDays(new Date(), 1),
      timeSlot: '10:00 AM',
      expertId: initialExpertId || 0,
      subType: '',
      notes: '',
      location: propertyAddress || '',
    },
  });

  // Get available experts for the service type
  useEffect(() => {
    const fetchExperts = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest('GET', `/api/service-providers/type/${serviceType}`);
        if (!response.ok) {
          throw new Error('Failed to fetch service experts');
        }
        const expertsData = await response.json();
        setExperts(expertsData);
        
        // If an initial expert ID was provided, select that expert
        if (initialExpertId) {
          const initialExpert = expertsData.find((expert: ServiceExpert) => expert.id === initialExpertId);
          if (initialExpert) {
            setSelectedExpert(initialExpert);
            // Set sub-type if the expert has a default service
            if (initialExpert.services && initialExpert.services.includes(serviceType)) {
              const subTypes = expertSpecializations[serviceType as keyof typeof expertSpecializations] || [];
              if (subTypes.length > 0) {
                form.setValue('subType', subTypes[0]);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching experts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load available experts',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperts();
  }, [initialExpertId, serviceType, form, toast]);

  // Handle expert selection
  const handleExpertSelect = (expertId: number) => {
    const expert = experts.find(e => e.id === expertId);
    setSelectedExpert(expert || null);
    form.setValue('expertId', expertId);
  };

  // Go to next step
  const handleNextStep = () => {
    if (step === 1) {
      // Validate expert selection
      if (!form.getValues('expertId')) {
        toast({
          title: 'Required',
          description: 'Please select a service expert',
          variant: 'destructive',
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate date and time
      if (!form.getValues('date') || !form.getValues('timeSlot')) {
        toast({
          title: 'Required',
          description: 'Please select a date and time',
          variant: 'destructive',
        });
        return;
      }
      setStep(3);
    }
  };

  // Go to previous step
  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Submit appointment
  const onSubmit = async (values: AppointmentFormValues) => {
    try {
      setSubmitLoading(true);

      // Combine date and time
      const dateStr = format(values.date, 'yyyy-MM-dd');
      const timeStr = values.timeSlot;
      const combinedDateTime = new Date(`${dateStr} ${timeStr}`);
      
      // Create appointment request
      const appointmentData = {
        userId,
        userName,
        type: serviceType,
        subType: values.subType,
        expertId: values.expertId,
        expertName: selectedExpert?.name || '',
        date: combinedDateTime.toISOString(),
        status: 'pending',
        notes: values.notes || '',
        metadata: {
          propertyId: propertyId,
          propertyAddress: values.location || propertyAddress,
          expertName: selectedExpert?.name,
          expertServiceType: selectedExpert?.serviceType,
          userEmail: selectedExpert?.contactEmail,
        }
      };

      const response = await apiRequest('POST', '/api/appointments', appointmentData);
      
      if (!response.ok) {
        throw new Error('Failed to schedule appointment');
      }

      const appointmentResult = await response.json();
      
      toast({
        title: 'Success',
        description: 'Your appointment has been scheduled!',
      });
      
      onComplete(appointmentResult.id);
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to schedule appointment',
        variant: 'destructive',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Render expert selection step
  const renderExpertSelection = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Select a Service Expert</h2>
        <p className="text-muted-foreground">
          Choose an expert for your {serviceType.replace('_', ' ')} appointment
        </p>
        
        {isLoading ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {experts.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p>No experts available for this service type.</p>
                <Button variant="outline" onClick={onCancel} className="mt-4">
                  Go Back
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {experts.map((expert) => (
                    <Card 
                      key={expert.id}
                      className={cn(
                        "cursor-pointer overflow-hidden transition-all",
                        form.getValues('expertId') === expert.id && "ring-2 ring-primary"
                      )}
                      onClick={() => handleExpertSelect(expert.id)}
                    >
                      <CardContent className="p-0">
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{expert.name}</h3>
                              <p className="text-sm text-muted-foreground">{expert.serviceType}</p>
                            </div>
                            {form.getValues('expertId') === expert.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <p className="text-sm mt-2">{expert.description}</p>
                          <div className="flex mt-3 gap-1 flex-wrap">
                            {expert.servicesOffered?.map((service: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </>
        )}
      </div>
    );
  };

  // Render date and time selection step
  const renderDateTimeSelection = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Select Date & Time</h2>
        <p className="text-muted-foreground">
          Choose when you would like to schedule your appointment
        </p>
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div>
            <FormLabel className="mb-2 block">
              Date
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.getValues('date') && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.getValues('date') ? (
                    format(form.getValues('date'), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.getValues('date')}
                  onSelect={(date) => date && form.setValue('date', date)}
                  initialFocus
                  disabled={(date) => 
                    date < new Date(new Date().setHours(0, 0, 0, 0)) || 
                    differenceInCalendarDays(date, new Date()) > 90
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <FormLabel className="mb-2 block">
              Time
            </FormLabel>
            <Select
              onValueChange={(value) => form.setValue('timeSlot', value)}
              defaultValue={form.getValues('timeSlot')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Morning</SelectLabel>
                  {timeSlots.slice(0, 6).map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Afternoon</SelectLabel>
                  {timeSlots.slice(6).map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="pt-4">
          <FormLabel className="mb-2 block">
            Appointment Type
          </FormLabel>
          <RadioGroup
            onValueChange={(value) => form.setValue('subType', value)}
            defaultValue={form.getValues('subType')}
            className="grid grid-cols-1 md:grid-cols-3 gap-2"
          >
            {(expertSpecializations[serviceType as keyof typeof expertSpecializations] || []).map((type) => (
              <FormItem key={type} className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <RadioGroupItem value={type} />
                </FormControl>
                <FormLabel className="font-normal cursor-pointer">
                  {type}
                </FormLabel>
              </FormItem>
            ))}
          </RadioGroup>
        </div>
      </div>
    );
  };

  // Render appointment details step
  const renderAppointmentDetails = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Confirm Appointment Details</h2>
        <p className="text-muted-foreground">
          Please review and finalize your appointment information
        </p>
        
        <div className="border rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Expert</p>
              <p className="font-medium">{selectedExpert?.name}</p>
              <p className="text-sm">{selectedExpert?.serviceType}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Appointment Type</p>
              <p className="font-medium">{serviceType.replace('_', ' ')}</p>
              <p className="text-sm">{form.getValues('subType')}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {format(form.getValues('date'), "EEEE, MMMM d, yyyy")}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{form.getValues('timeSlot')}</p>
              </div>
            </div>
          </div>
          
          {(propertyAddress || propertyId) && (
            <div className="pt-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Property</p>
                  <p>{propertyAddress}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter address or meeting location"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Where would you like the appointment to take place?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any special instructions or requests"
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide any additional information for the expert
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-x-4 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handlePreviousStep}
                disabled={submitLoading}
              >
                Back
              </Button>
              <Button 
                type="submit"
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    Scheduling...
                  </>
                ) : (
                  'Confirm Appointment'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  };

  // Render the current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return renderExpertSelection();
      case 2:
        return renderDateTimeSelection();
      case 3:
        return renderAppointmentDetails();
      default:
        return renderExpertSelection();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Schedule an Appointment</h1>
        <div className="flex items-center space-x-1">
          <Badge variant={step === 1 ? "default" : "outline"}>Expert</Badge>
          <div className="w-4 h-px bg-border"></div>
          <Badge variant={step === 2 ? "default" : "outline"}>Date & Time</Badge>
          <div className="w-4 h-px bg-border"></div>
          <Badge variant={step === 3 ? "default" : "outline"}>Details</Badge>
        </div>
      </div>
      
      <div>
        {renderStep()}
      </div>
      
      {step < 3 && (
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleNextStep}
            disabled={isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}