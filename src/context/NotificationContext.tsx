import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api';

export interface NotificationItem {
  _id: string;
  id?: string;
  title: string;
  message: string;
  type: 'Booking' | 'Contact' | 'Order' | 'Chatbot' | 'Newsletter' | 'Payment' | 'System' | 'Warning' | 'Success';
  icon?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  recipientRoles?: string[];
  relatedModule?: string;
  relatedRecordId?: string;
  readStatus: boolean;
  actionUrl: string;
  createdBy?: string;
  createdAt: string;
}

interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  toast: NotificationToast | null;
  dismissToast: () => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<NotificationToast | null>(null);

  // Keep track of known notification IDs to detect new incoming real-time notifications
  const knownIdsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef<boolean>(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.getNotifications({ limit: 15, sortBy: 'latest' });
      if (res.success && res.data) {
        const list: NotificationItem[] = res.data.notifications || [];
        const count = res.data.unreadCount ?? list.filter(n => !n.readStatus).length;

        // Detect new unread notification for Real-Time Toast Popups
        if (!initialLoadRef.current && list.length > 0) {
          const latest = list[0];
          const latestId = latest._id || latest.id || '';
          if (latestId && !knownIdsRef.current.has(latestId) && !latest.readStatus) {
            setToast({
              id: latestId,
              title: latest.title,
              message: latest.message,
              type: latest.type
            });
          }
        }

        // Update known IDs
        list.forEach(n => {
          const id = n._id || n.id;
          if (id) knownIdsRef.current.add(id);
        });

        setNotifications(list);
        setUnreadCount(count);
        initialLoadRef.current = false;
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll for notifications every 15 seconds
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const markAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications(prev =>
      prev.map(n => ((n._id === id || n.id === id) ? { ...n, readStatus: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await api.markNotificationAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllAsRead = async () => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
    setUnreadCount(0);

    try {
      await api.markAllNotificationsAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    // Optimistic UI update
    setNotifications(prev => prev.filter(n => n._id !== id && n.id !== id));
    setUnreadCount(prev => {
      const target = notifications.find(n => n._id === id || n.id === id);
      return target && !target.readStatus ? Math.max(0, prev - 1) : prev;
    });

    try {
      await api.deleteNotification(id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        toast,
        dismissToast,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
