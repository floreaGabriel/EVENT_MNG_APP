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

        const params = { 
          limit: 4,
          visibility: 'PUBLIC',
          status: 'PUBLISHED',
          sortBy: 'currentAttendees', 
          sortOrder: 'desc'
        };
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

      {/* About Our Company Section */}
      <div className="bg-gradient-to-br from-white to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              <span className="inline-block transform hover:scale-105 transition-transform duration-300">
                Despre EventHub
              </span>
            </h2>
            <div className="h-1 w-20 bg-blue-500 mx-auto mt-2 mb-4 rounded transform hover:scale-x-150 transition-all duration-300 ease-in-out"></div>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-600 sm:mt-4">
              Conectăm oamenii prin experiențe memorabile
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-5 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Misiunea Noastră</h3>
              <p className="text-gray-600 text-center">
                Să facilităm organizarea și descoperirea evenimentelor, făcând mai ușoară conectarea oamenilor cu experiențe care le îmbogățesc viața.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-5 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Ce ne face diferiți</h3>
              <p className="text-gray-600 text-center">
                Platforma noastră intuitivă și personalizată ajută atât organizatorii cât și participanții să se conecteze fără efort, în comunitatea lor locală.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-5 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Comunitatea Noastră</h3>
              <p className="text-gray-600 text-center">
                Peste 10,000 de utilizatori activi și 500 de organizatori de evenimente folosesc platforma noastră lunar pentru a crea conexiuni valoroase.
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <div className="inline-flex items-center space-x-8 py-5 px-8 rounded-full bg-white shadow-lg transform transition-all duration-300 hover:scale-105">
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold text-blue-600 animate-pulse">5000+</span>
                <span className="text-gray-500">Evenimente</span>
              </div>
              <div className="h-10 w-px bg-gray-200"></div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold text-blue-600 animate-pulse">150+</span>
                <span className="text-gray-500">Orașe</span>
              </div>
              <div className="h-10 w-px bg-gray-200"></div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold text-blue-600 animate-pulse">50K+</span>
                <span className="text-gray-500">Participanți</span>
              </div>
            </div>
          </div>
          
          <div className="mt-16">
            <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-12">
              <Link 
                to="/events" 
                className="px-8 py-3 bg-blue-600 text-white rounded-md shadow transform transition-all duration-300 hover:bg-blue-700 hover:scale-105 flex items-center space-x-2"
              >
                <span>Explorează Evenimente</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;