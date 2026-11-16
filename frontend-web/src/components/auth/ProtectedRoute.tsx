import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LoadingState } from '../common/RequestState'

/**
 * Requiere sesión. Sin sesión redirige a /login recordando el destino.
 * Si aún se está validando la sesión guardada (arranque en modo real), espera
 * con un aviso en vez de redirigir: evita mandar a /login a un usuario con
 * sesión válida que no se había restaurado aún.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, validando } = useAuth()
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

  return <Outlet />
}
