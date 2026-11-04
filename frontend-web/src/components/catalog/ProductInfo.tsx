import { useState } from 'react'
import { formatPrice } from '../../utils/formatPrice'
import { clampCantidad } from '../../utils/validation'

type ProductInfoProps = {
  nombre: string
  categoría: string
  /** Precio en number; el formato $18.00 se aplica solo al renderizar. */
  precio: number
  /** null = sin control de stock: disponible y sin límite de cantidad. */
  stock: number | null
  descripción: string | null
  onAddToCart: (quantity: number) => void
}

export default function ProductInfo({
  nombre,
  categoría,
  precio,
  stock,
  descripción,
  onAddToCart,
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)
  const agotado = stock !== null && stock <= 0
  const conLimite = stock !== null

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
      {agotado ? (
        <p className="mt-3 inline-block rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold text-stone-700">
          Agotado
        </p>
      ) : conLimite ? (
        <p className="mt-3 text-xs text-stone-500">Solo {stock} disponibles</p>
      ) : null}
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
          max={stock ?? undefined}
          value={quantity}
          disabled={agotado}
          onChange={(event) => {
            setQuantity(
              clampCantidad(Number(event.target.value), stock ?? undefined) || 1,
            )
          }}
          className="mt-2 block min-h-11 w-24 rounded-lg border border-stone-300 px-3 text-sm text-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      <button
        type="button"
        disabled={agotado}
        onClick={() =>
          onAddToCart(clampCantidad(quantity, stock ?? undefined) || 1)
        }
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {agotado ? 'Producto agotado' : 'Agregar al carrito'}
      </button>
    </div>
  )
}
