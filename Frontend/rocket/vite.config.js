import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0', // Allows access from external devices
    port: 5173,      // Optional: Specify a custom port
  },
  plugins: [react()],
})
