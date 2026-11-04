/**
 * Token de sesión en localStorage.
 * - Modo mock: token simulado determinista (crearTokenMock), solo desarrollo.
 * - Modo real (VITE_MOCK_MODE=false): el token Sanctum devuelto por
 *   POST /auth/login; services/api.ts lo adjunta como Bearer en cada petición.
 */
import type { AuthUser } from '../types/auth'

const TOKEN_KEY = 'nexocommerce.mockToken.v1'

function leer(clave: string): string | null {
  try {
    return localStorage.getItem(clave)
  } catch {
    return null
  }
}

export function cargarToken(): string | null {
  return leer(TOKEN_KEY)
}

export function guardarToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Sin almacenamiento: la sesión vive solo en memoria.
  }
}

export function limpiarToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Sin almacenamiento: nada que limpiar.
  }
}

/** Token simulado determinista por usuario (solo modo mock). */
export function crearTokenMock(usuario: AuthUser): string {
  return `mock-token-${usuario.id}`
}
