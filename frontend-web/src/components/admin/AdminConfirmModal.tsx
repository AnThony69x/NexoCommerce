import { useEffect, useRef } from 'react'

type AdminConfirmModalProps = {
  abierto: boolean
  titulo: string
  descripcion: string
  textoConfirmar?: string
  onConfirmar: () => void
  onCancelar: () => void
}

export default function AdminConfirmModal({
  abierto,
  titulo,
  descripcion,
  textoConfirmar = 'Confirmar',
  onConfirmar,
  onCancelar,
}: AdminConfirmModalProps) {
  const botonCancelarRef = useRef<HTMLButtonElement>(null)
  const elementoPrevioRef = useRef<HTMLElement | null>(null)
  const onCancelarRef = useRef(onCancelar)

  // Se mantiene la última función en un ref para no re-registrar el
  // listener de teclado en cada render del padre.
  useEffect(() => {
    onCancelarRef.current = onCancelar
  }, [onCancelar])

  // Escape cierra el modal, el foco entra al modal y vuelve al elemento
  // que lo abrio al cerrarse.
  useEffect(() => {
    if (!abierto) return

    elementoPrevioRef.current = document.activeElement as HTMLElement | null
    botonCancelarRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancelarRef.current()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      elementoPrevioRef.current?.focus()
    }
  }, [abierto])

  if (!abierto) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      className="fixed inset-0 z-20 flex items-center justify-center bg-stone-900/40 px-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-stone-800">{titulo}</h2>
        <p className="mt-2 text-sm text-stone-600">{descripcion}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={botonCancelarRef}
            type="button"
            onClick={onCancelar}
            className="inline-flex min-h-10 items-center rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-500"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="inline-flex min-h-10 items-center rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}
