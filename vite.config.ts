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
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 3000,
    strictPort: true,
    allowedHosts: [
      'qualiver-whatspp-interface.onrender.com',
      'localhost',
      '127.0.0.1'
    ],
  },
})
