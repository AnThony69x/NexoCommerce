import placeholderGenerico from '../../assets/hero-placeholder.svg'
import { useAsync } from '../../hooks/useAsync'
import { listarCategorias } from '../../services/categoriesRepository'
import {
  CATEGORIA_DETALLES,
  CATEGORIA_REPOSTERIA,
  CATEGORIA_SUBLIMACION,
} from '../../services/productsRepository'
import type { CategoryNode } from '../../types/category'
import { ApiErrorState, LoadingState } from '../common/RequestState'
import CategoryCard from './CategoryCard'

/**
 * Rutas fijas del catálogo vertical por nombre de categoría. Las categorías
 * que el backend no reconoce (o sin ruta propia) llevan al catálogo general.
 */
const RUTAS_CATEGORIAS: Record<string, string> = {
  [CATEGORIA_REPOSTERIA]: '/reposteria',
  [CATEGORIA_DETALLES]: '/detalles',
  [CATEGORIA_SUBLIMACION]: '/sublimacion',
}

function rutaDeCategoria(categoria: CategoryNode): string {
  return RUTAS_CATEGORIAS[categoria.nombre] ?? '/catalogo'
}

export default function CategoriesSection() {
  const {
    data: categorias,
    loading,
    error,
    recargar,
  } = useAsync(listarCategorias, [])

  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto">
        <h2 className="mb-8 font-display text-3xl font-semibold tracking-tight text-brown sm:text-4xl">
          Elige cómo quieres celebrar
        </h2>

        {loading ? (
          <LoadingState mensaje="Cargando categorías…" />
        ) : error ? (
          <ApiErrorState mensaje={error} onReintentar={recargar} />
        ) : categorias && categorias.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {categorias.map((categoria) => (
              <CategoryCard
                key={categoria.id}
                title={categoria.nombre}
                description={categoria.descripcion ?? ''}
                image={categoria.imagen?.url ?? placeholderGenerico}
                href={rutaDeCategoria(categoria)}
              />
            ))}
          </div>
        ) : (
          <p
            role="status"
            className="rounded-xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500"
          >
            No hay categorías disponibles por el momento.
          </p>
        )}
      </div>
    </section>
  )
}
