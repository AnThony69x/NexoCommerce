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
