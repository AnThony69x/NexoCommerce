import { createContext } from 'react'

export type CartProduct = {
  id: string
  nombre: string
  imagen: string
  precioUnitario: number
  categoría: string
  cantidad: number
}

export type CartContextValue = {
  productos: CartProduct[]
  totalUnidades: number
  subtotal: number
  agregarProducto: (
    product: Omit<CartProduct, 'cantidad'>,
    cantidad: number,
  ) => void
  aumentarCantidad: (id: string) => void
  disminuirCantidad: (id: string) => void
  eliminarProducto: (id: string) => void
}

export const CartContext = createContext<CartContextValue | null>(null)
