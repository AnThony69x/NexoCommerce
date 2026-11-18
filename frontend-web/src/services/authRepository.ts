import { ApiError } from '../types/api'
import { cargarSesion } from '../storage/sessionStore'
import { cargarToken, limpiarToken } from '../storage/tokenStore'
import * as authService from './authService'
import type { AuthUser, SesionAuth } from '../types/auth'

export type DatosRegistro = {
  nombre_completo: string
  correo: string
  telefono: string | null
  password: string
}

export async function iniciarSesion(
  correo: string,
  password: string,
): Promise<SesionAuth> {
  return authService.iniciarSesion(correo.trim().toLowerCase(), password)
}

export async function registrarCliente(
  datos: DatosRegistro,
): Promise<SesionAuth> {
  const correo = datos.correo.trim().toLowerCase()

  return authService.registrarCliente({
    ...datos,
    correo,
    telefono: datos.telefono?.trim() || null,
  })
}

export async function cerrarSesion(): Promise<void> {
  try {
    await authService.cerrarSesion()
  } catch {
    // El token local se descarta de todos modos; no hay nada más que hacer.
  }
}

export async function obtenerPerfil(): Promise<AuthUser> {
  return authService.obtenerPerfil()
}

export async function actualizarPerfil(datos: {
  nombre_completo: string
  telefono: string | null
}): Promise<AuthUser> {
  return authService.actualizarPerfil(datos)
}

export async function cambiarPassword(
  passwordActual: string,
  passwordNueva: string,
): Promise<void> {
  await authService.cambiarPassword(passwordActual, passwordNueva)
  return
}

export async function reenviarVerificacion(): Promise<void> {
  await authService.reenviarVerificacion()
}

export async function refrescarSesionInicial(): Promise<AuthUser | null> {
  if (!cargarToken()) return null

  try {
    return await authService.obtenerPerfil()
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      limpiarToken()
      return null
    }
    // Fallo transitorio (sin conexión, 5xx, etc.): conservar la sesión local.
    return cargarSesion()
  }
}
