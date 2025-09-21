// frontend/secure-vault-frontend/src/components/Dashboard.js
import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>Welcome to the Secure Document Vault!</p>

      <div style={{ marginTop: '20px' }}>
        <h2>Quick Actions</h2>
        <ul>
          {/* --- CHANGE THESE LINKS TO USE ABSOLUTE PATHS STARTING WITH /app/ --- */}
          <li><Link to="/app/upload">Upload a new file</Link></li>
          <li><Link to="/app/my-files">View your files</Link></li>
          <li><Link to="/app/search">Search for files</Link></li>
          <li><Link to="/app/shared-with-me">See files shared with you</Link></li>
          <li><Link to="/app/admin">Access Admin Panel (Admins only)</Link></li>
          {/* --- END OF CHANGES --- */}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;