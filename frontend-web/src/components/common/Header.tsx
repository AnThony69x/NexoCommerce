import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'

const ICONO_BUSCAR = (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

const ICONO_USUARIO = (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
  </svg>
)

const ICONO_CARRITO = (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </svg>
)

export default function Header() {
  const navigate = useNavigate()
  const { totalItems } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [menuAbierto, setMenuAbierto] = useState(false)

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedSearchTerm = searchTerm.trim()
    navigate(
      normalizedSearchTerm
        ? `/catalogo?search=${encodeURIComponent(normalizedSearchTerm)}`
        : '/catalogo',
    )
  }

  function cerrarSesion() {
    logout()
    setMenuAbierto(false)
    navigate('/')
  }

  const inicial = user?.nombre_completo.trim().charAt(0).toUpperCase() ?? '?'

  return (
    <header className="border-b border-stone-200 bg-cream px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="inline-flex flex-col leading-none">
          <span className="font-display text-xl font-semibold text-brown">
            Dulces Aesca
          </span>
          <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.3em] text-brown-soft">
            Hecho para celebrar
          </span>
        </Link>

        <nav aria-label="Navegación principal">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-brown-soft">
            <li>
              <Link
                to="/"
                className="transition-colors hover:text-rose-brand-dark"
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link
                to="/reposteria"
                className="transition-colors hover:text-rose-brand-dark"
              >
                Repostería
              </Link>
            </li>
            <li>
              <Link
                to="/detalles"
                className="transition-colors hover:text-rose-brand-dark"
              >
                Detalles personalizados
              </Link>
            </li>
            <li>
              <Link
                to="/sublimacion"
                className="transition-colors hover:text-rose-brand-dark"
              >
                Sublimación
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2 text-sm text-brown-soft">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar"
              aria-label="Buscar productos"
              className="h-9 w-28 rounded-full border border-stone-300 bg-white px-3 text-xs text-brown outline-none placeholder:text-brown-soft/70 focus:border-rose-brand sm:w-36"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 bg-white text-brown transition-colors hover:border-rose-brand hover:text-rose-brand"
            >
              {ICONO_BUSCAR}
            </button>
          </form>

          {!isAuthenticated || !user ? (
            <Link
              to="/login"
              aria-label="Iniciar sesión"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 bg-white text-brown transition-colors hover:border-rose-brand hover:text-rose-brand"
            >
              {ICONO_USUARIO}
            </Link>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuAbierto((actual) => !actual)}
                aria-expanded={menuAbierto}
                aria-label={`Cuenta de ${user.nombre_completo}`}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 bg-white text-brown transition-colors hover:border-rose-brand hover:text-rose-brand"
              >
                {ICONO_USUARIO}
                <span className="sr-only">{inicial}</span>
              </button>

              {menuAbierto && (
                <div className="absolute right-0 z-30 mt-2 w-48 rounded-xl border border-stone-200 bg-white py-2 shadow-lg">
                  {user.role === 'ADMIN' ? (
                    <Link
                      to="/admin"
                      onClick={() => setMenuAbierto(false)}
                      className="block px-4 py-2 text-sm text-brown hover:bg-cream-soft"
                    >
                      Panel de administración
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/perfil"
                        onClick={() => setMenuAbierto(false)}
                        className="block px-4 py-2 text-sm text-brown hover:bg-cream-soft"
                      >
                        Mi perfil
                      </Link>
                      <Link
                        to="/pedidos"
                        onClick={() => setMenuAbierto(false)}
                        className="block px-4 py-2 text-sm text-brown hover:bg-cream-soft"
                      >
                        Mis pedidos
                      </Link>
                      <Link
                        to="/notificaciones"
                        onClick={() => setMenuAbierto(false)}
                        className="block px-4 py-2 text-sm text-brown hover:bg-cream-soft"
                      >
                        Notificaciones
                      </Link>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={cerrarSesion}
                    className="block w-full px-4 py-2 text-left text-sm text-rose-brand-dark hover:bg-cream-soft"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}

          <Link
            to="/carrito"
            aria-label={`Carrito, ${totalItems} productos`}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 bg-white text-brown transition-colors hover:border-rose-brand hover:text-rose-brand"
          >
            {ICONO_CARRITO}
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-brand px-1 text-[10px] font-semibold text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
