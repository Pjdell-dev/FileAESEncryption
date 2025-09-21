// frontend/secure-vault-frontend/src/components/MyFiles.js
import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Import the configured API client

function MyFiles() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await api.get('/my-files');
        // Assuming the API returns an array of file objects
        setFiles(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching files:', error);
        setError('Failed to load files.');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
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
      alert('Download failed.');
    }
  };

  if (loading) return <p style={{ padding: '20px' }}>Loading files...</p>;
  if (error) return <p style={{ padding: '20px', color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>My Files</h2>
      {files.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Type</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Size (bytes)</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{file.original_name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{file.mime_type}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{file.size}</td>
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

export default MyFiles;