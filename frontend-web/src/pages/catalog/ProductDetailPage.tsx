import { useContext } from 'react'
import { useParams } from 'react-router-dom'
import cakePlaceholder from '../../assets/product-cake-placeholder.svg'
import boxPlaceholder from '../../assets/product-box-placeholder.svg'
import dessertPlaceholder from '../../assets/product-dessert-placeholder.svg'
import mugPlaceholder from '../../assets/product-mug-placeholder.svg'
import ProductGallery from '../../components/catalog/ProductGallery'
import ProductCustomization from '../../components/catalog/ProductCustomization'
import ProductInfo from '../../components/catalog/ProductInfo'
import RelatedProducts from '../../components/catalog/RelatedProducts'
import { CartContext } from '../../contexts/CartContext'

type MockProduct = {
  id: string
  nombre: string
  categoría: string
  precio: string
  precioUnitario: number
  descripción: string
  imagen: string
}

const mockProducts: Record<string, MockProduct> = {
  'torta-jardin-de-rosas': {
    id: 'torta-jardin-de-rosas',
    nombre: 'Torta Jardín de Rosas',
    categoría: 'Repostería',
    precio: '$45.00',
    precioUnitario: 45,
    descripción:
      'Producto temporal para representar la descripción de una creación dulce y especial.',
    imagen: cakePlaceholder,
  },
  'caja-dulce-celebracion': {
    id: 'caja-dulce-celebracion',
    nombre: 'Caja Dulce Celebración',
    categoría: 'Detalles personalizados',
    precio: '$32.00',
    precioUnitario: 32,
    descripción: 'Una selección temporal de detalles dulces para celebrar.',
    imagen: boxPlaceholder,
  },
  'taza-flores-nombre': {
    id: 'taza-flores-nombre',
    nombre: 'Taza Flores & Nombre',
    categoría: 'Sublimación',
    precio: '$18.00',
    precioUnitario: 18,
    descripción: 'Producto temporal de sublimación con diseño personalizado.',
    imagen: mugPlaceholder,
  },
  'cheesecake-frutos-rojos': {
    id: 'cheesecake-frutos-rojos',
    nombre: 'Cheesecake de Frutos Rojos',
    categoría: 'Repostería',
    precio: '$28.00',
    precioUnitario: 28,
    descripción: 'Postre temporal con una combinación dulce de frutos rojos.',
    imagen: dessertPlaceholder,
  },
}

export default function ProductDetailPage() {
  const cart = useContext(CartContext)
  const { id } = useParams()
  const product = mockProducts[id ?? ''] ?? mockProducts['torta-jardin-de-rosas']

  if (!cart) {
    throw new Error('ProductDetailPage debe renderizarse dentro de CartProvider')
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
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
            descripción={product.descripción}
            onAddToCart={(quantity) =>
              cart.agregarProducto(
                {
                  id: product.id,
                  nombre: product.nombre,
                  imagen: product.imagen,
                  precioUnitario: product.precioUnitario,
                  categoría: product.categoría,
                },
                quantity,
              )
            }
          />
        </section>

        <ProductCustomization />

        <RelatedProducts />
      </div>
    </main>
  )
}
