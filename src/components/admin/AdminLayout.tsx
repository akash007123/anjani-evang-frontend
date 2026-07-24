import { useState, useEffect } from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import LoadingSpinner from '../layout/LoadingSpinner';

export default function AdminLayout() {
  const { isAuthenticated } = useAdminAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Guard routing with a slight simulated load effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isAuthenticated) {
    // Force redirect to login page if unauthenticated
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner fullPage={true} />
      </div>
    );
  }

  // Map route pathname to elegant descriptive page titles
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Operations Dashboard';
    if (path.includes('/bookings')) return 'Event Bookings & Holds';
    if (path.includes('/ai-bookings')) return 'AI Concierge Center';
    if (path.includes('/orders')) return 'Catering Orders';
    if (path.includes('/contacts')) return 'Client Inquiries';
    if (path.includes('/users')) return 'User & Partner Directory';
    if (path.includes('/settings')) return 'Console Settings';
    return 'Admin Control Panel';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar Navigation */}
      <AdminSidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Window Area */}
      <div 
        className={`flex-grow flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Reusable Header */}
        <AdminHeader 
          title={getPageTitle()} 
          setIsMobileOpen={setIsMobileOpen} 
        />

        {/* Dynamic Page Content Shell */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8 text-left">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
