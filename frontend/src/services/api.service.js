const API_BASE_URL = 'http://localhost:5001/api';


const fetchApi = async (endpoint, options = {}) => {
  // Default options
  const defaultOptions = {
    headers: {},
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
  // If the body is FormData, do not set Content-Type (let the browser handle it)
  // Also, do not stringify the body
  if (!(fetchOptions.body instanceof FormData)) {
    fetchOptions.headers['Content-Type'] = fetchOptions.headers['Content-Type'] || 'application/json';
    if (fetchOptions.body && typeof fetchOptions.body === 'object') {
      fetchOptions.body = JSON.stringify(fetchOptions.body);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

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

  updateProfile: (userData) => {
    const formData = new FormData();

    for (const [key, value] of Object.entries(userData)) {
        if (key === 'profilePic' && value instanceof File) {
            formData.append(key, value);
        } else if (typeof value === 'object' && value !== null) {
            formData.append(key, JSON.stringify(value));
        } else {
            formData.append(key, value);
        }
    }

    for (const [key, value] of formData.entries()) {
        console.log(`FormData entry: ${key}=${value}`);
    }

    return fetchApi('/auth/updateProfile', {
        method: 'PUT',
        body: formData,
    });
  },

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


  createEvent: (eventData) => {
    const formData = new FormData();

    // Append all event data fields to FormData
    // Since FormData can only store strings or files, we need to stringify nested objects
    for (const [key, value] of Object.entries(eventData)) {
      if (key === 'coverImage' && value instanceof File) {
        // If the value is a File (for coverImage), append it directly
        formData.append(key, value);
      } else if (typeof value === 'object' && value !== null) {
        // If the value is an object (e.g., location, dates, pricing), stringify it
        formData.append(key, JSON.stringify(value));
      } else {
        // For primitive values, append as-is
        formData.append(key, value);
      }
    }

    return fetchApi('/events/createEvent', {
      method: 'POST',
      body: formData,
    });

    },


  updateEvent: (id, eventData) => {
    const formData = new FormData();

    // Append all event data fields to FormData
    for (const [key, value] of Object.entries(eventData)) {
      if (key === 'coverImage' && value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }

    return fetchApi(`/events/update/${id}`, {
      method: 'PUT',
      body: formData,
    });
    },

    toggleSaveEvent: (eventId) =>
      fetchApi(`/events/save/${eventId}`, {
        method: 'POST',
      }),
    
    checkSavedEvent: (eventId) =>
      fetchApi(`/events/saved/${eventId}`),

    getOrganizerStats: () =>
      fetchApi('/stats/organizer', {
        method: 'GET'
      }),

    deleteEvent: (eventId) =>
      fetchApi(`/events/deleteEvent/${eventId}`, {
        method: 'DELETE',
      }),
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