import type { AuthUser } from '../types/auth'

export type MockAuthUser = AuthUser & {
  passwordMock: string
}

export const authUsersMock: MockAuthUser[] = [
  {
    id: 'user-admin-001',
    role: 'ADMIN',
    nombre_completo: 'Admin NexoCommerce',
    correo: 'admin@nexocommerce.test',
    telefono: '+593 999 000 001',
    correo_verificado: true,
    activo: true,
    passwordMock: 'admin123',
  },
  {
    id: 'user-cliente-001',
    role: 'CLIENTE',
    nombre_completo: 'Cliente NexoCommerce',
    correo: 'cliente@nexocommerce.test',
    telefono: '+593 999 000 002',
    correo_verificado: true,
    activo: true,
    passwordMock: 'cliente123',
  },
  {
    id: 'user-cliente-002',
    role: 'CLIENTE',
    nombre_completo: 'Cliente Inactivo',
    correo: 'inactivo@nexocommerce.test',
    telefono: '+593 999 000 003',
    correo_verificado: false,
    activo: false,
    passwordMock: 'inactivo123',
  },
]

