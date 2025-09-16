'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import Pusher from 'pusher-js';

interface Notification {
  id: string;
  type: 'order' | 'payment' | 'seller' | 'product' | 'system';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
  userId?: number;
  role?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  userId?: number;
  userRole?: string;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  userId,
  userRole,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Initialize Pusher
    const pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    setPusher(pusherInstance);

    // Connection events
    pusherInstance.connection.bind('connected', () => {
      console.log('✅ Pusher connected');
      setIsConnected(true);
    });

    pusherInstance.connection.bind('disconnected', () => {
      console.log('❌ Pusher disconnected');
      setIsConnected(false);
    });

    pusherInstance.connection.bind('error', (error: any) => {
      console.error('❌ Pusher connection error:', error);
      setIsConnected(false);
    });

    // Subscribe to user-specific channel
    const userChannel = pusherInstance.subscribe(`user-${userId}`);
    
    // Subscribe to role-specific channel if available
    let roleChannel: any = null;
    if (userRole) {
      roleChannel = pusherInstance.subscribe(`role-${userRole.toLowerCase()}`);
    }

    // Subscribe to broadcast channel for system-wide notifications
    const broadcastChannel = pusherInstance.subscribe('broadcast');

    // Generic notification handler
    const handleNotification = (eventType: string, data: any) => {
      const notification: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        type: data.type || 'system',
        title: data.title || 'New Notification',
        message: data.message || '',
        data: data.data,
        timestamp: new Date(),
        read: false,
        userId: data.userId,
        role: data.role,
      };

      setNotifications(prev => [notification, ...prev]);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      }
    };

    // User-specific events
    userChannel.bind('order-placed', (data: any) => {
      handleNotification('order-placed', {
        ...data,
        type: 'order',
        title: '🛍️ Order Placed',
        message: `Your order #${data.orderId} has been placed successfully.`,
      });
    });

    userChannel.bind('order-status-update', (data: any) => {
      handleNotification('order-status-update', {
        ...data,
        type: 'order',
        title: '📦 Order Update',
        message: `Order #${data.orderId} status changed to ${data.status}.`,
      });
    });

    userChannel.bind('payment-processed', (data: any) => {
      handleNotification('payment-processed', {
        ...data,
        type: 'payment',
        title: '💳 Payment Processed',
        message: `Payment of $${data.amount} has been processed successfully.`,
      });
    });

    userChannel.bind('payment-failed', (data: any) => {
      handleNotification('payment-failed', {
        ...data,
        type: 'payment',
        title: '❌ Payment Failed',
        message: `Payment of $${data.amount} has failed. Please try again.`,
      });
    });

    // Role-specific events
    if (roleChannel) {
      roleChannel.bind('new-order-seller', (data: any) => {
        handleNotification('new-order-seller', {
          ...data,
          type: 'order',
          title: '🛍️ New Order Received',
          message: `You have a new order #${data.orderId} for $${data.amount}.`,
        });
      });

      roleChannel.bind('seller-verification-update', (data: any) => {
        handleNotification('seller-verification-update', {
          ...data,
          type: 'seller',
          title: '✅ Verification Update',
          message: `Your seller verification status has been updated to ${data.status}.`,
        });
      });

      roleChannel.bind('payout-processed', (data: any) => {
        handleNotification('payout-processed', {
          ...data,
          type: 'seller',
          title: '💰 Payout Processed',
          message: `Your payout of $${data.amount} has been processed.`,
        });
      });

      roleChannel.bind('product-low-stock', (data: any) => {
        handleNotification('product-low-stock', {
          ...data,
          type: 'product',
          title: '⚠️ Low Stock Alert',
          message: `Product "${data.productName}" is running low on stock (${data.stock} remaining).`,
        });
      });

      roleChannel.bind('product-out-of-stock', (data: any) => {
        handleNotification('product-out-of-stock', {
          ...data,
          type: 'product',
          title: '❌ Out of Stock',
          message: `Product "${data.productName}" is now out of stock.`,
        });
      });
    }

    // Generic notification listeners for backend events
    userChannel.bind_global((eventName: string, data: any) => {
      console.log(`📨 Received notification on user channel: ${eventName}`, data);
      if (eventName.startsWith('notification-')) {
        handleNotification(eventName, {
          ...data,
          type: data.type || 'system',
          title: data.title || 'New Notification',
          message: data.message || 'You have a new notification',
        });
      }
    });

    if (roleChannel) {
      roleChannel.bind_global((eventName: string, data: any) => {
        console.log(`📨 Received notification on role channel: ${eventName}`, data);
        if (eventName.startsWith('notification-')) {
          handleNotification(eventName, {
            ...data,
            type: data.type || 'system',
            title: data.title || 'New Notification',
            message: data.message || 'You have a new notification',
          });
        }
      });
    }

    broadcastChannel.bind_global((eventName: string, data: any) => {
      console.log(`📨 Received notification on broadcast channel: ${eventName}`, data);
      if (eventName.startsWith('notification-') || eventName.startsWith('broadcast-')) {
        handleNotification(eventName, {
          ...data,
          type: data.type || 'system',
          title: data.title || 'New Notification',
          message: data.message || 'You have a new notification',
        });
      }
    });

    // Broadcast events (system-wide)
    broadcastChannel.bind('system-maintenance', (data: any) => {
      handleNotification('system-maintenance', {
        ...data,
        type: 'system',
        title: '🔧 System Maintenance',
        message: data.message || 'System maintenance is scheduled.',
      });
    });

    broadcastChannel.bind('system-announcement', (data: any) => {
      handleNotification('system-announcement', {
        ...data,
        type: 'system',
        title: '📢 Announcement',
        message: data.message || 'New system announcement.',
      });
    });

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup
    return () => {
      userChannel.unbind_all();
      roleChannel?.unbind_all();
      broadcastChannel.unbind_all();
      pusherInstance.unsubscribe(`user-${userId}`);
      if (userRole) {
        pusherInstance.unsubscribe(`role-${userRole.toLowerCase()}`);
      }
      pusherInstance.unsubscribe('broadcast');
      pusherInstance.disconnect();
    };
  }, [userId, userRole]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    isConnected,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};