import React, { useState, useEffect } from 'react';
import { format, parseISO, addDays, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, CalendarIcon, MapPin, Video, User } from 'lucide-react';

// Tour types
const TOUR_TYPES = [
  { id: 'in-person', label: 'In-Person Guided Tour', icon: <MapPin className="h-5 w-5" /> },
  { id: 'live-video', label: 'Live Video Tour', icon: <Video className="h-5 w-5" /> },
  { id: 'self-guided', label: 'Self-Guided Tour', icon: <User className="h-5 w-5" /> }
];

// Time slots
const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
];

interface AppointmentSchedulerProps {
  propertyId?: string;
  propertyAddress?: string;
  onScheduleComplete?: (appointmentDetails: {
    tourType: string;
    date: Date;
    time: string;
    name: string;
    email: string;
    phone: string;
    notes: string;
  }) => void;
  buttonLabel?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  isFullWidth?: boolean;
}

export default function AppointmentScheduler({
  propertyId,
  propertyAddress = "Property",
  onScheduleComplete,
  buttonLabel = "Schedule a Tour",
  buttonVariant = "default",
  buttonSize = "default",
  isFullWidth = false
}: AppointmentSchedulerProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [tourType, setTourType] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>(TIME_SLOTS);
  
  // Generate available dates (next 30 days)
  useEffect(() => {
    const dates = eachDayOfInterval({
      start: new Date(),
      end: addMonths(new Date(), 1)
    });
    
    // Filter out weekends if needed or other logic to determine availability
    const filteredDates = dates.filter(date => {
      const day = date.getDay();
      // Example: exclude Sundays (0)
      return day !== 0;
    });
    
    setAvailableDates(filteredDates);
  }, []);
  
  // Reset time when date changes
  useEffect(() => {
    if (date) {
      // Here you would typically fetch available time slots for the selected date
      // For now, we'll use all time slots but filter based on the day
      const day = date.getDay();
      // Example: fewer slots on Saturdays
      const slots = day === 6 
        ? TIME_SLOTS.filter((_, i) => i < 8) // Only morning slots on Saturday
        : TIME_SLOTS;
      
      setAvailableTimes(slots);
      setTime(''); // Reset time selection
    }
  }, [date]);
  
  const handleComplete = () => {
    if (!date || !time || !tourType) return;
    
    const appointmentDetails = {
      tourType,
      date,
      time,
      name,
      email,
      phone,
      notes
    };
    
    // Call the callback if provided
    if (onScheduleComplete) {
      onScheduleComplete(appointmentDetails);
    }
    
    // For demo, just show a success message and close
    console.log('Appointment scheduled:', appointmentDetails);
    
    // Reset form and close dialog
    resetForm();
    setOpen(false);
  };
  
  const resetForm = () => {
    setStep(1);
    setTourType('');
    setDate(undefined);
    setTime('');
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button 
          variant={buttonVariant} 
          size={buttonSize} 
          className={isFullWidth ? "w-full" : ""}
        >
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Schedule a Tour"}
            {step === 2 && "Select Date & Time"}
            {step === 3 && "Your Information"}
            {step === 4 && "Confirm Appointment"}
          </DialogTitle>
          <DialogDescription>
            {propertyAddress && `For property at: ${propertyAddress}`}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Tour Type Selection */}
        {step === 1 && (
          <div className="py-4">
            <h3 className="text-lg font-medium mb-4">Choose Tour Type</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {TOUR_TYPES.map((type) => (
                <Card 
                  key={type.id}
                  className={`cursor-pointer border-2 transition-all ${
                    tourType === type.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-gray-400'
                  }`}
                  onClick={() => setTourType(type.id)}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center h-40">
                    <div className={`p-3 rounded-full mb-2 ${
                      tourType === type.id ? 'bg-primary/20 text-primary' : 'bg-gray-100'
                    }`}>
                      {type.icon}
                    </div>
                    <h4 className="font-medium">{type.label}</h4>
                    {tourType === type.id && (
                      <CheckCircle className="text-primary w-5 h-5 mt-2 absolute top-2 right-2" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Step 2: Date & Time Selection */}
        {step === 2 && (
          <div className="py-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-medium mb-4">Select a Date</h3>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => {
                    // Disable dates that aren't in availableDates
                    return !availableDates.some(availableDate => 
                      isSameDay(availableDate, date)
                    );
                  }}
                  className="border rounded-md p-2"
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">
                  {date 
                    ? `Select a Time for ${format(date, 'MMMM d, yyyy')}` 
                    : 'Select a Date First'}
                </h3>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                  {date ? (
                    availableTimes.map((timeSlot) => (
                      <Button
                        key={timeSlot}
                        variant={time === timeSlot ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => setTime(timeSlot)}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {timeSlot}
                      </Button>
                    ))
                  ) : (
                    <p className="text-gray-500 col-span-2">
                      Please select a date first
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 3: Contact Information */}
        {step === 3 && (
          <div className="py-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="(123) 456-7890"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes or Questions (Optional)</Label>
                <Input 
                  id="notes" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Any specific questions or requests?"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="py-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-2">Tour Details</h3>
              
              <div className="grid gap-2 mb-4">
                <div className="flex">
                  <div className="font-medium w-32">Tour Type:</div>
                  <div>{TOUR_TYPES.find(t => t.id === tourType)?.label}</div>
                </div>
                
                <div className="flex">
                  <div className="font-medium w-32">Date:</div>
                  <div>{date ? format(date, 'MMMM d, yyyy') : ''}</div>
                </div>
                
                <div className="flex">
                  <div className="font-medium w-32">Time:</div>
                  <div>{time}</div>
                </div>
              </div>
              
              <h3 className="font-medium text-lg mb-2">Contact Information</h3>
              
              <div className="grid gap-2">
                <div className="flex">
                  <div className="font-medium w-32">Name:</div>
                  <div>{name}</div>
                </div>
                
                <div className="flex">
                  <div className="font-medium w-32">Email:</div>
                  <div>{email}</div>
                </div>
                
                <div className="flex">
                  <div className="font-medium w-32">Phone:</div>
                  <div>{phone}</div>
                </div>
                
                {notes && (
                  <div className="flex">
                    <div className="font-medium w-32">Notes:</div>
                    <div>{notes}</div>
                  </div>
                )}
              </div>
            </div>
            
            <p className="mt-4 text-sm text-gray-500">
              After confirming, you'll receive a confirmation email with details about your appointment.
              {tourType === 'live-video' && " A link to join the video call will be provided closer to the appointment time."}
            </p>
          </div>
        )}
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
          )}
          
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            
            {step < 4 ? (
              <Button
                type="button"
                onClick={() => {
                  // Validation before proceeding
                  if (step === 1 && !tourType) return;
                  if (step === 2 && (!date || !time)) return;
                  if (step === 3 && (!name || !email || !phone)) return;
                  
                  setStep(step + 1);
                }}
                disabled={
                  (step === 1 && !tourType) ||
                  (step === 2 && (!date || !time)) ||
                  (step === 3 && (!name || !email || !phone))
                }
              >
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleComplete}
              >
                Confirm Appointment
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}