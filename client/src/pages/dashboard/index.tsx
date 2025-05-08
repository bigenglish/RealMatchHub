import * as React from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { UserDashboard } from '@/components/dashboard/user-dashboard';
import { VendorDashboard } from '@/components/dashboard/vendor-dashboard';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';

const Dashboard = () => {
  const { user, loading } = useAuth();

  // Handle loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Redirect to="/auth/login" />;
  }

  // Render the appropriate dashboard based on user role
  const renderDashboardContent = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard user={user} />;
      case 'vendor':
        return <VendorDashboard user={user} />;
      case 'user':
      default:
        return <UserDashboard user={user} />;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboardContent()}
    </DashboardLayout>
  );
};

export default Dashboard;