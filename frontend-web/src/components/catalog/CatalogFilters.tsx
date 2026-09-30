type CatalogFiltersProps = {
  selectedCategory: string
  onCategoryChange: (value: string) => void
  onlyAvailable: boolean
  onAvailabilityChange: (value: boolean) => void
}

export default function CatalogFilters({
  selectedCategory,
  onCategoryChange,
  onlyAvailable,
  onAvailabilityChange,
}: CatalogFiltersProps) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-stone-800">Filtros</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-2 text-sm text-stone-600">
          <span>Categoría</span>
          <select
            value={selectedCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-700"
          >
            <option>Todas las categorías</option>
            <option>Repostería</option>
            <option>Detalles personalizados</option>
            <option>Sublimación</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-stone-600">
          <span>Rango de precio</span>
          <select className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-700">
            <option>Cualquier precio</option>
            <option>Hasta $20</option>
            <option>$20 - $40</option>
            <option>Más de $40</option>
          </select>
        </label>

        <label className="flex items-center gap-3 self-end text-sm text-stone-600 sm:col-span-2 lg:col-span-1">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(event) => onAvailabilityChange(event.target.checked)}
            className="h-4 w-4 rounded border-stone-300 accent-stone-800"
          />
          <span>Disponible</span>
        </label>
      </div>
    </section>
  )
}
