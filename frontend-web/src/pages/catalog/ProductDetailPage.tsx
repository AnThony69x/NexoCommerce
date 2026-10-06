import { useContext } from 'react'
import { useParams } from 'react-router-dom'
import boxPlaceholder from '../../assets/product-box-placeholder.svg'
import dessertPlaceholder from '../../assets/product-dessert-placeholder.svg'
import BackButton from '../../components/common/BackButton'
import ProductGallery from '../../components/catalog/ProductGallery'
import ProductCustomization from '../../components/catalog/ProductCustomization'
import ProductInfo from '../../components/catalog/ProductInfo'
import RelatedProducts from '../../components/catalog/RelatedProducts'
import { CartContext } from '../../contexts/CartContext'
import { obtenerProductoPorId } from '../../data/products.mock'

export default function ProductDetailPage() {
  const cart = useContext(CartContext)
  const { id } = useParams()
  const product = id ? obtenerProductoPorId(id) : undefined

  if (!cart) {
    throw new Error('ProductDetailPage debe renderizarse dentro de CartProvider')
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <BackButton fallback="/catalogo" />
          <section className="rounded-xl border border-stone-200 bg-white p-6 sm:p-8">
            <h1 className="text-3xl font-semibold text-stone-800">
              Producto no encontrado
            </h1>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              El producto solicitado no está disponible en los datos mock.
            </p>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <BackButton fallback="/catalogo" />
        <section className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery
            images={[
              {
                src: product.imagen,
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
            nombre={product.nombre}
            categoría={product.categoría}
            precio={product.precio}
            descripción={`Producto mock de ${product.categoría.toLowerCase()} para una ocasión especial.`}
            onAddToCart={(quantity) =>
              cart.agregarProducto(
                {
                  id: product.id,
                  nombre: product.nombre,
                  imagen: product.imagen,
                  precioUnitario: product.precio,
                  categoría: product.categoría,
                },
                quantity,
              )
            }
          />
        </section>

        <ProductCustomization />

        <RelatedProducts excluirId={product.id} />
      </div>
    </main>
  )
}
