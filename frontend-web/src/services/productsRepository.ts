/**
 * Repositorio de productos: única puerta de acceso de la UI a productos.
 * Aquí se centraliza la decisión mock/real (nunca dentro de componentes):
 *
 *   VITE_MOCK_MODE=true  → datos locales (data/products.mock), sin red.
 *   VITE_MOCK_MODE=false → productsService (API real).
 *
 * Sin fallback silencioso: en modo real los errores se propagan para que la
 * UI muestre loading / error con reintento / empty state. Ambos caminos
 * devuelven los mismos tipos (Product y ProductDetalle), así la UI ignora el
 * origen de los datos.
 *
 * Las consultas compuestas (por categoría, relacionados, destacados) se
 * apoyan en listarProductos() para que también cambien de origen con el modo.
 */
import { config } from '../config/app'
import {
  CATEGORIA_DETALLES,
  CATEGORIA_REPOSTERIA,
  CATEGORIA_SUBLIMACION,
  productsMock,
  productosDetalleMock,
} from '../data/products.mock'
import {
  listarProductos as listarProductosApi,
  obtenerProducto as obtenerProductoApi,
} from './productsService'
import type { Product, ProductDetalle } from '../types/product'

export { CATEGORIA_DETALLES, CATEGORIA_REPOSTERIA, CATEGORIA_SUBLIMACION }

/** Catálogo completo de productos activos (mock o API según el modo). */
export async function listarProductos(): Promise<Product[]> {
  if (config.mockMode) return productsMock
  return listarProductosApi()
}

/**
 * Detalle de producto por id numérico. null = no existe (la página muestra
 * "Producto no encontrado"). Id no numérico → null sin llamar a la red.
 */
export async function obtenerProducto(
  id: number,
): Promise<ProductDetalle | null> {
  if (!Number.isInteger(id)) return null
  if (config.mockMode) {
    return productosDetalleMock.find((item) => item.id === id) ?? null
  }
  return obtenerProductoApi(id)
}

/** Productos cuya categoría raíz coincide por nombre (páginas verticales). */
export async function listarPorCategoria(nombre: string): Promise<Product[]> {
  const todos = await listarProductos()
  return todos.filter((producto) => producto.categoria.nombre === nombre)
}

/** Relacionados: misma categoría que el producto actual, sin repetirlo. */
export async function listarRelacionados(
  categoriaId: number,
  excluirId: number,
  limite = 3,
): Promise<Product[]> {
  const todos = await listarProductos()
  return todos
    .filter(
      (producto) =>
        producto.categoria.id === categoriaId && producto.id !== excluirId,
    )
    .slice(0, limite)
}

/** Destacados del home por ids (se preserva el orden solicitado). */
export async function listarDestacados(ids: number[]): Promise<Product[]> {
  const todos = await listarProductos()
  return ids.flatMap((id) => {
    const encontrado = todos.find((producto) => producto.id === id)
    return encontrado ? [encontrado] : []
  })
}
