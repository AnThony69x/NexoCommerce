import { useState } from 'react'
import { formatPrice } from '../../utils/formatPrice'

type ProductInfoProps = {
  nombre: string
  categoría: string
  precio: number
  descripción: string
  onAddToCart: (quantity: number) => void
}

export default function ProductInfo({
  nombre,
  categoría,
  precio,
  descripción,
  onAddToCart,
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        {categoría}
      </p>
      <h1 className="mt-2 text-2xl font-semibold leading-tight text-stone-800 sm:text-3xl">
        {nombre}
      </h1>
      <p className="mt-3 text-xl font-semibold text-stone-800 sm:text-2xl">
        {formatPrice(precio)}
      </p>
      <p className="mt-4 text-sm leading-6 text-stone-600">{descripción}</p>

      <div className="mt-6">
        <label
          htmlFor="quantity"
          className="text-sm font-medium text-stone-700"
        >
          Cantidad
        </label>
        <input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(event) => {
            const nextQuantity = Number(event.target.value)
            setQuantity(
              Number.isFinite(nextQuantity) && nextQuantity > 0
                ? nextQuantity
                : 1,
            )
          }}
          className="mt-2 block min-h-11 w-24 rounded-lg border border-stone-300 px-3 text-sm text-stone-700"
        />
      </div>

      <button
        type="button"
        onClick={() => onAddToCart(Math.max(1, quantity))}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
      >
        Agregar al carrito
      </button>
    </div>
  )
}
