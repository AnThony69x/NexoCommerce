import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'

export default function FloatingCartButton() {
  const location = useLocation()
  const { totalItems } = useCart()

  // Oculto también en /checkout: a ancho completo el botón fijo quedaba
  // encima del resumen y podía tapar "Confirmar pedido".
  if (location.pathname === '/carrito' || location.pathname === '/checkout') {
    return null
  }

  return (
    <Link
      to="/carrito"
      aria-label={`Ir al carrito, ${totalItems} productos`}
      className="fixed bottom-6 right-6 z-20 flex h-12 items-center gap-2 rounded-full bg-stone-800 px-4 text-sm font-medium text-white shadow-xl transition-colors hover:bg-rose-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-brand/50 focus-visible:ring-offset-2"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="18" cy="20" r="1.4" />
        <path d="M2 3h2.3l2.5 12.1a1.8 1.8 0 0 0 1.8 1.4h8.3a1.8 1.8 0 0 0 1.8-1.4L21 7H5.2" />
      </svg>
      {totalItems > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-700 px-1 text-xs font-semibold text-white">
          {totalItems}
        </span>
      )}
    </Link>
  )
}
