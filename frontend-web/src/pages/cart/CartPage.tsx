import { Link } from 'react-router-dom'
import BackButton from '../../components/common/BackButton'
import CartItem from '../../components/cart/CartItem'
import CartSummary from '../../components/cart/CartSummary'
import { useCart } from '../../hooks/useCart'

export default function CartPage() {
  const { items } = useCart()

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <BackButton fallback="/" />
          <section>
            <h1 className="text-3xl font-semibold text-stone-800">Carrito</h1>
          </section>

          <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center">
            <p className="text-lg font-semibold text-stone-800">
              Tu carrito está vacío
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
              Explora el catálogo y agrega productos para verlos aquí.
            </p>
            <Link
              to="/catalogo"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
            >
              Explorar catálogo
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <BackButton fallback="/" />
        <section>
          <h1 className="text-3xl font-semibold text-stone-800">Carrito</h1>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-stone-800">
              Lista de productos
            </h2>

            {items.map((producto) => (
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
