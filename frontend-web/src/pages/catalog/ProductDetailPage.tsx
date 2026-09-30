import cakePlaceholder from '../../assets/product-cake-placeholder.svg'
import boxPlaceholder from '../../assets/product-box-placeholder.svg'
import dessertPlaceholder from '../../assets/product-dessert-placeholder.svg'
import ProductGallery from '../../components/catalog/ProductGallery'
import ProductCustomization from '../../components/catalog/ProductCustomization'
import ProductInfo from '../../components/catalog/ProductInfo'
import RelatedProducts from '../../components/catalog/RelatedProducts'

export default function ProductDetailPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery
            images={[
              {
                src: cakePlaceholder,
                alt: 'Imagen principal temporal del producto',
              },
              { src: boxPlaceholder, alt: 'Vista temporal del producto 2' },
              {
                src: dessertPlaceholder,
                alt: 'Vista temporal del producto 3',
              },
            ]}
          />

          <ProductInfo
            nombre="Torta Jardín de Rosas"
            categoría="Repostería"
            precio="$45.00"
            descripción="Producto temporal para representar la descripción de una creación dulce y especial."
          />
        </section>

        <ProductCustomization />

        <RelatedProducts />
      </div>
    </main>
  )
}
