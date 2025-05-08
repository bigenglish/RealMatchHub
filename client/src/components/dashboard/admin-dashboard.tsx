import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building, 
  PieChart, 
  BriefcaseBusiness, 
  AlertTriangle,
  MessageSquare,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Settings,
  UserCog,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function AdminDashboard() {
  const { user } = useAuth();
  
  // Admin subtype (platform admin or support admin)
  const subrole = user?.subrole || 'platform_admin';
  
  // Mock data for demonstration
  const stats = {
    totalUsers: 1245,
    totalVendors: 128,
    totalProperties: 3542,
    pendingVerifications: 14,
    activeSupport: 7
  };

  // Recent activity data
  const recentActivity = [
    { 
      type: 'user_register', 
      user: 'Michael Brown', 
      description: 'New user registered', 
      time: '10 minutes ago',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />
    },
    { 
      type: 'vendor_verification', 
      user: 'Elite Realty Group', 
      description: 'Vendor verification requested', 
      time: '45 minutes ago',
      icon: <Clock className="h-4 w-4 text-amber-500" />
    },
    { 
      type: 'property_report', 
      user: 'Susan Taylor', 
      description: 'Property listing reported', 
      time: '2 hours ago',
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />
    },
    { 
      type: 'support_ticket', 
      user: 'David Williams', 
      description: 'New support ticket created', 
      time: '3 hours ago',
      icon: <MessageSquare className="h-4 w-4 text-blue-500" />
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          {subrole === 'platform_admin' && "Monitor and manage the platform's users, vendors, and content."}
          {subrole === 'support_admin' && "Handle support requests and monitor user activity."}
        </p>
      </div>

      {/* Key platform stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +83 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendors</CardTitle>
            <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVendors}</div>
            <p className="text-xs text-muted-foreground">
              +12 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              +210 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
            <p className="text-xs text-muted-foreground">
              Vendors awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Support</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSupport}</div>
            <p className="text-xs text-muted-foreground">
              Open tickets
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent activity feed */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest platform events and activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start justify-between border-b pb-4">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {activity.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">{activity.user}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/dashboard/activity">
                View All Activity
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Quick actions */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Administrative Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/dashboard/users">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Manage Users</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/dashboard/vendors">
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4" />
                  <span>Manage Vendors</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/dashboard/properties">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>Manage Properties</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/dashboard/reports">
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  <span>View Reports</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/dashboard/system">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>System Settings</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Pending approvals for platform admins */}
      {subrole === 'platform_admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Approval Requests</CardTitle>
            <CardDescription>
              Vendors and service providers requiring verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>JR</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">Johnson Realty Group</p>
                    <p className="text-sm text-muted-foreground">Real Estate Agency</p>
                    <p className="text-xs text-muted-foreground">Submitted 2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <XCircle className="mr-1 h-4 w-4 text-red-500" />
                    Reject
                  </Button>
                  <Button size="sm">
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>MC</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">Modern Constructions LLC</p>
                    <p className="text-sm text-muted-foreground">Contractor</p>
                    <p className="text-xs text-muted-foreground">Submitted 3 days ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <XCircle className="mr-1 h-4 w-4 text-red-500" />
                    Reject
                  </Button>
                  <Button size="sm">
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/dashboard/approvals">
                View All Approval Requests
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Support tickets for support admins */}
      {subrole === 'support_admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Active Support Tickets</CardTitle>
            <CardDescription>
              Unresolved support requests requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>RM</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">Robert Miller</p>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High Priority</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Payment processing issue</p>
                    <p className="text-xs text-muted-foreground">Opened 4 hours ago</p>
                  </div>
                </div>
                <Button size="sm">
                  <MessageSquare className="mr-1 h-4 w-4" />
                  Respond
                </Button>
              </div>
              
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">Jennifer Davis</p>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Medium Priority</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Account access problem</p>
                    <p className="text-xs text-muted-foreground">Opened 7 hours ago</p>
                  </div>
                </div>
                <Button size="sm">
                  <MessageSquare className="mr-1 h-4 w-4" />
                  Respond
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/dashboard/support-tickets">
                View All Support Tickets
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* System performance metrics */}
      <Card>
        <CardHeader>
          <CardTitle>System Metrics</CardTitle>
          <CardDescription>
            Performance overview of the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span>API Response Time</span>
                  </div>
                  <div className="font-medium">245ms</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-muted-foreground" />
                      <span>Active Sessions</span>
                    </div>
                    <div className="font-medium">438</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>System Uptime</span>
                  </div>
                  <div className="font-medium">99.98%</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <PieChart className="h-4 w-4 text-muted-foreground" />
                      <span>Storage Usage</span>
                    </div>
                    <div className="font-medium">68%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/dashboard/system">
              View System Status
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}