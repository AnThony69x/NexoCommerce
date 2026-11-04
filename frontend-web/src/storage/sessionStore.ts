/**
 * Persistencia local de sesión y datos mock de autenticación.
 *
 * - cargarSesion/guardarSesion/limpiarSesion: válidos en AMBOS modos; guardan
 *   el usuario de la sesión actual para sobrevivir recargas (el token vive en
 *   tokenStore). En modo real el usuario se refresca contra GET /auth/perfil.
 * - cargarClientesMock/guardarClienteMock: SOLO modo mock; persisten los
 *   clientes registrados desde /registro mientras no hay backend.
 */
import type { AuthUser } from '../types/auth'
import type { MockAuthUser } from '../data/authUsers.mock'

const CLIENTES_KEY = 'nexocommerce.mockClients.v1'
const SESION_KEY = 'nexocommerce.mockSession.v1'

function leer<T>(clave: string, defecto: T): T {
  try {
    const raw = localStorage.getItem(clave)
    if (!raw) return defecto
    return JSON.parse(raw) as T
  } catch {
    return defecto
  }
}

function escribir(clave: string, valor: unknown): void {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    // Almacenamiento no disponible (modo privado, etc.): se continúa en memoria.
  }
}

export function cargarSesion(): AuthUser | null {
  return leer<AuthUser | null>(SESION_KEY, null)
}

export function guardarSesion(usuario: AuthUser): void {
  escribir(SESION_KEY, usuario)
}

export function limpiarSesion(): void {
  try {
    localStorage.removeItem(SESION_KEY)
  } catch {
    // Sin almacenamiento: nada que limpiar.
  }
}

export function cargarClientesMock(): MockAuthUser[] {
  const clientes = leer<MockAuthUser[]>(CLIENTES_KEY, [])
  return Array.isArray(clientes) ? clientes : []
}

export function guardarClienteMock(cliente: MockAuthUser): void {
  const clientes = cargarClientesMock()
  escribir(CLIENTES_KEY, [...clientes, cliente])
}
