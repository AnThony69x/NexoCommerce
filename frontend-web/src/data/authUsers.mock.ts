import type { AuthUser } from '../types/auth'

export type MockAuthUser = AuthUser & {
  passwordMock: string
}

/**
 * Usuarios mock (solo VITE_MOCK_MODE=true). Ids numéricos alineados con el
 * estilo del backend (seriales); las contraseñas son solo para el mock local.
 * Datos de prueba usados por el equipo: admin@nexocommerce.test/admin123,
 * cliente@nexocommerce.test/cliente123, inactivo@nexocommerce.test/inactivo123.
 */
export const authUsersMock: MockAuthUser[] = [
  {
    id: 1,
    role: 'ADMIN',
    nombre_completo: 'Admin NexoCommerce',
    correo: 'admin@nexocommerce.test',
    telefono: '+593 999 000 001',
    correo_verificado: true,
    activo: true,
    passwordMock: 'admin123',
  },
  {
    id: 2,
    role: 'CLIENTE',
    nombre_completo: 'Cliente NexoCommerce',
    correo: 'cliente@nexocommerce.test',
    telefono: '+593 999 000 002',
    correo_verificado: true,
    activo: true,
    passwordMock: 'cliente123',
  },
  {
    id: 3,
    role: 'CLIENTE',
    nombre_completo: 'Cliente Inactivo',
    correo: 'inactivo@nexocommerce.test',
    telefono: '+593 999 000 003',
    correo_verificado: false,
    activo: false,
    passwordMock: 'inactivo123',
  },
]
