import * as React from 'react';
import { UserData } from '@/lib/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Calendar, FileText, Clock, 
  ArrowUpRight, MessageSquare, DollarSign, 
  BarChart3, Home, Briefcase, CheckSquare
} from 'lucide-react';

interface VendorDashboardProps {
  user: UserData;
}

export const VendorDashboard: React.FC<VendorDashboardProps> = ({ user }) => {
  const subrole = user.subrole || 'agent'; // Default to agent if no subrole

  // Render different dashboard content based on subrole
  const renderSubroleSpecificContent = () => {
    switch (subrole) {
      case 'agent':
        return <AgentDashboard user={user} />;
      case 'loan_officer':
        return <LoanOfficerDashboard user={user} />;
      case 'contractor':
        return <ContractorDashboard user={user} />;
      case 'designer':
        return <DesignerDashboard user={user} />;
      default:
        return <AgentDashboard user={user} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome{user.displayName ? `, ${user.displayName}` : ''}
        </h2>
        <Button variant="outline">View Profile</Button>
      </div>

      {renderSubroleSpecificContent()}
    </div>
  );
};

// Agent Dashboard Component
const AgentDashboard: React.FC<VendorDashboardProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground">
              +3 in the last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Next: Today at 3:30 PM
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              2 pending offers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission MTD</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24,500</div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks and Calendar Tabs */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>To-Do List</CardTitle>
              <CardDescription>Your tasks for today and upcoming</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Today's Tasks */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">TODAY</h3>
                  <div className="space-y-2">
                    {[
                      { 
                        title: "Call back Jessica Adams", 
                        status: "high", 
                        time: "11:00 AM",
                        completed: false
                      },
                      { 
                        title: "Upload new listing photos for 123 Oak St", 
                        status: "medium", 
                        time: "1:00 PM",
                        completed: false
                      },
                      { 
                        title: "Review contract for Wilson purchase", 
                        status: "high", 
                        time: "3:00 PM",
                        completed: false
                      },
                      { 
                        title: "Send follow up email to new leads", 
                        status: "medium", 
                        time: "4:30 PM",
                        completed: true
                      }
                    ].map((task, i) => (
                      <div 
                        key={i} 
                        className={`flex items-center justify-between p-3 rounded-md border
                          ${task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-4 h-4 rounded-full 
                              ${task.status === 'high' 
                                ? 'bg-red-500' 
                                : task.status === 'medium' 
                                  ? 'bg-amber-500' 
                                  : 'bg-blue-500'
                              }
                            `}
                          />
                          <div>
                            <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                              {task.title}
                            </p>
                            <p className="text-xs text-gray-500">{task.time}</p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant={task.completed ? "outline" : "default"} 
                          className={task.completed ? "text-gray-500" : ""}
                        >
                          {task.completed ? "Completed" : "Complete"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tomorrow's Tasks */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">TOMORROW</h3>
                  <div className="space-y-2">
                    {[
                      { 
                        title: "Home inspection at 456 Pine St", 
                        status: "high", 
                        time: "9:30 AM",
                        completed: false
                      },
                      { 
                        title: "Meeting with Thompson family", 
                        status: "medium", 
                        time: "1:00 PM",
                        completed: false
                      },
                      { 
                        title: "Listing presentation for 789 Maple Dr", 
                        status: "high", 
                        time: "4:00 PM",
                        completed: false
                      }
                    ].map((task, i) => (
                      <div 
                        key={i} 
                        className="flex items-center justify-between p-3 rounded-md border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-4 h-4 rounded-full 
                              ${task.status === 'high' 
                                ? 'bg-red-500' 
                                : task.status === 'medium' 
                                  ? 'bg-amber-500' 
                                  : 'bg-blue-500'
                              }
                            `}
                          />
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-xs text-gray-500">{task.time}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Reminder
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calendar" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your schedule for the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Today */}
                <div>
                  <h3 className="font-medium mb-3">Today - May 8</h3>
                  <div className="space-y-3">
                    {[
                      { 
                        title: "Property showing at 123 Main St", 
                        time: "3:30 PM - 4:30 PM",
                        client: "Martinez Family",
                        type: "showing"
                      },
                      { 
                        title: "Closing documents review", 
                        time: "5:00 PM - 6:00 PM",
                        client: "Johnson Family",
                        type: "meeting"
                      }
                    ].map((appt, i) => (
                      <div key={i} className="flex gap-4 p-3 border rounded-lg">
                        <div className={`
                          w-2 self-stretch rounded-full 
                          ${appt.type === 'showing' ? 'bg-purple-500' : 'bg-blue-500'}
                        `} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{appt.title}</h4>
                            <Badge variant="outline">{appt.type}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{appt.time}</p>
                          <p className="text-sm mt-1">Client: {appt.client}</p>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm">Reschedule</Button>
                            <Button size="sm">Join Meeting</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tomorrow */}
                <div>
                  <h3 className="font-medium mb-3">Tomorrow - May 9</h3>
                  <div className="space-y-3">
                    {[
                      { 
                        title: "Home inspection", 
                        time: "9:30 AM - 11:30 AM",
                        client: "Wilson Family",
                        type: "inspection"
                      },
                      { 
                        title: "New client consultation", 
                        time: "1:00 PM - 2:00 PM",
                        client: "Rebecca Adams",
                        type: "meeting"
                      },
                      { 
                        title: "Listing presentation", 
                        time: "4:00 PM - 5:00 PM",
                        client: "Thompson Family",
                        type: "presentation"
                      }
                    ].map((appt, i) => (
                      <div key={i} className="flex gap-4 p-3 border rounded-lg">
                        <div className={`
                          w-2 self-stretch rounded-full 
                          ${appt.type === 'inspection' 
                            ? 'bg-green-500' 
                            : appt.type === 'presentation' 
                              ? 'bg-amber-500' 
                              : 'bg-blue-500'
                          }
                        `} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{appt.title}</h4>
                            <Badge variant="outline">{appt.type}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{appt.time}</p>
                          <p className="text-sm mt-1">Client: {appt.client}</p>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm">Reschedule</Button>
                            <Button variant="outline" size="sm">Details</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Active Listings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active Listings</CardTitle>
            <CardDescription>Your current property listings</CardDescription>
          </div>
          <Button variant="outline" className="gap-1">
            <Home className="h-4 w-4" /> Add Listing
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {[
              {
                address: "123 Oak Street, Los Angeles, CA 90001",
                price: "$749,000",
                status: "Active",
                days: 7,
                views: 243,
                showings: 8,
                offers: 0
              },
              {
                address: "456 Pine Avenue, Los Angeles, CA 90004",
                price: "$895,000",
                status: "Pending",
                days: 14,
                views: 412,
                showings: 12,
                offers: 2
              },
              {
                address: "789 Maple Drive, Los Angeles, CA 90012",
                price: "$1,250,000",
                status: "Active",
                days: 3,
                views: 128,
                showings: 4,
                offers: 0
              },
              {
                address: "234 Elm Court, Los Angeles, CA 90015",
                price: "$625,000",
                status: "Active",
                days: 22,
                views: 324,
                showings: 10,
                offers: 1
              }
            ].map((listing, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg">
                <div className="md:w-1/4">
                  <div className="aspect-video rounded-lg bg-gray-200 overflow-hidden">
                    <img 
                      src={`https://picsum.photos/seed/${i+400}/600/400`}
                      alt="Property" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="md:w-3/4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{listing.address}</h3>
                    <Badge className={`
                      ${listing.status === 'Active' ? 'bg-green-500' : 'bg-amber-500'}
                    `}>
                      {listing.status}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-blue-600">{listing.price}</p>
                    <p className="text-sm text-gray-500">{listing.days} days on market</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 py-2">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">Views</p>
                      <p className="font-medium">{listing.views}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">Showings</p>
                      <p className="font-medium">{listing.showings}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">Offers</p>
                      <p className="font-medium">{listing.offers}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm">Edit Listing</Button>
                    <Button variant="outline" size="sm">Schedule Showing</Button>
                    <Button variant="outline" size="sm">Share Listing</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Loan Officer Dashboard Component
const LoanOfficerDashboard: React.FC<VendorDashboardProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              +4 in the last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loans Closed</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loan Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.4M</div>
            <p className="text-xs text-muted-foreground">
              Month to date
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.25%</div>
            <p className="text-xs text-muted-foreground">
              -0.125% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Applications</CardTitle>
          <CardDescription>Manage your current loan applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-7 bg-gray-50 p-3 font-medium text-sm">
              <div>Client</div>
              <div>Loan Type</div>
              <div>Amount</div>
              <div>Rate</div>
              <div>Status</div>
              <div>Submitted</div>
              <div>Actions</div>
            </div>
            <div className="divide-y">
              {[
                {
                  client: "James & Sarah Wilson",
                  loan_type: "Conventional",
                  amount: "$420,000",
                  rate: "6.125%",
                  status: "In Underwriting",
                  submitted: "May 1, 2025",
                  days: 7
                },
                {
                  client: "Michael Thompson",
                  loan_type: "FHA",
                  amount: "$310,000",
                  rate: "6.25%",
                  status: "Needs Documents",
                  submitted: "May 3, 2025",
                  days: 5
                },
                {
                  client: "Rebecca Chen",
                  loan_type: "VA",
                  amount: "$385,000",
                  rate: "5.875%",
                  status: "Pre-Approved",
                  submitted: "May 5, 2025",
                  days: 3
                },
                {
                  client: "David & Lisa Rodriguez",
                  loan_type: "Conventional",
                  amount: "$525,000",
                  rate: "6.375%",
                  status: "Conditions Review",
                  submitted: "April 27, 2025",
                  days: 11
                },
                {
                  client: "Jennifer Smith",
                  loan_type: "Jumbo",
                  amount: "$850,000",
                  rate: "6.5%",
                  status: "Clear to Close",
                  submitted: "April 15, 2025",
                  days: 23
                }
              ].map((app, i) => (
                <div key={i} className="grid grid-cols-7 p-3 items-center">
                  <div className="font-medium">{app.client}</div>
                  <div>{app.loan_type}</div>
                  <div>{app.amount}</div>
                  <div>{app.rate}</div>
                  <div>
                    <Badge className={`
                      ${app.status === 'Pre-Approved' ? 'bg-blue-500' :
                        app.status === 'Clear to Close' ? 'bg-green-500' :
                        app.status === 'Needs Documents' ? 'bg-amber-500' :
                        'bg-gray-500'}
                    `}>
                      {app.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">{app.days} days ago</div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm">View</Button>
                    <Button size="sm">Update</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Products Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Current Loan Programs</CardTitle>
          <CardDescription>Today's rates and available options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                name: "30-Year Fixed",
                rate: "6.25%",
                apr: "6.38%",
                points: "0",
                description: "Traditional 30-year fixed rate mortgage",
                best_for: "Long-term homeowners seeking stability"
              },
              {
                name: "15-Year Fixed",
                rate: "5.50%",
                apr: "5.68%",
                points: "0",
                description: "Lower rate, higher payments, faster equity",
                best_for: "Homeowners looking to build equity faster"
              },
              {
                name: "5/1 ARM",
                rate: "5.25%",
                apr: "5.48%",
                points: "0",
                description: "Fixed for 5 years, then adjusts annually",
                best_for: "Buyers planning to move within 5-7 years"
              },
              {
                name: "FHA 30-Year",
                rate: "6.125%",
                apr: "6.32%",
                points: "0.5",
                description: "Government-backed with lower down payment",
                best_for: "First-time homebuyers with limited savings"
              },
              {
                name: "VA 30-Year",
                rate: "5.875%",
                apr: "6.02%",
                points: "0",
                description: "For veterans and service members",
                best_for: "Eligible military personnel and veterans"
              },
              {
                name: "Jumbo 30-Year",
                rate: "6.50%",
                apr: "6.63%",
                points: "0.5",
                description: "For loan amounts exceeding conforming limits",
                best_for: "Luxury homebuyers in high-cost areas"
              }
            ].map((product, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="bg-blue-600 p-4 text-white">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <div className="flex items-end gap-1 mt-1">
                    <span className="text-3xl font-bold">{product.rate}</span>
                    <span className="text-sm mb-1">Rate</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <div>APR: {product.apr}</div>
                    <div>Points: {product.points}</div>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <p className="text-sm">{product.description}</p>
                  <div>
                    <p className="text-xs text-gray-500">Best for:</p>
                    <p className="text-sm font-medium">{product.best_for}</p>
                  </div>
                  <Button className="w-full">Get Quote</Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Contractor Dashboard Component
const ContractorDashboard: React.FC<VendorDashboardProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              2 ahead of schedule
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proposals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              3 awaiting response
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Inspections</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Next: Tomorrow at 2:00 PM
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue MTD</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$78,500</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Active Projects</CardTitle>
          <CardDescription>Current project statuses and timelines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[
              {
                name: "Kitchen Remodel - 123 Oak St",
                client: "Wilson Family",
                start_date: "April 10, 2025",
                end_date: "May 25, 2025",
                budget: "$42,500",
                progress: 65,
                status: "On Schedule"
              },
              {
                name: "Bathroom Renovation - 456 Pine Ave",
                client: "Thompson Family",
                start_date: "April 22, 2025",
                end_date: "May 15, 2025",
                budget: "$18,750",
                progress: 40,
                status: "Ahead of Schedule"
              },
              {
                name: "Basement Finishing - 789 Maple Dr",
                client: "Rodriguez Family",
                start_date: "April 5, 2025",
                end_date: "June 10, 2025",
                budget: "$35,200",
                progress: 30,
                status: "On Schedule"
              },
              {
                name: "Deck Construction - 234 Elm Ct",
                client: "Chen Family",
                start_date: "May 2, 2025",
                end_date: "May 20, 2025",
                budget: "$12,800",
                progress: 15,
                status: "Just Started"
              }
            ].map((project, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-sm text-gray-500">Client: {project.client}</p>
                  </div>
                  <Badge className={`
                    ${project.status === 'On Schedule' ? 'bg-blue-500' :
                      project.status === 'Ahead of Schedule' ? 'bg-green-500' :
                      project.status === 'Delayed' ? 'bg-red-500' :
                      'bg-gray-500'}
                  `}>
                    {project.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Start Date</p>
                    <p className="font-medium">{project.start_date}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">End Date</p>
                    <p className="font-medium">{project.end_date}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Budget</p>
                    <p className="font-medium">{project.budget}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Progress</p>
                    <p className="font-medium">{project.progress}%</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">Project Details</Button>
                  <Button variant="outline" size="sm">Update Status</Button>
                  <Button variant="outline" size="sm">View Timeline</Button>
                  <Button size="sm">Upload Photos</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Leads */}
      <Card>
        <CardHeader>
          <CardTitle>New Leads</CardTitle>
          <CardDescription>Recent inquiries and potential projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: "Adam Johnson",
                project: "Full House Renovation",
                location: "Los Angeles, CA",
                budget: "$150,000-$200,000",
                timeline: "Flexible",
                message: "Looking to renovate a recently purchased 1960s home. Need a complete modernization including kitchen, bathrooms, and open floor plan.",
                date: "2 days ago"
              },
              {
                name: "Emily Garcia",
                project: "Kitchen and Master Bath Remodel",
                location: "Pasadena, CA",
                budget: "$75,000-$100,000",
                timeline: "June-August 2025",
                message: "We're looking to update our kitchen and master bathroom before school starts in the fall. Would like to discuss modern design options.",
                date: "3 days ago"
              },
              {
                name: "Robert Kim",
                project: "Outdoor Living Space",
                location: "Glendale, CA",
                budget: "$30,000-$50,000",
                timeline: "ASAP",
                message: "Want to create an outdoor entertainment area with kitchen, firepit, and covered patio. Need it completed before summer if possible.",
                date: "5 days ago"
              }
            ].map((lead, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{lead.name}</h3>
                    <p className="text-blue-600 font-medium">{lead.project}</p>
                  </div>
                  <p className="text-sm text-gray-500">{lead.date}</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 mt-2 text-sm">
                  <div>
                    <span className="text-gray-500">Location:</span> {lead.location}
                  </div>
                  <div>
                    <span className="text-gray-500">Budget:</span> {lead.budget}
                  </div>
                  <div>
                    <span className="text-gray-500">Timeline:</span> {lead.timeline}
                  </div>
                </div>
                
                <div className="mt-3 text-sm">
                  <span className="text-gray-500">Message:</span>
                  <p className="mt-1">{lead.message}</p>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm">Contact</Button>
                  <Button variant="outline" size="sm">Schedule Consultation</Button>
                  <Button size="sm">Create Proposal</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Designer Dashboard Component
const DesignerDashboard: React.FC<VendorDashboardProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              +2 in the last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Next: Today at 1:00 PM
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proposals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              2 awaiting client review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$22,500</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Design Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Current Design Projects</CardTitle>
          <CardDescription>Your active design projects and their statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[
              {
                name: "Modern Farmhouse Renovation",
                client: "Thompson Family",
                type: "Full Home",
                status: "Design Phase",
                progress: 40,
                next_milestone: "Design Presentation",
                next_date: "May 12, 2025"
              },
              {
                name: "Mid-Century Kitchen Remodel",
                client: "Garcia Family",
                type: "Kitchen",
                status: "Material Selection",
                progress: 70,
                next_milestone: "Final Material Order",
                next_date: "May 10, 2025"
              },
              {
                name: "Luxury Master Suite",
                client: "Wilson Residence",
                type: "Bedroom/Bath",
                status: "Implementation",
                progress: 85,
                next_milestone: "Final Styling",
                next_date: "May 15, 2025"
              },
              {
                name: "Contemporary Office Space",
                client: "Adams Law Firm",
                type: "Commercial",
                status: "Initial Concepts",
                progress: 20,
                next_milestone: "Concept Presentation",
                next_date: "May 20, 2025"
              }
            ].map((project, i) => (
              <div key={i} className="rounded-lg border overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3">
                  <div className="aspect-video md:aspect-square bg-gray-200">
                    <img 
                      src={`https://picsum.photos/seed/${i+500}/600/600`}
                      alt="Design Project"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 col-span-2 flex flex-col">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{project.name}</h3>
                      <Badge className={`
                        ${project.status === 'Design Phase' ? 'bg-purple-500' :
                          project.status === 'Material Selection' ? 'bg-blue-500' :
                          project.status === 'Implementation' ? 'bg-green-500' :
                          'bg-gray-500'}
                      `}>
                        {project.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
                      <div>
                        <span className="text-gray-500">Client:</span> {project.client}
                      </div>
                      <div>
                        <span className="text-gray-500">Type:</span> {project.type}
                      </div>
                      <div>
                        <span className="text-gray-500">Next Milestone:</span> {project.next_milestone}
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span> {project.next_date}
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    
                    <div className="flex gap-2 mt-4 flex-wrap">
                      <Button variant="outline" size="sm">View Design Board</Button>
                      <Button variant="outline" size="sm">Client Notes</Button>
                      <Button variant="outline" size="sm">Schedule Meeting</Button>
                      <Button size="sm">Update Status</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Design Inspirations */}
      <Card>
        <CardHeader>
          <CardTitle>Design Inspirations</CardTitle>
          <CardDescription>Recent additions to your inspiration boards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="group relative overflow-hidden rounded-lg">
                <div className="aspect-square bg-gray-200">
                  <img 
                    src={`https://picsum.photos/seed/${i+600}/500/500`}
                    alt="Inspiration"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <h4 className="text-white font-medium text-sm truncate">
                    {["Modern Living Room", "Kitchen Detail", "Minimalist Bathroom", "Accent Wall", "Lighting Concept", "Color Palette", "Texture Study", "Pattern Design"][i]}
                  </h4>
                  <div className="flex gap-1 mt-2">
                    <Badge variant="outline" className="bg-white/20 text-white text-xs">
                      {["Modern", "Kitchen", "Bathroom", "Accent", "Lighting", "Color", "Texture", "Pattern"][i]}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="link" className="gap-1">
              View all inspirations <ArrowUpRight size={14} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDashboard;