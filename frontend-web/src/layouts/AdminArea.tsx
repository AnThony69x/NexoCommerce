import { AdminMockProvider } from '../contexts/AdminMockContext'
import AdminLayout from './AdminLayout'

/**
 * Area administrativa: agrupa el proveedor de datos mock del panel (los nueve
 * modulos de mock) para que solo se descarguen al entrar a /admin. Asi el
 * bundle inicial del sitio publico no los arrastra.
 */
export default function AdminArea() {
  return (
    <AdminMockProvider>
      <AdminLayout />
    </AdminMockProvider>
  )
}
