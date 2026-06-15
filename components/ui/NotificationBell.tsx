'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  userId?: string;
  username?: string;
}

interface NotificationBellProps {
  userId: string;
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Fetch initial notifications
    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = (window as any).__supabaseClient?.channel?.(`notifications:${userId}`);
    if (channel) {
      channel
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'UserInteraction' }, handleNewNotification)
        .subscribe();
    }

    return () => {
      if (channel) {
        (window as any).__supabaseClient?.removeChannel?.(channel);
      }
    };
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      // Mock notifications for now - in production, fetch from API
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'follow',
          message: 'SciFiFan42 started following you',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          userId: 'user1',
          username: 'scififan42',
        },
        {
          id: '2',
          type: 'like',
          message: 'AnimeLover liked your review of Attack on Titan',
          read: false,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          userId: 'user2',
          username: 'animelover',
        },
        {
          id: '3',
          type: 'follow',
          message: 'MovieBuff started following you',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          userId: 'user3',
          username: 'moviebuff',
        },
      ];
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter((n) => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleNewNotification = (payload: any) => {
    const newNotification: Notification = {
      id: payload.new?.id || Date.now().toString(),
      type: payload.new?.actionType || 'unknown',
      message: `New activity from a user you follow`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-background-tertiary"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent-coral text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-background-secondary border border-accent-blue/20 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-accent-blue/10 flex items-center justify-between">
                <h3 className="text-text-primary font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-text-tertiary text-sm">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`p-3 border-b border-accent-blue/5 hover:bg-background-tertiary/50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-accent-blue/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notification.read ? 'bg-transparent' : 'bg-accent-blue'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-primary">{notification.message}</p>
                          <p className="text-xs text-text-tertiary mt-1">
                            {getTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-accent-blue/10">
                <button className="w-full text-center text-xs text-accent-blue hover:text-accent-blue/80 transition-colors py-2">
                  View all notifications
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
