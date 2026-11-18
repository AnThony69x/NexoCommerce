import { useEffect, useState } from 'react'
import AdminDialog from './AdminDialog'
import { abrirMultimediaPrivada } from '../../services/adminService'
import type { AdminPayment } from '../../types/admin'

export default function ComprobanteDialog({ pago, onCerrar }: { pago: AdminPayment; onCerrar: () => void }) {
  return (
    <AdminDialog titulo={`Comprobante de ${pago.pedidoNumero}`} onCerrar={onCerrar}>
      <ComprobantePrivado key={pago.comprobanteId} comprobanteId={pago.comprobanteId} />
      <button type="button" onClick={onCerrar} className="mt-4 rounded-lg border px-4 py-2">Cerrar</button>
    </AdminDialog>
  )
}

export function ComprobantePrivado({ comprobanteId }: { comprobanteId?: string }) {
  const [resultado, setResultado] = useState<{ url: string } | { error: string }>()
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    if (!comprobanteId) return
    let cerrado = false
    let url: string | undefined
    abrirMultimediaPrivada(comprobanteId).then((archivo) => {
      if (cerrado) {
        URL.revokeObjectURL(archivo)
        return
      }
      url = archivo
      setResultado({ url: archivo })
    }).catch((cause: unknown) => {
      if (!cerrado) setResultado({ error: cause instanceof Error ? cause.message : 'No se pudo abrir el comprobante.' })
    })
    return () => {
      cerrado = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [comprobanteId, intento])

  if (!comprobanteId) return <p>Sin comprobante adjunto</p>
  if (!resultado) return <p role="status">Cargando comprobante…</p>
  if ('error' in resultado) {
    return (
      <div>
        <p role="alert" className="text-rose-700">{resultado.error}</p>
        <button type="button" className="mt-2 font-medium underline" onClick={() => {
          setResultado(undefined)
          setIntento((actual) => actual + 1)
        }}>Reintentar</button>
      </div>
    )
  }
  return <a href={resultado.url} target="_blank" rel="noreferrer" className="font-medium underline">Abrir comprobante a tamaño completo</a>
}
