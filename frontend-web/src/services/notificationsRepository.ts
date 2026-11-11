/**
 * Repositorio de notificaciones: única puerta de acceso de la UI a los avisos
 * del cliente.
 *
 *   VITE_MOCK_MODE=true  → datos locales (data/notificaciones.mock) en memoria;
 *                          marcar como leída se conserva durante la sesión.
 *   VITE_MOCK_MODE=false → notificationsService (API real).
 *
 * En modo real no hay fallback silencioso: si el backend falla, el error se
 * propaga para que la UI muestre su estado de error con reintento.
 */
import { config } from '../config/app'
import { notificacionesMock } from '../data/notificaciones.mock'
import {
  marcarNotificacionLeida,
  obtenerNotificaciones,
} from './notificationsService'
import type { Notificacion, NotificacionesResultado } from '../types/notifications'

/** Estado mock en memoria (como el resto de mocks: vive durante la sesión). */
let notificacionesMockEstado: Notificacion[] = notificacionesMock.map(
  (item) => ({ ...item }),
)

function demoraMock<T>(valor: T, ms = 150): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(valor), ms)
  })
}

/** Lista los avisos del cliente (más recientes primero). */
export async function listarNotificaciones(): Promise<NotificacionesResultado> {
  if (!config.mockMode) {
    return obtenerNotificaciones()
  }

  const notificaciones = [...notificacionesMockEstado].sort((a, b) =>
    b.creado_en.localeCompare(a.creado_en),
  )

  return demoraMock({
    notificaciones,
    total_no_leidas: notificaciones.filter((item) => !item.leida).length,
  })
}

/** Marca un aviso como leído. */
export async function marcarLeida(id: string): Promise<Notificacion> {
  if (!config.mockMode) {
    return marcarNotificacionLeida(id)
  }

  let actualizada: Notificacion | null = null
  notificacionesMockEstado = notificacionesMockEstado.map((item) => {
    if (item.id !== id) return item
    actualizada = { ...item, leida: true, fecha_lectura: new Date().toISOString() }
    return actualizada
  })

  if (!actualizada) {
    throw new Error('El aviso no existe.')
  }

  return demoraMock(actualizada)
}
