import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useNotifications } from '../context/NotificationsContext';

const NotificationItem = ({ notification }) => {
  const navigate = useNavigate();
  const { markAsRead, deleteNotification } = useNotifications();

  // Formatare dată relativ la data curentă (ex: "acum 5 minute", "acum 2 ore")
  const formattedDate = formatDistance(
    new Date(notification.createdAt),
    new Date(),
    { addSuffix: true, locale: ro }
  );

  // Gestionarea click-ului pe notificare
  const handleClick = () => {
    // Marchează notificarea ca citită dacă nu este deja
    if (!notification.read) {
      markAsRead(notification._id);
    }

    // Navigare către eveniment dacă există un ID de eveniment
    if (notification.eventId) {
      navigate(`/events/${notification.eventId._id}`);
    }
  };

  // Gestionarea ștergerii notificării
  const handleDelete = (e) => {
    e.stopPropagation(); // Previne declansarea click-ului parinte
    deleteNotification(notification._id);
  };

  // Determinarea iconului în funcție de tipul notificării
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'event_invite':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'event_update':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'participation_confirmed':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'reminder':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`flex items-start space-x-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
    >
      {getNotificationIcon()}
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${!notification.read ? 'text-blue-900' : 'text-gray-900'}`}>
          {notification.message}
        </p>
        
        {notification.eventId && (
          <p className="mt-1 text-xs text-gray-500 truncate">
            {notification.eventId.title} - {notification.eventId.location?.address}
          </p>
        )}
        
        <p className="mt-1 text-xs text-gray-500">
          {formattedDate}
        </p>
      </div>
      
      <button 
        onClick={handleDelete}
        className="flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default NotificationItem; 