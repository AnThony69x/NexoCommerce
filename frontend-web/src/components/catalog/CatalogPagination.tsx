type CatalogPaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const CLASE_CIRCULO =
  'flex h-10 w-10 items-center justify-center rounded-full border text-sm transition-colors'

export default function CatalogPagination({
  currentPage,
  totalPages,
  onPageChange,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  )

  return (
    <nav
      aria-label="Paginación del catálogo"
      className="flex items-center justify-center gap-2"
    >
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Página anterior"
        className={`${CLASE_CIRCULO} border-stone-300 text-brown-soft hover:border-rose-brand hover:text-rose-brand-dark disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-stone-300 disabled:hover:text-brown-soft`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="m14 6-6 6 6 6" />
        </svg>
      </button>

      {pageNumbers.map((page) => (
        <button
          key={page}
          type="button"
          aria-current={page === currentPage ? 'page' : undefined}
          aria-label={`Página ${page}`}
          onClick={() => onPageChange(page)}
          className={
            page === currentPage
              ? `${CLASE_CIRCULO} border-rose-brand-dark bg-rose-brand-dark font-medium text-white`
              : `${CLASE_CIRCULO} border-stone-300 text-brown-soft hover:border-rose-brand hover:text-rose-brand`
          }
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Página siguiente"
        className={`${CLASE_CIRCULO} border-stone-300 text-brown-soft hover:border-rose-brand hover:text-rose-brand-dark disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-stone-300 disabled:hover:text-brown-soft`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="m10 6 6 6-6 6" />
        </svg>
      </button>
    </nav>
  )
}
