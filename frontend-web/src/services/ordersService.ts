import type { PaymentMethod } from '../types/checkout'
import type { AdminOrder, AdminOrderDetail } from '../types/admin'

/**
 * Servicio de pedidos del cliente.
 * Implementación mock en memoria (vive mientras dure la sesión de la app;
 * se reinicia al recargar, igual que el resto de mocks). Cuando el backend
 * esté disponible: POST /pedidos, GET /pedidos y GET /pedidos/:id vía services/api.ts.
 */

export type NuevoPedidoItem = {
  productoNombre: string
  cantidad: number
  precioUnitario: number
  personalizacion?: string
}

export type CrearPedidoInput = {
  clienteNombre: string
  clienteCorreo: string
  clienteTelefono: string
  direccion: string
  referencia: string
  fechaEntrega: string
  metodoPago: PaymentMethod
  items: NuevoPedidoItem[]
  subtotal: number
  envio: number
  total: number
}

let pedidosMock: AdminOrder[] = []
let secuencia = 100

function demoraMock<T>(valor: T, ms = 150): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(valor), ms)
  })
}

function construirDetalles(
  pedidoId: string,
  items: NuevoPedidoItem[],
): AdminOrderDetail[] {
  return items.map((item, indice) => ({
    id: `${pedidoId}-det-${indice + 1}`,
    productoNombre: item.productoNombre,
    cantidad: item.cantidad,
    precio_unitario: item.precioUnitario,
    subtotal: item.precioUnitario * item.cantidad,
    personalizacion: item.personalizacion,
  }))
}

export async function crearPedido(input: CrearPedidoInput): Promise<AdminOrder> {
  secuencia += 1
  const id = `ped-mock-${secuencia}`
  const pedido: AdminOrder = {
    id,
    numero: `PED-${secuencia}`,
    clienteNombre: input.clienteNombre,
    clienteCorreo: input.clienteCorreo,
    clienteTelefono: input.clienteTelefono,
    fecha_entrega: input.fechaEntrega,
    subtotal: input.subtotal,
    total: input.total,
    estado: 'PENDIENTE',
    detalles: construirDetalles(id, input.items),
    direccion: input.direccion,
    referencia: input.referencia,
    metodo_pago: input.metodoPago,
  }
  pedidosMock = [pedido, ...pedidosMock]
  return demoraMock(pedido)
}

export async function listarMisPedidos(): Promise<AdminOrder[]> {
  return demoraMock([...pedidosMock])
}

export async function obtenerMiPedido(id: string): Promise<AdminOrder | null> {
  return demoraMock(pedidosMock.find((item) => item.id === id) ?? null)
}
