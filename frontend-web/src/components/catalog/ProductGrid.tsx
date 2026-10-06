import CatalogProductCard from './CatalogProductCard'
import type { Product } from '../../types/product'

type ProductGridProps = {
  productos: Product[]
}

export default function ProductGrid({ productos }: ProductGridProps) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-stone-800">
        Listado de productos
      </h2>

      {productos.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {productos.map((producto) => (
            <CatalogProductCard
              key={producto.id}
              nombre={producto.nombre}
              precio={producto.precio}
              imagen={producto.imagen}
              categoría={producto.categoría}
              href={producto.href}
            />
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-lg border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
          No se encontraron productos.
        </p>
      )}
    </section>
  )
}
