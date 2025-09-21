// frontend/secure-vault-frontend/src/components/Register.js
import React, { useState } from 'react';
import api from '../services/api'; // Import the configured API client
import { useNavigate, Link } from 'react-router-dom'; // For navigation

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState(''); // For 'confirmed' validation rule
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook for programmatic navigation

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setLoading(true);

    // Basic client-side validation (optional but good UX)
    if (password !== passwordConfirmation) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
    }

    try {
      // Make the API call to Laravel backend /api/register
      // Include password_confirmation for Laravel's 'confirmed' validation rule
      const response = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation // Match Laravel's expected field name
      });

      // Assuming successful registration returns a 201 status
      alert('Registration successful!'); // Or display a success message

      // Optional: Automatically log the user in after registration
      // This would require the backend to return a token upon registration
      // const { token } = response.data;
      // localStorage.setItem('token', token);
      // setIsAuthenticated(true); // You'd need to pass setIsAuthenticated as a prop
      // navigate('/dashboard');

      // Redirect to login page so user can log in manually
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      // Handle different error types (network, validation, server)
      if (err.response) {
        // Server responded with an error status
        if (err.response.status === 422) {
          // Laravel validation errors
          const validationErrors = Object.values(err.response.data.messages || {}).flat().join(' ');
          setError(`Registration failed: ${validationErrors}`);
        } else if (err.response.status === 500) {
          setError('Registration failed on the server. Please try again later.');
        } else {
          setError(`Registration failed: ${err.response.statusText || 'Unknown error'}`);
        }
      } else if (err.request) {
        // Request was made but no response received (e.g., network issue)
        setError('Network error. Please check your connection.');
      } else {
        // Something else happened
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2 style={{ textAlign: 'center' }}>Register</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="reg-name" style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
          <input
            type="text"
            id="reg-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="reg-email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            id="reg-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="reg-password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            id="reg-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="8" // Match Laravel validation if set
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="reg-password-confirmation" style={{ display: 'block', marginBottom: '5px' }}>Confirm Password:</label>
          <input
            type="password"
            id="reg-password-confirmation"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;