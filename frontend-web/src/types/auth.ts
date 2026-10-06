export type UserRole = 'CLIENTE' | 'ADMIN'

export interface AuthUser {
  id: string
  role: UserRole
  nombre_completo: string
  correo: string
  telefono: string
  correo_verificado: boolean
  activo: boolean
}
