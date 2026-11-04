import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  IconoCategoria,
  IconoConfiguracion,
  IconoMultimedia,
  IconoPago,
  IconoPanel,
  IconoPedido,
  IconoProduccion,
  IconoProducto,
  IconoPublicacion,
  IconoUsuarios,
} from '../components/admin/AdminIcons'

const navegacion = [
  { titulo: 'Dashboard', href: '/admin', Icono: IconoPanel },
  { titulo: 'Productos', href: '/admin/productos', Icono: IconoProducto },
  { titulo: 'Categorías', href: '/admin/categorias', Icono: IconoCategoria },
  { titulo: 'Pedidos', href: '/admin/pedidos', Icono: IconoPedido },
  { titulo: 'Pagos', href: '/admin/pagos', Icono: IconoPago },
  { titulo: 'Usuarios', href: '/admin/usuarios', Icono: IconoUsuarios },
  { titulo: 'Publicaciones', href: '/admin/publicaciones', Icono: IconoPublicacion },
  { titulo: 'Multimedia', href: '/admin/multimedia', Icono: IconoMultimedia },
  { titulo: 'Producción', href: '/admin/produccion', Icono: IconoProduccion },
  { titulo: 'Configuración', href: '/admin/configuracion', Icono: IconoConfiguracion },
]

function claseEnlace(activo: boolean): string {
  const base =
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors'
  return activo
    ? `${base} bg-white/10 font-semibold text-white`
    : `${base} text-stone-300 hover:bg-white/5 hover:text-white`
}

function SidebarContenido({ onNavegar }: { onNavegar?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <Link
        to="/"
        onClick={onNavegar}
        className="mb-4 flex items-center gap-2 px-2 pt-1"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-700 text-sm font-bold text-white">
          D
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold text-white">
            Dulces Aesca
          </span>
          <span className="block text-[11px] text-stone-400">
            Administración
          </span>
        </span>
      </Link>

      <nav aria-label="Navegación administrativa" className="flex-1 space-y-1">
        {navegacion.map((item) => (
          <NavLink
            key={item.href + item.titulo}
            to={item.href}
            end={item.href === '/admin'}
            onClick={onNavegar}
            className={({ isActive }) => claseEnlace(isActive)}
          >
            <item.Icono className="h-5 w-5 shrink-0 opacity-80" />
            {item.titulo}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 rounded-xl bg-white/5 p-3">
        <p className="truncate text-xs font-medium text-white">
          Admin NexoCommerce
        </p>
        <p className="truncate text-[11px] text-stone-400">
          admin@nexocommerce.test
        </p>
        <p className="mt-1 inline-block rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
          Mock local
        </p>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuAbierto((actual) => !actual)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 text-sm font-semibold text-stone-700 lg:hidden"
              aria-label="Abrir menú administrativo"
              aria-expanded={menuAbierto}
            >
              ☰
            </button>
            <div>
              <p className="text-base font-semibold text-stone-800">
                Panel de administración
              </p>
              <p className="hidden text-xs text-stone-500 sm:block">
                Gestiona catálogo, pedidos y tienda desde un solo lugar.
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-500"
          >
            <span aria-hidden="true">←</span> Volver a la tienda
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl items-start gap-6 px-4 py-6 sm:px-6">
        <aside className="sticky top-[76px] hidden max-h-[calc(100vh-100px)] w-60 shrink-0 overflow-y-auto rounded-2xl bg-stone-900 p-4 shadow-sm lg:block">
          <SidebarContenido />
        </aside>

        {menuAbierto && (
          <div className="fixed inset-0 z-30 lg:hidden">
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setMenuAbierto(false)}
              className="absolute inset-0 bg-stone-900/50"
            />
            <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-stone-900 p-4 shadow-xl">
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setMenuAbierto(false)}
                  aria-label="Cerrar menú"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-300 hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <SidebarContenido onNavegar={() => setMenuAbierto(false)} />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
