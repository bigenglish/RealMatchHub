import * as React from 'react';
import { Link, useLocation } from 'wouter';
import { UserData } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, User, MessageSquare, 
  Calendar, FileText, LogOut, Menu,
  Bell, Settings, ChevronDown
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Define the sidebar navigation items based on user role
const getUserNavItems = (user: UserData | null) => {
  const baseItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Documents', href: '/dashboard/documents', icon: FileText },
  ];

  if (!user) return baseItems;

  if (user.role === 'admin') {
    return [
      ...baseItems,
      { name: 'User Management', href: '/dashboard/users', icon: User },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];
  }

  if (user.role === 'vendor') {
    return [
      ...baseItems,
      { name: 'Clients', href: '/dashboard/clients', icon: User },
      { name: 'Services', href: '/dashboard/services', icon: Settings },
    ];
  }

  // Default to user role
  return [
    ...baseItems,
    { name: 'My Properties', href: '/dashboard/properties', icon: Home },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ];
};

// Get role-specific title for the dashboard
const getDashboardTitle = (user: UserData | null) => {
  if (!user) return 'Dashboard';
  
  if (user.role === 'admin') {
    return user.subrole === 'platform_admin' 
      ? 'Platform Administration' 
      : 'Support Administration';
  }
  
  if (user.role === 'vendor') {
    switch (user.subrole) {
      case 'agent': return 'Agent Portal';
      case 'loan_officer': return 'Loan Officer Portal';
      case 'contractor': return 'Contractor Portal';
      case 'designer': return 'Designer Portal';
      default: return 'Vendor Portal';
    }
  }
  
  // User role
  switch (user.subrole) {
    case 'buyer': return 'Buyer Dashboard';
    case 'seller': return 'Seller Dashboard';
    case 'renter': return 'Renter Dashboard';
    default: return 'User Dashboard';
  }
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const navItems = getUserNavItems(user);
  const dashboardTitle = getDashboardTitle(user);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/'; // Redirect to home page after sign out
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        ${isSidebarOpen ? 'w-64' : 'w-20'} 
        bg-blue-900 text-white transition-all duration-300 
        flex flex-col fixed h-full z-10
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
          <div className={`flex items-center ${!isSidebarOpen && 'justify-center w-full'}`}>
            {isSidebarOpen ? (
              <div className="font-bold text-xl tracking-tight">REALTY.AI</div>
            ) : (
              <div className="font-bold text-xl">R</div>
            )}
          </div>
          <button 
            className={`text-white p-1 rounded hover:bg-blue-800 ${!isSidebarOpen && 'hidden'}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <Menu size={18} />
          </button>
          {!isSidebarOpen && (
            <button 
              className="text-white p-1 rounded hover:bg-blue-800 absolute left-16"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>
          )}
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 pt-5">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <a className={`
                      flex items-center p-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-700 text-white' 
                        : 'text-blue-100 hover:bg-blue-800'
                      }
                    `}>
                      <item.icon size={20} className="shrink-0" />
                      {isSidebarOpen && <span className="ml-4">{item.name}</span>}
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-blue-800">
          <button 
            onClick={handleSignOut}
            className="flex items-center justify-center w-full p-2 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            <LogOut size={20} className="shrink-0" />
            {isSidebarOpen && <span className="ml-3">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`
        flex-1 flex flex-col
        ${isSidebarOpen ? 'ml-64' : 'ml-20'}
        transition-all duration-300
      `}>
        {/* Top Header Bar */}
        <header className="bg-white shadow-sm border-b h-16 flex items-center px-6 sticky top-0 z-10">
          <div className="flex items-center justify-between w-full">
            <h1 className="font-semibold text-xl">{dashboardTitle}</h1>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" className="relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      {user?.displayName?.charAt(0) || 'U'}
                    </div>
                    {user?.displayName && <span>{user.displayName}</span>}
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/dashboard/profile">
                      <a className="flex items-center w-full">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/dashboard/settings">
                      <a className="flex items-center w-full">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;