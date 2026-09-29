import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="border-b border-stone-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/"
          className="text-xl font-semibold tracking-tight text-stone-800"
        >
          Dulces Aesca
        </Link>

        <nav aria-label="Navegación principal">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-stone-600">
            <li>
              <Link to="/" className="transition-colors hover:text-stone-900">
                Inicio
              </Link>
            </li>
            <li>
              <Link
                to="/reposteria"
                className="transition-colors hover:text-stone-900"
              >
                Repostería
              </Link>
            </li>
            <li>
              <Link
                to="/detalles-personalizados"
                className="transition-colors hover:text-stone-900"
              >
                Detalles personalizados
              </Link>
            </li>
            <li>
              <Link
                to="/sublimacion"
                className="transition-colors hover:text-stone-900"
              >
                Sublimación
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2 text-xs text-stone-600">
          <button
            type="button"
            aria-label="Buscar"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200"
          >
            S
          </button>
          <button
            type="button"
            aria-label="Usuario"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200"
          >
            U
          </button>
          <button
            type="button"
            aria-label="Carrito"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200"
          >
            C
          </button>
        </div>
      </div>
    </header>
  )
}
