/**
 * Servicio de notificaciones contra el backend real.
 * Endpoints (spec 10-notificaciones):
 *  - GET   /notificaciones            → data [] + meta {total_no_leidas, ...}
 *  - PATCH /notificaciones/{id}/leida → marca una como leída
 * NO decide mock/real (eso es notificationsRepository).
 */
import { apiClient } from './api'
import type { ApiEnvelope } from '../types/api'
import type {
  Notificacion,
  NotificacionesResultado,
} from '../types/notifications'

type NotificacionApi = {
  id: number
  usuario_id: number
  pedido_id: number | null
  pago_id: number | null
  tipo: Notificacion['tipo']
  titulo: string
  mensaje: string
  leida: boolean
  fecha_lectura: string | null
  creado_en: string
}

type NotificacionesMetaApi = {
  pagina_actual?: number
  por_pagina?: number
  total?: number
  total_paginas?: number
  total_no_leidas?: number
}

function aNotificacion(api: NotificacionApi): Notificacion {
  return {
    id: String(api.id),
    titulo: api.titulo,
    mensaje: api.mensaje,
    tipo: api.tipo,
    leida: api.leida,
    fecha_lectura: api.fecha_lectura,
    creado_en: api.creado_en,
    pedido_id: api.pedido_id === null ? null : String(api.pedido_id),
  }
}

/** GET /notificaciones → lista + total de no leídas. */
export async function obtenerNotificaciones(): Promise<NotificacionesResultado> {
  const { data } = await apiClient.get<
    ApiEnvelope<NotificacionApi[]> & { meta?: NotificacionesMetaApi }
  >('/notificaciones')

  return {
    notificaciones: (data.data ?? []).map(aNotificacion),
    total_no_leidas: data.meta?.total_no_leidas ?? 0,
  }
}

/** PATCH /notificaciones/{id}/leida → notificación ya marcada. */
export async function marcarNotificacionLeida(id: string): Promise<Notificacion> {
  const { data } = await apiClient.patch<ApiEnvelope<NotificacionApi>>(
    `/notificaciones/${id}/leida`,
  )
  return aNotificacion(data.data)
}
