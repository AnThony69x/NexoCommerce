import { useContext } from 'react'
import { CartContext, type CartProduct } from '../contexts/CartContext'

export type UseCartResult = {
  items: CartProduct[]
  totalItems: number
  subtotal: number
  total: number
  addItem: (product: Omit<CartProduct, 'cantidad'>, cantidad: number) => void
  increaseQuantity: (id: string) => void
  decreaseQuantity: (id: string) => void
  removeItem: (id: string) => void
  clearCart: () => void
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
    addItem: cart.agregarProducto,
    increaseQuantity: cart.aumentarCantidad,
    decreaseQuantity: cart.disminuirCantidad,
    removeItem: cart.eliminarProducto,
    clearCart: cart.vaciarCarrito,
  }
}
