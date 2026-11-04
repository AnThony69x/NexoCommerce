type LoadingStateProps = {
  mensaje?: string
}

export function LoadingState({ mensaje = 'Cargando…' }: LoadingStateProps) {
  return (
    <p
      role="status"
      aria-live="polite"
      className="rounded-xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500"
    >
      {mensaje}
    </p>
  )
}

type ApiErrorStateProps = {
  mensaje: string
  onReintentar?: () => void
}

export function ApiErrorState({ mensaje, onReintentar }: ApiErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center"
    >
      <p className="text-sm font-semibold text-rose-800">
        No se pudo cargar la información
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-rose-700">{mensaje}</p>
      {onReintentar && (
        <button
          type="button"
          onClick={onReintentar}
          className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
