type CatalogSearchProps = {
  searchTerm: string
  onSearchChange: (value: string) => void
}

export default function CatalogSearch({
  searchTerm,
  onSearchChange,
}: CatalogSearchProps) {
  return (
    <div className="flex-1">
      <label
        htmlFor="buscador-catalogo"
        className="block text-xs font-semibold uppercase tracking-[0.14em] text-brown-soft"
      >
        Buscar en la tienda
      </label>
      <input
        id="buscador-catalogo"
        type="search"
        placeholder="Busca tortas, regalos o sublimación…"
        aria-label="Buscar en la tienda"
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        className="mt-3 min-h-11 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-brown outline-none placeholder:text-brown-soft/70 focus:border-rose-brand"
      />
    </div>
  )
}
