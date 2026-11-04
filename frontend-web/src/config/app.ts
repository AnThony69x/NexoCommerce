/**
 * Configuración central de la app leída desde variables de entorno.
 * Con MOCK_MODE=true los services usan datos locales; con false llaman al backend.
 *
 * La URL de la API NUNCA se escribe dentro de componentes ni services: siempre
 * viene de VITE_API_URL (.env). Esto permite apuntar a `localhost` o a la IP LAN
 * de una laptop remota sin tocar código.
 */

function leerBooleano(valor: string | undefined, defecto: boolean): boolean {
  if (valor === undefined) return defecto
  return valor.toLowerCase() === 'true'
}

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
  mockMode: leerBooleano(import.meta.env.VITE_MOCK_MODE as string | undefined, true),
} as const
