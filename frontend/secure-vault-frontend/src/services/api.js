// frontend/secure-vault-frontend/src/services/api.js
import axios from 'axios';

// Adjust baseURL based on your setup (proxy or direct URL)
// Using '/api' relies on the Vite proxy defined in vite.config.js
// The proxy should forward '/api' requests to 'http://app:8000' (your Laravel Nginx service)
const api = axios.create({
  baseURL: '/api', // This will be proxied to http://app:8000/api
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

// Optional: Add a response interceptor for global error handling
// api.interceptors.response.use(
//   response => response,
//   error => {
//     if (!error.response) {
//       // Network error
//       console.error('Network Error:', error.message);
//     } else if (error.response.status === 401) {
//        // Handle 401 Unauthorized (e.g., redirect to login, clear token)
//        localStorage.removeItem('token');
//        window.location.href = '/login';
//     } else if (error.response.status >= 500) {
//        // Handle server errors
//        console.error('Server Error:', error.response.status, error.response.data);
//     }
//     return Promise.reject(error);
//   }
// );

export default api;