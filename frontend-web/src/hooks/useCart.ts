import { useContext } from 'react'
import { CartContext, type CartItemConfiguration, type CartProduct } from '../contexts/CartContext'

export type UseCartResult = {
  items: CartProduct[]
  totalItems: number
  subtotal: number
  total: number
  cargando: boolean
  error: string | null
  recargar: () => Promise<void>
  addItem: (product: Omit<CartProduct, 'cantidad'>, cantidad: number, configuracion?: CartItemConfiguration) => Promise<void>
  increaseQuantity: (id: string) => Promise<void>
  decreaseQuantity: (id: string) => Promise<void>
  removeItem: (id: string) => Promise<string | null>
  clearCart: () => Promise<string | null>
}

export function useCart(): UseCartResult {
  const cart = useContext(CartContext)

  if (!cart) {
    throw new Error('useCart debe usarse dentro de CartProvider')
  }

  return {
    items: cart.productos,
    totalItems: cart.totalUnidades,
    subtotal: cart.subtotal,
    total: cart.total,
    cargando: cart.cargando,
    error: cart.error,
    recargar: cart.recargar,
    addItem: cart.agregarProducto,
    increaseQuantity: cart.aumentarCantidad,
    decreaseQuantity: cart.disminuirCantidad,
    removeItem: cart.eliminarProducto,
    clearCart: cart.vaciarCarrito,
  }
}
