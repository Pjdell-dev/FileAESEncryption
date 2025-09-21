// frontend/secure-vault-frontend/src/components/SharedWithMe.js
import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Import the configured API client

function SharedWithMe() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedFiles = async () => {
      try {
        // Call the Laravel backend endpoint to get shared files
        // This assumes you have a /api/shared-with-me endpoint
        const response = await api.get('/shared-with-me');
        // Assuming the API returns an array of file objects
        setFiles(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching shared files:', error);
        // Handle different error types (network, 401, etc.)
        if (error.response) {
          // Server responded with an error status
          if (error.response.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
            // This might be handled globally by your axios interceptor
          } else {
            setError(`Failed to load shared files: ${error.response.statusText || 'Unknown error'}`);
          }
        } else if (error.request) {
          // Request was made but no response received (e.g., network issue)
          setError('Network error. Please check your connection.');
        } else {
          // Something else happened
          setError('Failed to load shared files. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSharedFiles();
  }, []); // Empty dependency array means this runs once on mount

  const handleDownload = async (fileId, fileName) => {
    try {
      // Use responseType: 'blob' for file downloads
      const response = await api.get(`/download/${fileId}`, {
        responseType: 'blob', // Important for downloading files
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName); // Use the original filename
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url); // Release the object URL
    } catch (error) {
      console.error('Download error:', error);
      // Handle different error types (network, 401, 403, 404, etc.)
      if (error.response) {
        if (error.response.status === 403) {
          alert('You do not have permission to download this file.');
        } else if (error.response.status === 404) {
          alert('File not found.');
        } else {
          alert(`Download failed: ${error.response.statusText || 'Unknown error'}`);
        }
      } else if (error.request) {
        alert('Network error. Please check your connection.');
      } else {
        alert('Download failed.');
      }
    }
  };

  if (loading) return <p style={{ padding: '20px' }}>Loading shared files...</p>;
  if (error) return <p style={{ padding: '20px', color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Files Shared With Me</h2>
      {files.length === 0 ? (
        <p>No files have been shared with you yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Owner</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Type</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Size (bytes)</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Shared On</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{file.original_name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{file.owner ? file.owner.name : 'Unknown'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{file.mime_type}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{file.size}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(file.created_at).toLocaleDateString()}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <button onClick={() => handleDownload(file.id, file.original_name)}>
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SharedWithMe;