import boxPlaceholder from '../../assets/product-box-placeholder.svg'
import dessertPlaceholder from '../../assets/product-dessert-placeholder.svg'
import mugPlaceholder from '../../assets/product-mug-placeholder.svg'
import CatalogProductCard from './CatalogProductCard'

export default function RelatedProducts() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-stone-800 sm:text-xl">
        También te puede gustar
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CatalogProductCard
          nombre="Caja Dulce Celebración"
          precio="$32.00"
          imagen={boxPlaceholder}
          categoría="Detalles personalizados"
          href="/productos/caja-dulce-celebracion"
        />
        <CatalogProductCard
          nombre="Taza Flores & Nombre"
          precio="$18.00"
          imagen={mugPlaceholder}
          categoría="Sublimación"
          href="/productos/taza-flores-nombre"
        />
        <CatalogProductCard
          nombre="Cheesecake de Frutos Rojos"
          precio="$28.00"
          imagen={dessertPlaceholder}
          categoría="Repostería"
          href="/productos/cheesecake-frutos-rojos"
        />
      </div>
    </section>
  )
}
