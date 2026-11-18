import { Link } from 'react-router-dom'
import CatalogProductCard from '../catalog/CatalogProductCard'
import { ApiErrorState, LoadingState } from '../common/RequestState'
import { useAsync } from '../../hooks/useAsync'
import {
  listarProductos,
} from '../../services/productsRepository'

/**
 * Ids numéricos de los destacados (catálogo actual: 1 torta jardín, 5 caja
 * dulce, 8 taza flores, 2 cheesecake). El listado completo está en
 * el catálogo del backend.
 */
const destacadosIds = [1, 5, 8, 2]

/** Badge del maquetado: el primero es "Más pedido"; sublimación "Personalizado". */
function badgeDeProducto(
  indice: number,
  sublimacion: boolean,
  agotado: boolean,
): string | undefined {
  if (agotado) return undefined
  if (indice === 0) return 'Más pedido'
  if (sublimacion) return 'Personalizado'
  return undefined
}

export default function FeaturedProductsSection() {
  const {
    data: destacados,
    loading,
    error,
    recargar,
  } = useAsync(async () => {
    const productos = await listarProductos()
    const preferidos = destacadosIds.flatMap((id) => productos.filter((producto) => producto.id === id))
    const disponibles = productos.filter((producto) =>
      !destacadosIds.includes(producto.id) && (producto.stock === null || producto.stock > 0),
    )
    return [...preferidos, ...disponibles].slice(0, destacadosIds.length)
  })

  return (
    <section className="bg-cream-rose px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 inline-block rounded-full bg-rose-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-brand-ink">
              Favoritos de la semana
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-brown sm:text-4xl">
              Pequeños lujos para compartir
            </h2>
          </div>
          <Link
            to="/catalogo"
            className="text-sm font-medium text-rose-brand-dark transition-colors hover:text-rose-brand"
          >
            Ver todos los productos →
          </Link>
        </div>

        {loading ? (
          <LoadingState mensaje="Cargando destacados…" />
        ) : error ? (
          <ApiErrorState mensaje={error} onReintentar={recargar} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(destacados ?? []).map((producto, indice) => (
              <CatalogProductCard
                key={producto.id}
                id={producto.id}
                nombre={producto.nombre}
                precio={producto.precio}
                imagen={producto.imagen}
                categoría={producto.categoria.nombre}
                personalizar={producto.tipo === 'SUBLIMACION'}
                stock={producto.stock}
                badge={badgeDeProducto(
                  indice,
                  producto.tipo === 'SUBLIMACION',
                  producto.stock !== null && producto.stock <= 0,
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
