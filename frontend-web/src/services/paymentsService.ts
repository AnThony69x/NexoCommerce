import { apiClient } from './api'
import { config } from '../config/app'
import type { ApiEnvelope } from '../types/api'
import type { PaymentMethod } from '../types/checkout'

type PagoApi = { id: number; pedido_id: number; metodo: PaymentMethod; estado: string; monto: number }

export async function registrarPago(datos: {
  pedidoId: string
  monto: number
  metodo: PaymentMethod
  referencia?: string
  comprobante?: File | null
}): Promise<void> {
  if (config.mockMode) return

  let multimediaId: number | undefined
  if (datos.metodo === 'TRANSFERENCIA') {
    if (!datos.comprobante) throw new Error('Selecciona el comprobante de transferencia.')
    const formulario = new FormData()
    formulario.append('archivo', datos.comprobante)
    formulario.append('destino', 'comprobantes')
    const subida = await apiClient.post<ApiEnvelope<{ id: number }>>('/multimedia', formulario)
    multimediaId = subida.data.data.id
  }

  await apiClient.post<ApiEnvelope<PagoApi>>('/pagos', {
    pedido_id: Number(datos.pedidoId),
    metodo: datos.metodo,
    monto: datos.monto.toFixed(2),
    ...(datos.metodo === 'TRANSFERENCIA'
      ? { multimedia_id: multimediaId }
      : { referencia_pasarela: datos.referencia?.trim() }),
  })
}
