import { apiClient } from './api'
import type { ApiEnvelope } from '../types/api'
import type { CartProduct } from '../contexts/CartContext'
import type { CartItemConfiguration } from '../contexts/CartContext'
import { imagenProducto } from '../utils/imagenProducto'

type CarritoApi = {
  items: Array<{
    id: number
    producto_id: number
    nombre: string
    imagen_principal_url: string | null
    cantidad: number
    precio_unitario: number
    disponible: boolean
    comentario?: string | null
    configuracion?: {
      tipo: string
      id: number | null
      nombre: string | null
      costo_adicional: number
    } | null
  }>
  subtotal: number
  total: number
}

export type CarritoSnapshot = {
  productos: CartProduct[]
  subtotal: number
  total: number
}

function mapearCarrito(carrito: CarritoApi): CarritoSnapshot {
  return {
    productos: carrito.items.map((item) => ({
      id: String(item.id),
      nombre: item.nombre,
      imagen: imagenProducto(item.imagen_principal_url),
      precioUnitario: Number(item.precio_unitario),
      categoría: 'Producto',
      cantidad: Number(item.cantidad),
      stock: item.disponible ? null : 0,
      comentario: item.comentario ?? null,
      configuracion: item.configuracion
        ? {
            tipo: item.configuracion.tipo,
            id: item.configuracion.id === null ? null : Number(item.configuracion.id),
            nombre: item.configuracion.nombre ?? (item.configuracion.tipo === 'PERSONALIZADO' ? 'Diseño personalizado' : null),
            costo_adicional: Number(item.configuracion.costo_adicional),
          }
        : null,
    })),
    subtotal: Number(carrito.subtotal),
    total: Number(carrito.total),
  }
}

async function actualizarCarrito(url = '/carrito'): Promise<CarritoSnapshot> {
  const respuesta = await apiClient.get<ApiEnvelope<CarritoApi>>(url)
  return mapearCarrito(respuesta.data.data)
}

export const obtenerCarrito = (): Promise<CarritoSnapshot> => actualizarCarrito()

export async function agregarAlCarrito(
  productoId: number,
  cantidad: number,
  configuracion: CartItemConfiguration = {},
): Promise<CarritoSnapshot> {
  const respuesta = await apiClient.post<ApiEnvelope<CarritoApi>>('/carrito/items', {
    producto_id: productoId,
    cantidad,
    ...configuracion,
  })
  return mapearCarrito(respuesta.data.data)
}

export async function actualizarCantidadCarrito(
  id: string,
  cantidad: number,
): Promise<CarritoSnapshot> {
  const respuesta = await apiClient.put<ApiEnvelope<CarritoApi>>(`/carrito/items/${id}`, {
    cantidad,
  })
  return mapearCarrito(respuesta.data.data)
}

export async function eliminarDelCarrito(id: string): Promise<CarritoSnapshot> {
  const respuesta = await apiClient.delete<ApiEnvelope<CarritoApi>>(`/carrito/items/${id}`)
  return mapearCarrito(respuesta.data.data)
}

export async function vaciarCarritoRemoto(): Promise<CarritoSnapshot> {
  const respuesta = await apiClient.delete<ApiEnvelope<CarritoApi>>('/carrito')
  return mapearCarrito(respuesta.data.data)
}
