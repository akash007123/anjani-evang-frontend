import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import ProtectedRoute from '../components/admin/ProtectedRoute';
import { NotificationProvider } from '../context/NotificationContext';
import Dashboard from './admin/Dashboard';
import Bookings from './admin/Bookings';
import Orders from './admin/Orders';
import Contacts from './admin/Contacts';
import Users from './admin/Users';
import Blogs from './admin/Blogs';
import Menu from './admin/Menu';
import Packages from './admin/Packages';
import Newsletter from './admin/Newsletter';
import Gallery from './admin/Gallery';
import Settings from './admin/Settings';
import AIChatbotInquiries from './admin/AIChatbotInquiries';
import Notifications from './admin/Notifications';
import SEO from '../components/SEO';

export default function Admin() {
  return (
    <NotificationProvider>
      <SEO 
        title="Admin Control Panel - Anjani Catering & Events" 
        description="Manage website content, bookings, orders, blogs, menu items, packages, subscribers, and gallery."
        urlPath="/admin"
      />
      <Routes>
        {/* Outer security wrapper ensuring valid authentication token for all admin routes */}
        <Route element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Manager', 'Employee']} />}>
          <Route element={<AdminLayout />}>
            {/* Default redirect to dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />

            {/* General Staff Access Modules */}
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Manager', 'Employee']}><Dashboard /></ProtectedRoute>} />
            <Route path="contacts" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Manager', 'Employee']}><Contacts /></ProtectedRoute>} />
            <Route path="orders" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Manager', 'Employee']}><Orders /></ProtectedRoute>} />
            <Route path="notifications" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Manager']}><Notifications /></ProtectedRoute>} />

            {/* Operations & Management Modules */}
            <Route path="bookings" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Manager']}><Bookings /></ProtectedRoute>} />
            <Route path="menu" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Manager']}><Menu /></ProtectedRoute>} />
            <Route path="packages" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Manager']}><Packages /></ProtectedRoute>} />
            <Route path="ai-bookings" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Manager']}><AIChatbotInquiries /></ProtectedRoute>} />

            {/* Content & Marketing Management Modules */}
            <Route path="blogs" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin']}><Blogs /></ProtectedRoute>} />
            <Route path="newsletter" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin']}><Newsletter /></ProtectedRoute>} />
            <Route path="gallery" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin']}><Gallery /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin']}><Settings /></ProtectedRoute>} />

            {/* Super Admin Restricted Security Module */}
            <Route path="users" element={<ProtectedRoute allowedRoles={['Super Admin']}><Users /></ProtectedRoute>} />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </NotificationProvider>
  );
}
