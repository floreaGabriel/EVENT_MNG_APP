import { createContext, useContext, useState, useEffect } from 'react';
import { notificationsApi } from '../services/api.service';

// Crearea contextului
const NotificationsContext = createContext();

// Hook personalizat pentru a folosi contextul
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

// Provider-ul contextului
export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Funcție pentru încărcarea notificărilor
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getNotifications();
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Nu s-au putut încărca notificările');
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru marcarea unei notificări ca citită
  const markAsRead = async (notificationId) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      
      // Actualizăm local notificările pentru o experiență UI mai rapidă
      setNotifications(notifications.map(notification => 
        notification._id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ));
      
      // Decrementăm contorul de necitite
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      setError('Nu s-a putut marca notificarea ca citită');
    }
  };

  // Funcție pentru marcarea tuturor notificărilor ca citite
  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      
      // Actualizăm local notificările pentru o experiență UI mai rapidă
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      
      // Resetăm contorul de necitite
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      setError('Nu s-au putut marca toate notificările ca citite');
    }
  };

  // Funcție pentru ștergerea unei notificări
  const deleteNotification = async (notificationId) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      
      // Eliminăm notificarea din stare
      const updatedNotifications = notifications.filter(
        notification => notification._id !== notificationId
      );
      setNotifications(updatedNotifications);
      
      // Actualizăm contorul de necitite dacă notificarea era necitită
      const wasUnread = notifications.find(n => n._id === notificationId && !n.read);
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
      setError('Nu s-a putut șterge notificarea');
    }
  };

  // Încărcăm notificările la prima randare
  useEffect(() => {
    fetchNotifications();
    
    // Putem configura un interval pentru a verifica periodic notificările noi
    const intervalId = setInterval(fetchNotifications, 60000); // Verificare la fiecare minut
    
    return () => clearInterval(intervalId); // Cleanup la dezasamblare
  }, []);

  // Valoarea furnizată de context
  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsContext; 