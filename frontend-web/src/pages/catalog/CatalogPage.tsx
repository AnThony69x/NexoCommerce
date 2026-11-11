import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CatalogFilters, {
  type RangoPrecio,
} from '../../components/catalog/CatalogFilters'
import CatalogPagination from '../../components/catalog/CatalogPagination'
import CatalogSearch from '../../components/catalog/CatalogSearch'
import ProductGrid from '../../components/catalog/ProductGrid'
import { ApiErrorState, LoadingState } from '../../components/common/RequestState'
import { useAsync } from '../../hooks/useAsync'
import { listarCategorias } from '../../services/categoriesRepository'
import { listarProductos } from '../../services/productsRepository'
import type { Product } from '../../types/product'

type OrdenCatalogo = 'destacados' | 'precio-asc' | 'precio-desc'

const OPCIONES_ORDEN: Array<{ valor: OrdenCatalogo; etiqueta: string }> = [
  { valor: 'destacados', etiqueta: 'Más destacados' },
  { valor: 'precio-asc', etiqueta: 'Precio: menor a mayor' },
  { valor: 'precio-desc', etiqueta: 'Precio: mayor a menor' },
]

const ETIQUETAS_PRECIO: Record<RangoPrecio, string> = {
  todos: '',
  'menos-20': 'Menos de $20',
  '20-40': '$20 – $40',
  'mas-40': 'Más de $40',
}

const PRODUCTOS_POR_PAGINA = 9

function coincidePrecio(precio: number, rango: RangoPrecio): boolean {
  switch (rango) {
    case 'menos-20':
      return precio < 20
    case '20-40':
      return precio >= 20 && precio <= 40
    case 'mas-40':
      return precio > 40
    case 'todos':
      return true
  }
}

function ordenar(lista: Product[], orden: OrdenCatalogo): Product[] {
  if (orden === 'precio-asc') {
    return [...lista].sort((a, b) => a.precio - b.precio)
  }
  if (orden === 'precio-desc') {
    return [...lista].sort((a, b) => b.precio - a.precio)
  }
  return lista
}

export default function CatalogPage() {
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get('search') ?? '',
  )
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<
    string[]
  >([])
  const [rangoPrecio, setRangoPrecio] = useState<RangoPrecio>('todos')
  const [soloDisponible, setSoloDisponible] = useState(false)
  const [orden, setOrden] = useState<OrdenCatalogo>('destacados')
  const [currentPage, setCurrentPage] = useState(1)

  const {
    data: productos,
    loading,
    error,
    recargar,
  } = useAsync(listarProductos)

  // Categorías del sidebar (mock o API real según el modo).
  const {
    data: categorias,
    loading: cargandoCategorias,
    error: errorCategorias,
    recargar: recargarCategorias,
  } = useAsync(listarCategorias, [])

  const nombresCategorias = (categorias ?? []).map(
    (categoria) => categoria.nombre,
  )

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredProducts = (productos ?? []).filter((product) => {
    const matchesName = product.nombre
      .toLowerCase()
      .includes(normalizedSearchTerm)
    const matchesCategory =
      categoriasSeleccionadas.length === 0 ||
      categoriasSeleccionadas.includes(product.categoria.nombre)
    const matchesPrice = coincidePrecio(product.precio, rangoPrecio)
    // stock null = sin control de inventario → disponible.
    const matchesAvailability =
      !soloDisponible ||
      (product.activo && (product.stock === null || product.stock > 0))

    return matchesName && matchesCategory && matchesPrice && matchesAvailability
  })
  const orderedProducts = ordenar(filteredProducts, orden)
  const totalPages = Math.max(
    1,
    Math.ceil(orderedProducts.length / PRODUCTOS_POR_PAGINA),
  )
  const paginatedProducts = orderedProducts.slice(
    (currentPage - 1) * PRODUCTOS_POR_PAGINA,
    currentPage * PRODUCTOS_POR_PAGINA,
  )

  const hayFiltrosActivos =
    categoriasSeleccionadas.length > 0 ||
    rangoPrecio !== 'todos' ||
    soloDisponible

  function limpiarFiltros() {
    setCategoriasSeleccionadas([])
    setRangoPrecio('todos')
    setSoloDisponible(false)
    setCurrentPage(1)
  }

  return (
    <main className="min-h-screen bg-cream px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto space-y-8">
        <section>
          <h1 className="font-display text-4xl font-semibold text-brown sm:text-5xl">
            Tienda
          </h1>
        </section>

        {/* Buscador + orden */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
          <CatalogSearch
            searchTerm={searchTerm}
            onSearchChange={(value) => {
              setSearchTerm(value)
              setCurrentPage(1)
            }}
          />

          <div className="sm:w-64">
            <label
              htmlFor="orden-catalogo"
              className="block text-xs font-semibold uppercase tracking-[0.14em] text-brown-soft"
            >
              Ordenar por
            </label>
            <select
              id="orden-catalogo"
              value={orden}
              onChange={(event) => {
                setOrden(event.target.value as OrdenCatalogo)
                setCurrentPage(1)
              }}
              className="mt-3 min-h-11 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-brown outline-none focus:border-rose-brand"
            >
              {OPCIONES_ORDEN.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.etiqueta}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chips de filtros activos */}
        <div className="flex flex-wrap items-center gap-2">
          {categoriasSeleccionadas.map((nombre) => (
            <button
              key={nombre}
              type="button"
              onClick={() => {
                setCategoriasSeleccionadas((actuales) =>
                  actuales.filter((actual) => actual !== nombre),
                )
                setCurrentPage(1)
              }}
              aria-label={`Quitar filtro ${nombre}`}
              className="inline-flex items-center gap-2 rounded-full bg-rose-brand px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-rose-brand-dark"
            >
              {nombre}
              <span aria-hidden="true">×</span>
            </button>
          ))}

          {rangoPrecio !== 'todos' && (
            <button
              type="button"
              onClick={() => {
                setRangoPrecio('todos')
                setCurrentPage(1)
              }}
              aria-label="Quitar filtro de precio"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-brown-soft transition-colors hover:border-rose-brand hover:text-rose-brand-dark"
            >
              {ETIQUETAS_PRECIO[rangoPrecio]}
              <span aria-hidden="true">×</span>
            </button>
          )}

          {soloDisponible && (
            <button
              type="button"
              onClick={() => {
                setSoloDisponible(false)
                setCurrentPage(1)
              }}
              aria-label="Quitar filtro de disponibilidad"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-brown-soft transition-colors hover:border-rose-brand hover:text-rose-brand-dark"
            >
              Disponible ahora
              <span aria-hidden="true">×</span>
            </button>
          )}

          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="ml-1 text-xs font-medium text-brown-soft underline underline-offset-2 transition-colors hover:text-rose-brand-dark"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Sidebar + resultados */}
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <CatalogFilters
            categorias={nombresCategorias}
            categoriasSeleccionadas={categoriasSeleccionadas}
            onCategoriasChange={(nombres) => {
              setCategoriasSeleccionadas(nombres)
              setCurrentPage(1)
            }}
            categoriasCargando={cargandoCategorias}
            categoriasError={errorCategorias}
            onReintentarCategorias={recargarCategorias}
            rangoPrecio={rangoPrecio}
            onRangoPrecioChange={(valor) => {
              setRangoPrecio(valor)
              setCurrentPage(1)
            }}
            soloDisponible={soloDisponible}
            onSoloDisponibleChange={(valor) => {
              setSoloDisponible(valor)
              setCurrentPage(1)
            }}
          />

          <div>
            {loading ? (
              <LoadingState mensaje="Cargando catálogo…" />
            ) : error ? (
              <ApiErrorState mensaje={error} onReintentar={recargar} />
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between gap-4">
                  <p className="text-sm text-brown-soft">
                    {orderedProducts.length} producto
                    {orderedProducts.length === 1 ? '' : 's'}
                  </p>
                  <span className="flex items-center gap-1.5 text-xs text-brown-soft">
                    Cuadrícula
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="h-4 w-4"
                    >
                      <rect x="4" y="4" width="7" height="7" rx="1" />
                      <rect x="13" y="4" width="7" height="7" rx="1" />
                      <rect x="4" y="13" width="7" height="7" rx="1" />
                      <rect x="13" y="13" width="7" height="7" rx="1" />
                    </svg>
                  </span>
                </div>

                <ProductGrid
                  productos={paginatedProducts}
                  badgeDestacado={orden === 'destacados'}
                />

                <div className="mt-10">
                  <CatalogPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
