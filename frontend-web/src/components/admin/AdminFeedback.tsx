import type { AdminFeedbackMessage } from '../../types/admin'

type AdminFeedbackProps = {
  mensaje: AdminFeedbackMessage | null
}

export default function AdminFeedback({ mensaje }: AdminFeedbackProps) {
  if (!mensaje) return null

  const clases =
    mensaje.tipo === 'exito'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-rose-200 bg-rose-50 text-rose-800'

  return (
    <p role="status" className={`rounded-xl border px-4 py-3 text-sm ${clases}`}>
      {mensaje.texto}
    </p>
  )
}
