import { createContext } from 'react'

export type CartProduct = {
  id: string
  nombre: string
  imagen: string
  precioUnitario: number
  categoría: string
  cantidad: number
  /** Stock vigente al agregar. 0 = agotado. */
  stock: number | null
  comentario?: string | null
  configuracion?: {
    tipo: string
    id: number | null
    nombre: string | null
    costo_adicional: number
  } | null
}

export type CartItemConfiguration = {
  comentario?: string
  diseno_torta_id?: number
  plantilla_diseno_id?: number
  diseno_personalizado_id?: number
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
  cargando: boolean
  error: string | null
  recargar: () => Promise<void>
  agregarProducto: (
    product: Omit<CartProduct, 'cantidad'>,
    cantidad: number,
    configuracion?: CartItemConfiguration,
  ) => Promise<void>
  aumentarCantidad: (id: string) => Promise<void>
  disminuirCantidad: (id: string) => Promise<void>
  eliminarProducto: (id: string) => Promise<string | null>
  vaciarCarrito: () => Promise<string | null>
}

export const CartContext = createContext<CartContextValue | null>(null)
