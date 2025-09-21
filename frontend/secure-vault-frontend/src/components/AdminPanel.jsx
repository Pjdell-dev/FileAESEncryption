// frontend/secure-vault-frontend/src/components/AdminPanel.js
import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Import the configured API client

function AdminPanel() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('logs'); // 'logs' or 'users'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch logs and users concurrently
        const [logsRes, usersRes] = await Promise.all([
          api.get('/admin/logs'),
          api.get('/admin/users')
        ]);
        // Assuming API returns arrays directly or within a 'data' key
        setLogs(logsRes.data.data || logsRes.data); // Handle pagination if present
        setUsers(usersRes.data);
      } catch (error) {
        console.error('Error fetching admin ', error);
        setError('Failed to load admin data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p style={{ padding: '20px' }}>Loading admin panel...</p>;
  if (error) return <p style={{ padding: '20px', color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Panel</h2>
      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={() => setActiveTab('logs')}
          style={{
            padding: '8px 15px',
            marginRight: '5px',
            backgroundColor: activeTab === 'logs' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'logs' ? 'white' : 'black',
            border: '1px solid #ccc',
            cursor: 'pointer',
            borderRadius: '3px 3px 0 0',
          }}
        >
          Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '8px 15px',
            backgroundColor: activeTab === 'users' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'users' ? 'white' : 'black',
            border: '1px solid #ccc',
            cursor: 'pointer',
            borderRadius: '3px 3px 0 0',
          }}
        >
          Manage Users
        </button>
      </div>

      {activeTab === 'logs' && (
        <div>
          <h3>Audit Logs</h3>
          {logs.length === 0 ? (
            <p>No audit logs found.</p>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '6px' }}>ID</th>
                    <th style={{ border: '1px solid #ddd', padding: '6px' }}>User</th>
                    <th style={{ border: '1px solid #ddd', padding: '6px' }}>Action</th>
                    <th style={{ border: '1px solid #ddd', padding: '6px' }}>Details</th>
                    <th style={{ border: '1px solid #ddd', padding: '6px' }}>IP Address</th>
                    <th style={{ border: '1px solid #ddd', padding: '6px' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>{log.id}</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>{log.user ? `${log.user.name} (${log.user.email})` : 'N/A'}</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>{log.action}</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>{log.details || 'N/A'}</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>{log.ip_address || 'N/A'}</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h3>Manage Users</h3>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '6px' }}>ID</th>
                    <th style={{ border: '1px solid #ddd', padding: '6px' }}>Name</th>
                    <th style={{ border: '1px solid #ddd', padding: '6px' }}>Email</th>
                    <th style={{ border: '1px solid #ddd', padding: '6px' }}>Role</th>
                    <th style={{ border: '1px solid #ddd', padding: '6px' }}>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>{user.id}</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>{user.name}</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>{user.email}</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>{user.role}</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;