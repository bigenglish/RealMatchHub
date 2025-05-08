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
import { 
  Home, Calendar, FileText, Clock, 
  ArrowUpRight, MessageSquare, DollarSign
} from 'lucide-react';

interface UserDashboardProps {
  user: UserData;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const subrole = user.subrole || 'buyer'; // Default to buyer if no subrole

  // Render different dashboard content based on subrole
  const renderSubroleSpecificContent = () => {
    switch (subrole) {
      case 'buyer':
        return <BuyerDashboard user={user} />;
      case 'seller':
        return <SellerDashboard user={user} />;
      case 'renter':
        return <RenterDashboard user={user} />;
      default:
        return <BuyerDashboard user={user} />;
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

// Buyer Dashboard Component
const BuyerDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 in the last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Viewings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Next: Tomorrow at 2:00 PM
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              2 require your attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pre-approval</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$425,000</div>
            <p className="text-xs text-muted-foreground">
              Pre-approval is valid for 60 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Homebuying Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Your Homebuying Journey</CardTitle>
          <CardDescription>Track your progress toward homeownership</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Overall Progress</p>
                  <Badge variant="outline">Step 3 of 7</Badge>
                </div>
                <p className="text-sm text-muted-foreground">43%</p>
              </div>
              <Progress value={43} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4 py-2 px-3 rounded-lg bg-green-50 border border-green-200 text-green-700">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Get Pre-Approved</p>
                  <p className="text-sm">Completed on April 15, 2025</p>
                </div>
              </div>

              <div className="flex items-center gap-4 py-2 px-3 rounded-lg bg-green-50 border border-green-200 text-green-700">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Define Search Criteria</p>
                  <p className="text-sm">Completed on April 18, 2025</p>
                </div>
              </div>

              <div className="flex items-center gap-4 py-2 px-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">View Properties</p>
                  <p className="text-sm">In progress: 5 properties viewed</p>
                </div>
              </div>

              <div className="flex items-center gap-4 py-2 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-500">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600">
                  <div className="text-sm font-medium">4</div>
                </div>
                <div>
                  <p className="font-medium">Make an Offer</p>
                  <p className="text-sm">Upcoming step</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Properties */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Properties</CardTitle>
          <CardDescription>Based on your preferences and search history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow">
                <div className="aspect-video bg-gray-200 relative">
                  <img
                    src={`https://picsum.photos/seed/${i+100}/600/400`}
                    alt="Property"
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-blue-600">New</Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold">{["Modern Townhouse", "Luxury Condo", "Spacious Family Home"][i]}</h4>
                  <p className="text-sm text-gray-500 mt-1">{["123 Main St", "456 Maple Ave", "789 Oak Blvd"][i]}</p>
                  <div className="flex justify-between items-center mt-3">
                    <p className="font-semibold text-blue-600">${["429,000", "385,000", "575,000"][i]}</p>
                    <div className="flex space-x-3 text-sm text-gray-500">
                      <span>{[3, 2, 4][i]} bd</span>
                      <span>•</span>
                      <span>{[2, 2, 3][i]} ba</span>
                      <span>•</span>
                      <span>{["1,450", "1,200", "2,300"][i]} sqft</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-3 text-blue-600 border-blue-600">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="link" className="gap-1">
              View all properties <ArrowUpRight size={14} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Seller Dashboard Component
const SellerDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Property Value</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$425,000</div>
            <p className="text-xs text-muted-foreground">
              +2.3% from last estimate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Showings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Next: Tomorrow at 4:00 PM
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              1 needs your response
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days on Market</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              -8 days from average in your area
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Selling Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Your Selling Journey</CardTitle>
          <CardDescription>Track your progress toward selling your home</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Overall Progress</p>
                  <Badge variant="outline">Step 4 of 7</Badge>
                </div>
                <p className="text-sm text-muted-foreground">57%</p>
              </div>
              <Progress value={57} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4 py-2 px-3 rounded-lg bg-green-50 border border-green-200 text-green-700">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Property Valuation</p>
                  <p className="text-sm">Completed on April 10, 2025</p>
                </div>
              </div>

              <div className="flex items-center gap-4 py-2 px-3 rounded-lg bg-green-50 border border-green-200 text-green-700">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Property Listed</p>
                  <p className="text-sm">Completed on April 26, 2025</p>
                </div>
              </div>

              <div className="flex items-center gap-4 py-2 px-3 rounded-lg bg-green-50 border border-green-200 text-green-700">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Showings Started</p>
                  <p className="text-sm">Completed on April 28, 2025</p>
                </div>
              </div>

              <div className="flex items-center gap-4 py-2 px-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Reviewing Offers</p>
                  <p className="text-sm">In progress: 2 offers received</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Center */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
          <CardDescription>Communications about your property</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{["New offer received", "Showing feedback", "Document request"][i]}</p>
                    <p className="text-sm text-gray-500">{["10 min ago", "2 hours ago", "Yesterday"][i]}</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {[
                      "You've received a new offer on your property. Please review and respond.",
                      "Feedback from your recent showing is now available.",
                      "Your agent has requested additional documents for the listing."
                    ][i]}
                  </p>
                  <div className="pt-1">
                    <Button variant="link" className="px-0 h-auto text-blue-600">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="link" className="gap-1">
              View all messages <ArrowUpRight size={14} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Renter Dashboard Component
const RenterDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Rentals</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              +3 in the last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Viewings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Next: Today at 4:30 PM
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Application in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Range</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,800 - $2,500</div>
            <p className="text-xs text-muted-foreground">
              Monthly rent target
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Rentals */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Rentals</CardTitle>
          <CardDescription>Based on your preferences and search history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow">
                <div className="aspect-video bg-gray-200 relative">
                  <img
                    src={`https://picsum.photos/seed/${i+200}/600/400`}
                    alt="Rental"
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-purple-600">Featured</Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold">{["Modern Apartment", "Downtown Loft", "Garden Townhouse"][i]}</h4>
                  <p className="text-sm text-gray-500 mt-1">{["123 Main St", "456 Maple Ave", "789 Oak Blvd"][i]}</p>
                  <div className="flex justify-between items-center mt-3">
                    <p className="font-semibold text-purple-600">${["1,950", "2,250", "1,875"][i]}/month</p>
                    <div className="flex space-x-3 text-sm text-gray-500">
                      <span>{[1, 2, 2][i]} bd</span>
                      <span>•</span>
                      <span>{[1, 2, 1.5][i]} ba</span>
                      <span>•</span>
                      <span>{["750", "950", "1,100"][i]} sqft</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" className="flex-1 text-purple-600 border-purple-600">
                      Schedule
                    </Button>
                    <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="link" className="gap-1">
              View all rentals <ArrowUpRight size={14} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rental Search Criteria */}
      <Card>
        <CardHeader>
          <CardTitle>Your Search Criteria</CardTitle>
          <CardDescription>Modify your preferences to find the perfect rental</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Location</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-gray-50">Downtown</Badge>
                <Badge variant="outline" className="bg-gray-50">Westside</Badge>
                <Badge variant="outline" className="bg-gray-50">+ Add Location</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Price Range</h4>
              <div className="flex items-center gap-2">
                <div className="font-medium">$1,800</div>
                <div className="flex-1">
                  <Progress value={60} className="h-2" />
                </div>
                <div className="font-medium">$2,500</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Property Type</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-gray-50">Apartment</Badge>
                <Badge variant="outline" className="bg-gray-50">Townhouse</Badge>
                <Badge variant="outline" className="bg-gray-50">Condo</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Bedrooms</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-gray-50">1+ Bed</Badge>
                <Badge variant="outline" className="bg-gray-50">2+ Beds</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-gray-50">In-unit Laundry</Badge>
                <Badge variant="outline" className="bg-gray-50">Pool</Badge>
                <Badge variant="outline" className="bg-gray-50">Pet Friendly</Badge>
                <Badge variant="outline" className="bg-gray-50">+ Add Amenity</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Availability</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-gray-50">Available Now</Badge>
                <Badge variant="outline" className="bg-gray-50">Next 30 Days</Badge>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Update Search Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;