import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NotificationItem from './NotificationItem';
import { useNotifications } from '../context/NotificationsContext';

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAllAsRead, loading } = useNotifications();

  // Funcție pentru comutarea stării dropdown-ului
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Închide dropdown-ul la click în afara lui
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Butonul de notificări */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-expanded={isOpen}
      >
        <span className="sr-only">Vezi notificările</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Indicator pentru notificări necitite */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown pentru notificări */}
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1 bg-white rounded-md shadow-xs">
            {/* Header dropdown */}
            <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">Notificări</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Marchează toate ca citite
                </button>
              )}
            </div>

            {/* Conținutul dropdown-ului */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-sm text-gray-500">Se încarcă notificările...</p>
                </div>
              ) : notifications.length > 0 ? (
                notifications.slice(0, 5).map((notification) => (
                  <NotificationItem key={notification._id} notification={notification} />
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500">Nu ai notificări.</p>
                </div>
              )}
            </div>

            {/* Footer dropdown */}
            {notifications.length > 5 && (
              <div className="px-4 py-2 border-t border-gray-200 text-center">
                <Link 
                  to="/notifications" 
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Vezi toate notificările
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown; 