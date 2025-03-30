import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationsContext';
import NotificationItem from '../components/NotificationItem';

const Notifications = () => {
  const { notifications, unreadCount, loading, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'event_update', 'event_invite', 'participation_confirmed', 'reminder'

  // Filtrarea notificărilor în funcție de starea de citire
  const filteredNotifications = notifications.filter(notification => {
    // Aplicăm filtrul pentru starea de citire
    const readFilterMatch = 
      filter === 'all' || 
      (filter === 'unread' && !notification.read) || 
      (filter === 'read' && notification.read);
    
    // Aplicăm filtrul pentru tipul notificării
    const typeFilterMatch = 
      typeFilter === 'all' || 
      notification.type === typeFilter;
    
    // Notificarea trebuie să corespundă ambelor filtre
    return readFilterMatch && typeFilterMatch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notificări</h1>
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount} necitite din {notifications.length} totale
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead} 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Marchează toate ca citite
              </button>
            )}
          </div>
        </div>
        
        {/* Filtre */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex flex-col md:flex-row md:items-center gap-4">
          <div>
            <label htmlFor="read-filter" className="block text-sm font-medium text-gray-700 mr-2">
              Filtrează după:
            </label>
            <select 
              id="read-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="mt-1 block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">Toate</option>
              <option value="unread">Necitite</option>
              <option value="read">Citite</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mr-2">
              Tip notificare:
            </label>
            <select 
              id="type-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="mt-1 block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">Toate tipurile</option>
              <option value="event_invite">Invitații</option>
              <option value="event_update">Actualizări eveniment</option>
              <option value="participation_confirmed">Participare confirmată</option>
              <option value="reminder">Remindere</option>
            </select>
          </div>
        </div>
        
        {/* Lista de notificări */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-500">Se încarcă notificările...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationItem 
                key={notification._id} 
                notification={notification} 
              />
            ))
          ) : (
            <div className="p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nu există notificări</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all'
                  ? 'Nu ai nicio notificare momentan.'
                  : filter === 'unread'
                  ? 'Nu ai notificări necitite.'
                  : 'Nu ai notificări citite.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications; 