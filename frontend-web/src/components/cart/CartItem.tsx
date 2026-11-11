import { formatPrice } from '../../utils/formatPrice'
import type { CartProduct } from '../../contexts/CartContext'
import { useCart } from '../../hooks/useCart'

type CartItemProps = {
  producto: CartProduct
}

export default function CartItem({ producto }: CartItemProps) {
  const { increaseQuantity, decreaseQuantity, removeItem } = useCart()
  const { id, nombre, imagen, precioUnitario, cantidad, categoría, stock } = producto
  const subtotal = precioUnitario * cantidad
  const enTope = cantidad >= stock

  return (
    <article className="grid gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-[112px_1fr_auto] sm:items-center">
      <img
        loading="lazy"
        src={imagen}
        alt={nombre}
        className="aspect-square w-28 rounded-lg object-cover"
      />

      <div>
        <h3 className="font-semibold text-stone-800">{nombre}</h3>
        <p className="mt-1 text-sm text-stone-500">{categoría}</p>
        <p className="mt-3 text-sm text-stone-600">
          Precio unitario: {formatPrice(precioUnitario)}
        </p>
        <p className="mt-1 text-xs text-stone-500">
          Disponibles: {stock}
        </p>
      </div>

      <div className="text-left sm:text-right">
        <div className="flex items-center gap-2 sm:justify-end">
          <button
            type="button"
            aria-label={`Disminuir cantidad de ${nombre}`}
            onClick={() => decreaseQuantity(id)}
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
            onClick={() => increaseQuantity(id)}
            disabled={enTope}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-300 text-stone-700 hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            +
          </button>
        </div>
        <p className="mt-3 text-sm font-semibold text-stone-800">
          Subtotal: {formatPrice(subtotal)}
        </p>
        <button
          type="button"
          onClick={() => removeItem(id)}
          className="mt-2 text-sm text-rose-700 hover:text-rose-800"
        >
          Eliminar
        </button>
      </div>
    </article>
  )
}
