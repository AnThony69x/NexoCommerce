/**
 * Tipos de autenticación: contrato crudo del backend (snake_case) y modelo UI.
 * Fuente: backend app/Http/Controllers/Auth/AuthController.php,
 * Http/Resources/UsuarioResource.php y routes/api.php (spec auth 1.1.0).
 *
 * Reglas del módulo:
 * - id SIEMPRE number (seriales del backend; el modelo UI lo mantiene igual).
 * - `role` (UI) se mapea desde `rol` (API); `correo`/`telefono` llegan
 *   snake_case y el mapper los deja idénticos para la UI.
 * - telefono puede ser null en el backend (campo nullable).
 */

export type UserRole = 'CLIENTE' | 'ADMIN'

// ---------------------------------------------------------------------------
// Contrato crudo (respuesta HTTP) — solo para mappers de services.
// ---------------------------------------------------------------------------

/** Subconjunto de usuario en login/registro/oauth (usuarioBrief del backend). */
export interface UsuarioBriefApi {
  id: number
  nombre_completo: string
  correo: string
  telefono: string | null
  rol: UserRole
  correo_verificado: boolean
  activo: boolean
}

/** GET /auth/perfil (UsuarioResource con terminos). */
export interface UsuarioPerfilApi extends UsuarioBriefApi {
  creado_en: string
  terminos_aceptados: boolean
  version_terminos: string
}

/** data de POST /auth/login y POST /auth/registro. */
export interface SesionAuthApi {
  usuario: UsuarioBriefApi
  token: string
}

// ---------------------------------------------------------------------------
// Modelo UI (lo que consumen el contexto y las páginas).
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: number
  role: UserRole
  nombre_completo: string
  correo: string
  /** null = sin teléfono registrado. */
  telefono: string | null
  correo_verificado: boolean
  activo: boolean
}

/** Sesión activa: usuario de UI + token (mock o Sanctum real). */
export interface SesionAuth {
  usuario: AuthUser
  token: string
}
