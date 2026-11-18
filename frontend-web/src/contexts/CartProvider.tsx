import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { CartContext, type CartItemConfiguration, type CartProduct } from './CartContext'
import { cargarCarrito, guardarCarrito } from '../storage/cartStore'
import { clampCantidad } from '../utils/validation'
import { config } from '../config/app'
import { useAuth } from '../hooks/useAuth'
import {
  agregarAlCarrito,
  actualizarCantidadCarrito,
  eliminarDelCarrito,
  obtenerCarrito,
  vaciarCarritoRemoto,
} from '../services/cartService'

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [productos, setProductos] = useState<CartProduct[]>(() =>
    config.mockMode ? cargarCarrito() : [],
  )
  const [subtotalApi, setSubtotalApi] = useState(0)
  const [totalApi, setTotalApi] = useState(0)
  const [cargando, setCargando] = useState(!config.mockMode && !!user)
  const [error, setError] = useState<string | null>(null)

  const aplicarCarrito = useCallback((snapshot: Awaited<ReturnType<typeof obtenerCarrito>>) => {
    setProductos(snapshot.productos)
    setSubtotalApi(snapshot.subtotal)
    setTotalApi(snapshot.total)
  }, [])

  const recargar = useCallback(async () => {
    if (config.mockMode || !user) return
    setCargando(true)
    setError(null)
    try {
      aplicarCarrito(await obtenerCarrito())
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo cargar el carrito.')
    } finally {
      setCargando(false)
    }
  }, [aplicarCarrito, user])

  useEffect(() => {
    if (config.mockMode) guardarCarrito(productos)
  }, [productos])

  useEffect(() => {
    if (config.mockMode) return
    if (user) {
      void recargar()
    } else {
      setProductos([])
      setSubtotalApi(0)
      setTotalApi(0)
      setCargando(false)
    }
  }, [recargar, user])

  async function ejecutarApi(accion: () => Promise<Awaited<ReturnType<typeof obtenerCarrito>>>) {
    setError(null)
    setCargando(true)
    try {
      aplicarCarrito(await accion())
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo actualizar el carrito.')
    } finally {
      setCargando(false)
    }
  }

  async function agregarProducto(
    producto: Omit<CartProduct, 'cantidad'>,
    cantidad: number,
    configuracion: CartItemConfiguration = {},
  ) {
    if (config.mockMode) {
      const stock = producto.stock ?? 999
      if (stock <= 0) return
      const segura = clampCantidad(cantidad, stock)
      if (segura < 1) return
      const tieneConfiguracion = Boolean(
        configuracion.comentario?.trim() || configuracion.diseno_torta_id ||
        configuracion.plantilla_diseno_id || configuracion.diseno_personalizado_id,
      )
      const idLinea = tieneConfiguracion
        ? `${producto.id}:${configuracion.diseno_torta_id ?? ''}:${configuracion.plantilla_diseno_id ?? ''}:${configuracion.diseno_personalizado_id ?? ''}:${configuracion.comentario?.trim() ?? ''}`
        : producto.id
      setProductos((actuales) => {
        const existente = actuales.find((item) => item.id === idLinea)
        const personalizado: Omit<CartProduct, 'cantidad'> = {
          ...producto,
          id: idLinea,
          comentario: configuracion.comentario?.trim() || null,
          configuracion: configuracion.diseno_personalizado_id
            ? { tipo: 'PERSONALIZADO', id: configuracion.diseno_personalizado_id, nombre: 'Diseño personalizado', costo_adicional: 0 }
            : null,
        }
        return existente
          ? actuales.map((item) => item.id === idLinea
            ? { ...item, cantidad: clampCantidad(item.cantidad + segura, item.stock ?? 999) }
            : item)
          : [...actuales, { ...personalizado, cantidad: segura }]
      })
      return
    }
    if (!user) {
      setError('Inicia sesión para agregar productos al carrito.')
      return
    }
    await ejecutarApi(() => agregarAlCarrito(Number(producto.id), cantidad, configuracion))
  }

  async function cambiarCantidad(id: string, cantidad: number) {
    if (config.mockMode) {
      setProductos((actuales) => actuales.map((item) => item.id === id
        ? { ...item, cantidad: Math.max(1, clampCantidad(cantidad, item.stock ?? 999)) }
        : item))
      return
    }
    await ejecutarApi(() => actualizarCantidadCarrito(id, cantidad))
  }

  async function eliminarProducto(id: string) {
    if (config.mockMode) {
      setProductos((actuales) => actuales.filter((item) => item.id !== id))
      return
    }
    await ejecutarApi(() => eliminarDelCarrito(id))
  }

  async function vaciarCarrito() {
    if (config.mockMode) {
      setProductos([])
      return
    }
    await ejecutarApi(vaciarCarritoRemoto)
  }

  const totalUnidades = productos.reduce((suma, item) => suma + item.cantidad, 0)
  const subtotal = config.mockMode
    ? productos.reduce((suma, item) => suma + item.precioUnitario * item.cantidad, 0)
    : subtotalApi
  const costoEnvio = config.mockMode && productos.length > 0 ? 5 : 0
  const total = config.mockMode ? subtotal + costoEnvio : totalApi

  return (
    <CartContext.Provider value={{
      productos,
      totalUnidades,
      subtotal,
      costoEnvio,
      total,
      cargando,
      error,
      recargar,
      agregarProducto,
      aumentarCantidad: (id) => cambiarCantidad(id, (productos.find((item) => item.id === id)?.cantidad ?? 0) + 1),
      disminuirCantidad: (id) => cambiarCantidad(
        id,
        Math.max(1, (productos.find((item) => item.id === id)?.cantidad ?? 1) - 1),
      ),
      eliminarProducto,
      vaciarCarrito,
    }}>
      {children}
    </CartContext.Provider>
  )
}
