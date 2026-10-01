import cakePlaceholder from '../../assets/product-cake-placeholder.svg'
import boxPlaceholder from '../../assets/product-box-placeholder.svg'
import mugPlaceholder from '../../assets/product-mug-placeholder.svg'
import dessertPlaceholder from '../../assets/product-dessert-placeholder.svg'
import ProductCard from './ProductCard'

export default function FeaturedProductsSection() {
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
          <ProductCard
            nombre="Torta Jardín de Rosas"
            precio="$45.00"
            imagen={cakePlaceholder}
            href="/productos/torta-jardin-de-rosas"
          />
          <ProductCard
            nombre="Caja Dulce Celebración"
            precio="$32.00"
            imagen={boxPlaceholder}
            href="/productos/caja-dulce-celebracion"
          />
          <ProductCard
            nombre="Taza Flores & Nombre"
            precio="$18.00"
            imagen={mugPlaceholder}
            href="/productos/taza-flores-nombre"
          />
          <ProductCard
            nombre="Cheesecake de Frutos Rojos"
            precio="$28.00"
            imagen={dessertPlaceholder}
            href="/productos/cheesecake-frutos-rojos"
          />
        </div>
      </div>
    </section>
  )
}
