import { Link } from 'react-router-dom'
import { useContext } from 'react'
import CartItem from '../../components/cart/CartItem'
import CartSummary from '../../components/cart/CartSummary'
import { CartContext } from '../../contexts/CartContext'

export default function CartPage() {
  const cart = useContext(CartContext)

  if (!cart) {
    throw new Error('CartPage debe renderizarse dentro de CartProvider')
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section>
          <h1 className="text-3xl font-semibold text-stone-800">Carrito</h1>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-stone-800">
              Lista de productos
            </h2>

            {cart.productos.map((producto) => (
              <CartItem key={producto.id} producto={producto} />
            ))}
          </section>

          <aside className="space-y-3">
            <CartSummary />
            <Link
              to="/catalogo"
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 hover:border-stone-500"
            >
              Continuar comprando
            </Link>
          </aside>
        </div>
      </div>
    </main>
  )
}
