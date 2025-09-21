// frontend/secure-vault-frontend/src/components/Search.js
import React, { useState } from 'react';
import api from '../services/api'; // Import the configured API client

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
        setResults([]);
        return;
    }

    setLoading(true);
    setError(null);
    setResults([]); // Clear previous results
    try {
      // Encode the query parameter properly
      const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
      // Assuming the API returns an object like { files: [...] }
      // Adjust based on your actual API response structure
      setResults(response.data.files || response.data); // Handle potential pagination or flat array
    } catch (error) {
      console.error('Search error:', error);
      // Handle different error types (network, 401, etc.)
      if (error.response) {
        // Server responded with an error status
        if (error.response.status === 401) {
          // Handle unauthorized access (e.g., redirect to login)
          // This might be handled globally by your axios interceptor
        } else {
          setError(`Search failed: ${error.response.statusText || 'Unknown error'}`);
        }
      } else if (error.request) {
        // Request was made but no response received (e.g., network issue)
        setError('Network error. Please check your connection.');
      } else {
        // Something else happened
        setError('Search failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await api.get(`/download/${fileId}`, {
        responseType: 'blob', // Important for downloading files
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName); // Use the original filename
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
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

  return (
    <div style={{ padding: '20px' }}>
      <h2>Search Files</h2>
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter search term..."
          required
          style={{ padding: '8px', marginRight: '10px', width: '300px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '8px 15px' }}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {results.length > 0 && (
        <div>
          <h3>Search Results:</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Owner</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Type</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Size (bytes)</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((file) => (
                <tr key={file.id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{file.original_name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{file.owner ? file.owner.name : 'Unknown'}</td>
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
        </div>
      )}
      {!loading && query && results.length === 0 && <p>No files found matching "{query}".</p>}
    </div>
  );
}

export default Search;