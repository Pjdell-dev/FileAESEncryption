// frontend/secure-vault-frontend/src/components/Upload.js
import React, { useState } from 'react';
import api from '../services/api'; // Import the configured API client
import { useNavigate } from 'react-router-dom'; // For navigation after upload

function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage(''); // Clear previous messages
    setUploadProgress(0); // Reset progress
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setMessage('Uploading...');
    setUploadProgress(0);

    try {
      // Use Axios with onUploadProgress for basic progress indication
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });

      setMessage('File uploaded successfully!');
      setFile(null); // Clear file input
      setUploadProgress(0);
      // Optionally, navigate to My Files or refresh the list
      // navigate('/app/my-files');
    } catch (error) {
      console.error('Upload error:', error);
      // Handle different error types (network, 400, 413, etc.)
      if (error.response) {
        // Server responded with an error status
        if (error.response.status === 400) {
          setMessage(`Upload failed: ${error.response.data.error || 'Bad Request'}`);
        } else if (error.response.status === 413) {
          setMessage('Upload failed: File too large.');
        } else if (error.response.status === 422) {
          // Laravel validation errors
          const validationErrors = Object.values(error.response.data.messages || {}).flat().join(' ');
          setMessage(`Upload failed: ${validationErrors}`);
        } else {
          setMessage(`Upload failed: ${error.response.statusText || 'Unknown server error'}`);
        }
      } else if (error.request) {
        // Request was made but no response received (e.g., network issue)
        setMessage('Network error. Please check your connection.');
      } else {
        // Something else happened
        setMessage('Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2 style={{ textAlign: 'center' }}>Upload File</h2>
      {message && <p style={{ color: message.includes('failed') ? 'red' : 'green', textAlign: 'center' }}>{message}</p>}
      <form onSubmit={handleUpload}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="file" style={{ display: 'block', marginBottom: '5px' }}>Choose File:</label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button
          type="submit"
          disabled={uploading || !file}
          style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: uploading || !file ? 'not-allowed' : 'pointer' }}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {uploading && uploadProgress > 0 && (
        <div style={{ marginTop: '15px' }}>
          <p>Progress: {uploadProgress}%</p>
          <progress value={uploadProgress} max="100" style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
}

export default Upload;