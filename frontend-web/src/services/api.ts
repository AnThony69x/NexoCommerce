/**
 * Cliente HTTP base (Axios) para la API del backend Laravel (/api/v1).
 *
 * Responsabilidades:
 *  - baseURL ÚNICAMENTE desde VITE_API_URL (via config/app.ts). No se
 *    hardcodea ninguna IP/localhost: así soporta backend local o remoto (LAN).
 *  - Headers por defecto: Accept y Content-Type application/json.
 *  - Timeout razonable.
 *  - Envío automático del token Bearer (Authorization) vía tokenStore.
 *  - Normalización global de errores HTTP (401/403/422/500 y red) a ApiError.
 *
 * Si VITE_API_URL no está definida, config/app.ts emite un error de desarrollo
 * (solo en dev) y las peticiones quedarán sin base (se verá como error de red).
 *
 * Este módulo SOLO normaliza y propaga errores; nunca muestra alert() ni UI.
 * Los componentes/servicios decidirán cómo presentarlos (con useAsync, etc.).
 *
 * IMPORTANTE: módulos ya integrados con este cliente: categorías, productos y
 * auth (decisión mock/real en sus repositorios). Pendientes: carrito, pedidos,
 * pagos y admin, que aún usan datos locales.
 */
import axios, { AxiosError } from 'axios'
import { config } from '../config/app'
import { cargarToken, limpiarToken } from '../storage/tokenStore'
import { ApiError, type ApiErrorForma } from '../types/api'

// baseURL estrictamente desde el entorno. Si falta, config/app.ts ya avisó en dev.
const baseURL = config.apiUrl

export const apiClient = axios.create({
  baseURL,
  // 30 s: el backend de desarrollo (Laravel artisan serve) puede tardar
  // ~10 s en escribir y registrar un usuario; con 15 s el cliente cortaba
  // la peticion aunque el servidor ya hubiera respondido.
  timeout: 30000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// Adjunta el token Bearer si existe sesión. El token vive en tokenStore:
// simulado en modo mock, o el token Sanctum real en modo backend.
apiClient.interceptors.request.use((request) => {
  const token = cargarToken()
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`)
  }
  return request
})

/** Nombre del evento global que anuncia "la sesión ya no es válida". */
export const SESION_EXPIRADA_EVENTO = 'nexo:sesion-expirada'

/** Mensaje global por código HTTP. Solo normalización, sin UI. */
function mensajePorEstado(status: number): string {
  switch (status) {
    case 401:
      return 'Tu sesión expiró o no es válida. Inicia sesión de nuevo.'
    case 403:
      return 'No tienes permisos para realizar esta acción.'
    case 422:
      return 'Revisa los datos enviados: algunos campos no son válidos.'
    case 500:
      return 'Error interno del servidor. Intenta nuevamente más tarde.'
    default:
      return 'No se pudo completar la solicitud.'
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorForma>
      const status = axiosError.response?.status ?? 0

      // 401 = token inválido/expirado: se limpia para forzar re-login.
      if (status === 401) {
        limpiarToken()
        // El token solo no basta: la UI (AuthContext) seguiría viendo usuario.
        // Se anuncia el evento para que cierre también la sesión visible.
        window.dispatchEvent(new Event(SESION_EXPIRADA_EVENTO))
      }

      // Prioriza el mensaje del backend; si no existe, usa el genérico del estado.
      const message =
        axiosError.response?.data?.message ?? mensajePorEstado(status)

      // En 422 el backend además envía `errors` (validación campo a campo);
      // en 400 puede enviar `codigo_error` (regla de negocio, p. ej.
      // PED_PRECIO_CAMBIADO) que la UI necesita para reaccionar.
      throw new ApiError(
        status,
        message,
        axiosError.response?.data?.errors,
        axiosError.response?.data?.codigo_error,
      )
    }

    // Sin respuesta del servidor (red caída, timeout, CORS bloqueado, etc.).
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisa tu conexión.')
  },
)
