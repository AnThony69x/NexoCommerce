import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Backend remoto (Tailscale Funnel de la VM de otro colaborador).
 * En desarrollo, Vite hace de proxy de /api → backend para que las peticiones
 * sean del mismo origen y no dependamos de la configuración CORS del backend.
 * En producción se usa VITE_API_URL completo (sin proxy).
 */
const API_BACKEND = 'https://backend.tail364ad0.ts.net'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: API_BACKEND,
        changeOrigin: true,
      },
    },
  },
})
