import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

const navegacion = [
  { titulo: 'Dashboard', href: '/admin' },
  { titulo: 'Productos', href: '/admin/productos' },
  { titulo: 'Categorías', href: '/admin/categorias' },
  { titulo: 'Pedidos', href: '/admin/pedidos' },
  { titulo: 'Pagos', href: '/admin/pagos' },
  { titulo: 'Usuarios', href: '/admin/usuarios' },
  { titulo: 'Publicaciones', href: '/admin/publicaciones' },
  { titulo: 'Multimedia', href: '/admin/multimedia' },
  { titulo: 'Producción', href: '/admin/produccion' },
  { titulo: 'Configuración', href: '/admin/configuracion' },
]

function claseEnlace(activo: boolean): string {
  return activo
    ? 'block rounded-lg bg-stone-800 px-3 py-2 text-sm font-medium text-white'
    : 'block rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-stone-100'
}

function SidebarContenido({ onNavegar }: { onNavegar?: () => void }) {
  return (
    <nav aria-label="Navegación administrativa" className="space-y-1">
      {navegacion.map((item) => (
        <NavLink
          key={item.href + item.titulo}
          to={item.href}
          end={item.href === '/admin'}
          onClick={onNavegar}
          className={({ isActive }) => claseEnlace(isActive)}
        >
          {item.titulo}
        </NavLink>
      ))}
    </nav>
  )
}

export default function AdminLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuAbierto((actual) => !actual)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 text-sm font-semibold text-stone-700 lg:hidden"
              aria-label="Abrir menú administrativo"
            >
              =
            </button>
            <div>
              <p className="text-base font-semibold text-stone-800">
                Panel de administración
              </p>
              <p className="text-xs text-stone-500">
                Admin NexoCommerce (mock) · admin@nexocommerce.test
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex min-h-9 items-center rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-500"
          >
            Volver a la tienda
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="rounded-2xl border border-stone-200 bg-white p-3">
            <SidebarContenido />
          </div>
        </aside>

        {menuAbierto && (
          <div className="fixed inset-0 z-10 lg:hidden">
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setMenuAbierto(false)}
              className="absolute inset-0 bg-stone-900/40"
            />
            <div className="absolute left-0 top-0 h-full w-64 bg-white p-4 shadow-lg">
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
