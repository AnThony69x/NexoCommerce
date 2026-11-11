import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'

/**
 * Estilo compartido por los botones circulares del header (buscar, cuenta,
 * carrito): tamaño táctil cómodo, hover con acento y foco visible para
 * teclado.
 */
const BOTON_ICONO =
  'flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-brown transition-colors hover:border-rose-brand hover:bg-rose-50 hover:text-rose-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-brand/40'

const NAV_ITEMS = [
  { to: '/', label: 'Inicio' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/reposteria', label: 'Repostería' },
  { to: '/detalles', label: 'Detalles personalizados' },
  { to: '/sublimacion', label: 'Sublimación' },
]

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
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
    <path d="M2 3h2.3l2.5 12.1a1.8 1.8 0 0 0 1.8 1.4h8.3a1.8 1.8 0 0 0 1.8-1.4L21 7H5.2" />
  </svg>
)

export default function Header() {
  const navigate = useNavigate()
  const { totalItems } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [menuAbierto, setMenuAbierto] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // El menú de cuenta se cierra al hacer clic fuera o al pulsar Escape:
  // antes se quedaba abierto flotando sobre el contenido.
  useEffect(() => {
    if (!menuAbierto) return

    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuAbierto(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuAbierto])

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
      <div className="mx-auto flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Link to="/" className="inline-flex flex-col leading-none">
          <span className="font-display text-xl font-semibold text-brown">
            Dulces Aesca
          </span>
          <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.3em] text-brown-soft">
            Hecho para celebrar
          </span>
        </Link>

        <nav
          aria-label="Navegación principal"
          className="order-3 w-full lg:order-2 lg:w-auto"
        >
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `inline-block border-b-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-brand/40 ${
                      isActive
                        ? 'border-rose-brand font-semibold text-rose-brand-dark'
                        : 'border-transparent text-brown-soft hover:border-stone-300 hover:text-rose-brand-dark'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="order-2 flex items-center gap-2 text-sm text-brown-soft lg:order-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar"
              aria-label="Buscar productos"
              className="h-10 w-32 rounded-full border border-stone-200 bg-white px-3.5 text-xs text-brown outline-none transition-colors placeholder:text-brown-soft/70 focus:border-rose-brand focus-visible:ring-2 focus-visible:ring-rose-brand/30 md:w-44"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className={BOTON_ICONO}
            >
              {ICONO_BUSCAR}
            </button>
          </form>

          {!isAuthenticated || !user ? (
            <Link
              to="/login"
              aria-label="Iniciar sesión"
              className={BOTON_ICONO}
            >
              {ICONO_USUARIO}
            </Link>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuAbierto((actual) => !actual)}
                aria-expanded={menuAbierto}
                aria-label={`Cuenta de ${user.nombre_completo}`}
                className={`relative ${BOTON_ICONO}`}
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
            className={`relative ${BOTON_ICONO}`}
          >
            {ICONO_CARRITO}
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-brand-dark px-1 text-[10px] font-semibold text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
