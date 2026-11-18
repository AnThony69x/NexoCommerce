import { useState, type ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { ApiErrorState, LoadingState } from '../common/RequestState'
import { useAsync } from '../../hooks/useAsync'
import { listarCategorias } from '../../services/categoriesRepository'
import { listarProductos } from '../../services/productsRepository'
import type { Product } from '../../types/product'
import { incluirCategoriasActivas } from '../../utils/categoryTree'

async function cargarCatalogo(nombreCategoria: string) {
  const [categorias, catalogo] = await Promise.all([listarCategorias(), listarProductos()])
  const raiz = categorias.find(
    (categoria) => categoria.activo
      && categoria.categoria_padre_id === null
      && categoria.nombre === nombreCategoria,
  )
  const ids = new Set<number>()
  if (raiz) incluirCategoriasActivas(raiz, ids)

  return {
    subcategorias: raiz?.subcategorias.filter((categoria) => categoria.activo) ?? [],
    productos: catalogo.filter((producto) => ids.has(producto.categoria.id)),
  }
}

const claseAccion = 'font-medium text-rose-800 underline underline-offset-4 hover:text-rose-950'

type CategoryCatalogProps = {
  categoria: string
  seccion: string
  verTodos: string
  ProductGrid: ComponentType<{ products: Product[] }>
}

export default function CategoryCatalog({ categoria, seccion, verTodos, ProductGrid }: CategoryCatalogProps) {
  const { data, loading, error, recargar } = useAsync(() => cargarCatalogo(categoria), [categoria])
  const [categoriaId, setCategoriaId] = useState<number | null>(null)
  const seleccion = data?.subcategorias.find((categoria) => categoria.id === categoriaId)
  const productos = data?.productos ?? []
  const idsSeleccionados = new Set<number>()
  if (seleccion) incluirCategoriasActivas(seleccion, idsSeleccionados)
  const visibles = seleccion
    ? productos.filter((producto) => idsSeleccionados.has(producto.categoria.id))
    : productos

  return (
    <>

      <div className="mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        {loading ? (
          <LoadingState mensaje={`Cargando ${seccion}…`} />
        ) : error ? (
          <ApiErrorState mensaje={error} onReintentar={recargar} />
        ) : (
          <>
            <div role="group" aria-label={`Subcategorías de ${seccion}`} className="flex flex-wrap gap-2">
              <FiltroCategoria activo={!seleccion} onClick={() => setCategoriaId(null)}>
                Todas
              </FiltroCategoria>
              {data?.subcategorias.map((categoria) => (
                <FiltroCategoria
                  key={categoria.id}
                  activo={seleccion?.id === categoria.id}
                  onClick={() => setCategoriaId(categoria.id)}
                >
                  {categoria.nombre}
                </FiltroCategoria>
              ))}
            </div>

            {visibles.length === 0 && (
              <div className="my-8 rounded-xl border border-stone-200 p-8 text-center text-sm text-stone-600">
                {productos.length === 0 ? (
                  <>
                    <p className="mb-3">Aún no hay productos de {seccion} disponibles.</p>
                    <Link to="/catalogo" className={claseAccion}>Explorar catálogo</Link>
                  </>
                ) : (
                  <>
                    <p className="mb-3">Aún no hay productos en esta subcategoría.</p>
                    <button type="button" className={claseAccion} onClick={() => setCategoriaId(null)}>
                      {verTodos}
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {!loading && !error && visibles.length > 0 && <ProductGrid products={visibles} />}
    </>
  )
}

function FiltroCategoria({ activo, children, onClick }: {
  activo: boolean
  children: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={`min-h-10 rounded-full border px-4 py-2 text-sm font-medium ${
        activo ? 'border-rose-800 bg-rose-800 text-white' : 'border-stone-300 bg-white text-stone-700 hover:border-rose-800'
      }`}
    >
      {children}
    </button>
  )
}
