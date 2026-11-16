import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LoadingState } from '../common/RequestState'

/**
 * Requiere rol ADMIN. Invitados van a /login; no-admin van a /.
 * Igual que ProtectedRoute, espera la validación de sesión del arranque antes
 * de decidir adónde redirigir.
 */
export default function AdminRoute() {
  const { user, isAuthenticated, validando } = useAuth()
  const location = useLocation()

  if (validando && !isAuthenticated) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <LoadingState mensaje="Verificando sesión…" />
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    )
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
