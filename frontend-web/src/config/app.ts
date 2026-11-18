
/** URL base de la API, o undefined si VITE_API_URL no está definida. */
const apiUrlCruda = (import.meta.env.VITE_API_URL as string | undefined)?.trim()

/**
 * Comprobación de desarrollo: si falta VITE_API_URL se avisa con un mensaje
 * claro y accionable. Solo se emite en dev (import.meta.env.DEV) para no
 * romper producción, y nunca lanza excepción (no bloquea la app).
 */
if (!apiUrlCruda && import.meta.env.DEV) {
  console.error(
    [
      '[NexoCommerce] Falta la variable de entorno VITE_API_URL.',
      'Copia .env.example a .env y define la URL del backend, por ejemplo:',
      '  VITE_API_URL=http://192.168.X.X:8000/api/v1',
      'Luego reinicia el servidor de desarrollo (npm run dev).',
    ].join('\n'),
  )
}

export const config = {
  apiUrl: apiUrlCruda ? apiUrlCruda : undefined,
} as const
