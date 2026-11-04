/** Rangos de precio del sidebar (contrato entre la página y los filtros). */
export type RangoPrecio = 'todos' | 'menos-20' | '20-40' | 'mas-40'

const OPCIONES_PRECIO: Array<{ valor: RangoPrecio; etiqueta: string }> = [
  { valor: 'todos', etiqueta: 'Cualquier precio' },
  { valor: 'menos-20', etiqueta: 'Menos de $20' },
  { valor: '20-40', etiqueta: '$20 – $40' },
  { valor: 'mas-40', etiqueta: 'Más de $40' },
]

type CatalogFiltersProps = {
  /** Nombres de categorías (raíz del árbol) para la lista de checkboxes. */
  categorias: string[]
  /** Categorías marcadas (multi-selección; vacío = todas). */
  categoriasSeleccionadas: string[]
  onCategoriasChange: (nombres: string[]) => void
  /** true mientras se cargan las categorías (checkboxes deshabilitados). */
  categoriasCargando: boolean
  /** Mensaje de error si falló la carga; null si no hay error. */
  categoriasError: string | null
  /** Reintenta la carga de categorías cuando hubo error. */
  onReintentarCategorias: () => void
  rangoPrecio: RangoPrecio
  onRangoPrecioChange: (valor: RangoPrecio) => void
  soloDisponible: boolean
  onSoloDisponibleChange: (valor: boolean) => void
}

export default function CatalogFilters({
  categorias,
  categoriasSeleccionadas,
  onCategoriasChange,
  categoriasCargando,
  categoriasError,
  onReintentarCategorias,
  rangoPrecio,
  onRangoPrecioChange,
  soloDisponible,
  onSoloDisponibleChange,
}: CatalogFiltersProps) {
  function alternarCategoria(nombre: string, marcada: boolean) {
    onCategoriasChange(
      marcada
        ? [...categoriasSeleccionadas, nombre]
        : categoriasSeleccionadas.filter((actual) => actual !== nombre),
    )
  }

  return (
    <aside
      aria-label="Filtros del catálogo"
      className="h-fit rounded-2xl border border-stone-200 bg-white p-5"
    >
      {/* Categoría */}
      <fieldset disabled={categoriasCargando}>
        <legend className="text-sm font-semibold text-brown">Categoría</legend>

        <div className="mt-3 space-y-2">
          {categorias.map((nombre) => (
            <label
              key={nombre}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-brown-soft"
            >
              <input
                type="checkbox"
                checked={categoriasSeleccionadas.includes(nombre)}
                onChange={(event) =>
                  alternarCategoria(nombre, event.target.checked)
                }
                className="h-4 w-4 rounded border-stone-300 accent-rose-brand"
              />
              <span>{nombre}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {categoriasCargando && (
        <p role="status" aria-live="polite" className="mt-3 text-xs text-brown-soft">
          Cargando categorías…
        </p>
      )}

      {!categoriasCargando && categoriasError && (
        <p role="alert" className="mt-3 text-xs text-rose-brand-dark">
          {categoriasError}{' '}
          <button
            type="button"
            onClick={onReintentarCategorias}
            className="font-medium underline"
          >
            Reintentar
          </button>
        </p>
      )}

      {!categoriasCargando && !categoriasError && categorias.length === 0 && (
        <p className="mt-3 text-xs text-brown-soft">
          No hay categorías disponibles.
        </p>
      )}

      <hr className="my-5 border-stone-200" />

      {/* Precio */}
      <fieldset>
        <legend className="text-sm font-semibold text-brown">Precio</legend>
        <div className="mt-3 space-y-2">
          {OPCIONES_PRECIO.map((opcion) => (
            <label
              key={opcion.valor}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-brown-soft"
            >
              <input
                type="radio"
                name="filtro-precio"
                checked={rangoPrecio === opcion.valor}
                onChange={() => onRangoPrecioChange(opcion.valor)}
                className="h-4 w-4 border-stone-300 accent-rose-brand"
              />
              <span>{opcion.etiqueta}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <hr className="my-5 border-stone-200" />

      {/* Disponibilidad */}
      <fieldset>
        <legend className="text-sm font-semibold text-brown">
          Disponibilidad
        </legend>
        <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-brown-soft">
          <input
            type="checkbox"
            checked={soloDisponible}
            onChange={(event) => onSoloDisponibleChange(event.target.checked)}
            className="h-4 w-4 rounded border-stone-300 accent-rose-brand"
          />
          <span>Disponible ahora</span>
        </label>
      </fieldset>
    </aside>
  )
}
