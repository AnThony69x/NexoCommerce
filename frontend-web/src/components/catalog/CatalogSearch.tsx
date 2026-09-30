type CatalogSearchProps = {
  searchTerm: string
  onSearchChange: (value: string) => void
}

export default function CatalogSearch({
  searchTerm,
  onSearchChange,
}: CatalogSearchProps) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-stone-800">Buscador</h2>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Buscar productos..."
          aria-label="Buscar productos"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className="min-h-11 flex-1 rounded-lg border border-stone-300 px-4 py-3 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-stone-500"
        />
        <button
          type="button"
          aria-label="Buscar"
          className="min-h-11 rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700"
        >
          Buscar
        </button>
      </div>
    </section>
  )
}
