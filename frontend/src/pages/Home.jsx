// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi } from '../services/api.service';

const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {

        const params = { limit: 4 };
        const data = await eventsApi.getEvents(params);
        setFeaturedEvents(data.data);
      } catch (error) {
        console.error('Error fetching featured events:', error);
        setError('Failed to load featured events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvents();
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-10 pb-20 sm:pt-16 sm:pb-32 lg:pt-24 lg:pb-40">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                <span className="block">Discover Amazing Events</span>
                <span className="block text-blue-200">Near You</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-blue-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Find the best concerts, workshops, conferences, and more happening in your city.
              </p>
              <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                  <Link to="/events" className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 sm:px-8">
                    Browse Events
                  </Link>
                  <Link to="/create-event" className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-500 bg-opacity-60 hover:bg-opacity-70 sm:px-8">
                    Create Event
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Events Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Featured Events
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Check out these popular upcoming events
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center mt-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center mt-10 text-red-500">{error}</div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {featuredEvents.length > 0 ? (
              featuredEvents.map((event) => (
                <div key={event._id} className="group relative bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={event.media?.coverImage}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black opacity-60"></div>
                    <div className="absolute bottom-0 left-0 p-4">
                      <p className="text-sm font-medium text-white">
                        {new Date(event.dates.start).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-white truncate">
                        {event.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {event.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {event.location.city}, {event.location.country}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {event.shortDescription || event.description.substring(0, 120) + '...'}
                    </p>
                    <div className="mt-4">
                      <Link 
                        to={`/events/${event._id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center col-span-full text-gray-500">
                No featured events available at the moment.
              </div>
            )}
          </div>
        )}

        {featuredEvents.length > 0 && (
          <div className="mt-10 text-center">
            <Link 
              to="/events" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              View All Events
            </Link>
          </div>
        )}
      </div>

      {/* Categories Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Browse by Category
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Find events that match your interests
            </p>
          </div>
          
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {['Concert', 'Festival', 'Workshop', 'Conference', 'Party', 'Exhibition', 'SportEvent', 'Charity', 'Other'].map((category) => (
              <Link
                key={category}
                to={`/events?category=${category}`}
                className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow duration-200"
              >
                <div className="text-blue-600 mb-3">
                  {/* Simple category icons using emojis */}
                  {category === 'Concert' && '🎵'}
                  {category === 'Festival' && '🎪'}
                  {category === 'Workshop' && '🛠️'}
                  {category === 'Conference' && '💼'}
                  {category === 'Party' && '🎉'}
                  {category === 'Exhibition' && '🖼️'}
                  {category === 'SportEvent' && '⚽'}
                  {category === 'Charity' && '💝'}
                  {category === 'Other' && '✨'}
                </div>
                <h3 className="text-lg font-medium text-gray-900">{category}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;