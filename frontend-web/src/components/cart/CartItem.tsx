import { useState } from 'react'

type CartItemProps = {
  nombre: string
  imagen: string
  precioUnitario: number
  cantidadInicial: number
  categoría: string
}

export default function CartItem({
  nombre,
  imagen,
  precioUnitario,
  cantidadInicial,
  categoría,
}: CartItemProps) {
  const [cantidad, setCantidad] = useState(cantidadInicial)
  const [visible, setVisible] = useState(true)

  if (!visible) {
    return null
  }

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
            onClick={() => setCantidad((current) => Math.max(1, current - 1))}
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
            onClick={() => setCantidad((current) => current + 1)}
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
          onClick={() => setVisible(false)}
          className="mt-2 text-sm text-rose-700 hover:text-rose-800"
        >
          Eliminar
        </button>
      </div>
    </article>
  )
}
