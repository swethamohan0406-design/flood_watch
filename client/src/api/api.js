import axios from 'axios';

/**
 * Pre-configured Axios instance
 * Automatically prefixes requests with baseURL '/api'
 * and attaches Bearer token from localStorage if present.
 */
const api = axios.create({
  baseURL: '/api',
});

// Request Interceptor: Attach JWT token to Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flood_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Optional global handling of unauthenticated responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If response is 401 Unauthorized, token may be invalid/expired
    if (error.response && error.response.status === 401) {
      // You could optionally clear stale tokens here if needed
    }
    return Promise.reject(error);
  }
);

export default api;
