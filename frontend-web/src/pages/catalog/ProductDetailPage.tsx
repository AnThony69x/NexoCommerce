import { useParams } from 'react-router-dom'
import BackButton from '../../components/common/BackButton'
import ProductGallery from '../../components/catalog/ProductGallery'
import ProductCustomization from '../../components/catalog/ProductCustomization'
import ProductInfo from '../../components/catalog/ProductInfo'
import RelatedProducts from '../../components/catalog/RelatedProducts'
import { ApiErrorState, LoadingState } from '../../components/common/RequestState'
import { useAsync } from '../../hooks/useAsync'
import { useCart } from '../../hooks/useCart'
import { STOCK_CARRITO_SIN_LIMITE } from '../../contexts/CartContext'
import { obtenerProducto } from '../../services/productsRepository'
import { imagenProducto } from '../../utils/imagenProducto'

export default function ProductDetailPage() {
  const { addItem } = useCart()
  const { id } = useParams()
  const idProducto = Number(id ?? '')
  const {
    data: product,
    loading,
    error,
    recargar,
  } = useAsync(() => obtenerProducto(idProducto), [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <BackButton fallback="/catalogo" />
          <LoadingState mensaje="Cargando producto…" />
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <BackButton fallback="/catalogo" />
          <ApiErrorState mensaje={error} onReintentar={recargar} />
        </div>
      </main>
    )
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
              El producto solicitado no existe o no está disponible.
            </p>
          </section>
        </div>
      </main>
    )
  }

  // Etiqueta de categoría: nombre resuelto; si falta, se usa el tipo.
  const etiquetaCategoria = product.categoria.nombre ?? product.tipo

  // Galería desde las imágenes del producto (mínimo una para la galería).
  const imagenesGaleria =
    product.imagenes.length > 0
      ? product.imagenes.map((imagen, indice) => ({
          src: imagenProducto(imagen.url),
          alt: `${product.nombre} — imagen ${indice + 1}`,
        }))
      : [{ src: imagenProducto(null), alt: product.nombre }]

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <BackButton fallback="/catalogo" />
        <section className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery images={imagenesGaleria} />

          <ProductInfo
            nombre={product.nombre}
            categoría={etiquetaCategoria}
            precio={product.precio}
            stock={product.stock}
            descripción={product.descripcion}
            onAddToCart={(quantity) =>
              addItem(
                {
                  // El carrito mock trabaja con ids string: se convierte aquí.
                  id: String(product.id),
                  nombre: product.nombre,
                  imagen: imagenProducto(product.imagenes[0]?.url),
                  precioUnitario: product.precio,
                  categoría: etiquetaCategoria,
                  stock: product.stock ?? STOCK_CARRITO_SIN_LIMITE,
                },
                quantity,
              )
            }
          />
        </section>

        <ProductCustomization />

        <RelatedProducts categoriaId={product.categoria.id} excluirId={product.id} />
      </div>
    </main>
  )
}
