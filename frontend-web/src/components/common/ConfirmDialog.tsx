import { useRef, useState } from 'react'
import Dialog from './Dialog'

type ConfirmDialogProps = {
  abierto: boolean
  titulo: string
  descripcion: string
  textoConfirmar?: string
  onConfirmar: () => void | Promise<void>
  onCancelar: () => void
}

function Confirmacion({ titulo, descripcion, textoConfirmar = 'Confirmar', onConfirmar, onCancelar }: ConfirmDialogProps) {
  const pendiente = useRef(false)
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState<string>()

  async function confirmar() {
    if (pendiente.current) return
    pendiente.current = true
    setOcupado(true)
    setError(undefined)
    try {
      await onConfirmar()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo completar la acción.')
    } finally {
      pendiente.current = false
      setOcupado(false)
    }
  }

  return (
    <Dialog titulo={titulo} onCerrar={onCancelar} ocupado={ocupado}>
      <p className="text-sm text-stone-600">{descripcion}</p>
      {error && <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>}
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" disabled={ocupado} onClick={onCancelar} className="rounded-lg border px-4 py-2">Cancelar</button>
        <button type="button" disabled={ocupado} onClick={() => void confirmar()} className="rounded-lg bg-stone-800 px-4 py-2 text-white disabled:opacity-50">
          {ocupado ? 'Guardando…' : textoConfirmar}
        </button>
      </div>
    </Dialog>
  )
}

export default function ConfirmDialog(props: ConfirmDialogProps) {
  return props.abierto ? <Confirmacion {...props} /> : null
}
