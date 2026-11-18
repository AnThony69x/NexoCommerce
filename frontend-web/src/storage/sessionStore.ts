import type { AuthUser } from '../types/auth'

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
