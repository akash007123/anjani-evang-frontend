export type AdminRole = 'Super Admin' | 'Admin' | 'Manager' | 'Employee';

export interface AdminUser {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  username?: string;
  profilePicture: string;
  role?: AdminRole | string;
  permissions?: string[];
  status?: string;
  lastLogin?: string;
  createdAt?: string;
  createdBy?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  amount: number;
  status: 'paid' | 'preparing' | 'delivered' | 'cancelled';
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  profilePicture: string;
  status: 'active' | 'away' | 'inactive';
  role: string;
}
