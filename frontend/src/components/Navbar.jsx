// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationsDropdown from './NotificationsDropdown';

const Navbar = ({ user, setUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = () => {
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
            {/* Componenta Notificări */}
            {user && (
              <div className="relative mr-4" onClick={handleMenuClick}>
                <NotificationsDropdown />
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
                    <Link to="/notifications" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Notifications
                    </Link>
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
            {/* Adăugăm butonul de notificări pe mobile */}
            {user && (
              <div className="relative mr-4" onClick={handleMenuClick}>
                <NotificationsDropdown />
              </div>
            )}
            
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
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

        {/* Mobile User Section */}
        {user ? (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              {user.avatar ? (
                <img className="h-10 w-10 rounded-full" src={user.avatar} alt={`${user.firstname} ${user.lastname}`} />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {user.firstname.charAt(0)}{user.lastname.charAt(0)}
                </div>
              )}
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user.username}</div>
                <div className="text-sm font-medium text-gray-500">{user.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {user.roles?.includes('PARTICIPANT') && (
                <Link to="/profile-participant" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-blue-700 hover:bg-gray-100">
                  Your Profile
                </Link>
              )}
              {user.roles?.includes('ORGANIZER') && (
                <Link to="/profile-organizer" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-blue-700 hover:bg-gray-100">
                  Your Profile
                </Link>
              )}
              {user?.roles?.includes('ORGANIZER') && (
                <Link to="/organizer-stats" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-blue-700 hover:bg-gray-100">
                  Statistics
                </Link>
              )}
              <Link to="/notifications" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-blue-700 hover:bg-gray-100">
                Notifications
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 hover:text-blue-700 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex flex-col space-y-2 px-4">
              <Link to="/login" className="block w-full text-center py-2 bg-white border border-gray-300 rounded-md text-blue-700 hover:bg-gray-50">
                Log in
              </Link>
              <Link to="/register" className="block w-full text-center py-2 bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md text-white">
                Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;