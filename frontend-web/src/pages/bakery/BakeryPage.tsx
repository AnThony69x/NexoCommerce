import { useState } from 'react'
import { Link } from 'react-router-dom'
import BakeryHero from '../../components/bakery/BakeryHero'
import BakeryProductGrid from '../../components/bakery/BakeryProductGrid'
import { ApiErrorState, LoadingState } from '../../components/common/RequestState'
import { useAsync } from '../../hooks/useAsync'
import { listarCategorias } from '../../services/categoriesRepository'
import { CATEGORIA_REPOSTERIA, listarProductos } from '../../services/productsRepository'
import type { CategoryNode } from '../../types/category'

function incluirCategoriasActivas(categoria: CategoryNode, ids: Set<number>) {
  if (!categoria.activo) return

  ids.add(categoria.id)
  for (const hija of categoria.subcategorias) {
    incluirCategoriasActivas(hija, ids)
  }
}

async function cargarReposteria() {
  const [categorias, catalogo] = await Promise.all([listarCategorias(), listarProductos()])
  const raiz = categorias.find(
    (categoria) => categoria.activo
      && categoria.categoria_padre_id === null
      && categoria.nombre === CATEGORIA_REPOSTERIA,
  )
  const ids = new Set<number>()
  if (raiz) incluirCategoriasActivas(raiz, ids)

  return {
    subcategorias: raiz?.subcategorias.filter((categoria) => categoria.activo) ?? [],
    productos: catalogo.filter((producto) => ids.has(producto.categoria.id)),
  }
}

const claseAccion = 'font-medium text-rose-800 underline underline-offset-4 hover:text-rose-950'

export default function BakeryPage() {
  const { data, loading, error, recargar } = useAsync(cargarReposteria)
  const [categoriaId, setCategoriaId] = useState<number | null>(null)
  const seleccion = data?.subcategorias.find((categoria) => categoria.id === categoriaId)
  const productos = data?.productos ?? []
  const idsSeleccionados = new Set<number>()
  if (seleccion) incluirCategoriasActivas(seleccion, idsSeleccionados)
  const visibles = seleccion
    ? productos.filter((producto) => idsSeleccionados.has(producto.categoria.id))
    : productos

  return (
    <main>
      <BakeryHero />

      <div className="mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        {loading ? (
          <LoadingState mensaje="Cargando repostería…" />
        ) : error ? (
          <ApiErrorState mensaje={error} onReintentar={recargar} />
        ) : (
          <>
            <div role="group" aria-label="Subcategorías de repostería" className="flex flex-wrap gap-2">
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
                    <p className="mb-3">Aún no hay productos de repostería disponibles.</p>
                    <Link to="/catalogo" className={claseAccion}>Explorar catálogo</Link>
                  </>
                ) : (
                  <>
                    <p className="mb-3">Aún no hay productos en esta subcategoría.</p>
                    <button type="button" className={claseAccion} onClick={() => setCategoriaId(null)}>
                      Ver todos los productos de repostería
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {!loading && !error && visibles.length > 0 && <BakeryProductGrid products={visibles} />}
    </main>
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
