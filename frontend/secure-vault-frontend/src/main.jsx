// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // Make sure the extension matches your file (.js or .jsx)
import './index.css' // Optional: import global index styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)