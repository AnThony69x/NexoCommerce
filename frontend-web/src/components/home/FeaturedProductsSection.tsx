import ProductCard from './ProductCard'
import { productsMock } from '../../data/products.mock'

const destacadosIds = [
  'torta-jardin-de-rosas',
  'caja-dulce-celebracion',
  'taza-flores-nombre',
  'cheesecake-frutos-rojos',
]

export default function FeaturedProductsSection() {
  const destacados = destacadosIds.flatMap((id) =>
    productsMock.find((product) => product.id === id) ?? [],
  )

  return (
    <section className="border-b border-stone-200 bg-stone-50 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-800 sm:text-3xl">
            Productos destacados
          </h2>
          <span className="text-xs text-stone-500">Ejemplos temporales</span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {destacados.map((producto) => (
            <ProductCard
              key={producto.id}
              nombre={producto.nombre}
              precio={producto.precio}
              imagen={producto.imagen}
              href={producto.href}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
