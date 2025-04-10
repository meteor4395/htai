import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { firestoreService } from '../services/firestore';

const NotificationContext = createContext({});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let unsubscribe;

    if (user) {
      unsubscribe = firestoreService.subscribeToNotifications(user.uid, (notifications) => {
        setNotifications(notifications);
        setUnreadCount(notifications.length);
      });
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      await firestoreService.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const promises = notifications
        .filter((n) => !n.read)
        .map((n) => firestoreService.markNotificationAsRead(n.id));
      
      await Promise.all(promises);
      
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await firestoreService.deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
      setUnreadCount((prev) =>
        notifications.find((n) => n.id === notificationId && !n.read)
          ? prev - 1
          : prev
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const createNotification = async (data) => {
    try {
      const notification = await firestoreService.createNotification({
        ...data,
        userId: user.uid,
      });
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 