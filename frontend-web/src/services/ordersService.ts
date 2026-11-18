import { apiClient } from './api'
import type { ApiEnvelope, ApiEnvelopePaginado } from '../types/api'
import type { PaymentMethod } from '../types/checkout'
import type { AdminOrder, AdminOrderDetail } from '../types/admin'

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
  fechaEntrega: string
  metodoPago: PaymentMethod
  items: NuevoPedidoItem[]
  subtotal: number
  envio: number
  total: number
}

type PedidoApi = {
  id: number
  fecha_entrega: string
  estado: AdminOrder['estado'] | 'CANCELADO'
  subtotal: number
  total: number
  tipo_entrega?: 'RETIRO' | 'DOMICILIO'
  direccion_entrega?: string | null
  telefono_contacto?: string | null
  hora_entrega?: string | null
  items?: Array<{
    id: number
    nombre_producto: string
    cantidad: number
    precio_unitario: number
    subtotal: number
    nombre_diseno?: string | null
    indicaciones?: string | null
  }>
  pago?: { id: number; metodo: PaymentMethod; estado: string } | null
}

function mapearPedido(pedido: PedidoApi): AdminOrder {
  return {
    id: String(pedido.id),
    numero: `#${pedido.id}`,
    clienteNombre: '',
    clienteCorreo: '',
    clienteTelefono: pedido.telefono_contacto ?? '',
    fecha_entrega: pedido.fecha_entrega,
    subtotal: Number(pedido.subtotal),
    total: Number(pedido.total),
    estado: pedido.estado,
    detalles: (pedido.items ?? []).map((item): AdminOrderDetail => ({
      id: String(item.id),
      productoNombre: item.nombre_producto,
      cantidad: item.cantidad,
      precio_unitario: Number(item.precio_unitario),
      subtotal: Number(item.subtotal),
      personalizacion: item.nombre_diseno ?? item.indicaciones ?? undefined,
    })),
    direccion: pedido.direccion_entrega ?? (pedido.tipo_entrega === 'RETIRO' ? 'Retiro en tienda' : ''),
    metodo_pago: pedido.pago?.metodo,
    pago_estado: pedido.pago?.estado as AdminOrder['pago_estado'],
  }
}

export async function crearPedido(input: CrearPedidoInput): Promise<AdminOrder> {
  const { data } = await apiClient.post<ApiEnvelope<PedidoApi>>('/pedidos', {
    fecha_entrega: input.fechaEntrega,
    total_esperado: input.total.toFixed(2),
    tipo_entrega: input.direccion.trim() ? 'DOMICILIO' : 'RETIRO',
    direccion_entrega: input.direccion.trim() || undefined,
    telefono_contacto: input.clienteTelefono.trim() || undefined,
  })
  return mapearPedido(data.data)
}

export async function listarMisPedidos(): Promise<AdminOrder[]> {
  const primera = await apiClient.get<ApiEnvelopePaginado<PedidoApi>>('/pedidos', {
    params: { page: 1 },
  })
  const pedidos = [...primera.data.data]
  const paginas = Math.min(primera.data.meta.total_paginas ?? 1, 100)
  for (let page = 2; page <= paginas; page += 1) {
    const { data } = await apiClient.get<ApiEnvelopePaginado<PedidoApi>>('/pedidos', {
      params: { page },
    })
    pedidos.push(...data.data)
  }
  return pedidos.map(mapearPedido)
}

export async function obtenerMiPedido(id: string): Promise<AdminOrder | null> {
  const { data } = await apiClient.get<ApiEnvelope<PedidoApi>>(`/pedidos/${id}`)
  return mapearPedido(data.data)
}
