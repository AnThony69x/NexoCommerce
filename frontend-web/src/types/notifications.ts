/**
 * Tipos del modulo de notificaciones del cliente (contrato backend:
 * GET /api/v1/notificaciones y PATCH /api/v1/notificaciones/{id}/leida).
 */

export type NotificacionTipo =
  | 'PEDIDO_CONFIRMADO'
  | 'PEDIDO_EN_PREPARACION'
  | 'PEDIDO_LISTO'
  | 'PEDIDO_ENTREGADO'
  | 'PAGO_APROBADO'
  | 'PAGO_RECHAZADO'
  | 'AVISO'

export type Notificacion = {
  id: string
  titulo: string
  mensaje: string
  tipo: NotificacionTipo
  leida: boolean
  fecha_lectura: string | null
  creado_en: string
  pedido_id: string | null
}

export type NotificacionesResultado = {
  notificaciones: Notificacion[]
  total_no_leidas: number
}
