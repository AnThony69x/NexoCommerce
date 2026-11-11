/**
 * Repositorio de autenticación: única puerta de acceso de la UI a sesiones.
 * Aquí se centraliza la decisión mock/real (nunca dentro de componentes):
 *
 *   VITE_MOCK_MODE=true  → usuarios locales (data/authUsers.mock) + clientes
 *                          registrados en localStorage; token simulado.
 *   VITE_MOCK_MODE=false → authService (API real: /auth/login, /auth/registro,
 *                          /auth/logout, /auth/perfil).
 *
 * Sin fallback silencioso: en modo real los errores se propagan como ApiError
 * (401 credenciales/ sesión inválida, 422 validación) y la UI los muestra.
 * Ambos caminos devuelven los mismos tipos (SesionAuth/AuthUser), así la UI
 * ignora el origen de los datos.
 */
import { config } from '../config/app'
import { authUsersMock, type MockAuthUser } from '../data/authUsers.mock'
import { ApiError } from '../types/api'
import {
  cargarClientesMock,
  cargarSesion,
  guardarClienteMock,
} from '../storage/sessionStore'
import {
  cargarToken,
  crearTokenMock,
  limpiarToken,
} from '../storage/tokenStore'
import * as authService from './authService'
import type { AuthUser, SesionAuth } from '../types/auth'

export type DatosRegistro = {
  nombre_completo: string
  correo: string
  telefono: string | null
  password: string
}

function sinPassword(usuario: MockAuthUser): AuthUser {
  const { passwordMock, ...sinClave } = usuario
  void passwordMock
  return sinClave
}

function todosLosUsuariosMock(): MockAuthUser[] {
  return [...authUsersMock, ...cargarClientesMock()]
}

/** POST /auth/login (real) o búsqueda local (mock). Lanza ApiError si falla. */
export async function iniciarSesion(
  correo: string,
  password: string,
): Promise<SesionAuth> {
  if (!config.mockMode) {
    return authService.iniciarSesion(correo.trim().toLowerCase(), password)
  }

  const correoNormalizado = correo.trim().toLowerCase()
  const mockUser = todosLosUsuariosMock().find(
    (candidate) =>
      candidate.correo.toLowerCase() === correoNormalizado &&
      candidate.passwordMock === password,
  )

  if (!mockUser || !mockUser.activo) {
    throw new ApiError(401, 'Correo, contraseña o estado de usuario inválido.')
  }

  const usuario = sinPassword(mockUser)
  return { usuario, token: crearTokenMock(usuario) }
}

/**
 * POST /auth/registro (real) o alta local (mock). El registro público SIEMPRE
 * crea CLIENTE (nunca ADMIN). Lanza ApiError si falla (422 correo duplicado).
 */
export async function registrarCliente(
  datos: DatosRegistro,
): Promise<SesionAuth> {
  const correo = datos.correo.trim().toLowerCase()

  if (!config.mockMode) {
    return authService.registrarCliente({
      ...datos,
      correo,
      telefono: datos.telefono?.trim() || null,
    })
  }

  const duplicado = todosLosUsuariosMock().some(
    (candidate) => candidate.correo.toLowerCase() === correo,
  )

  if (duplicado) {
    throw new ApiError(422, 'El correo ya está registrado. Inicia sesión.')
  }

  const nuevoCliente: MockAuthUser = {
    // Id numérico mock suficiente para distinguir clientes locales.
    id: Date.now(),
    role: 'CLIENTE',
    nombre_completo: datos.nombre_completo.trim(),
    correo,
    telefono: datos.telefono?.trim() || null,
    correo_verificado: false,
    activo: true,
    passwordMock: datos.password,
  }

  guardarClienteMock(nuevoCliente)
  const usuario = sinPassword(nuevoCliente)
  return { usuario, token: crearTokenMock(usuario) }
}

/**
 * POST /auth/logout (real, revoca el token) o no-op (mock). La sesión local
 * se limpia siempre en el contexto, aunque falle la revocación remota.
 */
export async function cerrarSesion(): Promise<void> {
  if (config.mockMode) return
  try {
    await authService.cerrarSesion()
  } catch {
    // El token local se descarta de todos modos; no hay nada más que hacer.
  }
}

/**
 * GET /auth/perfil (real) o sesión local almacenada (mock). El contexto lo
 * usa al montar, en modo real, para refrescar/validar la sesión guardada.
 */
export async function obtenerPerfil(): Promise<AuthUser> {
  if (!config.mockMode) {
    return authService.obtenerPerfil()
  }

  const sesion = cargarSesion()
  if (!sesion) {
    throw new ApiError(401, 'No hay sesión activa.')
  }
  return sesion
}

/**
 * Arranque de sesión al cargar la app (lo consume el contexto, que no sabe
 * si es mock o real):
 *  - mock: devuelve la sesión local guardada (sin red).
 *  - real: si hay token guardado, lo valida contra GET /auth/perfil.
 *    Solo un 401 (token rechazado por el backend) descarta la sesión y
 *    devuelve null. Un fallo de red o un 5xx NO cierra la sesión local:
 *    evita el "logout silencioso" con la red inestable; se conserva la
 *    sesión y se revalida en el siguiente intento o petición.
 */
export async function refrescarSesionInicial(): Promise<AuthUser | null> {
  if (config.mockMode) {
    return cargarSesion()
  }

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
