type CatalogPaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function CatalogPagination({
  currentPage,
  totalPages,
  onPageChange,
}: CatalogPaginationProps) {
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  )

  return (
    <nav
      aria-label="Paginación del catálogo"
      className="flex flex-wrap items-center justify-center gap-2 text-sm text-stone-600"
    >
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-lg border border-stone-300 px-4 py-2 text-stone-600 hover:border-stone-500 disabled:cursor-not-allowed disabled:text-stone-400"
      >
        Anterior
      </button>

      {pageNumbers.map((page) => (
        <button
          key={page}
          type="button"
          aria-current={page === currentPage ? 'page' : undefined}
          onClick={() => onPageChange(page)}
          className={
            page === currentPage
              ? 'rounded-lg bg-stone-800 px-4 py-2 font-medium text-white'
              : 'rounded-lg border border-stone-300 px-4 py-2 hover:border-stone-500'
          }
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-lg border border-stone-300 px-4 py-2 text-stone-600 hover:border-stone-500 disabled:cursor-not-allowed disabled:text-stone-400"
      >
        Siguiente
      </button>
    </nav>
  )
}
