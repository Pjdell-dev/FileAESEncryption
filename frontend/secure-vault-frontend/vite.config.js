// frontend/secure-vault-frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API requests during development
    proxy: {
      '/api': {
        // 'app' is the service name in your docker-compose.yml for the Laravel app
        // Nginx is running on port 80 inside the 'app' container
        target: 'http://localhost:8000', // This points to the Nginx service
        // Use 'http://host.docker.internal:8000' if running React outside Docker and accessing backend on host
        changeOrigin: true,
        secure: false, // Set to true if using HTTPS for the backend
        // Rewrite the path if needed (usually not for /api)
        // rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
})