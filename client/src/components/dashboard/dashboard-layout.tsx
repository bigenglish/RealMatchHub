import React, { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Home, 
  Search, 
  FileText, 
  MessageSquare, 
  Calendar, 
  Settings, 
  HelpCircle, 
  LogOut, 
  User,
  Building,
  Users,
  DollarSign,
  BriefcaseBusiness,
  PieChart,
  BarChart3
} from 'lucide-react';

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem = ({ icon, label, href, active }: SidebarItemProps) => {
  return (
    <Link href={href}>
      <a className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent ${
        active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-primary'
      }`}>
        {icon}
        <span>{label}</span>
      </a>
    </Link>
  );
};

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const [location] = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  // Render different sidebar items based on user role
  const renderSidebarItems = () => {
    if (!user) return null;

    const commonItems = [
      { icon: <Home size={20} />, label: 'Dashboard', href: '/dashboard' },
      { icon: <MessageSquare size={20} />, label: 'Messages', href: '/dashboard/messages' },
      { icon: <Settings size={20} />, label: 'Settings', href: '/dashboard/settings' },
      { icon: <HelpCircle size={20} />, label: 'Help & Support', href: '/dashboard/support' },
    ];

    // User-specific sidebar items
    if (user.role === 'user') {
      const userItems = [
        { icon: <Search size={20} />, label: 'Property Search', href: '/dashboard/search' },
        { icon: <Calendar size={20} />, label: 'Appointments', href: '/dashboard/appointments' },
        { icon: <FileText size={20} />, label: 'My Documents', href: '/dashboard/documents' },
      ];
      
      // Add specialized items based on subrole
      if (user.subrole === 'buyer') {
        userItems.push({ icon: <Building size={20} />, label: 'Saved Properties', href: '/dashboard/saved-properties' });
      } else if (user.subrole === 'seller') {
        userItems.push({ icon: <Building size={20} />, label: 'My Listings', href: '/dashboard/listings' });
      }
      
      return [...userItems, ...commonItems];
    }
    
    // Vendor-specific sidebar items
    else if (user.role === 'vendor') {
      const vendorItems = [
        { icon: <BriefcaseBusiness size={20} />, label: 'My Services', href: '/dashboard/my-services' },
        { icon: <Calendar size={20} />, label: 'Appointments', href: '/dashboard/appointments' },
        { icon: <DollarSign size={20} />, label: 'Earnings', href: '/dashboard/earnings' },
        { icon: <Users size={20} />, label: 'Clients', href: '/dashboard/clients' },
      ];
      
      // Add specialized items based on vendor type
      if (user.subrole === 'agent') {
        vendorItems.push({ icon: <Building size={20} />, label: 'Listings', href: '/dashboard/listings' });
      }
      
      return [...vendorItems, ...commonItems];
    }
    
    // Admin-specific sidebar items
    else if (user.role === 'admin') {
      const adminItems = [
        { icon: <Users size={20} />, label: 'Users', href: '/dashboard/users' },
        { icon: <BriefcaseBusiness size={20} />, label: 'Vendors', href: '/dashboard/vendors' },
        { icon: <Building size={20} />, label: 'Properties', href: '/dashboard/properties' },
        { icon: <PieChart size={20} />, label: 'Reports', href: '/dashboard/reports' },
        { icon: <BarChart3 size={20} />, label: 'Analytics', href: '/dashboard/analytics' },
      ];
      
      return [...adminItems, ...commonItems];
    }
    
    return commonItems;
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-[200px] mt-4" />
          <Skeleton className="h-4 w-[160px] mt-2" />
          <Button asChild className="mt-4">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  const sidebarItems = renderSidebarItems();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/">
          <a className="flex items-center gap-2 font-semibold">
            <Building className="h-6 w-6" />
            <span className="text-xl font-bold">Realty.AI</span>
          </a>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full" size="icon">
                <Avatar>
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                  <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <a className="flex w-full cursor-pointer items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <a className="flex w-full cursor-pointer items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-background md:flex">
          <nav className="flex-1 overflow-auto py-4">
            <div className="px-4 py-2">
              <h2 className="mb-2 text-lg font-semibold tracking-tight">
                {user.role === 'user' && 'User Dashboard'}
                {user.role === 'vendor' && 'Vendor Dashboard'}
                {user.role === 'admin' && 'Admin Dashboard'}
              </h2>
              <div className="flex flex-col gap-1">
                {sidebarItems?.map((item, index) => (
                  <SidebarItem
                    key={index}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    active={location === item.href}
                  />
                ))}
              </div>
            </div>
          </nav>
          <div className="mt-auto p-4">
            <Separator className="mb-4" />
            <div className="flex items-center gap-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.displayName}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user.subrole ? user.subrole.replace('_', ' ') : user.role}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}