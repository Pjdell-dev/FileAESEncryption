// frontend/secure-vault-frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import RegisterPage from './components/Register';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Upload from './components/Upload';
import MyFiles from './components/MyFiles';
import SharedWithMe from './components/SharedWithMe';
import Search from './components/Search';
import AdminPanel from './components/AdminPanel';
import './App.css';

// --- Simple NotFoundPage ---
function NotFoundPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for doesn’t exist.</p>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing token on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* --- Public Routes --- */}
          <Route
            path="/login"
            element={
              isAuthenticated
                ? <Navigate to="/app/dashboard" replace />
                : <Login setIsAuthenticated={setIsAuthenticated} />
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated
                ? <Navigate to="/app/dashboard" replace />
                : <RegisterPage />
            }
          />

          {/* --- Redirect root path based on authentication --- */}
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? "/app/dashboard" : "/login"} replace />}
          />

          {/* --- Protected Routes --- */}
          <Route
            path="/app/*"
            element={<ProtectedRoutes isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />}
          />

          {/* --- Catch-all for undefined paths --- */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

// --- Separate Component for Protected Routes ---
const ProtectedRoutes = ({ isAuthenticated, setIsAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route element={<Layout setIsAuthenticated={setIsAuthenticated} />}>
        {/* Redirect /app → /app/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* ✅ Define routes relative to /app */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="upload" element={<Upload />} />
        <Route path="my-files" element={<MyFiles />} />
        <Route path="shared-with-me" element={<SharedWithMe />} />
        <Route path="search" element={<Search />} />
        <Route path="admin" element={<AdminPanel />} />

        {/* Catch-all for undefined paths under /app/* */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
