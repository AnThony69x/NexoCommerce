import { useContext } from 'react'
import { CartContext, type CartProduct } from '../../contexts/CartContext'

type CartItemProps = {
  producto: CartProduct
}

export default function CartItem({ producto }: CartItemProps) {
  const cart = useContext(CartContext)

  if (!cart) {
    throw new Error('CartItem debe renderizarse dentro de CartProvider')
  }

  const { aumentarCantidad, disminuirCantidad, eliminarProducto } = cart
  const { id, nombre, imagen, precioUnitario, cantidad, categoría } = producto
  const subtotal = precioUnitario * cantidad

  return (
    <article className="grid gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-[112px_1fr_auto] sm:items-center">
      <img
        src={imagen}
        alt={nombre}
        className="aspect-square w-28 rounded-lg object-cover"
      />

      <div>
        <h3 className="font-semibold text-stone-800">{nombre}</h3>
        <p className="mt-1 text-sm text-stone-500">{categoría}</p>
        <p className="mt-3 text-sm text-stone-600">
          Precio unitario: ${precioUnitario.toFixed(2)}
        </p>
      </div>

      <div className="text-left sm:text-right">
        <div className="flex items-center gap-2 sm:justify-end">
          <button
            type="button"
            aria-label={`Disminuir cantidad de ${nombre}`}
            onClick={() => disminuirCantidad(id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-300 text-stone-700 hover:border-stone-500"
          >
            -
          </button>
          <span className="min-w-6 text-center text-sm font-medium text-stone-700">
            {cantidad}
          </span>
          <button
            type="button"
            aria-label={`Aumentar cantidad de ${nombre}`}
            onClick={() => aumentarCantidad(id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-300 text-stone-700 hover:border-stone-500"
          >
            +
          </button>
        </div>
        <p className="mt-3 text-sm font-semibold text-stone-800">
          Subtotal: ${subtotal.toFixed(2)}
        </p>
        <button
          type="button"
          onClick={() => eliminarProducto(id)}
          className="mt-2 text-sm text-rose-700 hover:text-rose-800"
        >
          Eliminar
        </button>
      </div>
    </article>
  )
}
