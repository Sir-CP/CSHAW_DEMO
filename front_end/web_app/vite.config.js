import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // THIS IS THE FIX: Tells Vite to let React Router handle URLs
    historyApiFallback: true 
  }
})