// frontend/secure-vault-frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // --- Add or ensure this line is present ---
    historyApiFallback: true, // This is crucial for SPA routing
    // --- End addition ---
    // Proxy API requests during development
    proxy: {
      '/api': {
        // 'app' is the service name for your Laravel app in docker-compose.yml
        // Nginx in the 'app' container listens on port 80
        target: 'http://app:80', // Points to the Nginx service
        // Use 'http://host.docker.internal:8000' if running React outside Docker
        // and accessing the backend on the host machine via Nginx on port 8000
        changeOrigin: true,
        secure: false, // Set to true if using HTTPS for the backend
        // rewrite: (path) => path.replace(/^\/api/, ''), // Usually not needed for /api
      }
    }
  }
})
