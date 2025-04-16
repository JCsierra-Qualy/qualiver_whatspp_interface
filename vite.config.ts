import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Generate source maps for better debugging
    sourcemap: true,
    // Ensure CSS is properly extracted and minified
    cssCodeSplit: true,
    // Configure chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Ensure assets are properly served from the correct base URL
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    // Allow connections from all hosts (needed for Render)
    host: true,
    // Use environment variable for port or default to 5173
    port: Number(process.env.PORT) || 5173,
  },
  preview: {
    // Configuration for preview server (used in production)
    port: 10000,
    host: true,
    strictPort: true,
  },
})
