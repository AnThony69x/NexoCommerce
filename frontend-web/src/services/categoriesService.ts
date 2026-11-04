/**
 * Servicio de categorías (endpoint público GET /api/v1/categorias).
 * Consume el cliente HTTP base (services/api.ts) y devuelve el árbol de
 * categorías respetando el contrato del backend (CategoryNode).
 *
 * NOTA: el backend devuelve un árbol (no paginado), envuelto en { success, data }.
 */
import { apiClient } from './api'
import type { ApiEnvelope } from '../types/api'
import type { CategoryNode } from '../types/category'

/**
 * Obtiene el árbol de categorías activas.
 * El backend expone GET /categorias (público, sin token).
 */
export async function getCategories(): Promise<CategoryNode[]> {
  const { data } = await apiClient.get<ApiEnvelope<CategoryNode[]>>('/categorias')
  return data.data
}
