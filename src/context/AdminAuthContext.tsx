import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser, AdminRole } from '../types/admin';
import { api } from '../lib/api';
import { isTokenValid, decodeJwt } from '../lib/jwt';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: AdminUser | null;
  token: string | null;
  login: (emailOrMobile: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: Omit<AdminUser, 'id'>, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<Omit<AdminUser, 'id'>>) => void;
  verifyAccount: (emailOrMobile: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (emailOrMobile: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  hasRole: (allowedRoles: AdminRole[] | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

export function normalizeRole(role?: string): string {
  if (!role) return 'Admin';
  const clean = role.trim().toLowerCase().replace(/_/g, ' ');
  if (clean.includes('super')) return 'Super Admin';
  if (clean.includes('admin')) return 'Admin';
  if (clean.includes('manager')) return 'Manager';
  if (clean.includes('employee') || clean.includes('staff')) return 'Employee';
  if (clean.includes('user') || clean.includes('customer')) return 'User';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Validate stored token and fetch user on initial mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('eveng_admin_token') || sessionStorage.getItem('eveng_token');

      if (storedToken && isTokenValid(storedToken)) {
        setToken(storedToken);
        const decoded = decodeJwt(storedToken);

        try {
          // Attempt to fetch current user profile from backend
          const res = await api.getMe();
          if (res.success && res.data) {
            const u = res.data;
            const nameParts = (u.name || decoded?.name || '').split(' ');
            const adminUser: AdminUser = {
              id: u.id || u._id || decoded?.id || '',
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || '',
              email: u.email || decoded?.email || '',
              mobile: u.mobile || '',
              profilePicture: u.profilePicture || '',
              role: normalizeRole(u.role || decoded?.role || 'Admin'),
              permissions: u.permissions || []
            };
            setCurrentUser(adminUser);
            setIsAuthenticated(true);
          } else {
            // Fallback to decoded token payload
            if (decoded) {
              const nameParts = (decoded.name || '').split(' ');
              const fallbackUser: AdminUser = {
                id: decoded.id || '',
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                email: decoded.email || '',
                mobile: '',
                profilePicture: '',
                role: normalizeRole(decoded.role || 'Admin'),
                permissions: []
              };
              setCurrentUser(fallbackUser);
              setIsAuthenticated(true);
            } else {
              logout();
            }
          }
        } catch {
          if (decoded) {
            const nameParts = (decoded.name || '').split(' ');
            setCurrentUser({
              id: decoded.id || '',
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || '',
              email: decoded.email || '',
              mobile: '',
              profilePicture: '',
              role: normalizeRole(decoded.role || 'Admin'),
              permissions: []
            });
            setIsAuthenticated(true);
          } else {
            logout();
          }
        }
      } else {
        logout();
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (emailOrMobile: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await api.login({ emailOrMobile, password });
      if (res.success && res.data) {
        const authToken = res.data.token || '';
        localStorage.setItem('eveng_admin_token', authToken);
        setToken(authToken);

        const u = res.data.user || {};
        const decoded = decodeJwt(authToken);
        const nameParts = (u.name || decoded?.name || '').split(' ');
        
        const adminUser: AdminUser = {
          id: u.id || decoded?.id || '',
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: u.email || decoded?.email || '',
          mobile: u.mobile || '',
          profilePicture: u.profilePicture || '',
          role: normalizeRole(u.role || decoded?.role || 'Admin'),
          permissions: u.permissions || []
        };

        setCurrentUser(adminUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, error: res.error || 'Login failed' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Login request error' };
    }
  };

  const signup = async (userData: Omit<AdminUser, 'id'>, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const payload = {
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        mobile: userData.mobile,
        password,
        role: userData.role || 'Admin'
      };
      const res = await api.register(payload);
      if (res.success && res.data) {
        const authToken = res.data.token || '';
        localStorage.setItem('eveng_admin_token', authToken);
        setToken(authToken);

        const u = res.data.user || {};
        const newUser: AdminUser = {
          id: u.id || '',
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          mobile: userData.mobile,
          profilePicture: userData.profilePicture || '',
          role: userData.role || 'Admin',
          permissions: []
        };
        setCurrentUser(newUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, error: res.error || 'Registration failed' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Registration error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('eveng_admin_token');
    sessionStorage.removeItem('eveng_token');
    setToken(null);
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const updateProfile = (data: Partial<Omit<AdminUser, 'id'>>) => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, ...data });
  };

  const verifyAccount = async (emailOrMobile: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.verifyAccount(emailOrMobile);
      return { success: res.success, error: res.error };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification failed' };
    }
  };

  const resetPassword = async (emailOrMobile: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.resetPassword(emailOrMobile, newPassword);
      return { success: res.success, error: res.error };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password reset failed' };
    }
  };

  const hasRole = (allowedRoles: AdminRole[] | string[]): boolean => {
    if (!currentUser || !currentUser.role) return false;
    const userRoleNorm = normalizeRole(currentUser.role);
    if (userRoleNorm === 'Super Admin') return true;
    const allowedNorm = allowedRoles.map((r) => normalizeRole(r));
    return allowedNorm.includes(userRoleNorm) || allowedRoles.includes(currentUser.role as any);
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    const userRoleNorm = normalizeRole(currentUser.role);
    if (userRoleNorm === 'Super Admin') return true;
    if (currentUser.permissions?.includes('all')) return true;
    return Boolean(currentUser.permissions?.includes(permission));
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        currentUser,
        token,
        login,
        signup,
        logout,
        updateProfile,
        verifyAccount,
        resetPassword,
        hasRole,
        hasPermission
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
