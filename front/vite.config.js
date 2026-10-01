import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // En local, les appels /api/... sont redirigés vers Symfony.
    // Sur la VM, c'est Nginx qui fait cette redirection.
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
