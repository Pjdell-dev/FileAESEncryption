// frontend/secure-vault-frontend/src/services/api.js
import axios from 'axios';

// Adjust baseURL based on your setup (proxy or direct URL)
// Using '/api' relies on the Vite proxy defined in vite.config.js
const api = axios.create({
  baseURL: '/api', // This will be proxied to http://dms_nginx/api (which forwards to app:9000)
  // If NOT using proxy and running React outside Docker:
  // baseURL: 'http://localhost:8000/api',
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;