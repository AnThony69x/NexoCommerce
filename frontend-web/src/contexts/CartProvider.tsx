import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { CartContext, type CartItemConfiguration, type CartProduct } from './CartContext'
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
  const [productos, setProductos] = useState<CartProduct[]>([])
  const [subtotalApi, setSubtotalApi] = useState(0)
  const [totalApi, setTotalApi] = useState(0)
  const [cargando, setCargando] = useState(!!user)
  const [error, setError] = useState<string | null>(null)

  const aplicarCarrito = useCallback((snapshot: Awaited<ReturnType<typeof obtenerCarrito>>) => {
    setProductos(snapshot.productos)
    setSubtotalApi(snapshot.subtotal)
    setTotalApi(snapshot.total)
  }, [])

  const recargar = useCallback(async () => {
    if (!user) return
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
    if (!user) {
      setError('Inicia sesión para agregar productos al carrito.')
      return
    }
    await ejecutarApi(() => agregarAlCarrito(Number(producto.id), cantidad, configuracion))
  }

  async function cambiarCantidad(id: string, cantidad: number) {
    await ejecutarApi(() => actualizarCantidadCarrito(id, cantidad))
  }

  async function eliminarProducto(id: string) {
    await ejecutarApi(() => eliminarDelCarrito(id))
  }

  async function vaciarCarrito() {
    await ejecutarApi(vaciarCarritoRemoto)
  }

  const totalUnidades = productos.reduce((suma, item) => suma + item.cantidad, 0)
  const subtotal = subtotalApi
  const costoEnvio = 0
  const total = totalApi

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
