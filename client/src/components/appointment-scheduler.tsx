import React, { useState, useEffect } from 'react';
import { format, addDays, parse, isAfter, isBefore, addWeeks } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import PaymentProcessor from './payment-processor';
import { CalendarIcon, Clock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export interface ServiceExpert {
  id: number;
  name: string;
  title: string;
  description: string;
  services: string[];
  rating: number;
  price: number;
  image?: string;
  availability?: string[];
}

interface AppointmentSchedulerProps {
  userId: number;
  userName: string;
  propertyId?: number;
  propertyAddress?: string;
  expertId?: number;
  serviceType: string;
  onComplete?: (appointmentId: number) => void;
  onCancel?: () => void;
}

type AppointmentStep = 'datetime' | 'details' | 'payment' | 'confirmation';
type TimeSlot = { time: string; available: boolean };

const generateTimeSlots = (date: Date, bookedTimes: string[] = []): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 9; // 9 AM
  const endHour = 18; // 6 PM
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const dateTimeString = `${format(date, 'yyyy-MM-dd')}T${timeString}:00`;
      
      slots.push({
        time: timeString,
        available: !bookedTimes.includes(dateTimeString)
      });
    }
  }
  
  return slots;
};

export default function AppointmentScheduler({
  userId,
  userName,
  propertyId,
  propertyAddress,
  expertId,
  serviceType,
  onComplete,
  onCancel
}: AppointmentSchedulerProps) {
  const [step, setStep] = useState<AppointmentStep>('datetime');
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<string>(serviceType);
  const [subType, setSubType] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [experts, setExperts] = useState<ServiceExpert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<ServiceExpert | null>(null);
  const [bookedSlots, setBookedSlots] = useState<Record<string, string[]>>({});
  const [appointmentId, setAppointmentId] = useState<number | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const { toast } = useToast();

  // Fetch experts based on service type
  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const response = await apiRequest('GET', `/api/service-experts?serviceType=${serviceType}`);
        const data = await response.json();
        
        if (data.length > 0) {
          setExperts(data);
          
          // If expertId is provided, select that expert
          if (expertId) {
            const expert = data.find((e: ServiceExpert) => e.id === expertId);
            if (expert) {
              setSelectedExpert(expert);
            }
          } else {
            // Otherwise select the first expert
            setSelectedExpert(data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching experts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load available experts',
          variant: 'destructive',
        });
      }
    };

    fetchExperts();
  }, [serviceType, expertId]);

  // Update time slots when date changes
  useEffect(() => {
    if (date) {
      const dateString = format(date, 'yyyy-MM-dd');
      const bookedTimes = bookedSlots[dateString] || [];
      setTimeSlots(generateTimeSlots(date, bookedTimes));
      setSelectedTime(null); // Reset selected time
    }
  }, [date, bookedSlots]);

  // Fetch booked appointments for the current expert
  useEffect(() => {
    if (selectedExpert) {
      const fetchBookings = async () => {
        try {
          const response = await apiRequest('GET', `/api/appointments?expertId=${selectedExpert.id}`);
          const appointments = await response.json();
          
          // Organize booked slots by date
          const slots: Record<string, string[]> = {};
          
          appointments.forEach((apt: any) => {
            const aptDate = new Date(apt.date);
            const dateString = format(aptDate, 'yyyy-MM-dd');
            const timeString = format(aptDate, "yyyy-MM-dd'T'HH:mm:ss");
            
            if (!slots[dateString]) {
              slots[dateString] = [];
            }
            
            slots[dateString].push(timeString);
          });
          
          setBookedSlots(slots);
        } catch (error) {
          console.error('Error fetching bookings:', error);
        }
      };
      
      fetchBookings();
    }
  }, [selectedExpert]);

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
  };

  const handleNextStep = () => {
    if (step === 'datetime' && date && selectedTime) {
      setStep('details');
    } else if (step === 'details') {
      setStep('payment');
    }
  };

  const handlePreviousStep = () => {
    if (step === 'details') {
      setStep('datetime');
    } else if (step === 'payment') {
      setStep('details');
    }
  };

  const handlePaymentComplete = async (paymentId: string) => {
    if (!date || !selectedTime || !selectedExpert) {
      return;
    }

    try {
      // Format date and time for the appointment
      const dateTimeString = `${format(date, 'yyyy-MM-dd')}T${selectedTime}:00`;
      const appointmentDateTime = new Date(dateTimeString);

      // Create appointment
      const appointmentData = {
        userId,
        expertId: selectedExpert.id,
        propertyId,
        type: appointmentType,
        subType,
        date: appointmentDateTime.toISOString(),
        notes,
        status: 'confirmed',
        paymentId,
        metadata: {
          customerName: userName,
          propertyAddress,
          serviceName: `${appointmentType} - ${subType}`,
          expertName: selectedExpert.name,
          price: selectedExpert.price
        }
      };

      const response = await apiRequest('POST', '/api/appointments', appointmentData);
      const appointment = await response.json();
      
      setAppointmentId(appointment.id);
      setStep('confirmation');
      
      toast({
        title: 'Appointment Scheduled',
        description: `Your appointment has been scheduled for ${format(date, 'MMMM d, yyyy')} at ${selectedTime}`,
      });
      
      if (onComplete) {
        onComplete(appointment.id);
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule appointment',
        variant: 'destructive',
      });
    }
  };

  const renderTimeSelector = () => {
    return (
      <div className="grid grid-cols-4 gap-2 mt-4">
        {timeSlots.map((slot, index) => (
          <Button
            key={index}
            variant={selectedTime === slot.time ? 'default' : 'outline'}
            className={`
              ${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}
              ${selectedTime === slot.time ? 'bg-primary' : ''}
            `}
            onClick={() => slot.available && handleSelectTime(slot.time)}
            disabled={!slot.available}
          >
            {slot.time}
          </Button>
        ))}
      </div>
    );
  };

  const renderExpertSelector = () => {
    if (experts.length === 0) {
      return (
        <div className="p-4 bg-muted rounded">
          No experts available for this service.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <RadioGroup
          value={selectedExpert?.id.toString()}
          onValueChange={(value) => {
            const expert = experts.find(e => e.id.toString() === value);
            if (expert) {
              setSelectedExpert(expert);
            }
          }}
        >
          {experts.map((expert) => (
            <div key={expert.id} className="flex items-start space-x-3 p-3 border rounded-md">
              <RadioGroupItem value={expert.id.toString()} id={`expert-${expert.id}`} />
              <div className="flex-1">
                <div className="flex justify-between">
                  <Label htmlFor={`expert-${expert.id}`} className="font-medium">
                    {expert.name}
                  </Label>
                  <div className="text-sm font-medium">${expert.price.toFixed(2)}</div>
                </div>
                <p className="text-sm text-gray-500 mt-1">{expert.title}</p>
                <div className="mt-1 flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span 
                      key={i} 
                      className={`text-sm ${i < expert.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-1 text-xs text-gray-500">({expert.rating.toFixed(1)})</span>
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  };

  // Sub-type options based on appointment type
  const getSubTypeOptions = () => {
    switch (appointmentType) {
      case 'property_tour':
        return ['In-person Tour', 'Virtual Tour', 'Open House Visit'];
      case 'consultation':
        return ['Property Valuation', 'Buying Strategy', 'Selling Strategy', 'Investment Consultation'];
      case 'inspection':
        return ['Full Home Inspection', 'Specialized Inspection', 'Pre-listing Inspection'];
      case 'appraisal':
        return ['Full Appraisal', 'Desktop Appraisal', 'Drive-by Appraisal'];
      case 'mortgage':
        return ['Initial Consultation', 'Loan Application', 'Rate Discussion'];
      case 'legal':
        return ['Contract Review', 'Title Search', 'Closing Preparation'];
      default:
        return ['General Appointment'];
    }
  };

  const renderDatetimeStep = () => (
    <>
      <CardHeader>
        <CardTitle>Schedule an Appointment</CardTitle>
        <CardDescription>
          Select a date and time for your {serviceType.replace('_', ' ')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 p-3 rounded-md">
          <div className="flex items-center mb-2">
            <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <h3 className="font-medium">Select Date</h3>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return (
                isBefore(date, today) || 
                isAfter(date, addWeeks(today, 4)) || 
                date.getDay() === 0 || // Sunday
                date.getDay() === 6    // Saturday
              );
            }}
            className="rounded-md border"
          />
        </div>

        {date && (
          <div className="bg-muted/50 p-3 rounded-md">
            <div className="flex items-center mb-2">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <h3 className="font-medium">Select Time</h3>
            </div>
            {renderTimeSelector()}
          </div>
        )}

        <div className="bg-muted/50 p-3 rounded-md">
          <div className="flex items-center mb-2">
            <h3 className="font-medium">Select Expert</h3>
          </div>
          {renderExpertSelector()}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleNextStep}
          disabled={!date || !selectedTime || !selectedExpert}
        >
          Next
        </Button>
      </CardFooter>
    </>
  );

  const renderDetailsStep = () => (
    <>
      <CardHeader>
        <CardTitle>Appointment Details</CardTitle>
        <CardDescription>
          Provide additional details for your appointment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="appointment-type">Appointment Type</Label>
          <Select 
            value={appointmentType} 
            onValueChange={setAppointmentType}
          >
            <SelectTrigger id="appointment-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="property_tour">Property Tour</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="inspection">Inspection</SelectItem>
              <SelectItem value="appraisal">Appraisal</SelectItem>
              <SelectItem value="mortgage">Mortgage</SelectItem>
              <SelectItem value="legal">Legal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sub-type">Appointment Sub-type</Label>
          <Select 
            value={subType} 
            onValueChange={setSubType}
          >
            <SelectTrigger id="sub-type">
              <SelectValue placeholder="Select sub-type" />
            </SelectTrigger>
            <SelectContent>
              {getSubTypeOptions().map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {propertyAddress && (
          <div>
            <Label>Property</Label>
            <div className="p-3 bg-muted rounded-md">
              {propertyAddress}
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any special requirements or questions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="bg-muted/50 p-3 rounded-md">
          <h3 className="font-medium mb-2">Appointment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">{date ? format(date, 'MMMM d, yyyy') : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">{selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expert:</span>
              <span className="font-medium">{selectedExpert?.name}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-medium">${selectedExpert?.price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handlePreviousStep}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleNextStep}
          disabled={!appointmentType || !subType}
        >
          Proceed to Payment
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </>
  );

  const renderPaymentStep = () => (
    <>
      <CardHeader>
        <CardTitle>Payment</CardTitle>
        <CardDescription>
          Complete payment to schedule your appointment
        </CardDescription>
      </CardHeader>
      <CardContent>
        {selectedExpert && (
          <PaymentProcessor
            serviceName={`${appointmentType.replace('_', ' ')} - ${subType}`}
            description={`Appointment with ${selectedExpert.name} on ${date ? format(date, 'MMMM d, yyyy') : ''} at ${selectedTime}`}
            amount={selectedExpert.price}
            onComplete={handlePaymentComplete}
            onCancel={handlePreviousStep}
          />
        )}
      </CardContent>
    </>
  );

  const renderConfirmationStep = () => (
    <>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
          Appointment Confirmed
        </CardTitle>
        <CardDescription>
          Your appointment has been successfully scheduled
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-md">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Appointment ID:</span>
              <span className="font-medium">#{appointmentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">{date ? format(date, 'MMMM d, yyyy') : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">{selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">{appointmentType.replace('_', ' ')} - {subType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expert:</span>
              <span className="font-medium">{selectedExpert?.name}</span>
            </div>
            {propertyAddress && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Property:</span>
                <span className="font-medium">{propertyAddress}</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          A confirmation email has been sent to your registered email address.
          You can also view this appointment in your account dashboard.
        </p>

        <div className="flex flex-col items-center">
          <Badge className="mb-2">Add to Calendar</Badge>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Google</Button>
            <Button variant="outline" size="sm">Apple</Button>
            <Button variant="outline" size="sm">Outlook</Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => onComplete && onComplete(appointmentId || 0)}
        >
          Done
        </Button>
      </CardFooter>
    </>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 'datetime':
        return renderDatetimeStep();
      case 'details':
        return renderDetailsStep();
      case 'payment':
        return renderPaymentStep();
      case 'confirmation':
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      {renderCurrentStep()}
    </Card>
  );
}