// src/pages/OrganizerStats.jsx
import { useState, useEffect } from 'react';
import { eventsApi } from '../services/api.service';

const OrganizerStats = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    eventsByCategory: {},
    recentEvents: [],
    popularEvents: [],
    attendeeTrend: [],
    ticketRevenue: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrganizerStats = async () => {
      try {
        setLoading(true);
        const data = await eventsApi.getOrganizerStats();
        setStats(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching organizer statistics:', error);
        setError('Failed to load statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizerStats();
  }, []);

  // Calculează rata de conversie
  const calculateConversionRate = () => {
    if (!stats.popularEvents || stats.popularEvents.length === 0) return '0%';
    
    const totalAttendees = stats.popularEvents.reduce((sum, event) => sum + event.attendees, 0);
    const totalTicketsSold = stats.popularEvents.reduce((sum, event) => sum + event.ticketsSold, 0);
    
    if (totalAttendees === 0) return '0%';
    return Math.round((totalTicketsSold / totalAttendees) * 100) + '%';
  };

  // Calculează media de participanți per eveniment
  const calculateAverageAttendance = () => {
    return stats.totalEvents ? Math.round(stats.totalAttendees / stats.totalEvents) : 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {error}
              </h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Organizer Statistics
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Track the performance of your events
          </p>
        </div>

        {/* Stats Overview Cards */}
        <div className="mt-10 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Events
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.totalEvents}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Attendees
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.totalAttendees.toLocaleString()}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Average Attendance
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {calculateAverageAttendance()}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Conversion Rate
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {calculateConversionRate()}
              </dd>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Attendees Trend Chart */}
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Attendees Trend
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="h-64 relative">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  {/* Grid lines */}
                  <line x1="50" y1="170" x2="350" y2="170" stroke="#E5E7EB" strokeWidth="1" />
                  <line x1="50" y1="135" x2="350" y2="135" stroke="#E5E7EB" strokeWidth="1" />
                  <line x1="50" y1="100" x2="350" y2="100" stroke="#E5E7EB" strokeWidth="1" />
                  <line x1="50" y1="65" x2="350" y2="65" stroke="#E5E7EB" strokeWidth="1" />
                  <line x1="50" y1="30" x2="350" y2="30" stroke="#E5E7EB" strokeWidth="1" />
                  
                  {/* Y-axis labels */}
                  <text x="40" y="170" textAnchor="end" fontSize="12" fill="#6B7280">0</text>
                  <text x="40" y="135" textAnchor="end" fontSize="12" fill="#6B7280">100</text>
                  <text x="40" y="100" textAnchor="end" fontSize="12" fill="#6B7280">200</text>
                  <text x="40" y="65" textAnchor="end" fontSize="12" fill="#6B7280">300</text>
                  <text x="40" y="30" textAnchor="end" fontSize="12" fill="#6B7280">400</text>
                  
                  {/* X-axis labels */}
                  {stats.attendeeTrend && stats.attendeeTrend.map((point, index) => {
                    const xPos = 75 + (index * (300 / (stats.attendeeTrend.length - 1 || 1)));
                    return (
                      <text key={`month-${index}`} x={xPos} y="185" textAnchor="middle" fontSize="12" fill="#6B7280">
                        {point.month}
                      </text>
                    );
                  })}
                  
                  {/* Data line */}
                  {stats.attendeeTrend && stats.attendeeTrend.length > 0 && (
                    <polyline 
                      points={stats.attendeeTrend.map((point, index) => {
                        const xPos = 75 + (index * (300 / (stats.attendeeTrend.length - 1 || 1)));
                        const maxValue = Math.max(...stats.attendeeTrend.map(p => p.count), 400);
                        const yPos = 170 - ((point.count / maxValue) * 140);
                        return `${xPos},${yPos}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="3"
                    />
                  )}
                  
                  {/* Data points */}
                  {stats.attendeeTrend && stats.attendeeTrend.map((point, index) => {
                    const xPos = 75 + (index * (300 / (stats.attendeeTrend.length - 1 || 1)));
                    const maxValue = Math.max(...stats.attendeeTrend.map(p => p.count), 400);
                    const yPos = 170 - ((point.count / maxValue) * 140);
                    return (
                      <circle key={`point-${index}`} cx={xPos} cy={yPos} r="4" fill="#3B82F6" />
                    );
                  })}
                </svg>
              </div>
              <div className="mt-2 text-sm text-gray-500 text-center">
                Monthly attendee count over the last 6 months
              </div>
            </div>
          </div>

          {/* Category Distribution Chart */}
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Events by Category
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="h-64 relative">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  {/* Pie Chart */}
                  <g transform="translate(200, 100)">
                    {Object.entries(stats.eventsByCategory).length > 0 && (() => {
                      const colors = [
                        '#3B82F6', '#10B981', '#F59E0B', '#EC4899', 
                        '#8B5CF6', '#EF4444', '#14B8A6', '#F97316'
                      ];
                      
                      const categoryEntries = Object.entries(stats.eventsByCategory);
                      const total = categoryEntries.reduce((sum, [_, count]) => sum + count, 0);
                      
                      let startAngle = 0;
                      return categoryEntries.map(([category, count], index) => {
                        const percentage = count / total;
                        const endAngle = startAngle + percentage * 2 * Math.PI;
                        
                        // Calcul coordonate pentru arc
                        const startX = Math.sin(startAngle) * 80;
                        const startY = -Math.cos(startAngle) * 80;
                        const endX = Math.sin(endAngle) * 80;
                        const endY = -Math.cos(endAngle) * 80;
                        
                        // Decide dacă arcul este mai mare de 180 grade
                        const largeArcFlag = percentage > 0.5 ? 1 : 0;
                        
                        // Construiește path pentru felie
                        const path = `M 0 0 L ${startX} ${startY} A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
                        
                        const slice = (
                          <path
                            key={`pie-${index}`}
                            d={path}
                            fill={colors[index % colors.length]}
                          />
                        );
                        
                        // Actualizează unghiul pentru următoarea felie
                        startAngle = endAngle;
                        
                        return slice;
                      });
                    })()}
                  </g>
                  
                  {/* Legend */}
                  <g transform="translate(330, 70)">
                    {Object.entries(stats.eventsByCategory).map(([category, count], index) => {
                      const colors = [
                        '#3B82F6', '#10B981', '#F59E0B', '#EC4899', 
                        '#8B5CF6', '#EF4444', '#14B8A6', '#F97316'
                      ];
                      return (
                        <g key={`legend-${index}`} transform={`translate(0, ${index * 25})`}>
                          <rect x="0" y="0" width="15" height="15" fill={colors[index % colors.length]} />
                          <text x="20" y="12" fontSize="12" fill="#6B7280">{category}</text>
                        </g>
                      );
                    })}
                  </g>
                </svg>
              </div>
              <div className="mt-2 text-sm text-gray-500 text-center">
                Distribution of events by category
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Revenue Chart */}
        <div className="mt-8 bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Ticket Revenue by Event Type
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="h-80 relative">
              <svg className="w-full h-full" viewBox="0 0 600 300">
                {/* Grid lines */}
                <line x1="60" y1="250" x2="550" y2="250" stroke="#E5E7EB" strokeWidth="1" />
                <line x1="60" y1="200" x2="550" y2="200" stroke="#E5E7EB" strokeWidth="1" />
                <line x1="60" y1="150" x2="550" y2="150" stroke="#E5E7EB" strokeWidth="1" />
                <line x1="60" y1="100" x2="550" y2="100" stroke="#E5E7EB" strokeWidth="1" />
                <line x1="60" y1="50" x2="550" y2="50" stroke="#E5E7EB" strokeWidth="1" />
                
                {/* Y-axis labels */}
                <text x="50" y="250" textAnchor="end" fontSize="12" fill="#6B7280">$0</text>
                <text x="50" y="200" textAnchor="end" fontSize="12" fill="#6B7280">$5k</text>
                <text x="50" y="150" textAnchor="end" fontSize="12" fill="#6B7280">$10k</text>
                <text x="50" y="100" textAnchor="end" fontSize="12" fill="#6B7280">$15k</text>
                <text x="50" y="50" textAnchor="end" fontSize="12" fill="#6B7280">$20k</text>
                
                {/* X-axis */}
                <line x1="60" y1="250" x2="60" y2="255" stroke="#4B5563" strokeWidth="1" />
                <line x1="550" y1="250" x2="550" y2="255" stroke="#4B5563" strokeWidth="1" />
                <line x1="60" y1="250" x2="550" y2="250" stroke="#4B5563" strokeWidth="1" />
                
                {/* Bars */}
                {stats.ticketRevenue && stats.ticketRevenue.map((item, index) => {
                  const barWidth = 60;
                  const gap = 30;
                  const totalWidth = (barWidth + gap) * stats.ticketRevenue.length;
                  const startX = (550 - 60 - totalWidth) / 2 + 60;
                  const x = startX + index * (barWidth + gap);
                  
                  // Găsim valoarea maximă pentru scalare
                  const maxRevenue = Math.max(...stats.ticketRevenue.map(i => i.revenue), 20000);
                  
                  // Calculăm înălțimea barei proporțional cu valoarea
                  const heightScale = 200 / maxRevenue; // 200px este diferența între y=50 și y=250
                  const height = item.revenue * heightScale;
                  const y = 250 - height;
                  
                  return (
                    <g key={`bar-${index}`}>
                      <rect 
                        x={x} 
                        y={y} 
                        width={barWidth} 
                        height={height} 
                        fill="#3B82F6" 
                        opacity="0.8" 
                      />
                      <text 
                        x={x + barWidth/2} 
                        y={y - 10} 
                        textAnchor="middle" 
                        fontSize="12" 
                        fill="#1F2937" 
                        fontWeight="bold"
                      >
                        ${item.revenue.toLocaleString()}
                      </text>
                      <text 
                        x={x + barWidth/2} 
                        y={280} 
                        textAnchor="middle" 
                        fontSize="14" 
                        fill="#4B5563"
                      >
                        {item.category}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="mt-2 text-sm text-gray-500 text-center">
              Total ticket revenue by event category
            </div>
          </div>
        </div>

        {/* Events by Category */}
        <div className="mt-8 bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Events by Category
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {Object.entries(stats.eventsByCategory).map(([category, count]) => (
                <div key={category} className="bg-gray-50 rounded-lg p-4 text-center">
                  <span className="text-2xl font-bold text-blue-600">{count}</span>
                  <p className="mt-1 text-sm text-gray-500">{category}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Events
            </h3>
          </div>
          <div className="bg-white overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {stats.recentEvents && stats.recentEvents.map((event) => (
                <li key={event._id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-blue-600 truncate">
                      {event.title}
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {event.attendees} attendees
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
              {(!stats.recentEvents || stats.recentEvents.length === 0) && (
                <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                  No recent events available
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Popular Events */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Most Popular Events
            </h3>
          </div>
          <div className="bg-white overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendees
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tickets Sold
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fill Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.popularEvents && stats.popularEvents.map((event) => (
                  <tr key={event._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {event.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.attendees}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.ticketsSold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Math.round((event.ticketsSold / event.attendees) * 100)}%
                    </td>
                  </tr>
                ))}
                {(!stats.popularEvents || stats.popularEvents.length === 0) && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      No popular events available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerStats;