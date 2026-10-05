import CatalogProductCard from '../catalog/CatalogProductCard'
import type { Product } from '../../types/product'

type DetailsProductGridProps = {
  products: Product[]
}

export default function DetailsProductGrid({
  products,
}: DetailsProductGridProps) {
  return (
    <section className="border-b border-stone-200 bg-white px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-800 sm:text-3xl">
            Ideas para regalar
          </h2>
          <span className="text-xs text-stone-500">Selección mock</span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <CatalogProductCard
              key={product.id}
              nombre={product.nombre}
              precio={product.precio}
              imagen={product.imagen}
              categoría={product.categoría}
              href={product.href}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
