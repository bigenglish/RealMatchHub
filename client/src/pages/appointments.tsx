import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppointmentScheduler from '@/components/appointment-scheduler';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Appointment } from '@shared/chat-schema';

// Current mock user - in a real app, this would come from authentication
const currentUser = {
  id: 1,
  name: 'John Smith',
  email: 'john.smith@example.com',
  type: 'buyer',
};

// This page shows all appointments for the current user
export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const { toast } = useToast();

  // Fetch appointments for the current user
  const { data: appointments, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/appointments', currentUser.id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/appointments?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      const appointmentsData = await response.json();
      return appointmentsData;
    }
  });

  const handleScheduleComplete = (appointmentId: number) => {
    setShowScheduleDialog(false);
    toast({
      title: 'Appointment Scheduled',
      description: `Your appointment has been scheduled. Appointment ID: #${appointmentId}`,
    });
    refetch();
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailDialog(true);
  };

  const handleUpdateStatus = async (appointmentId: number, status: string) => {
    try {
      const response = await apiRequest('PATCH', `/api/appointments/${appointmentId}/status`, { status });
      
      if (!response.ok) {
        throw new Error('Failed to update appointment status');
      }
      
      toast({
        title: 'Status Updated',
        description: `Appointment status has been updated to ${status}`,
      });
      
      refetch();
      
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setShowDetailDialog(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  // Filter appointments by status
  const filterAppointments = (appointments: Appointment[] = []) => {
    const now = new Date();
    
    if (activeTab === 'upcoming') {
      return appointments.filter(appointment => 
        new Date(appointment.date) > now && 
        ['pending', 'confirmed'].includes(appointment.status)
      );
    } else if (activeTab === 'past') {
      return appointments.filter(appointment => 
        new Date(appointment.date) < now || 
        ['completed', 'canceled'].includes(appointment.status)
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      return appointments;
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'canceled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Format appointment date
  const formatAppointmentDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'MMMM d, yyyy');
  };

  // Format appointment time
  const formatAppointmentTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'h:mm a');
  };

  // Render appointment status badge
  const renderStatusBadge = (status: string) => {
    return (
      <Badge variant="outline" className={`${getStatusColor(status)} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Render appointment cards
  const renderAppointmentCards = () => {
    const filteredAppointments = filterAppointments(appointments);
    
    if (filteredAppointments.length === 0) {
      return (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No appointments found</p>
          <Button onClick={() => setShowScheduleDialog(true)} className="mt-4">
            Schedule an Appointment
          </Button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {filteredAppointments.map((appointment) => (
          <Card key={appointment.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    {appointment.type.replace('_', ' ')} - {appointment.subType}
                  </CardTitle>
                  <CardDescription>
                    Appointment #{appointment.id}
                  </CardDescription>
                </div>
                {renderStatusBadge(appointment.status)}
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{formatAppointmentDate(appointment.date)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <ClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{formatAppointmentTime(appointment.date)}</span>
                </div>
                {appointment.metadata && appointment.metadata.propertyAddress && (
                  <div className="flex items-center text-sm">
                    <MapPinIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="truncate">{String(appointment.metadata.propertyAddress)}</span>
                  </div>
                )}
                {appointment.metadata && appointment.metadata.expertName && (
                  <div className="flex items-center text-sm">
                    <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{String(appointment.metadata.expertName)}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleViewAppointment(appointment)}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <Button onClick={() => setShowScheduleDialog(true)}>
          Schedule New Appointment
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-destructive">
              <p>Error loading appointments.</p>
              <Button variant="outline" onClick={() => refetch()} className="mt-2">
                Try Again
              </Button>
            </div>
          ) : (
            renderAppointmentCards()
          )}
        </TabsContent>
        <TabsContent value="past">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-destructive">
              <p>Error loading appointments.</p>
              <Button variant="outline" onClick={() => refetch()} className="mt-2">
                Try Again
              </Button>
            </div>
          ) : (
            renderAppointmentCards()
          )}
        </TabsContent>
      </Tabs>
      
      {/* Schedule Appointment Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AppointmentScheduler
            userId={currentUser.id}
            userName={currentUser.name}
            serviceType="consultation"
            onComplete={handleScheduleComplete}
            onCancel={() => setShowScheduleDialog(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Appointment Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          {selectedAppointment && (
            <>
              <DialogTitle>
                {selectedAppointment.type.replace('_', ' ')} - {selectedAppointment.subType}
              </DialogTitle>
              <DialogDescription>
                Appointment #{selectedAppointment.id}
              </DialogDescription>
              
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4 py-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Status:</span>
                    {renderStatusBadge(selectedAppointment.status)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{formatAppointmentDate(selectedAppointment.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{formatAppointmentTime(selectedAppointment.date)}</span>
                    </div>
                  </div>
                  
                  {selectedAppointment.metadata && selectedAppointment.metadata.propertyAddress && (
                    <div>
                      <span className="font-medium block mb-1">Property:</span>
                      <div className="flex items-start">
                        <MapPinIcon className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                        <span>{String(selectedAppointment.metadata.propertyAddress)}</span>
                      </div>
                    </div>
                  )}
                  
                  {selectedAppointment.metadata && selectedAppointment.metadata.expertName && (
                    <div>
                      <span className="font-medium block mb-1">Expert:</span>
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{String(selectedAppointment.metadata.expertName)}</span>
                      </div>
                    </div>
                  )}
                  
                  {selectedAppointment.notes && (
                    <div>
                      <span className="font-medium block mb-1">Notes:</span>
                      <div className="bg-muted p-3 rounded-md text-sm">
                        {selectedAppointment.notes}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <Separator />
              
              <div className="flex justify-end gap-2">
                {['pending', 'confirmed'].includes(selectedAppointment.status) && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedAppointment.id, 'canceled')}
                      className="flex items-center gap-1"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      Cancel
                    </Button>
                    
                    {selectedAppointment.status === 'pending' && (
                      <Button
                        onClick={() => handleUpdateStatus(selectedAppointment.id, 'confirmed')}
                        className="flex items-center gap-1"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        Confirm
                      </Button>
                    )}
                    
                    {selectedAppointment.status === 'confirmed' && (
                      <Button
                        onClick={() => handleUpdateStatus(selectedAppointment.id, 'completed')}
                        className="flex items-center gap-1"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        Mark Completed
                      </Button>
                    )}
                  </>
                )}
                
                {selectedAppointment.status === 'canceled' && (
                  <Button
                    variant="outline"
                    onClick={() => setShowScheduleDialog(true)}
                  >
                    Reschedule
                  </Button>
                )}
                
                <Button
                  variant={['pending', 'confirmed'].includes(selectedAppointment.status) ? 'outline' : 'default'}
                  onClick={() => setShowDetailDialog(false)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}