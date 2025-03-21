
const API_BASE_URL = 'http://localhost:5001/api';


const fetchApi = async (endpoint, options = {}) => {
  // Default options
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
  };

  // Merge options
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    //console.log("fetchApi", `${API_BASE_URL}${endpoint}`, fetchOptions);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
    
    //console.log("response", response);
    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    // Handle API error responses
    if (!response.ok) {
      const error = new Error(
        isJson && data.message ? data.message : 'API request failed'
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

export const authApi = {

  login: (credentials) => 
    fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),


  register: (userData) =>
    fetchApi('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),


  logout: () =>
    fetchApi('/auth/logout', {
      method: 'POST',
    }),


  checkAuth: () =>
    fetchApi('/auth/check', {
      method: 'GET',
    }),

  updateProfile: (profileData) =>
    fetchApi('/auth/updateProfile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
      headers: {
        'Content-Type': 'application/json'
      }
    }),

  sendVerifyEmail: (userId) =>
    fetchApi('/auth/send-verify-token', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
  
  verifyEmail: (userId, emailToken) =>
    fetchApi('/auth/verify-account', {
      method: 'POST',
      body: JSON.stringify({ userId, emailToken }),
    }),
  
  sendResetEmailToken: (email) =>
    fetchApi('/auth/send-reset-token', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  
  resetPassword: (email, token, newPassword) =>
    fetchApi('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, newPassword }),
    }),
};

export const eventsApi = {

  getEvents: (params = {}) => {
    // Build query string from params object
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    return fetchApi(`/events${queryString ? `?${queryString}` : ''}`);
  },


  getEventById: (id) =>
    fetchApi(`/events/${id}`),


  createEvent: (eventData) =>
    fetchApi('/events/createEvent', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),


  updateEvent: (id, eventData) =>
    fetchApi(`/events/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    }),

    toggleSaveEvent: (eventId) =>
      fetchApi(`/events/save/${eventId}`, {
        method: 'POST',
      }),
    
    checkSavedEvent: (eventId) =>
      fetchApi(`/events/saved/${eventId}`),

    getOrganizerStats: () =>
      fetchApi('/stats/organizer', {
        method: 'GET'
      })
};


export const registrationsApi = {

  registerForEvent: (registrationData) => 
    fetchApi(`/registrations/register`, {
      method: 'POST',
      body: JSON.stringify(registrationData)
  }),

  getUserRegistration: () =>
    fetchApi(`/registrations/my-registrations`),

  cancelRegistration: (registrationId) => 
    fetchApi(`/registrations/cancel/${registrationId}`, {
      method: 'PUT',
  }),

  checkRegistrationStatus: (registrationId) => 
    fetchApi(`/registrations/check/${registrationId}`),
  
  getEventRegistrations: (eventId) =>
    fetchApi(`/registrations/event/${eventId}`),
    
  updateRegistrationStatus: (registrationId, statusData) =>
    fetchApi(`/registrations/update-status/${registrationId}`, {
      method: 'PUT',
      body: JSON.stringify(statusData)
    }),

  getSavedEvents: () =>
    fetchApi(`/registrations/saved-events`),

}



// Export the raw fetchApi for custom calls
export { fetchApi };

// Export default object with all APIs
export default {
  auth: authApi,
  events: eventsApi,
  registrations: registrationsApi,
  fetch: fetchApi
};