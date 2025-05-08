import * as React from 'react';
import { UserData } from '@/lib/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Calendar, Clock,
  BarChart3, ArrowUpRight, 
  MessageSquare, Bell, DollarSign, 
  ShieldAlert, Bug, Server, 
  FileText, CheckCircle, AlertCircle,
  Settings, HelpCircle, Home, Search
} from 'lucide-react';

interface AdminDashboardProps {
  user: UserData;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const subrole = user.subrole || 'platform_admin'; // Default to platform admin if no subrole

  // Render different dashboard content based on subrole
  const renderSubroleSpecificContent = () => {
    switch (subrole) {
      case 'platform_admin':
        return <PlatformAdminDashboard user={user} />;
      case 'support_admin':
        return <SupportAdminDashboard user={user} />;
      default:
        return <PlatformAdminDashboard user={user} />;
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

// Platform Admin Dashboard Component
const PlatformAdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,458</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Healthy</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue MTD</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$186,304</div>
            <p className="text-xs text-muted-foreground">
              +8.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              1 requires immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Health */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Health</CardTitle>
          <CardDescription>Real-time monitoring and performance metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Performance */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <h3 className="text-sm font-medium">API Performance</h3>
              <Badge variant="outline" className="bg-green-50 text-green-700">Good</Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Response Time</span>
                <span className="text-green-600">87ms avg</span>
              </div>
              <Progress value={15} className="h-2 bg-gray-200" /> 
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-md border border-gray-200 p-3">
                <div className="text-xs text-gray-500">Success Rate</div>
                <div className="text-xl font-bold text-green-600">99.8%</div>
              </div>
              <div className="rounded-md border border-gray-200 p-3">
                <div className="text-xs text-gray-500">Error Rate</div>
                <div className="text-xl font-bold text-gray-600">0.2%</div>
              </div>
              <div className="rounded-md border border-gray-200 p-3">
                <div className="text-xs text-gray-500">Requests/min</div>
                <div className="text-xl font-bold text-blue-600">2,345</div>
              </div>
            </div>
          </div>

          {/* Server Resources */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <h3 className="text-sm font-medium">Server Resources</h3>
              <Badge variant="outline" className="bg-amber-50 text-amber-700">Moderate</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU</span>
                  <span>42%</span>
                </div>
                <Progress value={42} className="h-2 bg-gray-200" /> 
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Memory</span>
                  <span>68%</span>
                </div>
                <Progress value={68} className="h-2 bg-gray-200" /> 
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Storage</span>
                  <span>34%</span>
                </div>
                <Progress value={34} className="h-2 bg-gray-200" /> 
              </div>
            </div>
          </div>

          {/* Recent Errors */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Recent Errors</h3>
            <div className="space-y-2">
              {[
                {
                  message: "Payment processing timeout in Stripe API",
                  time: "15 minutes ago",
                  severity: "high"
                },
                {
                  message: "Database connection pool saturation",
                  time: "2 hours ago",
                  severity: "medium"
                },
                {
                  message: "Image processing queue overflow",
                  time: "3 hours ago",
                  severity: "low"
                }
              ].map((error, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-md border flex justify-between items-center
                    ${error.severity === 'high' 
                      ? 'bg-red-50 border-red-200' 
                      : error.severity === 'medium' 
                        ? 'bg-amber-50 border-amber-200' 
                        : 'bg-blue-50 border-blue-200'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className={`h-5 w-5 
                      ${error.severity === 'high' 
                        ? 'text-red-500' 
                        : error.severity === 'medium' 
                          ? 'text-amber-500' 
                          : 'text-blue-500'
                      }
                    `} />
                    <div>
                      <p className="font-medium text-sm">{error.message}</p>
                      <p className="text-xs text-gray-500">{error.time}</p>
                    </div>
                  </div>
                  <Button size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button variant="outline" className="w-full">
            View Complete System Status
          </Button>
        </CardFooter>
      </Card>

      {/* User and Revenue Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>User Analytics</CardTitle>
            <CardDescription>User growth and engagement metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-500">New Users</div>
                <div className="text-2xl font-bold">245</div>
                <div className="text-sm text-green-600">+12% this month</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Active Users</div>
                <div className="text-2xl font-bold">1,862</div>
                <div className="text-sm text-green-600">+8% this month</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">User Distribution</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Buyers</span>
                    <span>43%</span>
                  </div>
                  <Progress value={43} className="h-2 bg-gray-200" /> 
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Sellers</span>
                    <span>31%</span>
                  </div>
                  <Progress value={31} className="h-2 bg-gray-200" /> 
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Renters</span>
                    <span>14%</span>
                  </div>
                  <Progress value={14} className="h-2 bg-gray-200" /> 
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Service Providers</span>
                    <span>12%</span>
                  </div>
                  <Progress value={12} className="h-2 bg-gray-200" /> 
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button variant="outline" className="w-full">
              View Detailed Analytics
            </Button>
          </CardFooter>
        </Card>

        {/* Revenue Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>Financial performance and trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Monthly Revenue</div>
                <div className="text-2xl font-bold">$186,304</div>
                <div className="text-sm text-green-600">+8.2% MoM</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">YTD Revenue</div>
                <div className="text-2xl font-bold">$834,218</div>
                <div className="text-sm text-green-600">+18.5% YoY</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Revenue Breakdown</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Subscription Plans</span>
                    <span>$102,450</span>
                  </div>
                  <Progress value={55} className="h-2 bg-gray-200" /> 
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Commission Fees</span>
                    <span>$56,320</span>
                  </div>
                  <Progress value={30} className="h-2 bg-gray-200" /> 
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Service Referrals</span>
                    <span>$27,534</span>
                  </div>
                  <Progress value={15} className="h-2 bg-gray-200" /> 
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button variant="outline" className="w-full">
              View Financial Reports
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activity & Admin Actions */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="actions">Admin Actions</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Activity</CardTitle>
              <CardDescription>Recent events and user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {[
                  {
                    event: "New Agent Signup",
                    user: "Michael Rodriguez",
                    details: "New real estate agent registered and completed profile verification",
                    time: "10 minutes ago"
                  },
                  {
                    event: "Payment Processed",
                    user: "Premium Membership Purchase",
                    details: "User James Wilson purchased Premium Annual Plan ($599.00)",
                    time: "42 minutes ago"
                  },
                  {
                    event: "Property Dispute Filed",
                    user: "Sarah Thompson vs. ABC Realty",
                    details: "Dispute regarding property listing information for 123 Oak Street",
                    time: "1 hour ago"
                  },
                  {
                    event: "System Update Completed",
                    user: "Automatic System Update",
                    details: "Search algorithm optimization and database index rebuild completed",
                    time: "2 hours ago"
                  },
                  {
                    event: "API Integration Request",
                    user: "HomeAdvisor Integration",
                    details: "New third-party integration request pending approval",
                    time: "4 hours ago"
                  },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-4 py-2">
                    <div className="rounded-full bg-blue-100 p-2 mt-1">
                      <div className={`
                        w-2 h-2 rounded-full 
                        ${activity.event.includes('Payment') ? 'bg-green-500' :
                          activity.event.includes('Dispute') ? 'bg-red-500' :
                          activity.event.includes('System') ? 'bg-purple-500' :
                          'bg-blue-500'
                        }
                      `} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{activity.event}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      <p className="text-sm font-medium text-blue-600">{activity.user}</p>
                      <p className="text-sm text-gray-600">{activity.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="outline" className="w-full">
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="actions" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
              <CardDescription>Quick access to administrative functions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">User Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      <span>View All Users</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      <span>Role Assignments</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      <span>Suspension Management</span>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Content Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Home className="mr-2 h-4 w-4" />
                      <span>Property Listings</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Content Moderation</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      <span>Verification Queue</span>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">System Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Server className="mr-2 h-4 w-4" />
                      <span>System Status</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Platform Settings</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Bug className="mr-2 h-4 w-4" />
                      <span>Error Logs</span>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Business Operations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <DollarSign className="mr-2 h-4 w-4" />
                      <span>Billing Management</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>Analytics Dashboard</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Support Tickets</span>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Support Admin Dashboard Component
const SupportAdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">26</div>
            <p className="text-xs text-muted-foreground">
              5 high priority
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.4h</div>
            <p className="text-xs text-muted-foreground">
              -15min from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CSAT Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8/5</div>
            <p className="text-xs text-muted-foreground">
              Based on 183 responses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Support Ticket Queue */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Ticket Queue</CardTitle>
            <CardDescription>Support tickets requiring attention</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search tickets..." 
                className="pl-8 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Button variant="outline" size="sm">Filter</Button>
            <Button size="sm">New Ticket</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-7 bg-gray-50 p-3 font-medium text-sm">
              <div>ID</div>
              <div className="col-span-2">Subject</div>
              <div>Status</div>
              <div>Priority</div>
              <div>Time</div>
              <div>Actions</div>
            </div>
            <div className="divide-y">
              {[
                {
                  id: "TKT-5723",
                  subject: "Payment processing error during checkout",
                  status: "Open",
                  priority: "High",
                  time: "10 minutes ago",
                  user: "James Wilson"
                },
                {
                  id: "TKT-5722",
                  subject: "Unable to upload property photos",
                  status: "In Progress",
                  priority: "Medium",
                  time: "42 minutes ago",
                  user: "Sarah Thompson"
                },
                {
                  id: "TKT-5721",
                  subject: "Assistance with account verification",
                  status: "Waiting on User",
                  priority: "Low",
                  time: "1 hour ago",
                  user: "Michael Rodriguez"
                },
                {
                  id: "TKT-5720",
                  subject: "Property listing not showing in search results",
                  status: "Open",
                  priority: "Medium",
                  time: "3 hours ago",
                  user: "Jennifer Garcia"
                },
                {
                  id: "TKT-5719",
                  subject: "Request for data deletion under privacy policy",
                  status: "Open",
                  priority: "High",
                  time: "5 hours ago",
                  user: "Robert Kim"
                }
              ].map((ticket, i) => (
                <div key={i} className="grid grid-cols-7 p-3 items-center">
                  <div className="font-medium">{ticket.id}</div>
                  <div className="col-span-2">
                    <div className="font-medium">{ticket.subject}</div>
                    <div className="text-sm text-gray-500">From: {ticket.user}</div>
                  </div>
                  <div>
                    <Badge className={`
                      ${ticket.status === 'Open' ? 'bg-blue-500' :
                        ticket.status === 'In Progress' ? 'bg-amber-500' :
                        ticket.status === 'Waiting on User' ? 'bg-purple-500' :
                        'bg-gray-500'}
                    `}>
                      {ticket.status}
                    </Badge>
                  </div>
                  <div>
                    <Badge variant="outline" className={`
                      ${ticket.priority === 'High' ? 'border-red-500 text-red-700 bg-red-50' :
                        ticket.priority === 'Medium' ? 'border-amber-500 text-amber-700 bg-amber-50' :
                        'border-blue-500 text-blue-700 bg-blue-50'}
                    `}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">{ticket.time}</div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm">View</Button>
                    <Button size="sm">Assign</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 flex justify-between">
          <div className="text-sm text-gray-500">Showing 5 of 26 tickets</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </CardFooter>
      </Card>

      {/* Knowledge Base and Common Issues */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Base</CardTitle>
            <CardDescription>Recently updated articles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Payment Processing Troubleshooting Guide",
                  excerpt: "Common solutions for payment-related issues and error codes",
                  updated: "Updated 2 days ago",
                  views: 342
                },
                {
                  title: "Property Listing Best Practices",
                  excerpt: "Tips for creating effective listings and maximizing visibility",
                  updated: "Updated 1 week ago",
                  views: 563
                },
                {
                  title: "Account Verification Process",
                  excerpt: "Step-by-step guide to completing account verification",
                  updated: "Updated 2 weeks ago",
                  views: 894
                },
                {
                  title: "Privacy Policy and Data Management",
                  excerpt: "Guidelines for handling user data and privacy requests",
                  updated: "Updated 3 weeks ago",
                  views: 421
                }
              ].map((article, i) => (
                <div key={i} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-blue-600">{article.title}</h3>
                    <Badge variant="outline">{article.views} views</Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{article.excerpt}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-500">{article.updated}</span>
                    <Button variant="link" className="h-auto p-0 text-blue-600">Edit Article</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button variant="outline" className="w-full">
              Manage Knowledge Base
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Common Issues</CardTitle>
            <CardDescription>Trending support topics this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Top Issues by Volume</h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Payment Processing Errors</span>
                      <span>24%</span>
                    </div>
                    <Progress value={24} className="h-2 bg-gray-200" /> 
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Account Access Issues</span>
                      <span>18%</span>
                    </div>
                    <Progress value={18} className="h-2 bg-gray-200" /> 
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Listing Visibility Problems</span>
                      <span>14%</span>
                    </div>
                    <Progress value={14} className="h-2 bg-gray-200" /> 
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Photo Upload Failures</span>
                      <span>12%</span>
                    </div>
                    <Progress value={12} className="h-2 bg-gray-200" /> 
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Search Results Inconsistency</span>
                      <span>9%</span>
                    </div>
                    <Progress value={9} className="h-2 bg-gray-200" /> 
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">New Issues to Monitor</h3>
                <div className="space-y-2">
                  {[
                    "Mobile app notifications not delivering",
                    "Virtual tour loading failures on specific browsers",
                    "Message center delays between users and agents"
                  ].map((issue, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm p-2 border rounded-md">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button variant="outline" className="w-full">
              View Issue Tracking Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;