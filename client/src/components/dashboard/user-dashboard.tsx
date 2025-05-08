import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Search,
  ChevronRight
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';

export function UserDashboard() {
  const { user } = useAuth();
  const subrole = user?.subrole || 'buyer'; // Default to buyer if no subrole specified

  // Different welcome messages based on user subrole
  const welcomeMessages = {
    buyer: "Welcome to your home buying dashboard. Find your dream property and track your journey.",
    seller: "Welcome to your home selling dashboard. Manage your listing and track offers.",
    renter: "Welcome to your rental dashboard. Find your perfect rental property and manage applications."
  };

  const welcomeMessage = welcomeMessages[subrole as keyof typeof welcomeMessages] || welcomeMessages.buyer;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome, {user?.displayName}</h2>
        <p className="text-muted-foreground">{welcomeMessage}</p>
      </div>

      {/* Progress tracker */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>
            {subrole === 'buyer' && "Track your home buying journey"}
            {subrole === 'seller' && "Track your home selling process"}
            {subrole === 'renter' && "Track your rental application process"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div>Profile Completion</div>
                <div className="font-medium">40%</div>
              </div>
              <Progress value={40} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div>
                  {subrole === 'buyer' && "Home Search Progress"}
                  {subrole === 'seller' && "Listing Completion"}
                  {subrole === 'renter' && "Rental Search Progress"}
                </div>
                <div className="font-medium">25%</div>
              </div>
              <Progress value={25} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div>
        <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Search Properties</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Browse available properties and filter by your preferences.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" className="w-full justify-between" size="sm">
                <Link href="/dashboard/search">
                  <span>Search Now</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Schedule Viewings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Schedule property viewings with real estate agents.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" className="w-full justify-between" size="sm">
                <Link href="/dashboard/appointments">
                  <span>Schedule</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {subrole === 'buyer' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saved Properties</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  View and manage your saved properties.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full justify-between" size="sm">
                  <Link href="/dashboard/saved-properties">
                    <span>View Saved</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}

          {subrole === 'seller' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Listings</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Manage your property listings and view interest.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full justify-between" size="sm">
                  <Link href="/dashboard/listings">
                    <span>View Listings</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Check messages from agents and service providers.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" className="w-full justify-between" size="sm">
                <Link href="/dashboard/messages">
                  <span>View Messages</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Access and manage your real estate documents.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" className="w-full justify-between" size="sm">
                <Link href="/dashboard/documents">
                  <span>View Documents</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">Profile created</p>
            </div>
            <p className="text-xs text-muted-foreground">Just now</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full">
            View All Activity
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}