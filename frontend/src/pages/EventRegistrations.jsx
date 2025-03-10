// src/pages/EventRegistrations.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { registrationsApi } from '../services/api.service';

const EventRegistrations = ({ user }) => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  useEffect(() => {
    // Redirect if not logged in or not an organizer
    if (!user || !user.roles.includes('ORGANIZER')) {
      navigate('/login?message=You must be logged in as an organizer to view this page');
      return;
    }
    
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const response = await registrationsApi.getEventRegistrations(eventId);
        setRegistrations(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching registrations:', error);
        setError('Failed to load registrations. Please try again.');
        setLoading(false);
      }
    };
    
    fetchRegistrations();
  }, [eventId, user, navigate]);
  
  const handleApprove = async (registrationId) => {
    try {
      await registrationsApi.updateRegistrationStatus(registrationId, { status: 'CONFIRMED' });
      // Update the UI
      setRegistrations(prevRegistrations => 
        prevRegistrations.map(reg => 
          reg._id === registrationId ? { ...reg, status: 'CONFIRMED' } : reg
        )
      );
    } catch (error) {
      console.error('Error approving registration:', error);
      setError('Failed to approve registration. Please try again.');
    }
  };
  
  const handleReject = async (registrationId) => {
    try {
      await registrationsApi.updateRegistrationStatus(registrationId, { status: 'CANCELLED' });
      // Update the UI
      setRegistrations(prevRegistrations => 
        prevRegistrations.map(reg => 
          reg._id === registrationId ? { ...reg, status: 'CANCELLED' } : reg
        )
      );
    } catch (error) {
      console.error('Error rejecting registration:', error);
      setError('Failed to reject registration. Please try again.');
    }
  };
  
  const viewAttendeeProfile = (registration) => {
    setSelectedRegistration(registration);
    setShowDetailsModal(true);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Event Registrations</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {registrations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-gray-500 text-center">
            No registrations found for this event.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((registration) => (
                  <tr key={registration._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {registration.attendee.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={registration.attendee.avatar}
                              alt={`${registration.attendee.firstname} ${registration.attendee.lastname}`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                              {registration.attendee.firstname.charAt(0)}{registration.attendee.lastname.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {registration.attendee.firstname} {registration.attendee.lastname}
                          </div>
                          <div className="text-sm text-gray-500">
                            {registration.attendee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{registration.ticketType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{registration.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(registration.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${registration.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                          registration.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {registration.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewAttendeeProfile(registration)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View Profile
                      </button>
                      {registration.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(registration._id)}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(registration._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Attendee Profile Modal */}
      {showDetailsModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Attendee Profile
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 flex flex-col items-center">
                {selectedRegistration.attendee.avatar ? (
                  <img
                    src={selectedRegistration.attendee.avatar}
                    alt={`${selectedRegistration.attendee.firstname} ${selectedRegistration.attendee.lastname}`}
                    className="h-32 w-32 rounded-full object-cover mb-4"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-medium mb-4">
                    {selectedRegistration.attendee.firstname.charAt(0)}{selectedRegistration.attendee.lastname.charAt(0)}
                  </div>
                )}
                <h3 className="text-xl font-medium text-gray-900">
                  {selectedRegistration.attendee.firstname} {selectedRegistration.attendee.lastname}
                </h3>
                <p className="text-gray-500">@{selectedRegistration.attendee.username}</p>
              </div>
              
              <div className="md:col-span-2">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h4>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Email:</span> {selectedRegistration.attendee.email}
                </p>
                {selectedRegistration.attendee.participantProfile?.contactInfo?.phone && (
                  <p className="text-gray-700 mb-1">
                    <span className="font-medium">Phone:</span> {selectedRegistration.attendee.participantProfile.contactInfo.phone}
                  </p>
                )}
                
                {selectedRegistration.attendee.participantProfile?.description && (
                  <>
                    <h4 className="text-lg font-medium text-gray-900 mt-6 mb-2">Bio</h4>
                    <p className="text-gray-700">
                      {selectedRegistration.attendee.participantProfile.description}
                    </p>
                  </>
                )}
                
                <h4 className="text-lg font-medium text-gray-900 mt-6 mb-2">Registration Details</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700 mb-1">
                    <span className="font-medium">Ticket Type:</span> {selectedRegistration.ticketType}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <span className="font-medium">Quantity:</span> {selectedRegistration.quantity}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <span className="font-medium">Total Price:</span> {selectedRegistration.totalPrice} {selectedRegistration.currency}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <span className="font-medium">Payment Status:</span> {selectedRegistration.paymentStatus}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Registration Date:</span> {new Date(selectedRegistration.createdAt).toLocaleString()}
                  </p>
                </div>
                
                {selectedRegistration.status === 'PENDING' && (
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        handleApprove(selectedRegistration._id);
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedRegistration._id);
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventRegistrations;