// src/pages/Events.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    date: '',
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        let url = 'http://localhost:5001/api/events';
        const queryParams = [];

        if (searchTerm) queryParams.push(`title=${encodeURIComponent(searchTerm)}`);
        if (filters.category) queryParams.push(`category=${encodeURIComponent(filters.category)}`);
        if (filters.location) queryParams.push(`location=${encodeURIComponent(filters.location)}`);
        if (filters.date) queryParams.push(`date=${encodeURIComponent(filters.date)}`);

        if (queryParams.length > 0) {
          url += `?${queryParams.join('&')}`;
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        setEvents(data.data);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchTerm, filters]); // Re-randează când se schimbă searchTerm sau filtrele

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  return (
    <div className="bg-white">
      {/* Search and Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
          {/* Search Bar */}
          <div className="w-full sm:w-1/3">
            <input
              type="text"
              placeholder="Search events by title..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-2/3">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="Concert">Concert</option>
              <option value="Festival">Festival</option>
              <option value="Workshop">Workshop</option>
              <option value="Conference">Conference</option>
              <option value="Party">Party</option>
              <option value="Exhibition">Exhibition</option>
              <option value="SportEvent">Sport Event</option>
              <option value="Charity">Charity</option>
              <option value="Other">Other</option>
            </select>

            <input
              type="text"
              placeholder="Filter by location (city, country)..."
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            All Events
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Explore upcoming events matching your search and filters.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center mt-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center mt-10 text-red-500">{error}</div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event._id} className="group relative bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.media?.coverImage || 'https://res.cloudinary.com/duairwgys/image/upload/v1741028340/not_loaded_sample_qwxdws.jpg'}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black opacity-60"></div>
                    <div className="absolute bottom-0 left-0 p-4">
                      <p className="text-sm font-medium text-white">
                        {new Date(event.dates.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                      <Link to={`/events/${event._id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center col-span-full text-gray-500">
                No events found matching your criteria.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;