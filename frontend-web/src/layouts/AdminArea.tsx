import { AdminProvider } from '../contexts/AdminContext'
import AdminLayout from './AdminLayout'

/**
 * Área administrativa: carga sus datos al entrar a /admin para que el bundle
 * inicial de la tienda pública no arrastre los módulos administrativos.
 */
export default function AdminArea() {
  return (
    <AdminProvider>
      <AdminLayout />
    </AdminProvider>
  )
}
