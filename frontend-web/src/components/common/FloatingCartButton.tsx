import { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CartContext } from '../../contexts/CartContext'

export default function FloatingCartButton() {
  const location = useLocation()
  const cart = useContext(CartContext)

  if (!cart || location.pathname === '/carrito') {
    return null
  }

  return (
    <Link
      to="/carrito"
      aria-label={`Ir al carrito, ${cart.totalUnidades} productos`}
      className="fixed bottom-6 right-6 z-20 flex h-12 items-center gap-2 rounded-full bg-stone-800 px-4 text-sm font-medium text-white shadow-lg transition-colors hover:bg-stone-700"
    >
      <span aria-hidden="true">C</span>
      {cart.totalUnidades > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-700 px-1 text-xs font-semibold text-white">
          {cart.totalUnidades}
        </span>
      )}
    </Link>
  )
}
