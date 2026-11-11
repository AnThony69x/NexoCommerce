import { useNavigate } from 'react-router-dom'

type BackButtonProps = {
  fallback?: string
}

/**
 * Enlace "← Volver" discreto, pensado para integrarse dentro del encabezado
 * de una página (hero, cabecera de sección) sin caja ni bordes: no compite
 * con el contenido ni ocupa una franja propia.
 */
export default function BackButton({ fallback = '/' }: BackButtonProps) {
  const navigate = useNavigate()

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate(fallback)
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="group inline-flex items-center gap-1.5 rounded text-sm font-medium text-stone-500 transition-colors hover:text-rose-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-brand/40"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
      >
        <path d="M19 12H5" />
        <path d="m11 18-6-6 6-6" />
      </svg>
      Volver
    </button>
  )
}
