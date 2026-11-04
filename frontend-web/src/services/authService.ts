/**
 * Servicio de autenticación contra el backend real (/api/v1/auth y
 * /api/v1/usuarios). NO decide mock/real (eso es authRepository): aquí solo
 * hay HTTP y mappers de snake_case → modelo UI.
 *
 * Endpoints (routes/api.php):
 *  - POST /auth/login      {correo, password, device_name?} → data {usuario, token}
 *  - POST /auth/registro   {nombre_completo, correo, password (confirmed),
 *                           telefono?, terminos_aceptados, version_terminos}
 *                          → 201 data {usuario, token}
 *  - POST /auth/logout     (Bearer) revoca el token actual
 *  - GET  /auth/perfil     (Bearer) usuario completo (con creado_en/terminos)
 *  - PUT  /usuarios/perfil          {nombre_completo, telefono?}
 *  - PUT  /usuarios/cambiar-password {password_actual, password_nueva}
 *
 * Errores: 401 credenciales/ token inválido, 422 validación (ApiError.errores
 * campo a campo). El mapper no transforma errores: los propaga el cliente.
 */
import { apiClient } from './api'
import type { ApiEnvelope } from '../types/api'
import type {
  AuthUser,
  SesionAuth,
  SesionAuthApi,
  UsuarioBriefApi,
  UsuarioPerfilApi,
} from '../types/auth'

/** Versión de términos enviada al registrarse (contrato del backend). */
const VERSION_TERMINOS = '1.0'

// ---------------------------------------------------------------------------
// Mappers (respuesta backend → modelo UI)
// ---------------------------------------------------------------------------

function aUsuarioBrief(api: UsuarioBriefApi): AuthUser {
  return {
    id: Number(api.id),
    role: api.rol,
    nombre_completo: api.nombre_completo,
    correo: api.correo,
    telefono: api.telefono,
    correo_verificado: api.correo_verificado,
    activo: api.activo,
  }
}

/** GET /auth/perfil: los campos extra (creado_en, terminos) no van a la UI. */
function aUsuarioPerfil(api: UsuarioPerfilApi): AuthUser {
  return aUsuarioBrief(api)
}

function aSesion(api: SesionAuthApi): SesionAuth {
  return { usuario: aUsuarioBrief(api.usuario), token: api.token }
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

/** POST /auth/login → sesión (usuario + token Sanctum). */
export async function iniciarSesion(
  correo: string,
  password: string,
): Promise<SesionAuth> {
  const { data } = await apiClient.post<ApiEnvelope<SesionAuthApi>>(
    '/auth/login',
    {
      correo,
      password,
    },
  )
  return aSesion(data.data)
}

/** POST /auth/registro → sesión; el backend valida duplicados (422). */
export async function registrarCliente(datos: {
  nombre_completo: string
  correo: string
  password: string
  telefono: string | null
}): Promise<SesionAuth> {
  const { data } = await apiClient.post<ApiEnvelope<SesionAuthApi>>(
    '/auth/registro',
    {
      ...datos,
      // El backend exige `confirmed` en el password.
      password_confirmation: datos.password,
      terminos_aceptados: true,
      version_terminos: VERSION_TERMINOS,
    },
  )
  return aSesion(data.data)
}

/** POST /auth/logout (Bearer): revoca el token actual. */
export async function cerrarSesion(): Promise<void> {
  await apiClient.post('/auth/logout')
}

/** GET /auth/perfil (Bearer): usuario completo; sirve para refrescar la sesión. */
export async function obtenerPerfil(): Promise<AuthUser> {
  const { data } = await apiClient.get<ApiEnvelope<UsuarioPerfilApi>>(
    '/auth/perfil',
  )
  return aUsuarioPerfil(data.data)
}

/** PUT /usuarios/perfil (Bearer): actualiza nombre/teléfono. */
export async function actualizarPerfil(datos: {
  nombre_completo: string
  telefono: string | null
}): Promise<AuthUser> {
  const { data } = await apiClient.put<ApiEnvelope<UsuarioPerfilApi>>(
    '/usuarios/perfil',
    datos,
  )
  return aUsuarioPerfil(data.data)
}

/** PUT /usuarios/cambiar-password (Bearer). 401 = password actual incorrecto. */
export async function cambiarPassword(
  passwordActual: string,
  passwordNueva: string,
): Promise<void> {
  await apiClient.put('/usuarios/cambiar-password', {
    password_actual: passwordActual,
    password_nueva: passwordNueva,
  })
}
