import CatalogProductCard from './CatalogProductCard'
import type { Product } from '../../types/product'

type ProductGridProps = {
  productos: Product[]
  /** Badge "Más pedido" para el producto id 1 (torta jardín del catálogo). */
  badgeDestacado: boolean
}

export default function ProductGrid({
  productos,
  badgeDestacado,
}: ProductGridProps) {
  if (productos.length === 0) {
    return (
      <p
        role="status"
        className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-brown-soft"
      >
        No se encontraron productos con esos filtros.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {productos.map((producto) => {
        const agotado = producto.stock !== null && producto.stock <= 0
        let badge: string | undefined
        if (!agotado) {
          if (badgeDestacado && producto.id === 1) {
            badge = 'Más pedido'
          } else if (producto.categoria.nombre === 'Sublimación') {
            badge = 'Personalizado'
          }
        }

        return (
          <CatalogProductCard
            key={producto.id}
            id={producto.id}
            nombre={producto.nombre}
            precio={producto.precio}
            imagen={producto.imagen}
            categoría={producto.categoria.nombre}
            stock={producto.stock}
            badge={badge}
          />
        )
      })}
    </div>
  )
}
