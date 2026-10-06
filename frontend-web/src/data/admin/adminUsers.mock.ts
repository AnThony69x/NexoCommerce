import { authUsersMock } from '../authUsers.mock'
import type { AdminUser } from '../../types/admin'

const extraUsersMock: AdminUser[] = [
  {
    id: 'user-cliente-003',
    nombre_completo: 'María Pérez',
    correo: 'maria@ejemplo.test',
    telefono: '+593 999 000 010',
    rol: 'CLIENTE',
    correo_verificado: true,
    activo: true,
  },
  {
    id: 'user-cliente-004',
    nombre_completo: 'Juan Torres',
    correo: 'juan@ejemplo.test',
    telefono: '+593 999 000 011',
    rol: 'CLIENTE',
    correo_verificado: false,
    activo: true,
  },
]

export const adminUsersMock: AdminUser[] = [
  ...authUsersMock.map((user) => ({
    id: user.id,
    nombre_completo: user.nombre_completo,
    correo: user.correo,
    telefono: user.telefono,
    rol: user.role,
    correo_verificado: user.correo_verificado,
    activo: user.activo,
  })),
  ...extraUsersMock,
]

export const ADMIN_PRINCIPAL_ID = 'user-admin-001'
