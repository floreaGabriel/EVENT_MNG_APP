
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

  updateProfile: (profileData) =>
    fetchApi('/auth/updateProfile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
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
};

// Export the raw fetchApi for custom calls
export { fetchApi };

// Export default object with all APIs
export default {
  auth: authApi,
  events: eventsApi,
  fetch: fetchApi
};