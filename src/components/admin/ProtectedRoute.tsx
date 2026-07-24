import React from 'react';
import { Navigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminRole } from '../../types/admin';
import LoadingSpinner from '../layout/LoadingSpinner';
import { ShieldAlert, ArrowLeft, KeyRound, Lock, UserX } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: (AdminRole | string)[];
  requiredPermission?: string;
  children?: React.ReactNode;
}

export default function ProtectedRoute({
  allowedRoles,
  requiredPermission,
  children
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, currentUser, hasRole, hasPermission, logout } = useAdminAuth();
  const location = useLocation();

  // 1. Show elegant loading state while verifying JWT token or auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <LoadingSpinner fullPage={true} />
      </div>
    );
  }

  // 2. Redirect unauthenticated requests to login page with return state
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin-login"
        replace
        state={{
          from: location,
          message: 'Authentication required. Please sign in with a valid admin token.'
        }}
      />
    );
  }

  // 3. Check role-based authorization
  const isRoleAuthorized = allowedRoles ? hasRole(allowedRoles) : true;
  const isPermissionAuthorized = requiredPermission ? hasPermission(requiredPermission) : true;

  if (!isRoleAuthorized || !isPermissionAuthorized) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-lg mb-6 ring-8 ring-rose-50">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-serif font-bold text-secondary tracking-tight mb-2">
          Access Denied — Restricted Module
        </h2>

        <p className="text-xs sm:text-sm text-slate-500 font-sans leading-relaxed mb-6">
          Your current account role (<strong className="text-slate-800">{currentUser?.role || 'User'}</strong>) does not have authorization to access or modify this control panel section.
        </p>

        {allowedRoles && allowedRoles.length > 0 && (
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 w-full mb-6 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Lock className="w-4 h-4 text-rose-500" />
              <span>Authorization Requirements:</span>
            </div>
            <p className="text-xs text-slate-600 font-sans">
              Required Role(s):{' '}
              <span className="font-bold text-secondary font-mono">
                {allowedRoles.join(', ')}
              </span>
            </p>
            <p className="text-[11px] text-slate-400 font-sans">
              Logged in as: <span className="font-semibold">{currentUser?.email}</span>
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <Link
            to="/admin/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-secondary text-white font-bold text-xs hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-primary" />
            <span>Return to Dashboard</span>
          </Link>

          <button
            onClick={() => {
              logout();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-slate-400" />
            <span>Switch Role / Re-login</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Authorized: render children or nested routes via Outlet
  return children ? <>{children}</> : <Outlet />;
}
