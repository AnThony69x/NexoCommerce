import { createContext } from 'react'

export type CartProduct = {
  id: string
  nombre: string
  imagen: string
  precioUnitario: number
  categoría: string
  cantidad: number
  /** Stock vigente al agregar. 0 = agotado. */
  stock: number
}

/**
 * Stock alto que usa la UI al agregar productos SIN control de inventario
 * (stock null en el backend: TORTA/SUBLIMACION): disponibles sin límite.
 */
export const STOCK_CARRITO_SIN_LIMITE = 999

export type CartContextValue = {
  productos: CartProduct[]
  totalUnidades: number
  subtotal: number
  costoEnvio: number
  total: number
  agregarProducto: (
    product: Omit<CartProduct, 'cantidad'>,
    cantidad: number,
  ) => void
  aumentarCantidad: (id: string) => void
  disminuirCantidad: (id: string) => void
  eliminarProducto: (id: string) => void
  vaciarCarrito: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)
