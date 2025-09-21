// frontend/secure-vault-frontend/src/components/Login.js
import React, { useState } from 'react';
import api from '../services/api'; // Import the configured API client
import { useNavigate, Link } from 'react-router-dom'; // We'll use this for navigation
import axios from 'axios';

function Login({ setIsAuthenticated }) { // Receive setIsAuthenticated as a prop
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook for programmatic navigation

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setLoading(true);
    try {
      // Make the API call to Laravel backend
      const response = await axios.post('http://localhost:8000/api/login', { email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      // Inform the parent App component that the user is now authenticated
      setIsAuthenticated(true);
      // Navigate to the dashboard or home page
      navigate('/app/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      // Handle different error types (network, 401, etc.)
      if (err.response) {
        // Server responded with an error status
        if (err.response.status === 401) {
          setError('Invalid email or password.');
        } else {
          setError(`Login failed: ${err.response.statusText || 'Unknown error'}`);
        }
      } else if (err.request) {
        // Request was made but no response received (e.g., network issue)
        setError('Network error. Please check your connection.');
      } else {
        // Something else happened
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2 style={{ textAlign: 'center' }}>Login</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Don't have an account? <Link to="/register">Register</Link> {/* Add Register link if you implement registration */}
      </p>
    </div>
  );
}

export default Login;