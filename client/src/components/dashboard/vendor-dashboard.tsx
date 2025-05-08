import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BriefcaseBusiness, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  Users,
  Building,
  Star,
  ChevronRight,
  Clipboard
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function VendorDashboard() {
  const { user } = useAuth();
  const subrole = user?.subrole || 'agent'; // Default to agent if no subrole specified
  const vendorProfile = user?.vendorProfile || {};
  
  // Display name based on business name or user name
  const displayName = vendorProfile.businessName || user?.displayName;

  // Convert subrole to a friendly display name
  const subroleDisplay = {
    'agent': 'Real Estate Agent',
    'loan_officer': 'Loan Officer',
    'contractor': 'Contractor',
    'designer': 'Interior Designer'
  };

  // Different welcome messages based on vendor type
  const welcomeMessages = {
    agent: "Welcome to your agent dashboard. Manage your listings and client relationships.",
    loan_officer: "Welcome to your loan officer dashboard. Process applications and track clients.",
    contractor: "Welcome to your contractor dashboard. Manage projects and client communications.",
    designer: "Welcome to your designer dashboard. Showcase your portfolio and manage client projects."
  };

  const welcomeMessage = welcomeMessages[subrole as keyof typeof welcomeMessages] || welcomeMessages.agent;

  // Mock data for demonstration
  const totalClients = 12;
  const activeAppointments = 3;
  const profileCompletion = 65;
  const upcomingAppointments = [
    { client: 'John Davis', type: 'Property Viewing', time: 'Tomorrow, 10:00 AM' },
    { client: 'Sarah Wilson', type: 'Consultation', time: 'Friday, 2:30 PM' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome, {displayName}</h2>
        <p className="text-muted-foreground">{welcomeMessage}</p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorProfile.avgRating || '4.8'}</div>
            <p className="text-xs text-muted-foreground">
              {vendorProfile.reviewCount || '24'} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$5,240</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profile completion */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Profile Completion</CardTitle>
          <CardDescription>
            Complete your profile to attract more clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div>Profile Information</div>
                <div className="font-medium">{profileCompletion}%</div>
              </div>
              <Progress value={profileCompletion} className="h-2" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/profile">
              Complete Profile
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming appointments */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>
              Your scheduled appointments for the next 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{appointment.client[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">{appointment.client}</p>
                      <p className="text-sm text-muted-foreground">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="outline">{appointment.time}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/dashboard/appointments">
                View All Appointments
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Quick actions */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/dashboard/clients">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>View Clients</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/dashboard/messages">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Messages</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/dashboard/appointments/new">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Appointment</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            
            {subrole === 'agent' && (
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href="/dashboard/listings">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>Manage Listings</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
            
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/dashboard/earnings">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>View Earnings</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Services section for specific vendor types */}
      {(subrole === 'agent' || subrole === 'contractor' || subrole === 'designer') && (
        <Card>
          <CardHeader>
            <CardTitle>My Services</CardTitle>
            <CardDescription>
              {subrole === 'agent' && "Your real estate services offered to clients"}
              {subrole === 'contractor' && "Your construction and renovation services"}
              {subrole === 'designer' && "Your interior design services and packages"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Would display actual services from the database */}
              <div className="flex items-center justify-between border-b py-2">
                <div className="flex items-center gap-2">
                  <Clipboard className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {subrole === 'agent' && "Full Service Representation"}
                    {subrole === 'contractor' && "Full Home Renovation"}
                    {subrole === 'designer' && "Complete Interior Design Package"}
                  </p>
                </div>
                <Badge>
                  {subrole === 'agent' && "From $5,000"}
                  {subrole === 'contractor' && "Custom Quote"}
                  {subrole === 'designer' && "From $2,500"}
                </Badge>
              </div>
              <div className="flex items-center justify-between border-b py-2">
                <div className="flex items-center gap-2">
                  <Clipboard className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {subrole === 'agent' && "Property Marketing"}
                    {subrole === 'contractor' && "Kitchen Remodeling"}
                    {subrole === 'designer' && "Single Room Design"}
                  </p>
                </div>
                <Badge>
                  {subrole === 'agent' && "From $1,000"}
                  {subrole === 'contractor' && "From $10,000"}
                  {subrole === 'designer' && "From $800"}
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/dashboard/my-services">
                Manage My Services
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Loan officer specific section */}
      {subrole === 'loan_officer' && (
        <Card>
          <CardHeader>
            <CardTitle>Loan Applications</CardTitle>
            <CardDescription>
              Recent loan applications requiring your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b py-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">James Duncan</p>
                    <p className="text-xs text-muted-foreground">Conventional Loan</p>
                  </div>
                </div>
                <Badge variant="secondary">Pending Review</Badge>
              </div>
              <div className="flex items-center justify-between border-b py-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AM</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Alice Mercer</p>
                    <p className="text-xs text-muted-foreground">FHA Loan</p>
                  </div>
                </div>
                <Badge variant="secondary">Documents Needed</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/dashboard/loan-applications">
                View All Applications
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}