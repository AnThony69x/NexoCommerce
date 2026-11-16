/**
 * Notificaciones de ejemplo para el modo mock (panel del cliente).
 * Misma forma que devuelve el backend (spec 10-notificaciones).
 */
import type { Notificacion } from '../types/notifications'

export const notificacionesMock: Notificacion[] = [
  {
    id: 'notif-1',
    titulo: 'Pago verificado',
    mensaje:
      'Recibimos tu pago por transferencia. Confirmaremos la entrega apenas se acredite.',
    tipo: 'PAGO_APROBADO',
    leida: false,
    fecha_lectura: null,
    creado_en: '2026-11-08T15:20:00.000Z',
    pedido_id: null,
  },
  {
    id: 'notif-2',
    titulo: 'Tu pedido está listo',
    mensaje:
      'El pedido PED-104 ya terminó de pasarse y está listo para retirar o entregar.',
    tipo: 'PEDIDO_LISTO',
    leida: false,
    fecha_lectura: null,
    creado_en: '2026-11-06T09:05:00.000Z',
    pedido_id: 'ped-mock-104',
  },
  {
    id: 'notif-3',
    titulo: 'Pedido confirmado',
    mensaje:
      'Recibimos tu pedido y ya entramos a la cocina. Te avisamos cuando avance.',
    tipo: 'PEDIDO_CONFIRMADO',
    leida: true,
    fecha_lectura: '2026-11-04T18:30:00.000Z',
    creado_en: '2026-11-04T17:55:00.000Z',
    pedido_id: 'ped-mock-103',
  },
  {
    id: 'notif-4',
    titulo: 'Actualiza tus datos de entrega',
    mensaje:
      'Confirma tu número de teléfono para que el repartidor pueda contactarte.',
    tipo: 'AVISO',
    leida: true,
    fecha_lectura: '2026-11-01T12:00:00.000Z',
    creado_en: '2026-10-31T08:10:00.000Z',
    pedido_id: null,
  },
]
