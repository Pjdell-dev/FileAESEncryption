// frontend/secure-vault-frontend/src/components/Layout.js
import React from 'react';
import { Link, Outlet } from 'react-router-dom'; // Import Outlet

function Layout({ setIsAuthenticated }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false); // Update state in parent App component
  };

  return (
    <div>
      <nav style={{ padding: '10px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
        <Link to="/dashboard" style={{ marginRight: '15px' }}>Dashboard</Link>
        <Link to="/upload" style={{ marginRight: '15px' }}>Upload</Link>
        <Link to="/my-files" style={{ marginRight: '15px' }}>My Files</Link>
        <Link to="/shared-with-me" style={{ marginRight: '15px' }}>Shared With Me</Link>
        <Link to="/search" style={{ marginRight: '15px' }}>Search</Link>
        <Link to="/admin" style={{ marginRight: '15px' }}>Admin Panel</Link>
        <button onClick={handleLogout} style={{ float: 'right' }}>Logout</button>
      </nav>
      <div style={{ padding: '20px' }}>
        {/* This renders the child route element */}
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;