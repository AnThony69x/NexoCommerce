import {
  listarProductos as listarProductosApi,
  obtenerProducto as obtenerProductoApi,
} from './productsService'
import type { Product, ProductDetalle } from '../types/product'

export const CATEGORIA_DETALLES = 'Detalles personalizados'
export const CATEGORIA_REPOSTERIA = 'Repostería'
export const CATEGORIA_SUBLIMACION = 'Sublimación'

/** Catálogo completo de productos activos. */
export async function listarProductos(): Promise<Product[]> {
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
