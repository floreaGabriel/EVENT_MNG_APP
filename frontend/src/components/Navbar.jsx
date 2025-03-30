// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useNotifications from '../utils/useNotifications'; 

const Navbar = ({ user, setUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false); 
  const  {notifications, markAsRead } = useNotifications(); 
  const [unreadCount, setUnreadCount] = useState(0); 
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = () => {
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
      setIsNotificationsOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Actualizăm contorul de notificări necitite
  useEffect(() => {
    setUnreadCount(notifications.filter((notif) => !notif.read).length);
  }, [notifications]);

  // Prevenim închiderea meniurilor la click în interior
  const handleMenuClick = (e) => {
    e.stopPropagation();
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Main Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">EventHub</Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Home
              </Link>
              <Link to="/events" className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Events
              </Link>
              {user?.roles?.includes('ORGANIZER') && (
                <Link to="/create-event" className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Create Event
                </Link>
              )}
            </div>
          </div>

          {/* User Authentication Section + Notifications */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Buton Notificări */}
            {user && (
              <div className="relative mr-4" onClick={handleMenuClick}>
                <button
                  type="button"
                  className="relative flex items-center justify-center h-8 w-8 rounded-full bg-white text-gray-500 hover:text-blue-700 focus:outline-none"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                  <span className="sr-only">Open notifications</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a2 2 0 10-4 0v.083A6 6 0 004 11v3.159c0 .538-.214 1.053-.595 1.436L2 17h5m4 0a2 2 0 104 0"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-600 text-white text-xs font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-2 text-sm text-gray-700">Nu ai notificări.</p>
                    ) : (
                      notifications.map((notif, index) => (
                        <div
                          key={index}
                          className={`block px-4 py-2 text-sm ${
                            notif.read ? 'text-gray-500' : 'text-gray-700 font-semibold'
                          } hover:bg-gray-100`}
                          onClick={() => !notif.read && markAsRead(index)}
                        >
                          {notif.message}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Secțiunea User */}
            {user ? (
              <div className="relative ml-3" onClick={handleMenuClick}>
                <button
                  type="button"
                  className="flex items-center rounded-full bg-white text-sm focus:outline-none"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  {user.avatar ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.avatar}
                      alt={`${user.firstname} ${user.lastname}`}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {user.firstname.charAt(0)}{user.lastname.charAt(0)}
                    </div>
                  )}
                  <span className="ml-2 text-gray-700">{user.username}</span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {user.roles?.includes('PARTICIPANT') && (
                      <Link to="/profile-participant" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Your Profile
                      </Link>
                    )}
                    {user.roles?.includes('ORGANIZER') && (
                      <Link to="/profile-organizer" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Your Profile
                      </Link>
                    )}
                    {user?.roles?.includes('ORGANIZER') && (
                      <Link to="/organizer-stats" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Statistics
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-500 hover:text-blue-700 px-3 py-2 text-sm font-medium">
                  Log in
                </Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden" onClick={handleMenuClick}>
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-700">
              Home
            </Link>
            <Link to="/events" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-700">
              Events
            </Link>
            {user?.roles?.includes('ORGANIZER') && (
              <Link to="/create-event" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-700">
                Create Event
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div>
                <div className="flex items-center px-4">
                  {user.avatar ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.avatar}
                      alt={`${user.firstname} ${user.lastname}`}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {user.firstname.charAt(0)}{user.lastname.charAt(0)}
                    </div>
                  )}
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.firstname} {user.lastname}</div>
                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link to="/profile" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                    Your Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1 px-4">
                <Link to="/login" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                  Log in
                </Link>
                <Link to="/register" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;