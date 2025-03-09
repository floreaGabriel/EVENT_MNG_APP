import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../services/api.service";



const ParticipantDashboard = (({user}) => {
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
        participantProfile: {
        preferences: {
            eventTypes: user?.participantProfile?.preferences?.eventTypes || [],
            locations: user?.participantProfile?.preferences?.locations || [],
            priceRange: {
            min: user?.participantProfile?.preferences?.priceRange?.min || 0,
            max: user?.participantProfile?.preferences?.priceRange?.max || 1000,
            }
        },
        contactInfo: {
            phone: user?.participantProfile?.contactInfo?.phone || '',
            address: {
            street: user?.participantProfile?.contactInfo?.address?.street || '',
            city: user?.participantProfile?.contactInfo?.address?.city || '',
            country: user?.participantProfile?.contactInfo?.address?.country || 'Romania',
            postalCode: user?.participantProfile?.contactInfo?.address?.postalCode || '',
            }
        },
        socialMedia: {
            linkedin: user?.participantProfile?.socialMedia?.linkedin || '',
            facebook: user?.participantProfile?.socialMedia?.facebook || '',
            instagram: user?.participantProfile?.socialMedia?.instagram || '',
        },
        description: user?.participantProfile?.description || '',
        }
    });

    const navigate = useNavigate();

    useEffect(() => {
        // If no user is logged in, redirect to login
        if (!user) {
          navigate('/login?message=Please log in to view your profile');
        }
    }, [user, navigate]);

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

    const handlePriceRangeChange = (e) => {
        const { name, value } = e.target;
        const field = name.includes('min') ? 'min' : 'max';
        
        setProfileData(prevData => ({
        ...prevData,
        participantProfile: {
            ...prevData.participantProfile,
            preferences: {
            ...prevData.participantProfile.preferences,
            priceRange: {
                ...prevData.participantProfile.preferences.priceRange,
                [field]: parseInt(value, 10)
            }
            }
        }
        }));
    };

    const handleEventTypeChange = (e) => {
        const { value, checked } = e.target;
        
        setProfileData(prevData => {
        const currentEventTypes = [...prevData.participantProfile.preferences.eventTypes];
        
        if (checked && !currentEventTypes.includes(value)) {
            currentEventTypes.push(value);
        } else if (!checked && currentEventTypes.includes(value)) {
            const index = currentEventTypes.indexOf(value);
            currentEventTypes.splice(index, 1);
        }
        
        return {
            ...prevData,
            participantProfile: {
            ...prevData.participantProfile,
            preferences: {
                ...prevData.participantProfile.preferences,
                eventTypes: currentEventTypes
            }
            }
        };
        });
    };

    const handleLocationChange = (e) => {
        const { value } = e.target;
        const locations = value.split(',').map(location => location.trim()).filter(Boolean);
        
        setProfileData(prevData => ({
        ...prevData,
        participantProfile: {
            ...prevData.participantProfile,
            preferences: {
            ...prevData.participantProfile.preferences,
            locations
            }
        }
        }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
          // Here you would call your API to update the profile
          const response = await authApi.updateProfile(profileData);
          
          // For now, we'll just simulate a successful update
          // await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Update the user in context/local storage
          const updatedUser = { ...user, ...profileData };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setSuccess('Profile updated successfully!');
        } catch (err) {
          setError('Failed to update profile. Please try again.');
          console.error('Error updating profile:', err);
        } finally {
          setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/** Page header */}

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage your profile, preferences, and event activities
                    </p>
                </div>

                {/** succes and error msg */}
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
                    {/** Sidebar */}    
                    <div className="md:col-span-1">
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="flex flex-col items-center">
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
                                <h2 className="mt-4 text-xl font-semibold text-gray-900">{user.firstname} {user.lastname}</h2>
                                <p className="text-gray-500 text-sm">@{user.username}</p>
                            
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
                                onClick={() => setActiveTab('profile')}
                                className={`w-full text-left px-6 py-3 flex items-center ${
                                    activeTab === 'profile' 
                                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                                >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                Profile Settings
                                </button>
                            </li>
                            
                            <li>
                                <button
                                onClick={() => setActiveTab('preferences')}
                                className={`w-full text-left px-6 py-3 flex items-center ${
                                    activeTab === 'preferences' 
                                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                                >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                                </svg>
                                Preferences
                                </button>
                            </li>
                            
                            <li>
                                <button
                                onClick={() => setActiveTab('events')}
                                className={`w-full text-left px-6 py-3 flex items-center ${
                                    activeTab === 'events' 
                                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                                >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                My Events
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
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                              <div className="p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                                
                                <form onSubmit={handleSubmit}>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                      <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">
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
                                      <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">
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
                                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
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
                                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                                        <label htmlFor="participantProfile.contactInfo.phone" className="block text-sm font-medium text-gray-700 mb-1">
                                          Phone Number
                                        </label>
                                        <input
                                          type="tel"
                                          id="participantProfile.contactInfo.phone"
                                          name="participantProfile.contactInfo.phone"
                                          value={profileData.participantProfile.contactInfo.phone}
                                          onChange={handleInputChange}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                        />
                                      </div>
                                      
                                      <div>
                                        <label htmlFor="participantProfile.contactInfo.address.street" className="block text-sm font-medium text-gray-700 mb-1">
                                          Street Address
                                        </label>
                                        <input
                                          type="text"
                                          id="participantProfile.contactInfo.address.street"
                                          name="participantProfile.contactInfo.address.street"
                                          value={profileData.participantProfile.contactInfo.address.street}
                                          onChange={handleInputChange}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                        />
                                      </div>
                                      
                                      <div>
                                        <label htmlFor="participantProfile.contactInfo.address.city" className="block text-sm font-medium text-gray-700 mb-1">
                                          City
                                        </label>
                                        <input
                                          type="text"
                                          id="participantProfile.contactInfo.address.city"
                                          name="participantProfile.contactInfo.address.city"
                                          value={profileData.participantProfile.contactInfo.address.city}
                                          onChange={handleInputChange}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                        />
                                      </div>
                                      
                                      <div>
                                        <label htmlFor="participantProfile.contactInfo.address.postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                                          Postal Code
                                        </label>
                                        <input
                                          type="text"
                                          id="participantProfile.contactInfo.address.postalCode"
                                          name="participantProfile.contactInfo.address.postalCode"
                                          value={profileData.participantProfile.contactInfo.address.postalCode}
                                          onChange={handleInputChange}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                        />
                                      </div>
                                      
                                      <div>
                                        <label htmlFor="participantProfile.contactInfo.address.country" className="block text-sm font-medium text-gray-700 mb-1">
                                          Country
                                        </label>
                                        <select
                                          id="participantProfile.contactInfo.address.country"
                                          name="participantProfile.contactInfo.address.country"
                                          value={profileData.participantProfile.contactInfo.address.country}
                                          onChange={handleInputChange}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                        >
                                          <option value="Romania">Romania</option>
                                          <option value="Bulgaria">Bulgaria</option>
                                          <option value="Hungary">Hungary</option>
                                          <option value="Moldova">Moldova</option>
                                          <option value="Serbia">Serbia</option>
                                          <option value="Ukraine">Ukraine</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Social Media</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      <div>
                                        <label htmlFor="participantProfile.socialMedia.linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                                          LinkedIn
                                        </label>
                                        <input
                                          type="url"
                                          id="participantProfile.socialMedia.linkedin"
                                          name="participantProfile.socialMedia.linkedin"
                                          value={profileData.participantProfile.socialMedia.linkedin}
                                          onChange={handleInputChange}
                                          placeholder="https://linkedin.com/in/username"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                        />
                                      </div>
                                      
                                      <div>
                                        <label htmlFor="participantProfile.socialMedia.facebook" className="block text-sm font-medium text-gray-700 mb-1">
                                          Facebook
                                        </label>
                                        <input
                                          type="url"
                                          id="participantProfile.socialMedia.facebook"
                                          name="participantProfile.socialMedia.facebook"
                                          value={profileData.participantProfile.socialMedia.facebook}
                                          onChange={handleInputChange}
                                          placeholder="https://facebook.com/username"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                        />
                                      </div>
                                      
                                      <div>
                                        <label htmlFor="participantProfile.socialMedia.instagram" className="block text-sm font-medium text-gray-700 mb-1">
                                          Instagram
                                        </label>
                                        <input
                                          type="url"
                                          id="participantProfile.socialMedia.instagram"
                                          name="participantProfile.socialMedia.instagram"
                                          value={profileData.participantProfile.socialMedia.instagram}
                                          onChange={handleInputChange}
                                          placeholder="https://instagram.com/username"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label htmlFor="participantProfile.description" className="block text-sm font-medium text-gray-700 mb-1">
                                      Bio / About Me
                                    </label>
                                    <textarea
                                      id="participantProfile.description"
                                      name="participantProfile.description"
                                      value={profileData.participantProfile.description}
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
                                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                          Updating...
                                        </span>
                                      ) : 'Save Changes'}
                                    </button>
                                  </div>
                                </form>
                              </div>
                            )}

                            {/* Preferences Tab */}
                            {activeTab === 'preferences' && (
                              <div className="p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">My Event Preferences</h2>
                                
                                <form onSubmit={handleSubmit}>
                                  <div className="mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Event Categories</h3>
                                    <p className="text-sm text-gray-600 mb-3">Select the types of events you're interested in:</p>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                      {['Concert', 'Festival', 'Workshop', 'Conference', 'Party', 'Exhibition', 'SportEvent', 'Charity', 'Other'].map((category) => (
                                        <div key={category} className="flex items-center">
                                          <input
                                            id={`category-${category}`}
                                            name={`category-${category}`}
                                            type="checkbox"
                                            value={category}
                                            checked={profileData.participantProfile.preferences.eventTypes.includes(category)}
                                            onChange={handleEventTypeChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                          />
                                          <label htmlFor={`category-${category}`} className="ml-2 block text-sm text-gray-700">
                                            {category === 'SportEvent' ? 'Sport Event' : category}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <div className="mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Preferred Locations</h3>
                                    <p className="text-sm text-gray-600 mb-3">Enter cities where you'd like to attend events (comma-separated):</p>
                                    
                                    <input
                                      type="text"
                                      id="locations"
                                      name="locations"
                                      value={profileData.participantProfile.preferences.locations.join(', ')}
                                      onChange={handleLocationChange}
                                      placeholder="Bucharest, Cluj, Timisoara"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                    />
                                  </div>
                                  
                                  <div className="mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Price Range</h3>
                                    <p className="text-sm text-gray-600 mb-3">What's your preferred ticket price range?</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div>
                                        <label htmlFor="priceMin" className="block text-sm font-medium text-gray-700 mb-1">
                                          Minimum (RON)
                                        </label>
                                        <input
                                          type="number"
                                          id="priceMin"
                                          name="priceRange.min"
                                          min="0"
                                          value={profileData.participantProfile.preferences.priceRange.min}
                                          onChange={handlePriceRangeChange}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                        />
                                      </div>
                                      
                                      <div>
                                        <label htmlFor="priceMax" className="block text-sm font-medium text-gray-700 mb-1">
                                          Maximum (RON)
                                        </label>
                                        <input
                                          type="number"
                                          id="priceMax"
                                          name="priceRange.max"
                                          min="0"
                                          value={profileData.participantProfile.preferences.priceRange.max}
                                          onChange={handlePriceRangeChange}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-6 flex justify-end">
                                    <button
                                      type="submit"
                                      disabled={loading}
                                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {loading ? 'Saving...' : 'Save Preferences'}
                                    </button>
                                  </div>
                                </form>
                              </div>
                            )}
                            
                            {/* My Events Tab */}
                            {activeTab === 'events' && (
                              <div className="p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">My Events</h2>
                                
                                {/* Tabs for different event lists */}
                                <div className="border-b border-gray-200 mb-6">
                                  <nav className="-mb-px flex space-x-6">
                                    <a href="#" className="border-blue-500 text-blue-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                                      Upcoming Events
                                    </a>
                                    <a href="#" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                                      Past Events
                                    </a>
                                    <a href="#" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                                      Saved Events
                                    </a>
                                  </nav>
                                </div>
                              </div>

                              )};
                          </div>
                          </div>
                      </div>
                      </div>
                      </div>

)});

            



export default ParticipantDashboard;