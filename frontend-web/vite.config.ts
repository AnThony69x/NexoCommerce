import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Backend al que apunta el proxy de desarrollo.
 * Por defecto, el backend local (docker compose del backend, puerto 8001).
 * Se puede cambiar sin tocar el codigo:
 *   $env:API_PROXY_TARGET="https://mi-tunel.example.com"; npm run dev
 */
const API_PROXY_TARGET =
  process.env.API_PROXY_TARGET ?? 'http://localhost:8001'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // En desarrollo Vite hace de proxy de /api -> backend: las peticiones
      // salen del mismo origen y no dependen del CORS configurado en el
      // backend. En produccion se usa VITE_API_URL completo (sin proxy).
      '/api': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
      },
    },
  },
})
