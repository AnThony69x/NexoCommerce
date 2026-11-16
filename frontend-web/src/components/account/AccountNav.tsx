import { NavLink } from 'react-router-dom'

const SECCIONES = [
  { to: '/perfil', label: 'Perfil' },
  { to: '/pedidos', label: 'Pedidos' },
  { to: '/notificaciones', label: 'Notificaciones' },
]

/**
 * Navegacion interna del area de cuenta (perfil, pedidos, notificaciones).
 * Antes solo se llegaba a estas pantallas por el menu del header.
 */
export default function AccountNav() {
  return (
    <nav
      aria-label="Secciones de mi cuenta"
      className="border-b border-stone-200"
    >
      <ul className="-mb-px flex gap-1 overflow-x-auto">
        {SECCIONES.map((seccion) => (
          <li key={seccion.to}>
            <NavLink
              to={seccion.to}
              className={({ isActive }) =>
                `inline-block whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-brand/40 ${
                  isActive
                    ? 'border-rose-brand-dark text-rose-brand-dark'
                    : 'border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-800'
                }`
              }
            >
              {seccion.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
