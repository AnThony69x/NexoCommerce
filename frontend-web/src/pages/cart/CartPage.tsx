import { useRef, useState } from 'react'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import type { CartProduct } from '../../contexts/CartContext'
import { Link } from 'react-router-dom'
import BackButton from '../../components/common/BackButton'
import CartItem from '../../components/cart/CartItem'
import CartSummary from '../../components/cart/CartSummary'
import { useCart } from '../../hooks/useCart'

export default function CartPage() {
  const { items, cargando, error, recargar, removeItem, clearCart } = useCart()

  const [accion, setAccion] = useState<{ tipo: 'eliminar'; producto: CartProduct } | { tipo: 'vaciar' }>()
  const titulo = useRef<HTMLHeadingElement>(null)

  async function confirmar() {
    if (!accion) return
    const fallo = await (accion.tipo === 'eliminar' ? removeItem(accion.producto.id) : clearCart())
    if (fallo !== null) throw new Error(fallo)
    setAccion(undefined)
    requestAnimationFrame(() => titulo.current?.focus())
  }

  if (cargando && !accion) {
    return <main className="min-h-screen bg-stone-50 px-4 py-8"><div className="mx-auto max-w-6xl">Cargando carrito…</div></main>
  }

  if (items.length === 0 && !accion) {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <BackButton fallback="/" />
          <section>
            <h1 ref={titulo} tabIndex={-1} className="text-3xl font-semibold text-stone-800">Carrito</h1>
          </section>

          {error && !accion && <div role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{error}<button className="ml-3 underline" onClick={() => void recargar()}>Reintentar</button></div>}

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
          <h1 ref={titulo} tabIndex={-1} className="text-3xl font-semibold text-stone-800">Carrito</h1>
        </section>

        {error && !accion && <div role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{error}<button className="ml-3 underline" onClick={() => void recargar()}>Reintentar</button></div>}

        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-stone-800">Lista de productos</h2>
              <button type="button" onClick={() => setAccion({ tipo: 'vaciar' })} className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700">
                Vaciar carrito
              </button>
            </div>

            {items.map((producto) => (
              <CartItem key={producto.id} producto={producto} onEliminar={() => setAccion({ tipo: 'eliminar', producto })} />
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
        {accion && (
          <ConfirmDialog
            abierto
            titulo={accion.tipo === 'eliminar' ? 'Eliminar producto' : 'Vaciar carrito'}
            descripcion={accion.tipo === 'eliminar'
              ? `Se quitará «${accion.producto.nombre}${accion.producto.configuracion?.nombre ? ` · ${accion.producto.configuracion.nombre}` : ''}» del carrito.`
              : 'Se quitarán todos los productos del carrito.'}
            textoConfirmar={accion.tipo === 'eliminar' ? 'Eliminar' : 'Vaciar carrito'}
            onConfirmar={confirmar}
            onCancelar={() => setAccion(undefined)}
          />
        )}
      </div>
    </main>
  )
}
