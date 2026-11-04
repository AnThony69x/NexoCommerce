/**
 * Repositorio de categorías: única puerta de acceso de la UI a los datos
 * de categorías públicas. Aquí se centraliza la decisión mock/real
 * (nunca dentro de componentes visuales):
 *
 *   VITE_MOCK_MODE=true  → datos locales (data/categories.mock), sin red.
 *   VITE_MOCK_MODE=false → categoriesService.getCategories() (API real).
 *
 * En modo real NO hay fallback silencioso a mocks: si el backend falla, el
 * error se propaga tal cual para que la UI lo reporte con su estado de
 * error y el botón de reintento (nunca pantalla en blanco).
 *
 * Ambos caminos devuelven exactamente CategoryNode[] (contrato del
 * backend), así los componentes consumen siempre la misma estructura.
 */
import { config } from '../config/app'
import { categoriesMock } from '../data/categories.mock'
import { getCategories } from './categoriesService'
import type { CategoryNode } from '../types/category'

/** Obtiene el árbol de categorías según el modo configurado en el entorno. */
export async function listarCategorias(): Promise<CategoryNode[]> {
  if (config.mockMode) {
    return categoriesMock
  }
  return getCategories()
}
