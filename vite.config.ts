import { defineConfig } from 'vite'
import reactPlugin from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactPlugin()],
  server: {
    host: true, // Listen on all local IPs
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
