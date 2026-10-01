import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CartContext } from '../../contexts/CartContext'

export default function Header() {
  const navigate = useNavigate()
  const cart = useContext(CartContext)
  const [searchTerm, setSearchTerm] = useState('')

  if (!cart) {
    throw new Error('Header debe renderizarse dentro de CartProvider')
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedSearchTerm = searchTerm.trim()
    navigate(
      normalizedSearchTerm
        ? `/catalogo?search=${encodeURIComponent(normalizedSearchTerm)}`
        : '/catalogo',
    )
  }

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
                to="/detalles"
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
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar"
              aria-label="Buscar productos"
              className="h-8 w-24 rounded-full border border-stone-200 px-3 text-xs text-stone-700 outline-none placeholder:text-stone-400 focus:border-stone-400 sm:w-32"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200"
            >
              S
            </button>
          </form>
          <Link
            to="/login"
            aria-label="Usuario"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200"
          >
            U
          </Link>
          <Link
            to="/carrito"
            aria-label={`Carrito, ${cart.totalUnidades} productos`}
            className="relative flex h-8 w-8 items-center justify-center rounded-full border border-stone-200"
          >
            C
            {cart.totalUnidades > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-700 px-1 text-[10px] font-semibold text-white">
                {cart.totalUnidades}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
