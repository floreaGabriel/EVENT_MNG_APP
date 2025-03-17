import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, eventsApi } from "../services/api.service";

const OrganizerDashboard = (({user}) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [profileData, setProfileData] = useState({
        firstname: user?.firstname || '',
        lastname: user?.lastname || '',
        username: user?.username || '',
        email: user?.email || '',
        avatar: user?.avatar || '',
        organizerProfile: {
            description: user?.organizerProfile?.description || '',
            contactInfo: {
              businessEmail: user?.organizerProfile?.contactInfo?.businessEmail || '',
              phone: user?.organizerProfile?.contactInfo?.phone || '',
              website: user?.organizerProfile?.contactInfo?.website || '',
              socialMedia: {
                linkedin: user?.organizerProfile?.contactInfo?.socialMedia?.linkedin || '',
                facebook: user?.organizerProfile?.contactInfo?.socialMedia?.facebook || '',
                instagram: user?.organizerProfile?.contactInfo?.socialMedia?.instagram || '',
              }
            },
            subscriptionPlan: user?.organizerProfile?.subscriptionPlan || ''
          }
    });


    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [eventsError, setEventsError] = useState('');
    const [eventTab, setEventTab] = useState('upcoming');
    const [filteredEvents, setFilteredEvents] = useState([]);

    const navigate = useNavigate();


    const filterEventsByTab = (eventsToFilter, tab) => {
      const now = new Date();
      let filtered = [];
      
      switch(tab) {
        case 'upcoming':
          // Events with start date in the future and not in draft status
          filtered = eventsToFilter.filter(event => 
            new Date(event.dates.start) >= now && 
            event.status !== 'DRAFT'
          );
          break;
        case 'past':
          // Events with end date in the past and not in draft status
          filtered = eventsToFilter.filter(event => 
            new Date(event.dates.end) < now && 
            event.status !== 'DRAFT'
          );
          break;
        case 'draft':
          // Events with draft status regardless of date
          filtered = eventsToFilter.filter(event => 
            event.status === 'DRAFT'
          );
          break;
        default:
          filtered = eventsToFilter;
      }
      
      return filtered;
    };
    
    // Use a separate useEffect for filtering
    useEffect(() => {
      if (events.length > 0) {
        const filtered = filterEventsByTab(events, eventTab);
        setFilteredEvents(filtered);
      }
    }, [events, eventTab]);
    // fetch pentru evenimente
    useEffect(() => {
      const fetchEvents = async () => {
        if (activeTab !== 'events' || !user) return;

        try {

          console.log("incarcare evenimente organizator");
          setEventsLoading(true);
          const response = await eventsApi.getEvents();

          // preluam doar evenimentele organizatorului
          const organizerEvents = response.data.filter(
            event => event.organizer._id === user._id
          )

          console.log("Evenimente: ", organizerEvents);

          setEvents(organizerEvents);

        } catch (error) {
          console.error('Error fetching organizer events:', error);
          setEventsError('Failed to load your events. Please try again.');
        } finally {
          setEventsLoading(false);
        }
      }


      fetchEvents();
    }, [activeTab, user]);


    const handlePublishEvent = async (eventId) => {
      try {
        // Find the event in the list
        const eventToUpdate = events.find(e => e._id === eventId);
        if (!eventToUpdate) return;
        
        // Update the event status to PUBLISHED
        const updatedEventData = {
          ...eventToUpdate,
          status: 'PUBLISHED'
        };
        
        await eventsApi.updateEvent(eventId, updatedEventData);
        
        // Update local state to reflect the change
        const updatedEvents = events.map(event => 
          event._id === eventId 
            ? { ...event, status: 'PUBLISHED' } 
            : event
        );
        
        setEvents(updatedEvents);
        // Re-filter to update the current tab view
        filterEventsByTab(updatedEvents, eventTab);
        
        // Show success message if you have that functionality
        setSuccess('Event published successfully!');
      } catch (error) {
        console.error('Error publishing event:', error);
        setError('Failed to publish event. Please try again.');
      }
    };
    
    // use effect daca userul nu este logat
    useEffect(() => {
        // If no user is logged in, redirect to login
        if (!user) {
          navigate("/login?message=Please log in to view your profile");
        }
        // Verifică dacă utilizatorul este un organizator nou (fără plan selectat)
        else if (user.roles.includes("ORGANIZER") && !user.organizerProfile?.subscriptionPlan) {
          setActiveTab("select-plan"); // Afișează ecranul de selecție a planului
        }
    }, [user, navigate]);

    const handlePlanSelection = async (plan) => {
        setLoading(true);
        setError("");
        setSuccess("");
    
        try {
          const updatedProfileData = {
            ...profileData,
            organizerProfile: {
              ...profileData.organizerProfile,
              subscriptionPlan: plan,
            },
          };
    
          // Apel API pentru actualizarea planului
          const response = await authApi.updateProfile(updatedProfileData);
          const updatedUser = { ...user, ...updatedProfileData, avatar: response.data.avatar };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setSuccess("Plan selected successfully!");
          setTimeout(() => {
            setActiveTab("profile");
          }, 2000); // Redirecționare după 2 secunde
        } catch (err) {
          setError("Failed to select plan. Please try again.");
          console.error("Error selecting plan:", err);
        } finally {
          setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const keys = name.split('.');
        
        setProfileData(prevData => {
          const newData = { ...prevData };
          let current = newData;
          
          // Navigate to the nested property
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              current[keys[i]] = {};
            }
            current = current[keys[i]];
          }
          
          // Set the value
          current[keys[keys.length - 1]] = value;
          return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
      
        try {
          const response = await authApi.updateProfile(profileData);
          const updatedUser = { ...user, ...profileData, avatar: response.data.avatar };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setSuccess("Profile updated successfully!");
        } catch (err) {
          setError("Failed to update profile. Please try again.");
          console.error("Error updating profile:", err);
        } finally {
          setLoading(false);
        }
      };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // File validation
        if (!file.type.match('image.*')) {
          setError('Please select an image file');
          return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB
          setError('Image must be less than 5MB');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          setProfileData(prevData => ({
            ...prevData,
            avatar: event.target.result
          }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubscriptionSelect = async (newPlan) => {
      // If the selected plan is already the current plan, do nothing
      if (profileData.organizerProfile.subscriptionPlan === newPlan) {
        return;
      }
    
      setLoading(true);
      setError('');
      setSuccess('');
    
      try {
        // Prepare the updated profile data with the new subscription plan
        const updatedProfileData = {
          ...profileData,
          organizerProfile: {
            ...profileData.organizerProfile,
            subscriptionPlan: newPlan,
          },
        };
    
        // Make API call to update the profile with the new subscription plan
        const response = await authApi.updateProfile(updatedProfileData);
    
        // Update local state with the new profile data
        setProfileData(updatedProfileData);
    
        // Update the user object in localStorage
        const updatedUser = { 
          ...user, 
          ...updatedProfileData, 
          avatar: response.data.avatar 
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
    
        // Show success message
        setSuccess(`Successfully changed to ${newPlan} plan!`);
    
        // Optional: Redirect to profile tab after success
        setTimeout(() => {
          setActiveTab('profile');
          setSuccess('');
        }, 2000);
    
      } catch (err) {
        // Handle errors
        setError('Failed to change subscription plan. Please try again.');
        console.error('Error changing subscription plan:', err);
    
        // Optional: Revert to previous state if needed
        setProfileData(prevData => ({
          ...prevData,
          organizerProfile: {
            ...prevData.organizerProfile,
            subscriptionPlan: user.organizerProfile.subscriptionPlan
          }
        }));
      } finally {
        setLoading(false);
      }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">Manage your organizer profile and events</p>
          </div>
  
          {/* Success and error messages */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
  
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="flex flex-col items-center p-6">
                  <div className="relative group">
                                {profileData.avatar ? (
                                <img 
                                    src={profileData.avatar} 
                                    alt={`${user.firstname} ${user.lastname}`} 
                                    className="h-24 w-24 rounded-full object-cover border-2 border-white shadow-md"
                                />
                                ) : (
                                <div className="h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-medium border-2 border-white shadow-md">
                                        {user.firstname.charAt(0)}{user.lastname.charAt(0)}
                                    </div>
                                    )}
                                    <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer shadow-md hover:bg-blue-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                                    </svg>
                                    </label>
                                    <input 
                                    id="avatar-upload" 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleAvatarChange}
                                    />
                                </div>
                               
                    <h2 className="mt-4 text-xl font-semibold text-gray-900">
                      {user.firstname} {user.lastname}
                    </h2>
                    <p className="text-gray-500 text-sm">@{user.username}</p>
                      {/* Add subscription plan display */}
                      {profileData.organizerProfile.subscriptionPlan && (
                        <p className="text-gray-600 text-sm mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {profileData.organizerProfile.subscriptionPlan}
                          </span>
                        </p>
                      )}

                    {/* User badges/roles */}
                    <div className="mt-3 flex flex-wrap gap-2 justify-center">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className={`px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800`}
                        >
                          {role.charAt(0) + role.slice(1).toLowerCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
  
                {/* Navigation menu */}
                <nav className="py-2">
                  <ul>
                    <li>
                      <button
                        onClick={() => setActiveTab("profile")}
                        className={`w-full text-left px-6 py-3 flex items-center ${
                          activeTab === "profile"
                            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          ></path>
                        </svg>
                        Profile Settings
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("events")}
                        className={`w-full text-left px-6 py-3 flex items-center ${
                          activeTab === "events"
                            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          ></path>
                        </svg>
                        My Events
                      </button>
                    </li>
                    <li>
                        <button
                          onClick={() => setActiveTab('subscription')}
                          className={`w-full text-left px-6 py-3 flex items-center ${
                            activeTab === 'subscription' 
                              ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                          </svg>
                          Subscription Plan
                        </button>
                      </li>
                  </ul>
                </nav>
              
                {/* Quick Links Section */}
                    <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Quick Links</h3>
                        </div>
                        <div className="p-4">
                            <ul className="space-y-2">
                            <li>
                                <Link to="/events" className="text-blue-600 hover:text-blue-800 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                                Browse Events
                                </Link>
                            </li>
                            {user.roles.includes('ORGANIZER') && (
                                <li>
                                <Link to="/create-event" className="text-blue-600 hover:text-blue-800 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    Create New Event
                                </Link>
                                </li>
                            )}
                            <li>
                                <Link to="/tickets" className="text-blue-600 hover:text-blue-800 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                                </svg>
                                My Tickets
                                </Link>
                            </li>
                            </ul>
                        </div>
                    </div>
            </div>
            
  
            {/* Main content area */}
            <div className="md:col-span-3">
              <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                {/* Select Plan Tab (for new organizers) */}
                {activeTab === "select-plan" && (
                  <div className="p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                      Select Your Subscription Plan
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Welcome, {user.firstname}! Please choose a subscription plan to get
                      started as an organizer.
                    </p>
  
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* FREE Plan */}
                      <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-medium text-gray-900 mb-4">FREE</h3>
                        <p className="text-gray-600 mb-4">Basic features for new organizers.</p>
                        <ul className="text-gray-600 space-y-2 mb-6">
                          <li>✅ Create up to 5 events</li>
                          <li>✅ Basic analytics</li>
                          <li>❌ Limited support</li>
                        </ul>
                        <button
                          onClick={() => handlePlanSelection("FREE")}
                          disabled={loading}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {loading ? "Processing..." : "Select FREE"}
                        </button>
                      </div>
  
                      {/* PRO Plan */}
                      <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-medium text-gray-900 mb-4">PREMIUM</h3>
                        <p className="text-gray-600 mb-4">Enhanced features for growing organizers.</p>
                        <ul className="text-gray-600 space-y-2 mb-6">
                          <li>✅ Create up to 20 events per month</li>
                          <li>✅ Advanced analytics</li>
                          <li>✅ Priority support</li>
                        </ul>
                        <button
                          onClick={() => handlePlanSelection("PREMIUM")}
                          disabled={loading}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {loading ? "Processing..." : "Select PREMIUM"}
                        </button>
                      </div>
  
                      {/* ENTERPRISE Plan */}
                      <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-medium text-gray-900 mb-4">ENTERPRISE</h3>
                        <p className="text-gray-600 mb-4">Premium features for large organizations.</p>
                        <ul className="text-gray-600 space-y-2 mb-6">
                          <li>✅ Unlimited event creation</li>
                          <li>✅ Custom analytics</li>
                          <li>✅ Dedicated support</li>
                        </ul>
                        <button
                          onClick={() => handlePlanSelection("ENTERPRISE")}
                          disabled={loading}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {loading ? "Processing..." : "Select ENTERPRISE"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
  
                {/* Profile Tab */}
                {activeTab === "profile" && (
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>

                    <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                        <label
                            htmlFor="firstname"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            First Name
                        </label>
                        <input
                            type="text"
                            id="firstname"
                            name="firstname"
                            value={profileData.firstname}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                            required
                        />
                        </div>

                        <div>
                        <label
                            htmlFor="lastname"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="lastname"
                            name="lastname"
                            value={profileData.lastname}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                            required
                        />
                        </div>

                        <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={profileData.username}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                            required
                        />
                        </div>

                        <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                            required
                        />
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label
                            htmlFor="organizerProfile.contactInfo.phone"
                            className="block text-sm font-medium text-gray-700 mb-1"
                            >
                            Phone Number
                            </label>
                            <input
                            type="tel"
                            id="organizerProfile.contactInfo.phone"
                            name="organizerProfile.contactInfo.phone"
                            value={profileData.organizerProfile.contactInfo.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                            />
                        </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Social Media</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label
                            htmlFor="organizerProfile.socialMedia.linkedin"
                            className="block text-sm font-medium text-gray-700 mb-1"
                            >
                            LinkedIn
                            </label>
                            <input
                            type="url"
                            id="organizerProfile.socialMedia.linkedin"
                            name="organizerProfile.socialMedia.linkedin"
                            value={profileData.organizerProfile.contactInfo.socialMedia.linkedin}
                            onChange={handleInputChange}
                            placeholder="https://linkedin.com/in/username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                            />
                        </div>

                        <div>
                            <label
                            htmlFor="organizerProfile.socialMedia.facebook"
                            className="block text-sm font-medium text-gray-700 mb-1"
                            >
                            Facebook
                            </label>
                            <input
                            type="url"
                            id="organizerProfile.socialMedia.facebook"
                            name="organizerProfile.socialMedia.facebook"
                            value={profileData.organizerProfile.contactInfo.socialMedia.facebook}
                            onChange={handleInputChange}
                            placeholder="https://facebook.com/username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                            />
                        </div>

                        <div>
                            <label
                            htmlFor="organizerProfile.socialMedia.instagram"
                            className="block text-sm font-medium text-gray-700 mb-1"
                            >
                            Instagram
                            </label>
                            <input
                            type="url"
                            id="organizerProfile.socialMedia.instagram"
                            name="organizerProfile.socialMedia.instagram"
                            value={profileData.organizerProfile.contactInfo.socialMedia.instagram}
                            onChange={handleInputChange}
                            placeholder="https://instagram.com/username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                            />
                        </div>
                        </div>
                    </div>

                    <div>
                        <label
                        htmlFor="organizerProfile.description"
                        className="block text-sm font-medium text-gray-700 mb-1"
                        >
                        Bio / About Me
                        </label>
                        <textarea
                        id="organizerProfile.description"
                        name="organizerProfile.description"
                        value={profileData.organizerProfile.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                        placeholder="Tell other event-goers a bit about yourself..."
                        />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                        {loading ? (
                            <span className="flex items-center">
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                ></circle>
                                <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Updating...
                            </span>
                        ) : (
                            "Save Changes"
                        )}
                        </button>
                    </div>
                    </form>
                </div>
                )}
  
                {/* Events Tab */}
                {activeTab === 'events' && (
                <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">My Events</h2>
                
                {/* Tabs for different event lists */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="-mb-px flex space-x-6">
                  <button
                    type="button"
                    onClick={() => setEventTab('upcoming')}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm focus:outline-none ${
                      eventTab === 'upcoming' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Upcoming Events
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventTab('past')}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm focus:outline-none ${
                      eventTab === 'past' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Past Events
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventTab('draft')}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm focus:outline-none ${
                      eventTab === 'draft' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Draft Events
                  </button>
                </nav>
                </div>
                
                {eventsLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : eventsError ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {eventsError}
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500 mb-4">You haven't created any events yet.</p>
                    <Link 
                      to="/create-event"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      Create Your First Event
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEvents.map(event => (
                      <div key={event._id} className="bg-white border rounded-lg shadow-sm p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{event.title}</h3>
                            <p className="text-gray-600">{new Date(event.dates.start).toLocaleDateString()}</p>
                            <span className="inline-block mt-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                              {event.status}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                              {event.currentAttendees || 0} Registrations
                            </span>
                            {event.status === 'DRAFT' ? (
                              // Actions for draft events
                              <button
                                onClick={() => handlePublishEvent(event._id)}
                                className="inline-flex items-center px-3 py-1 border border-green-600 text-green-600 rounded-md hover:bg-green-50"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Publish
                              </button>
                            ) : (
                              // Actions for published events
                              <Link 
                                to={`/event/${event._id}/registrations`}
                                className="inline-flex items-center px-3 py-1 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                                Manage Registrations
                              </Link>
                            )}
                            <Link 
                              to={`/events/${event._id}`}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                              View Event
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!eventsLoading && events.length > 0 && (
                <div className="mt-6 text-center">
                        <Link 
                          to="/create-event"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                          </svg>
                          Create New Event
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                {/* Subscription Tab */}
                {activeTab === 'subscription' && (
                    <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscription Plan</h2>
                    
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Free Plan */}
                        <div className={`border rounded-lg p-6 flex-1 ${
                        profileData.organizerProfile.subscriptionPlan === 'FREE' 
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' 
                            : 'border-gray-200'
                        }`}>
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-medium text-gray-900">Free</h3>
                            {profileData.organizerProfile.subscriptionPlan === 'FREE' && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                Current Plan
                            </span>
                            )}
                        </div>
                        <p className="mt-4 text-sm text-gray-500">Basic features for small organizers just getting started.</p>
                        <p className="mt-6">
                            <span className="text-4xl font-extrabold text-gray-900">0</span>
                            <span className="text-base font-medium text-gray-500"> RON/mo</span>
                        </p>
                        <ul className="mt-6 space-y-4">
                            <li className="flex items-start">
                            <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="ml-2 text-sm text-gray-500">Advanced analytics</span>
                            </li>
                            <li className="flex items-start">
                            <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="ml-2 text-sm text-gray-500">Featured events (5 per month)</span>
                            </li>
                            <li className="flex items-start">
                            <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="ml-2 text-sm text-gray-500">Priority support</span>
                            </li>
                        </ul>
                        <button
                            type="button"
                            disabled={profileData.organizerProfile.subscriptionPlan === 'FREE'}
                            onClick={() => handleSubscriptionSelect('FREE')}
                            className={`mt-8 w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                            profileData.organizerProfile.subscriptionPlan === 'FREE'
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                            }`}
                        >
                            {profileData.organizerProfile.subscriptionPlan === 'FREE' ? 'Current Plan' : 'Select Plan'}
                        </button>
                        </div>
                        
                        {/* Premium Plan */}
                        <div className={`border rounded-lg p-6 flex-1 ${
                        profileData.organizerProfile.subscriptionPlan === 'PREMIUM' 
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' 
                            : 'border-gray-200'
                        }`}>
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-medium text-gray-900">PREMIUM</h3>
                            {profileData.organizerProfile.subscriptionPlan === 'PREMIUM' && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                Current Plan
                            </span>
                            )}
                        </div>
                        <p className="mt-4 text-sm text-gray-500">Premium features for small organizers just getting started.</p>
                        <p className="mt-6">
                            <span className="text-4xl font-extrabold text-gray-900">50</span>
                            <span className="text-base font-medium text-gray-500"> RON/mo</span>
                        </p>
                        <ul className="mt-6 space-y-4">
                            <li className="flex items-start">
                            <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="ml-2 text-sm text-gray-500">Advanced analytics</span>
                            </li>
                            <li className="flex items-start">
                            <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="ml-2 text-sm text-gray-500">Featured events (20 per month)</span>
                            </li>
                            <li className="flex items-start">
                            <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="ml-2 text-sm text-gray-500">Priority support</span>
                            </li>
                        </ul>
                        <button
                            type="button"
                            disabled={profileData.organizerProfile.subscriptionPlan === 'PREMIUM'}
                            onClick={() => handleSubscriptionSelect('PREMIUM')}
                            className={`mt-8 w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                            profileData.organizerProfile.subscriptionPlan === 'PREMIUM'
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                            }`}
                        >
                            {profileData.organizerProfile.subscriptionPlan === 'PREMIUM' ? 'Current Plan' : 'Select Plan'}
                        </button>
                        </div>

                        {/* Enterprise Plan */}
                        <div className={`border rounded-lg p-6 flex-1 ${
                        profileData.organizerProfile.subscriptionPlan === 'ENTERPRISE' 
                            ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500' 
                            : 'border-gray-200'
                        }`}>
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-medium text-gray-900">Enterprise</h3>
                            {profileData.organizerProfile.subscriptionPlan === 'ENTERPRISE' && (
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                Current Plan
                            </span>
                            )}
                        </div>
                        <p className="mt-4 text-sm text-gray-500">Full-featured solution for large organizations with multiple events.</p>
                        <p className="mt-6">
                            <span className="text-4xl font-extrabold text-gray-900">150</span>
                            <span className="text-base font-medium text-gray-500"> RON/mo</span>
                        </p>
                        <ul className="mt-6 space-y-4">
                            <li className="flex items-start">
                            <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="ml-2 text-sm text-gray-500">Unlimited active events</span>
                            </li>
                            <li className="flex items-start">
                            <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="ml-2 text-sm text-gray-500">Custom branding options</span>
                            </li>
                            <li className="flex items-start">
                            <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="ml-2 text-sm text-gray-500">Dedicated account manager</span>
                            </li>
                            <li className="flex items-start">
                            <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="ml-2 text-sm text-gray-500">API access</span>
                            </li>
                        </ul>
                        <button
                            type="button"
                            disabled={profileData.organizerProfile.subscriptionPlan === 'ENTERPRISE'}
                            onClick={() => handleSubscriptionSelect('ENTERPRISE')}
                            className={`mt-8 w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                            profileData.organizerProfile.subscriptionPlan === 'ENTERPRISE'
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
                            }`}
                        >
                            {profileData.organizerProfile.subscriptionPlan === 'ENTERPRISE' ? 'Current Plan' : 'Select Plan'}
                        </button>
                        </div>
                    </div>
                    </div>
                )}
              </div>
            </div>
          </div>
          </div>
          
        </div>
    );
});


export default OrganizerDashboard;