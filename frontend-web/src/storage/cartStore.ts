/**
 * Persistencia local del carrito: sobrevive recargas de página.
 * Mismo patrón defensivo que sessionStore: si el dato está corrupto o el
 * almacenamiento no está disponible (modo privado), se descarta y se parte
 * de un carrito vacío en memoria.
 */
import type { CartProduct } from '../contexts/CartContext'

const CARRITO_KEY = 'nexocommerce.cart.v1'

function esProductoValido(valor: unknown): valor is CartProduct {
  if (!valor || typeof valor !== 'object') return false
  const item = valor as Partial<CartProduct>
  return (
    typeof item.id === 'string' &&
    typeof item.nombre === 'string' &&
    typeof item.imagen === 'string' &&
    typeof item.categoría === 'string' &&
    typeof item.precioUnitario === 'number' &&
    Number.isFinite(item.precioUnitario) &&
    typeof item.cantidad === 'number' &&
    Number.isFinite(item.cantidad) &&
    item.cantidad >= 1 &&
    typeof item.stock === 'number' &&
    Number.isFinite(item.stock)
  )
}

export function cargarCarrito(): CartProduct[] {
  try {
    const raw = localStorage.getItem(CARRITO_KEY)
    if (!raw) return []
    const datos: unknown = JSON.parse(raw)
    if (!Array.isArray(datos)) return []
    return datos.filter(esProductoValido).map((item) => ({
      ...item,
      // Cantidades enteras y nunca menores a 1 (defensa ante datos viejos).
      cantidad: Math.max(1, Math.floor(item.cantidad)),
    }))
  } catch {
    return []
  }
}

export function guardarCarrito(productos: CartProduct[]): void {
  try {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(productos))
  } catch {
    // Sin almacenamiento: el carrito sigue solo en memoria.
  }
}
