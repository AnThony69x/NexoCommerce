import CatalogProductCard from './CatalogProductCard'
import { ApiErrorState, LoadingState } from '../common/RequestState'
import { useAsync } from '../../hooks/useAsync'
import { listarRelacionados } from '../../services/productsRepository'

type RelatedProductsProps = {
  /** Categoría del producto actual (para traer productos del mismo tipo). */
  categoriaId: number
  /** Id del producto actual, que se excluye de la lista. */
  excluirId: number
}

export default function RelatedProducts({
  categoriaId,
  excluirId,
}: RelatedProductsProps) {
  const {
    data: relacionados,
    loading,
    error,
    recargar,
  } = useAsync(() => listarRelacionados(categoriaId, excluirId, 3), [
    categoriaId,
    excluirId,
  ])

  return (
    <section>
      <h2 className="text-lg font-semibold text-stone-800 sm:text-xl">
        También te puede gustar
      </h2>

      {loading ? (
        <div className="mt-4">
          <LoadingState mensaje="Cargando relacionados…" />
        </div>
      ) : error ? (
        <div className="mt-4">
          <ApiErrorState mensaje={error} onReintentar={recargar} />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(relacionados ?? []).map((producto) => (
            <CatalogProductCard
              key={producto.id}
              id={producto.id}
              nombre={producto.nombre}
              precio={producto.precio}
              imagen={producto.imagen}
              categoría={producto.categoria.nombre}
              stock={producto.stock}
            />
          ))}
        </div>
      )}
    </section>
  )
}
