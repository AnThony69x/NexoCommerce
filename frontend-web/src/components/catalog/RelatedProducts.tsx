import CatalogProductCard from './CatalogProductCard'
import { obtenerRelacionados } from '../../data/products.mock'

type RelatedProductsProps = {
  excluirId?: string
}

export default function RelatedProducts({ excluirId }: RelatedProductsProps) {
  const relacionados = obtenerRelacionados(excluirId ?? '', 3)

  return (
    <section>
      <h2 className="text-lg font-semibold text-stone-800 sm:text-xl">
        También te puede gustar
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {relacionados.map((producto) => (
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
    </section>
  )
}
