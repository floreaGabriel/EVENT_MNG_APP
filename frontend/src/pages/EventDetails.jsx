import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventsApi, registrationsApi, paymentsApi } from '../services/api.service';
import GoogleMap from '../components/GoogleMap';
import PaymentModal from '../components/PaymentModal';

const EventDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState('');
  const [registrationData, setRegistrationData] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [cancelling, setCancelling] = useState(false);
  // Stare pentru modalul de plată
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Fetch event details when component mounts
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const response = await eventsApi.getEventById(id);
        setEvent(response.data);

         // Set default selected ticket
         if (response.data.pricing && 
          response.data.pricing.tickets && 
          response.data.pricing.tickets.length > 0) {
          setSelectedTicket(response.data.pricing.tickets[0].type);
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);


  // check if user already registered for event
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      // daca nu exista un user sau un event return... 
      if (!user || !event) return;


      try {
        const response = await registrationsApi.checkRegistrationStatus(id);
        if (response.isRegistered) {
          setRegistrationStatus(response.status);
          setRegistrationData(response.data);
          setRegistrationSuccess(true);
        }
      } catch (error) {
        console.error('Error checking registration status:', error);
      }
    };

    checkRegistrationStatus();
  }, [id, user, event]);

  // verificam daca evenimentul este salvat
  const [isSaved, setIsSaved] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);

  useEffect(() => {
    const checkIfEventSaved = async () => {
      if (!user) return;
      
      try {
        const response = await eventsApi.checkSavedEvent(id);
        if (response.success) {
          setIsSaved(response.isSaved);
        }
      } catch (error) {
        console.error('Error checking if event is saved:', error);
      }
    };
    
    checkIfEventSaved();
  }, [id, user]);

  // functie pentru salvare eveniment
  const handleToggleSave = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    try {
      setSavingEvent(true);
      const response = await eventsApi.toggleSaveEvent(id);
      if (response.success) {
        setIsSaved(response.isSaved);
      }
    } catch (error) {
      console.error('Error toggling event save:', error);
    } finally {
      setSavingEvent(false);
    }
  };
  // Function to handle event registration
  const handleRegister = async () => {
    // Check if user is logged in

    console.log("HANDLE REGISTER...");
    console.log("User incearca sa se inregistreze: ", user);

    if (event.organizer._id === user._id) {
      alert("You are the organizer, you cannot register for this event");
      return;
    }
    
    if (!user) {
      setShowLoginModal(true);
      return;
    }



    if (registrationStatus && registrationStatus !== 'CANCELLED') {
      setRegistrationSuccess(true);
      return;
    }

    setShowRegistrationModal(true);
  };

  const submitRegistration = async () => {
    try {
      setRegistering(true);
      setRegistrationError('');


      if (!selectedTicket) {
        setRegistrationError('Please select a ticket type');
        setRegistering(false);
        return;
      }

      // prepare registration data 

      const registrationPayload = {
        eventId: id,
        ticketType: selectedTicket,
        quantity: ticketQuantity
      }
      console.log(`Userul ${user.firstname} incearca sa se inregistreze la eveniment ... `);
      const response = await registrationsApi.registerForEvent(registrationPayload);
      setRegistrationSuccess(true);
      setRegistrationStatus(response.data.status);
      setRegistrationData(response.data);
      setShowRegistrationModal(false);
    } catch (error) {
      console.error('Error registering for event:', error);
      setRegistrationError(error.message || 'Failed to register for event. Please try again.');
    } finally {
      setRegistering(false);
    }
  };


  const handleCancelRegistration = async () => {
    try {

      console.log(`Userul ${user.firstname} incearca sa dea cancel la inregistrare`);
      setCancelling(true);
      if (!registrationData || !registrationData._id) {
        throw new Error('Registration data not found');
      }
      
      await registrationsApi.cancelRegistration(registrationData._id);
      setRegistrationStatus('CANCELLED');
      setCancelling(false);
      
      // Refresh registration data
      const response = await registrationsApi.checkRegistrationStatus(id);
      if (response.isRegistered) {
        setRegistrationData(response.data);
      }
    } catch (error) {
      console.error('Error cancelling registration:', error);
      setCancelling(false);
    }
  };

  // Format date with options
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Funcție pentru deschiderea modalului de plată
  const handlePayClick = () => {
    setShowPaymentModal(true);
  };

  // Funcție pentru închiderea modalului de plată
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  // Funcție pentru gestionarea succesului plății
  const handlePaymentSuccess = (paymentData) => {
    console.log('Payment successful:', paymentData);
    setPaymentSuccess(true);
    setShowPaymentModal(false);
    
    // Actualizează datele de înregistrare și statusul
    setRegistrationData(prevData => ({
      ...prevData,
      paymentStatus: 'PAID',
      status: 'CONFIRMED'
    }));
    setRegistrationStatus('CONFIRMED');

    // Reîncarcă datele de înregistrare pentru a fi sigur că avem cele mai recente informații
    checkRegistrationStatus();
  };

  // Funcție pentru verificarea statusului înregistrării
  const checkRegistrationStatus = async () => {
    // daca nu exista un user sau un event return... 
    if (!user || !event) return;

    try {
      const response = await registrationsApi.checkRegistrationStatus(id);
      if (response.isRegistered) {
        setRegistrationStatus(response.status);
        setRegistrationData(response.data);
        setRegistrationSuccess(true);
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
    }
  };

  // Adaugă această funcție pentru a genera butonul de acțiune bazat pe statusul înregistrării și plății
  const renderActionButton = () => {
    if (!user) {
      return (
        <button
          onClick={handleRegister}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
        >
          Înregistrează-te
        </button>
      );
    }

    if (event?.organizer?._id === user._id) {
      return (
        <Link
          to={`/event/${id}/registrations`}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md inline-block"
        >
          Gestionează înregistrările
        </Link>
      );
    }

    if (!registrationSuccess) {
      return (
        <button
          onClick={handleRegister}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
        >
          Înregistrează-te
        </button>
      );
    }

    if (registrationStatus === 'CANCELLED') {
      return (
        <button
          onClick={handleRegister}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
        >
          Înregistrează-te din nou
        </button>
      );
    }

    if (registrationStatus === 'CONFIRMED') {
      // Verifică dacă este nevoie de plată
      if (registrationData?.paymentStatus === 'UNPAID' && !event?.pricing?.isFree) {
        return (
          <div className="flex flex-col space-y-2">
            <button
              onClick={handlePayClick}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
            >
              Plătește acum
            </button>
            <button
              onClick={handleCancelRegistration}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
            >
              {cancelling ? 'Se anulează...' : 'Anulează înregistrarea'}
            </button>
          </div>
        );
      }
      
      return (
        <div className="flex flex-col space-y-2">
          <div className="bg-green-100 text-green-800 p-3 rounded-lg">
            {registrationData?.paymentStatus === 'PAID' 
              ? 'Ești înregistrat și ai plătit pentru acest eveniment!' 
              : 'Ești înregistrat pentru acest eveniment!'}
          </div>
          <button
            onClick={handleCancelRegistration}
            disabled={cancelling}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
          >
            {cancelling ? 'Se anulează...' : 'Anulează înregistrarea'}
          </button>
        </div>
      );
    }

    if (registrationStatus === 'PENDING') {
      return (
        <div className="flex flex-col space-y-2">
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg">
            Înregistrarea ta este în așteptarea confirmării organizatorului.
          </div>
          <button
            onClick={handleCancelRegistration}
            disabled={cancelling}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
          >
            {cancelling ? 'Se anulează...' : 'Anulează înregistrarea'}
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={handleRegister}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
      >
        Înregistrează-te
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded max-w-7xl mx-auto my-12">
        {error}
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center my-20">
        <h2 className="text-3xl font-bold text-gray-800">Event not found</h2>
        <Link to="/events" className="mt-4 inline-block text-blue-600 hover:underline">
          Browse all events
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowRegistrationModal(false)}>
          <div className="bg-white rounded-lg p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Complete Your Registration</h2>
            
            {registrationError && (
              <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md border border-red-200">
                {registrationError}
              </div>
            )}
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Ticket Type
              </label>
              <select
                value={selectedTicket}
                onChange={(e) => setSelectedTicket(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a ticket</option>
                {event.pricing.tickets.map((ticket, index) => (
                  <option key={index} value={ticket.type} disabled={ticket.availableQuantity !== undefined && ticket.availableQuantity < 1}>
                    {ticket.type} - {ticket.price.toFixed(2)} {ticket.currency} {ticket.availableQuantity !== undefined ? `(${ticket.availableQuantity} left)` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                max={selectedTicket ? event.pricing.tickets.find(t => t.type === selectedTicket)?.availableQuantity || 10 : 1}
                value={ticketQuantity}
                onChange={(e) => setTicketQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRegistrationModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitRegistration}
                disabled={registering || !selectedTicket}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {registering ? 'Processing...' : 'Complete Registration'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowLoginModal(false)}>
          <div className="bg-white rounded-lg p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Login Required</h2>
            <p className="mb-6">You need to be logged in to register for events.</p>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  navigate('/login', { state: { from: `/events/${id}` } });
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  navigate('/register', { state: { from: `/events/${id}` } });
                }}
                className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded hover:bg-blue-50"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div 
        className="w-full h-80 md:h-96 bg-cover bg-center relative" 
        style={{ 
          backgroundImage: `url(${event.media?.coverImage || 'https://res.cloudinary.com/duairwgys/image/upload/v1741028340/not_loaded_sample_qwxdws.jpg'})`,
          backgroundPosition: 'center',
          backgroundColor: '#000', // Fallback background color
          transition: 'background-image 0.3s ease-in-out'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
          <div className="max-w-7xl mx-auto w-full">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium inline-block mb-4">
              {event.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 max-w-4xl">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span>{formatEventDate(event.dates.start)}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>{event.location.name}, {event.location.city}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
              <div className="prose max-w-none text-gray-700">
                <p className="whitespace-pre-line">{event.description}</p>
              </div>
            </div>

            {/* Event Schedule */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Schedule</h2>
              <div className="space-y-4">
                {event.dates.doorsOpen && (
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-2 mr-4">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Doors Open</h3>
                      <p className="text-gray-600">{formatEventDate(event.dates.doorsOpen)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-4">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Event Starts</h3>
                    <p className="text-gray-600">{formatEventDate(event.dates.start)}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-red-100 rounded-full p-2 mr-4">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Event Ends</h3>
                    <p className="text-gray-600">{formatEventDate(event.dates.end)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Venue Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Venue</h2>
              <div className="flex flex-col w-full">
                <div className="bg-yellow-100 rounded-full p-2 mr-4 w-9">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{event.location.name}</h3>
                  <p className="text-gray-600">{event.location.address}</p>
                  <p className="text-gray-600">{event.location.city}, {event.location.country}</p>
                  
                  {/* Add a map placeholder */}
                  <div className="mt-4 w-full">
                    <GoogleMap
                      latitude={event.location.coordinates.latitude}
                      longitude={event.location.coordinates.longitude}
                      locationName={event.location.name}
                    />
                    
                  </div>
                </div>
              </div>
            </div>

            {/* Organizer Information */}
            {event.organizer._id !== user?._id && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Organizer</h2>
              <div className="flex items-center">
                {event.organizer.avatar ? (
                  <img 
                    src={event.organizer.avatar} 
                    alt={event.organizer.username} 
                    className="w-12 h-12 rounded-full mr-4"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium mr-4">
                    {event.organizer.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{event.organizer.username}</h3>
                  {event.organizer.organizerProfile?.rating && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span className="ml-1 text-gray-600">{event.organizer.organizerProfile.rating.average.toFixed(1)} ({event.organizer.organizerProfile.rating.count} reviews)</span>
                    </div>
                  )}
                  {user && (
                    <button className="mt-2 text-blue-600 hover:text-blue-800 font-medium flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                      </svg>
                      Contact Organizer
                    </button>
                  )}
                </div>
              </div>
            </div>
            )}

          </div>
            
          {/* Right Column - Registration Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Registration</h2>
              
              {/* Price Information */}
              <div className="mb-6">
                {event.pricing.isFree ? (
                  <p className="text-2xl font-bold text-green-600">Free Event</p>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-gray-900 mb-2">Ticket Options:</p>
                    <div className="space-y-3">
                      {event.pricing.tickets.map((ticket, index) => (
                        <div key={index} className="flex justify-between p-3 border border-gray-200 rounded-md hover:border-blue-300 transition-colors">
                          <div>
                            <p className="font-medium text-gray-900">{ticket.type}</p>
                            {ticket.availableQuantity && (
                              <p className="text-sm text-gray-500">
                                {ticket.availableQuantity} tickets remaining
                              </p>
                            )}
                          </div>
                          <p className="font-bold text-blue-600">
                            {ticket.price.toFixed(2)} {ticket.currency}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {/* Event Details Summary */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Date and Time</p>
                    <p className="text-gray-700">
                      {new Date(event.dates.start).toLocaleDateString('en-US', { 
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      , {new Date(event.dates.start).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-gray-700">{event.location.name}</p>
                  </div>
                </div>
                {event.capacity && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="text-gray-700">{event.capacity} attendees</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Registration Button */}
              
              {renderActionButton()}
              
              {/* Login Reminder */}
              {!user && (
                <p className="mt-3 text-sm text-gray-500 text-center">
                  You need to be logged in to register.{' '}
                  <Link to="/login" className="text-blue-600 hover:underline">
                    Log in
                  </Link>
                  {' '}or{' '}
                  <Link to="/register" className="text-blue-600 hover:underline">
                    Create an account
                  </Link>
                </p>
              )}
              
              

              {/* Save Button */}
              {user && (
                <button
                  onClick={handleToggleSave}
                  disabled={savingEvent}
                  className={`mt-3 w-full flex items-center justify-center py-2 px-4 border rounded-md font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSaved 
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100' 
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {savingEvent ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <svg 
                        className={`h-5 w-5 mr-2 ${isSaved ? 'text-yellow-500' : 'text-gray-400'}`} 
                        fill={isSaved ? 'currentColor' : 'none'}
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        ></path>
                      </svg>
                      {isSaved ? 'Saved to Your Events' : 'Save to Your Events'}
                    </>
                  )}
                </button>
              )}

              {/* Share Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Share this event</p>
                <div className="flex space-x-4">
                  <button className="flex items-center justify-center bg-blue-500 rounded-full p-2 text-white hover:bg-blue-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                    </svg>
                  </button>
                  <button className="flex items-center justify-center bg-blue-400 rounded-full p-2 text-white hover:bg-blue-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </button>
                  <button className="flex items-center justify-center bg-green-500 rounded-full p-2 text-white hover:bg-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Modal */}
      {registrationData && (
        <PaymentModal
          registration={registrationData}
          isOpen={showPaymentModal}
          onClose={handleClosePaymentModal}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default EventDetails;